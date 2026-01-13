from pydantic import BaseModel, computed_field
from typing import Optional, List
from datetime import date, datetime

# =================================================================
# Schema de ENTRADA (Baseado no PacienteFormData do api.ts)
# =================================================================
class PacienteBase(BaseModel):
    # Dados de identificação
    email: str
    nome: str
    endereco: Optional[str] = None
    cep: Optional[str] = None
    data_nascimento: date # FastAPI converte string "YYYY-MM-DD" para date
    
    # Dados demográficos (NOVOS CAMPOS)
    sexo: str
    raca_cor: Optional[str] = None
    situacao_conjugal: Optional[str] = None
    situacao_ocupacional: Optional[str] = None
    zona_moradia: Optional[str] = None
    
    # Situação socioeconômica (NOVOS CAMPOS)
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

class PacienteCreate(PacienteBase):
    """ Schema usado para criar um novo paciente via API """
    pass


# =================================================================
# Schema de SAÍDA (Baseado no PacienteOut do api.ts)
# =================================================================
class Paciente(PacienteBase): # (Herda todos os campos)
    id: int
    created_at: datetime
    
    # --- Campos lidos do DB ---
    is_outlier: Optional[bool] = None
    confidence: Optional[float] = None  # Grau de confiança do modelo
    needs_confirmation: Optional[bool] = None  # Se precisa confirmação
    professional_confirmed: Optional[bool] = None  # Confirmação do profissional
    acoes_geradas_llm: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    # --- Campos Calculados para o Frontend ---
    probabilidade_diabetes: float = 0.0
    probabilidade_hipertensao: float = 0.0

    @computed_field
    @property
    def risco_diabetes(self) -> str:
        """
        TRADUZ 'is_outlier: bool' para 'risco_diabetes: str'
        que o frontend espera.
        """
        if self.is_outlier is None:
            return "Não Calculado" 
        return "Crítico" if self.is_outlier else "Estável"

    @computed_field
    @property
    def risco_hipertensao(self) -> str:
        """
        TRADUZ 'is_outlier: bool' para 'risco_hipertensao: str'
        que o frontend espera.
        """
        if self.is_outlier is None:
            return "Não Calculado"
        return "Crítico" if self.is_outlier else "Estável"
        
    @computed_field
    @property
    def recomendacao_geral(self) -> str:
        """
        Passa o campo 'acoes_geradas_llm' do banco para o campo 
        'recomendacao_geral' que o frontend espera.
        """
        return self.acoes_geradas_llm or "Nenhuma recomendação gerada."

    class Config:
        from_attributes = True


# =================================================================
# Schema para Confirmação do Profissional
# =================================================================
class ProfessionalConfirmation(BaseModel):
    """Schema para confirmação do profissional sobre um paciente"""
    paciente_id: int
    is_outlier_confirmed: bool  # Confirmação se é realmente outlier
    professional_notes: Optional[str] = None  # Observações do profissional


# =================================================================
# Schema de SAÍDA para LISTAGEM (Baseado no PacienteListResponse)
# =================================================================
class PacienteListMeta(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int

class PacienteListResponse(BaseModel):
    """ Schema para a resposta paginada de pacientes """
    items: List[Paciente]
    meta: PacienteListMeta