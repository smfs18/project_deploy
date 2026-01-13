from fastapi import FastAPI
from schemas import PatientData, ClassificationResponse
from model import model_instance

app = FastAPI(
    title="Conecta+Saúde - Serviço de Classificação",
    description="API para detectar pacientes outliers com base em dados clínicos.",
    version="2.0.0"
)

@app.post("/classify", response_model=ClassificationResponse)
def classify_patient(patient_data: PatientData):
    """
    Recebe os dados de um paciente e retorna:
    - se ele é classificado como um outlier
    - o grau de confiança da predição
    - se precisa de confirmação do profissional
    """
    is_outlier, confidence, needs_confirmation = model_instance.predict(patient_data)
    
    return {
        "is_outlier": is_outlier,
        "confidence": confidence,
        "needs_confirmation": needs_confirmation
    }

@app.get("/")
def health_check():
    return {"status": "ok", "version": "2.0.0"}