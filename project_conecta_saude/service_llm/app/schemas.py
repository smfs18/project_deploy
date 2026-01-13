from pydantic import BaseModel
from typing import Optional

# =================================================================
# Schema de ENTRADA
# =================================================================

class PatientDataForLLM(BaseModel):
    """
    Este schema espelha os 22 campos de dados do paciente.
    (É o mesmo que fizemos antes, cite: schemas.py)
    """
    idade: int
    sexo: Optional[str] = None
    escolaridade: Optional[str] = None
    renda_familiar_sm: Optional[str] = None
    atividade_fisica: Optional[str] = None
    consumo_alcool: Optional[str] = None
    tabagismo_atual: Optional[bool] = None
    qualidade_dieta: Optional[str] = None
    qualidade_sono: Optional[str] = None
    nivel_estresse: Optional[str] = None
    suporte_social: Optional[str] = None
    historico_familiar_dc: Optional[bool] = None
    acesso_servico_saude: Optional[str] = None
    aderencia_medicamento: Optional[str] = None
    consultas_ultimo_ano: Optional[int] = None
    imc: Optional[float] = None
    pressao_sistolica_mmHg: Optional[int] = None
    pressao_diastolica_mmHg: Optional[int] = None
    glicemia_jejum_mg_dl: Optional[int] = None
    colesterol_total_mg_dl: Optional[int] = None
    hdl_mg_dl: Optional[int] = None
    triglicerides_mg_dl: Optional[int] = None

class LLMInput(BaseModel):
    """
    Este é o corpo (body) principal da requisição POST.
    Note que não pedimos mais os 'health_protocols',
    pois o agente RAG vai encontrá-los sozinho.
    """
    patient_data: PatientDataForLLM


# =================================================================
# Schema de SAÍDA
# =================================================================

class ActionResponse(BaseModel):
    """
    A resposta JSON contendo o plano de ação gerado.
    """
    generated_actions: str