from typing import Optional
from sqlalchemy.orm import Session
from app.schemas.paciente_schema import PacienteCreate, ProfessionalConfirmation
from app.models.paciente_models import Paciente, RetrainingData
from app import crud
from .http_client import call_ml_service, call_llm_service
from .geocoding_service import GeocodingService
from app.core.config import settings
import math
import json
from datetime import date, datetime

def _calculate_age(born: date) -> int:
    """Função helper para calcular a idade."""
    today = date.today()
    return today.year - born.year - ((today.month, today.day) < (born.month, born.day))

def _prepare_ml_features(paciente_in: PacienteCreate) -> dict:
    """
    Prepara os dados do paciente no formato esperado pelo modelo ML.
    Inclui todas as 28 features do modelo retreinado.
    """
    features = {
        # Dados demográficos
        "idade": _calculate_age(paciente_in.data_nascimento),
        "sexo": paciente_in.sexo,
        "raca_cor": paciente_in.raca_cor,
        "situacao_conjugal": paciente_in.situacao_conjugal,
        "situacao_ocupacional": paciente_in.situacao_ocupacional,
        "zona_moradia": paciente_in.zona_moradia,
        
        # Situação socioeconômica
        "seguranca_alimentar": paciente_in.seguranca_alimentar,
        "escolaridade": paciente_in.escolaridade,
        "renda_familiar_sm": paciente_in.renda_familiar_sm,
        "plano_saude": paciente_in.plano_saude,
        "arranjo_domiciliar": paciente_in.arranjo_domiciliar,
        
        # Hábitos de vida
        "atividade_fisica": paciente_in.atividade_fisica,
        "consumo_alcool": paciente_in.consumo_alcool,
        "tabagismo_atual": paciente_in.tabagismo_atual,
        "qualidade_dieta": paciente_in.qualidade_dieta,
        "qualidade_sono": paciente_in.qualidade_sono,
        
        # Fatores psicossociais
        "nivel_estresse": paciente_in.nivel_estresse,
        "suporte_social": paciente_in.suporte_social,
        
        # Histórico e acesso
        "historico_familiar_dc": paciente_in.historico_familiar_dc,
        "acesso_servico_saude": paciente_in.acesso_servico_saude,
        "aderencia_medicamento": paciente_in.aderencia_medicamento,
        "consultas_ultimo_ano": paciente_in.consultas_ultimo_ano,
        
        # Medições clínicas
        "imc": paciente_in.imc,
        "pressao_sistolica_mmHg": paciente_in.pressao_sistolica_mmHg,
        "pressao_diastolica_mmHg": paciente_in.pressao_diastolica_mmHg,
        "glicemia_jejum_mg_dl": paciente_in.glicemia_jejum_mg_dl,
        "colesterol_total_mg_dl": paciente_in.colesterol_total_mg_dl,
        "hdl_mg_dl": paciente_in.hdl_mg_dl,
        "triglicerides_mg_dl": paciente_in.triglicerides_mg_dl,
    }
    
    return features

async def _run_orchestration(db: Session, paciente_in: PacienteCreate, db_paciente: Paciente) -> Paciente:
    """
    Função helper que executa a orquestração ML/LLM para um paciente.
    Agora inclui lógica de confiança e armazenamento para retreinamento.
    """
    ml_input_data = _prepare_ml_features(paciente_in)
    
    try:
        # Chama o Serviço de ML
        ml_result = await call_ml_service(ml_input_data)
        
        is_outlier = ml_result.get("is_outlier", False)
        confidence = ml_result.get("confidence", 0.0)
        needs_confirmation = ml_result.get("needs_confirmation", False)
        
        # Salva os resultados do ML
        db_paciente.is_outlier = is_outlier
        db_paciente.confidence = confidence
        db_paciente.needs_confirmation = needs_confirmation
        
        # Se precisa de confirmação, armazena para possível retreinamento
        if needs_confirmation:
            print(f"Paciente {db_paciente.id} precisa de confirmação profissional. "
                  f"Confiança: {confidence:.2%}")
        
        # Chama o LLM apenas se for outlier
        if is_outlier:
            print(f"Paciente {db_paciente.id} é outlier. Chamando Agente LLM...")
            
            llm_input_payload = {
                "patient_data": ml_input_data
            }
            
            llm_result = await call_llm_service(llm_input_payload)
            generated_text = llm_result.get("generated_actions")
            db_paciente.acoes_geradas_llm = generated_text
        else:
            db_paciente.acoes_geradas_llm = "Paciente classificado como estável. Manter acompanhamento padrão."
            
        db.commit()
        db.refresh(db_paciente)
        
    except Exception as e:
        print(f"ALERTA: Falha na orquestração para paciente {db_paciente.id}: {e}")

    return db_paciente


async def create_paciente_with_orchestration(
    db: Session, *, paciente_in: PacienteCreate
) -> Paciente:
    """
    Orquestra o fluxo completo: Geocodifica CEP, Salva, Classifica (ML) e Gera Ações (LLM).
    """
    
    # 1. Se CEP foi fornecido, buscar coordenadas
    if paciente_in.cep:
        geocoding_result = await GeocodingService.get_coordinates_from_cep(paciente_in.cep)
        if geocoding_result:
            latitude, longitude, endereco_completo = geocoding_result
            if not paciente_in.endereco or not paciente_in.endereco.strip():
                paciente_in.endereco = endereco_completo
        else:
            latitude, longitude = None, None
    else:
        latitude, longitude = None, None
    
    # 2. Salva o paciente no banco
    db_paciente = crud.create_paciente(db, paciente_in=paciente_in)
    
    # 3. Salva as coordenadas obtidas
    if latitude and longitude:
        db_paciente.latitude = latitude
        db_paciente.longitude = longitude
        db.commit()
        db.refresh(db_paciente)
    
    # 4. Executa orquestração ML/LLM
    return await _run_orchestration(db, paciente_in, db_paciente)


def get_pacientes_paginados(
    db: Session, *, page: int, page_size: int, search: str
):
    """
    Busca pacientes paginados e prepara a resposta 
    exatamente como o frontend (api.ts) espera.
    """
    pacientes, total = crud.get_multi(
        db, page=page, page_size=page_size, search=search
    )
    
    meta = {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": math.ceil(total / page_size)
    }
    
    return {"items": pacientes, "meta": meta}


async def update_paciente_with_orchestration(
    db: Session, *, id: int, paciente_in: PacienteCreate
) -> Optional[Paciente]:
    """
    Atualiza um paciente e re-executa o fluxo de orquestração (ML/LLM).
    """
    db_paciente = crud.get_by_id(db, id=id)
    if not db_paciente:
        return None
    
    # Se CEP foi fornecido, buscar coordenadas
    if paciente_in.cep:
        geocoding_result = await GeocodingService.get_coordinates_from_cep(paciente_in.cep)
        if geocoding_result:
            latitude, longitude, endereco_completo = geocoding_result
            db_paciente.latitude = latitude
            db_paciente.longitude = longitude
            if not paciente_in.endereco or not paciente_in.endereco.strip():
                paciente_in.endereco = endereco_completo
        
    # Atualiza os campos do paciente
    for field, value in paciente_in.model_dump().items():
        setattr(db_paciente, field, value)
    
    # Re-executa a orquestração
    return await _run_orchestration(db, paciente_in, db_paciente)


def confirm_patient_classification(
    db: Session, *, confirmation: ProfessionalConfirmation
) -> Paciente:
    """
    Registra a confirmação do profissional sobre a classificação do paciente.
    Armazena os dados para retreinamento futuro do modelo.
    """
    db_paciente = crud.get_by_id(db, id=confirmation.paciente_id)
    if not db_paciente:
        raise ValueError(f"Paciente {confirmation.paciente_id} não encontrado")
    
    # Atualiza o paciente com a confirmação
    db_paciente.professional_confirmed = confirmation.is_outlier_confirmed
    db_paciente.professional_notes = confirmation.professional_notes
    db_paciente.confirmed_at = datetime.now()
    
    # Prepara features para armazenamento (reconstruir do paciente)
    features = {
        "idade": _calculate_age(db_paciente.data_nascimento),
        "sexo": db_paciente.sexo,
        "raca_cor": db_paciente.raca_cor,
        "situacao_conjugal": db_paciente.situacao_conjugal,
        "situacao_ocupacional": db_paciente.situacao_ocupacional,
        "zona_moradia": db_paciente.zona_moradia,
        "seguranca_alimentar": db_paciente.seguranca_alimentar,
        "escolaridade": db_paciente.escolaridade,
        "renda_familiar_sm": db_paciente.renda_familiar_sm,
        "plano_saude": db_paciente.plano_saude,
        "arranjo_domiciliar": db_paciente.arranjo_domiciliar,
        "atividade_fisica": db_paciente.atividade_fisica,
        "consumo_alcool": db_paciente.consumo_alcool,
        "tabagismo_atual": db_paciente.tabagismo_atual,
        "qualidade_dieta": db_paciente.qualidade_dieta,
        "qualidade_sono": db_paciente.qualidade_sono,
        "nivel_estresse": db_paciente.nivel_estresse,
        "suporte_social": db_paciente.suporte_social,
        "historico_familiar_dc": db_paciente.historico_familiar_dc,
        "acesso_servico_saude": db_paciente.acesso_servico_saude,
        "aderencia_medicamento": db_paciente.aderencia_medicamento,
        "consultas_ultimo_ano": db_paciente.consultas_ultimo_ano,
        "imc": db_paciente.imc,
        "pressao_sistolica_mmHg": db_paciente.pressao_sistolica_mmHg,
        "pressao_diastolica_mmHg": db_paciente.pressao_diastolica_mmHg,
        "glicemia_jejum_mg_dl": db_paciente.glicemia_jejum_mg_dl,
        "colesterol_total_mg_dl": db_paciente.colesterol_total_mg_dl,
        "hdl_mg_dl": db_paciente.hdl_mg_dl,
        "triglicerides_mg_dl": db_paciente.triglicerides_mg_dl,
    }
    
    # Cria registro de retreinamento
    retraining_entry = RetrainingData(
        paciente_id=db_paciente.id,
        original_prediction=db_paciente.is_outlier,
        original_confidence=db_paciente.confidence or 0.0,
        professional_confirmation=confirmation.is_outlier_confirmed,
        professional_notes=confirmation.professional_notes,
        features_json=json.dumps(features),
        used_for_retraining=False
    )
    
    db.add(retraining_entry)
    db.commit()
    db.refresh(db_paciente)
    
    print(f"Confirmação registrada para paciente {db_paciente.id}. "
          f"Predição: {db_paciente.is_outlier}, Confirmado: {confirmation.is_outlier_confirmed}")
    
    return db_paciente


def get_retraining_stats(db: Session) -> dict:
    """
    Retorna estatísticas sobre dados disponíveis para retreinamento.
    """
    total_pending = db.query(RetrainingData).filter(
        RetrainingData.used_for_retraining == False
    ).count()
    
    total_used = db.query(RetrainingData).filter(
        RetrainingData.used_for_retraining == True
    ).count()
    
    return {
        "pending_confirmations": total_pending,
        "used_for_retraining": total_used,
        "ready_for_retraining": total_pending >= 50
    }