"""
Scheduler para retreinamento automático do modelo.
Este script verifica periodicamente se há dados suficientes para retreinamento.

Executa retreinamento quando:
1. A cada 7 dias (1 semana)
2. Quando houver 50 ou mais confirmações pendentes

Uso:
    python scheduler_retrain.py --db-url "postgresql://user:pass@host/db"
"""

import argparse
import time
import schedule
from datetime import datetime
from sqlalchemy import create_engine, text
import subprocess
import sys
from pathlib import Path

MIN_SAMPLES_FOR_RETRAINING = 50


def check_and_retrain(db_url: str):
    """
    Verifica se há dados suficientes e executa retreinamento se necessário.
    """
    print(f"\n[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Verificando dados para retreinamento...")
    
    engine = create_engine(db_url)
    
    query = """
    SELECT COUNT(*) as pending_count
    FROM retraining_data
    WHERE used_for_retraining = FALSE
    """
    
    with engine.connect() as conn:
        result = conn.execute(text(query))
        row = result.fetchone()
        pending_count = row[0]
    
    print(f"Confirmações pendentes: {pending_count}")
    
    if pending_count >= MIN_SAMPLES_FOR_RETRAINING:
        print(f"✓ Limite atingido ({pending_count} >= {MIN_SAMPLES_FOR_RETRAINING})")
        print("Iniciando retreinamento...")
        
        # Executa script de retreinamento
        script_path = Path(__file__).parent / "retrain_model.py"
        try:
            result = subprocess.run(
                [sys.executable, str(script_path), "--db-url", db_url],
                check=True,
                capture_output=True,
                text=True
            )
            print("RETREINAMENTO CONCLUÍDO COM SUCESSO!")
            print(result.stdout)
        except subprocess.CalledProcessError as e:
            print(f"ERRO no retreinamento: {e}")
            print(e.stderr)
    else:
        print(f"✗ Limite não atingido ({pending_count} < {MIN_SAMPLES_FOR_RETRAINING})")
        print("Aguardando mais confirmações...")


def weekly_retrain(db_url: str):
    """
    Retreinamento semanal forçado.
    """
    print(f"\n[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Retreinamento semanal agendado")
    
    engine = create_engine(db_url)
    
    query = """
    SELECT COUNT(*) as pending_count
    FROM retraining_data
    WHERE used_for_retraining = FALSE
    """
    
    with engine.connect() as conn:
        result = conn.execute(text(query))
        row = result.fetchone()
        pending_count = row[0]
    
    if pending_count > 0:
        print(f"Retreinando com {pending_count} confirmações...")
        
        script_path = Path(__file__).parent / "retrain_model.py"
        try:
            result = subprocess.run(
                [sys.executable, str(script_path), "--db-url", db_url, "--force"],
                check=True,
                capture_output=True,
                text=True
            )
            print("RETREINAMENTO SEMANAL CONCLUÍDO!")
            print(result.stdout)
        except subprocess.CalledProcessError as e:
            print(f"ERRO no retreinamento: {e}")
            print(e.stderr)
    else:
        print("Nenhum dado novo para retreinamento.")


def main():
    parser = argparse.ArgumentParser(
        description='Scheduler para retreinamento automático do modelo'
    )
    parser.add_argument('--db-url', required=True, 
                       help='URL de conexão com o banco de dados')
    parser.add_argument('--check-interval', type=int, default=6,
                       help='Intervalo em horas para verificar dados (padrão: 6h)')
    
    args = parser.parse_args()
    
    print("=" * 70)
    print("SCHEDULER DE RETREINAMENTO DO MODELO")
    print("=" * 70)
    print(f"URL do banco: {args.db_url[:30]}...")
    print(f"Verificação a cada: {args.check_interval} horas")
    print(f"Retreinamento automático: ≥ {MIN_SAMPLES_FOR_RETRAINING} confirmações")
    print(f"Retreinamento semanal: Todo domingo às 02:00")
    print("=" * 70)
    
    # Agenda verificação periódica (ex: a cada 6 horas)
    schedule.every(args.check_interval).hours.do(check_and_retrain, db_url=args.db_url)
    
    # Agenda retreinamento semanal (todo domingo às 2h da manhã)
    schedule.every().sunday.at("02:00").do(weekly_retrain, db_url=args.db_url)
    
    # Executa verificação inicial
    check_and_retrain(args.db_url)
    
    print("\n✓ Scheduler iniciado. Aguardando próximas verificações...")
    print("  (Pressione Ctrl+C para interromper)\n")
    
    # Loop principal
    try:
        while True:
            schedule.run_pending()
            time.sleep(60)  # Verifica a cada minuto se há jobs agendados
    except KeyboardInterrupt:
        print("\n\nScheduler interrompido pelo usuário.")
        print("Encerrando...")


if __name__ == "__main__":
    main()
