from sqlalchemy import (
    Column, Integer, String, Boolean, Date, Float, 
    ForeignKey, DateTime, Text
)
from sqlalchemy.sql import func
from app.db.base import Base

class Paciente(Base):
    __tablename__ = "pacientes"

    id = Column(Integer, primary_key=True, index=True)
    
    # Identificação
    email = Column(String, index=True, unique=True, nullable=False)
    nome = Column(String, nullable=False)
    data_nascimento = Column(Date, nullable=False)
    endereco = Column(String, nullable=True)
    cep = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # Dados demográficos (NOVOS CAMPOS)
    sexo = Column(String, nullable=False)
    raca_cor = Column(String, nullable=False)
    situacao_conjugal = Column(String, nullable=False)
    situacao_ocupacional = Column(String, nullable=False)
    zona_moradia = Column(String, nullable=False)
    
    # Situação socioeconômica (NOVOS CAMPOS)
    seguranca_alimentar = Column(String, nullable=False)
    escolaridade = Column(String, nullable=False)
    renda_familiar_sm = Column(String, nullable=False)
    plano_saude = Column(String, nullable=False)
    arranjo_domiciliar = Column(String, nullable=False)

    # Hábitos de Vida
    atividade_fisica = Column(String, nullable=False)
    consumo_alcool = Column(String, nullable=False)
    tabagismo_atual = Column(Boolean, nullable=False)
    qualidade_dieta = Column(String, nullable=False)
    qualidade_sono = Column(String, nullable=False)

    # Psicossocial
    nivel_estresse = Column(String, nullable=False)
    suporte_social = Column(String, nullable=False)
    
    # Histórico e Acesso
    historico_familiar_dc = Column(Boolean, nullable=False)
    acesso_servico_saude = Column(String, nullable=False)
    aderencia_medicamento = Column(String, nullable=False)
    consultas_ultimo_ano = Column(Integer, nullable=False)

    # Medições Clínicas
    imc = Column(Float, nullable=False)
    pressao_sistolica_mmHg = Column(Integer, nullable=False)
    pressao_diastolica_mmHg = Column(Integer, nullable=False)
    glicemia_jejum_mg_dl = Column(Integer, nullable=False)
    colesterol_total_mg_dl = Column(Integer, nullable=False)
    hdl_mg_dl = Column(Integer, nullable=False)
    triglicerides_mg_dl = Column(Integer, nullable=False)

    # --- Campos de Resultado (pós-processamento) ---
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Resultados do ML
    is_outlier = Column(Boolean, default=False)
    confidence = Column(Float, nullable=True)  # Grau de confiança (0.0 a 1.0)
    needs_confirmation = Column(Boolean, default=False)  # Se precisa confirmação
    
    # Confirmação do profissional
    professional_confirmed = Column(Boolean, nullable=True)  # null = não confirmado ainda
    professional_notes = Column(Text, nullable=True)  # Observações do profissional
    confirmed_at = Column(DateTime(timezone=True), nullable=True)  # Quando foi confirmado
    
    # Resultados do LLM
    acoes_geradas_llm = Column(Text, nullable=True)


class RetrainingData(Base):
    """
    Tabela para armazenar dados de pacientes que precisam ser usados
    para retreinamento do modelo.
    """
    __tablename__ = "retraining_data"
    
    id = Column(Integer, primary_key=True, index=True)
    paciente_id = Column(Integer, ForeignKey("pacientes.id"), nullable=False)
    
    # Dados originais da predição
    original_prediction = Column(Boolean, nullable=False)  # Predição original do modelo
    original_confidence = Column(Float, nullable=False)  # Confiança original
    
    # Confirmação do profissional
    professional_confirmation = Column(Boolean, nullable=False)  # Confirmação do profissional
    professional_notes = Column(Text, nullable=True)
    
    # Dados das features (JSON seria ideal, mas vamos duplicar os campos essenciais)
    # Armazenamos como Text em formato JSON para facilitar retreinamento
    features_json = Column(Text, nullable=False)
    
    # Controle de retreinamento
    used_for_retraining = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    retrained_at = Column(DateTime(timezone=True), nullable=True)