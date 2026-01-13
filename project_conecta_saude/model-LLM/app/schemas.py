# model-LLM/app/schemas.py
# (VERSÃO ATUALIZADA COM TODAS AS FEATURES DO RETREINAMENTO)

from pydantic import BaseModel
from typing import Optional

class PatientData(BaseModel):
    """
    Schema com todas as features do modelo retreinado.
    Total de 28 features.
    """
    # Dados demográficos
    idade: int
    sexo: str
    raca_cor: Optional[str] = None
    situacao_conjugal: Optional[str] = None
    situacao_ocupacional: Optional[str] = None
    zona_moradia: Optional[str] = None
    
    # Situação socioeconômica
    seguranca_alimentar: Optional[str] = None
    escolaridade: str
    renda_familiar_sm: str
    plano_saude: Optional[str] = None
    arranjo_domiciliar: Optional[str] = None
    
    # Hábitos de vida
    atividade_fisica: str
    consumo_alcool: str
    tabagismo_atual: bool
    qualidade_dieta: str
    qualidade_sono: str
    
    # Fatores psicossociais
    nivel_estresse: str
    suporte_social: str
    
    # Histórico e acesso
    historico_familiar_dc: bool
    acesso_servico_saude: str
    aderencia_medicamento: str
    consultas_ultimo_ano: int
    
    # Medições clínicas
    imc: float
    pressao_sistolica_mmHg: int
    pressao_diastolica_mmHg: int
    glicemia_jejum_mg_dl: int
    colesterol_total_mg_dl: int
    hdl_mg_dl: int
    triglicerides_mg_dl: int

class ClassificationResponse(BaseModel):
    """
    Resposta da classificação incluindo grau de confiança.
    """
    is_outlier: bool
    confidence: float  # Grau de confiança da predição (0.0 a 1.0)
    needs_confirmation: bool  # Se precisa de confirmação do profissional