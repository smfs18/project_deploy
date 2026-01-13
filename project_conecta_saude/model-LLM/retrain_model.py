"""
Script para retreinamento automático do modelo de detecção de outliers.
Este script deve ser executado:
1. Automaticamente a cada semana (via cron ou scheduler)
2. Quando houver 50 ou mais pacientes confirmados pendentes de retreinamento

Uso:
    python retrain_model.py --db-url "postgresql://user:pass@host/db" [--force]
"""

import argparse
import json
import pandas as pd
from datetime import datetime
from pathlib import Path
from sqlalchemy import create_engine, text
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
from joblib import dump
import sys

# Configurações
MIN_SAMPLES_FOR_RETRAINING = 50
MODEL_OUTPUT_PATH = Path(__file__).parent / "models" / "modelo_outliers_v1.pkl"
BACKUP_PATH = Path(__file__).parent / "models" / "backups"


def get_retraining_data(db_url: str):
    """
    Busca dados de retreinamento do banco de dados.
    """
    engine = create_engine(db_url)
    
    query = """
    SELECT 
        features_json,
        professional_confirmation as label
    FROM retraining_data
    WHERE used_for_retraining = FALSE
    """
    
    with engine.connect() as conn:
        result = conn.execute(text(query))
        data = result.fetchall()
    
    if not data:
        print("Nenhum dado disponível para retreinamento.")
        return None
    
    print(f"Encontrados {len(data)} registros para retreinamento.")
    
    # Converte para DataFrame
    records = []
    for row in data:
        features = json.loads(row[0])
        features['label'] = int(row[1])  # True/False -> 1/0
        records.append(features)
    
    df = pd.DataFrame(records)
    return df


def preprocess_data(df: pd.DataFrame):
    """
    Pré-processa os dados para treino do modelo.
    """
    # Separa features e labels
    X = df.drop('label', axis=1)
    y = df['label']
    
    # Identifica colunas categóricas e numéricas
    categorical_cols = X.select_dtypes(include=['object', 'bool']).columns
    numerical_cols = X.select_dtypes(include=['int64', 'float64']).columns
    
    # Codifica variáveis categóricas
    label_encoders = {}
    for col in categorical_cols:
        le = LabelEncoder()
        X[col] = le.fit_transform(X[col].astype(str))
        label_encoders[col] = le
    
    # Normaliza variáveis numéricas
    scaler = StandardScaler()
    X[numerical_cols] = scaler.fit_transform(X[numerical_cols])
    
    return X, y, label_encoders, scaler


def train_model(X, y):
    """
    Treina o modelo de detecção de outliers.
    Usa Isolation Forest para detecção de anomalias.
    """
    print("Iniciando treinamento do modelo...")
    
    # Split treino/teste
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Treina modelo
    # Para Isolation Forest, usamos contamination baseado na proporção de outliers
    contamination = y_train.mean()
    
    model = IsolationForest(
        contamination=contamination,
        random_state=42,
        n_estimators=100
    )
    
    model.fit(X_train)
    
    # Avalia modelo
    y_pred_train = model.predict(X_train)
    y_pred_test = model.predict(X_test)
    
    # Converte -1/1 para 0/1
    y_pred_train = (y_pred_train == -1).astype(int)
    y_pred_test = (y_pred_test == -1).astype(int)
    
    print("\n=== Resultados no Conjunto de Treino ===")
    print(classification_report(y_train, y_pred_train))
    print("\nMatriz de Confusão (Treino):")
    print(confusion_matrix(y_train, y_pred_train))
    
    print("\n=== Resultados no Conjunto de Teste ===")
    print(classification_report(y_test, y_pred_test))
    print("\nMatriz de Confusão (Teste):")
    print(confusion_matrix(y_test, y_pred_test))
    
    return model


def backup_current_model():
    """
    Cria backup do modelo atual antes de substituí-lo.
    """
    if not MODEL_OUTPUT_PATH.exists():
        print("Nenhum modelo anterior encontrado para backup.")
        return
    
    BACKUP_PATH.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = BACKUP_PATH / f"modelo_outliers_backup_{timestamp}.pkl"
    
    import shutil
    shutil.copy(MODEL_OUTPUT_PATH, backup_file)
    print(f"Backup criado: {backup_file}")


def save_model(model, label_encoders, scaler):
    """
    Salva o modelo treinado e artefatos de pré-processamento.
    """
    backup_current_model()
    
    model_data = {
        'model': model,
        'label_encoders': label_encoders,
        'scaler': scaler,
        'trained_at': datetime.now().isoformat(),
        'version': '2.0'
    }
    
    MODEL_OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    dump(model_data, MODEL_OUTPUT_PATH)
    print(f"\nModelo salvo em: {MODEL_OUTPUT_PATH}")


def mark_data_as_used(db_url: str):
    """
    Marca os dados como usados para retreinamento.
    """
    engine = create_engine(db_url)
    
    query = """
    UPDATE retraining_data
    SET used_for_retraining = TRUE,
        retrained_at = NOW()
    WHERE used_for_retraining = FALSE
    """
    
    with engine.connect() as conn:
        result = conn.execute(text(query))
        conn.commit()
        print(f"\n{result.rowcount} registros marcados como usados para retreinamento.")


def main():
    parser = argparse.ArgumentParser(description='Retreina o modelo de detecção de outliers')
    parser.add_argument('--db-url', required=True, help='URL de conexão com o banco de dados')
    parser.add_argument('--force', action='store_true', 
                       help='Força retreinamento mesmo com menos de 50 amostras')
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("RETREINAMENTO DO MODELO DE DETECÇÃO DE OUTLIERS")
    print("=" * 60)
    
    # 1. Busca dados
    df = get_retraining_data(args.db_url)
    
    if df is None:
        print("\nNenhum dado disponível. Encerrando.")
        return
    
    # 2. Verifica quantidade mínima
    if len(df) < MIN_SAMPLES_FOR_RETRAINING and not args.force:
        print(f"\nATENÇÃO: Apenas {len(df)} amostras disponíveis.")
        print(f"Mínimo recomendado: {MIN_SAMPLES_FOR_RETRAINING}")
        print("Use --force para retreinar mesmo assim.")
        return
    
    # 3. Pré-processa dados
    print("\nPré-processando dados...")
    X, y, label_encoders, scaler = preprocess_data(df)
    
    # 4. Treina modelo
    model = train_model(X, y)
    
    # 5. Salva modelo
    save_model(model, label_encoders, scaler)
    
    # 6. Marca dados como usados
    mark_data_as_used(args.db_url)
    
    print("\n" + "=" * 60)
    print("RETREINAMENTO CONCLUÍDO COM SUCESSO!")
    print("=" * 60)
    print("\nPróximos passos:")
    print("1. Reinicie o serviço model-LLM para carregar o novo modelo")
    print("2. Monitore o desempenho do modelo nos próximos dias")


if __name__ == "__main__":
    main()
