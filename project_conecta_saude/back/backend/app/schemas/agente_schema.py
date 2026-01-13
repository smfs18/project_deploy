from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# ============================================
# AGENTE HEALTHCARE - SCHEMAS
# ============================================

class AgenteBase(BaseModel):
    """Base schema com campos comuns"""
    nome: str = Field(..., min_length=1, description="Nome completo do agente")
    email: EmailStr = Field(..., description="Email do agente")
    telefone: Optional[str] = Field(None, description="Telefone de contato")
    cpf: str = Field(..., min_length=11, description="CPF do agente")
    tipo_profissional: str = Field(..., description="ACS, Enfermeiro, Médico, etc")
    numero_registro: Optional[str] = Field(None, description="COREN, CRM, etc")
    ubs_nome: Optional[str] = Field(None, description="Nome da UBS")
    endereco: Optional[str] = Field(None, description="Endereço")
    ativo: bool = Field(default=True, description="Se o agente está ativo")


class AgenteCreate(AgenteBase):
    """Schema para criação de agente"""
    senha: str = Field(..., min_length=6)


class AgenteUpdate(BaseModel):
    """Schema para atualização de agente"""
    nome: Optional[str] = None
    email: Optional[EmailStr] = None
    telefone: Optional[str] = None
    tipo_profissional: Optional[str] = None
    numero_registro: Optional[str] = None
    ubs_nome: Optional[str] = None
    endereco: Optional[str] = None
    ativo: Optional[bool] = None


class Agente(AgenteBase):
    """Schema completo de agente com dados adicionais"""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============================================
# ATRIBUIÇÃO PACIENTE - SCHEMAS
# ============================================

class AtribuicaoPacienteBase(BaseModel):
    """Base schema para atribuição"""
    paciente_id: int = Field(..., description="ID do paciente")
    nome_paciente: str = Field(..., description="Nome do paciente")
    localizacao: Optional[str] = Field(None, description="Localização/endereço do paciente")
    informacoes_clinicas: Optional[Dict[str, Any]] = Field(None, description="Dados clínicos importantes")
    notas_gestor: Optional[str] = Field(None, description="Notas do gestor para o agente")
    data_visita_planejada: Optional[datetime] = Field(None, description="Data planejada para a visita")


class AtribuicaoPacienteCreate(BaseModel):
    """Schema para criar atribuição de paciente"""
    agente_id: int = Field(..., description="ID do agente")
    paciente_id: int = Field(..., description="ID do paciente")
    nome_paciente: Optional[str] = None
    localizacao: Optional[str] = None
    informacoes_clinicas: Optional[Dict[str, Any]] = None
    notas_gestor: Optional[str] = None
    data_visita_planejada: Optional[datetime] = None


class AtribuicaoPacienteUpdate(BaseModel):
    """Schema para atualizar atribuição"""
    localizacao: Optional[str] = None
    informacoes_clinicas: Optional[Dict[str, Any]] = None
    notas_gestor: Optional[str] = None
    ativo: Optional[bool] = None
    data_visita_planejada: Optional[datetime] = None
    anotacoes_visita: Optional[str] = None
    relatorio_visita: Optional[Dict[str, Any]] = None


class AtribuicaoPaciente(AtribuicaoPacienteBase):
    """Schema completo de atribuição"""
    id: int
    agente_id: int
    ativo: bool
    data_atribuicao: datetime
    data_visita_realizada: Optional[datetime] = None
    anotacoes_visita: Optional[str] = None
    relatorio_visita: Optional[Dict[str, Any]] = None
    data_conclusao: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AgenteComAtribuicoes(Agente):
    """Schema de agente com suas atribuições do dia"""
    atribuicoes: List[AtribuicaoPaciente] = []


class AgenteListResponse(BaseModel):
    """Response para listagem paginada de agentes"""
    items: List[Agente]
    total: int
    page: int
    page_size: int
    total_pages: int
