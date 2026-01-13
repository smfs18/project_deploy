import pandas as pd
import numpy as np
from joblib import load
from pathlib import Path
from schemas import PatientData 
from typing import Tuple

# --- Caminho do Modelo ---
CURRENT_FILE_PATH = Path(__file__).resolve()
APP_DIR = CURRENT_FILE_PATH.parent
PROJECT_ROOT = APP_DIR.parent
MODEL_PATH = PROJECT_ROOT / "models" / "modelo_outliers_v1.pkl"

# Limiar de confiança para solicitar confirmação
CONFIDENCE_THRESHOLD = 0.7

class Model:
    def __init__(self, model_path: Path):
        print(f"Tentando carregar modelo de: {model_path}")
        print(f"O arquivo existe? {model_path.exists()}")
        if model_path.exists():
            print("Carregando modelo...")
            self.model = load(model_path)
            print("Modelo carregado com sucesso!")
        else:
            print(f"AVISO: Modelo não encontrado em {model_path}.")
            self.model = None

    def predict(self, patient_data: PatientData) -> Tuple[bool, float, bool]:
        """
        Faz a predição e retorna:
        - is_outlier: bool (True se outlier, False se normal)
        - confidence: float (grau de confiança 0.0 a 1.0)
        - needs_confirmation: bool (True se confiança < threshold)
        """
        if self.model is None:
            error_msg = "ERRO CRÍTICO: Modelo não carregado. Não é possível fazer predições."
            print(error_msg)
            raise RuntimeError(error_msg)
        
        try:
            # Converte dados do paciente para DataFrame
            patient_data_dict = patient_data.model_dump()
            
            # Preenche valores padrão para campos Optional que estão None
            default_values = {
                "raca_cor": "Não informado",
                "situacao_conjugal": "Não informado",
                "situacao_ocupacional": "Não informado",
                "zona_moradia": "Urbana",
                "seguranca_alimentar": "Segurança alimentar",
                "plano_saude": "Não possui",
                "arranjo_domiciliar": "Mora com família"
            }
            
            for field, default_value in default_values.items():
                if patient_data_dict.get(field) is None:
                    patient_data_dict[field] = default_value
            
            input_df = pd.DataFrame([patient_data_dict])
            
            # Verifica se o modelo tem método predict_proba
            if hasattr(self.model, 'predict_proba'):
                # Obtém probabilidades
                probabilities = self.model.predict_proba(input_df)[0]
                
                # Para classificação binária: [prob_normal, prob_outlier]
                prob_normal = probabilities[0]
                prob_outlier = probabilities[1]
                
                # A confiança é a probabilidade da classe predita
                if prob_outlier > prob_normal:
                    is_outlier = True
                    confidence = prob_outlier
                else:
                    is_outlier = False
                    confidence = prob_normal
            else:
                # Se não tem predict_proba, usa apenas predict
                prediction = self.model.predict(input_df)
                is_outlier = bool(prediction[0] == 1)
                
                # Sem probabilidades, assumimos confiança moderada
                confidence = 0.75
            
            # Verifica se precisa de confirmação
            needs_confirmation = confidence < CONFIDENCE_THRESHOLD
            
            print(f"Predição: {'Outlier' if is_outlier else 'Normal'}, "
                  f"Confiança: {confidence:.2%}, "
                  f"Precisa confirmação: {needs_confirmation}")
            
            return is_outlier, float(confidence), needs_confirmation
            
        except Exception as e:
            error_msg = f"ERRO CRÍTICO na predição: {e}"
            print(error_msg)
            raise RuntimeError(error_msg)

# Cria uma instância única do modelo
model_instance = Model(MODEL_PATH)