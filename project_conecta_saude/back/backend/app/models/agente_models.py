from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, ForeignKey, 
    Table, Text, JSON
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

# --- PROTEÇÃO ÚNICA CONTRA REDEFINIÇÃO ---
if 'agente_paciente' in Base.metadata.tables:
    agente_paciente_association = Base.metadata.tables['agente_paciente']
else:
    agente_paciente_association = Table(
        'agente_paciente',
        Base.metadata,
        Column('agente_id', Integer, ForeignKey('agentes.id', ondelete='CASCADE')),
        Column('paciente_id', Integer, ForeignKey('pacientes.id', ondelete='CASCADE')),
        extend_existing=True
    )

# REMOVIDO: A segunda definição que estava causando o erro foi deletada aqui.

class AgenteHealthcare(Base):
    __tablename__ = "agentes"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    telefone = Column(String, nullable=True)
    cpf = Column(String, unique=True, nullable=False, index=True)
    tipo_profissional = Column(String, nullable=False)
    numero_registro = Column(String, nullable=True)
    
    # CAMPO ESSENCIAL PARA O LOGIN
    hashed_password = Column(String, nullable=False)
    
    ativo = Column(Boolean, default=True, index=True)
    ubs_nome = Column(String, nullable=True)
    endereco = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    atribuicoes = relationship("AtribuicaoPaciente", back_populates="agente", cascade="all, delete-orphan")


class AtribuicaoPaciente(Base):
    __tablename__ = "atribuicoes_pacientes"

    id = Column(Integer, primary_key=True, index=True)
    agente_id = Column(Integer, ForeignKey('agentes.id', ondelete='CASCADE'), nullable=False)
    paciente_id = Column(Integer, ForeignKey('pacientes.id', ondelete='CASCADE'), nullable=False)
    data_atribuicao = Column(DateTime(timezone=True), server_default=func.now())
    data_visita_planejada = Column(DateTime(timezone=True), nullable=True)
    nome_paciente = Column(String, nullable=False)
    localizacao = Column(String, nullable=True) 
    informacoes_clinicas = Column(JSON, nullable=True) 
    notas_gestor = Column(Text, nullable=True)
    data_visita_realizada = Column(DateTime(timezone=True), nullable=True)
    anotacoes_visita = Column(Text, nullable=True) 
    relatorio_visita = Column(JSON, nullable=True) 
    ativo = Column(Boolean, default=True)
    data_conclusao = Column(DateTime(timezone=True), nullable=True)
    
    agente = relationship("AgenteHealthcare", back_populates="atribuicoes")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())