from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from sqlalchemy.orm import Session
from typing import Optional, List, Any
from datetime import datetime
import logging

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user_models import User
from app.schemas import agente_schema
from app.services.agente_service import AgenteService, AtribuicaoPacienteService
from app.models.agente_models import AtribuicaoPaciente

logger = logging.getLogger(__name__)
router = APIRouter()

# ============================================
# 1. GESTÃO DE AGENTES (CRUD)
# ============================================

@router.post("/", response_model=agente_schema.Agente, status_code=status.HTTP_201_CREATED, tags=["Agentes"])
async def criar_agente(agente_in: agente_schema.AgenteCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Cria um novo agente no sistema."""
    return AgenteService.criar_agente(db, agente_in)

@router.get("/", response_model=agente_schema.AgenteListResponse, tags=["Agentes"])
async def listar_agentes(page: int = Query(1, ge=1), page_size: int = Query(10, ge=1, le=100), search: Optional[str] = Query(None), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Lista agentes com paginação para o Painel do Gestor."""
    return AgenteService.listar_agentes(db, page=page, page_size=page_size, search=search)

@router.get("/historico-visitas", tags=["Agentes"])
def listar_historico_visitas(db: Session = Depends(get_db), current_user: Any = Depends(get_current_user)):
    """Retorna o histórico de visitas do agente logado (Aba Histórico no App)."""
    if not current_user:
        raise HTTPException(status_code=401, detail="Usuário não autenticado")
    return AtribuicaoPacienteService.listar_atribuicoes_agente(db, agente_id=current_user.id)

@router.get("/{agente_id}", response_model=agente_schema.Agente, tags=["Agentes"])
async def buscar_agente(agente_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Busca detalhes de um agente específico."""
    return AgenteService.buscar_agente(db, agente_id)

# ============================================
# 2. ATRIBUIÇÕES (GESTÃO E APP)
# ============================================

@router.post("/{agente_id}/atribuicoes", response_model=agente_schema.AtribuicaoPaciente, status_code=status.HTTP_201_CREATED, tags=["Atribuições"])
async def atribuir_paciente(
    agente_id: int, 
    atribuicao_in: agente_schema.AtribuicaoPacienteCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    CRÍTICO: Cria a atribuição de um paciente para um agente.
    Resolve o erro 405 Method Not Allowed do Gestor.
    """
    atribuicao_in.agente_id = agente_id
    return AtribuicaoPacienteService.atribuir_paciente(db, atribuicao_in)

@router.get("/{agente_id}/atribuicoes", response_model=List[agente_schema.AtribuicaoPaciente], tags=["Atribuições"])
async def listar_atribuicoes_agente(agente_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Lista pacientes pendentes para o Silas no App."""
    return AtribuicaoPacienteService.listar_atribuicoes_agente(db, agente_id)

@router.get("/atribuicao/{atribuicao_id}", response_model=agente_schema.AtribuicaoPaciente, tags=["Atribuições"])
async def buscar_atribuicao_direta(atribuicao_id: int, db: Session = Depends(get_db)):
    """Busca dados de uma visita específica para carregar o resumo da IA."""
    return AtribuicaoPacienteService.buscar_atribuicao(db, atribuicao_id)

@router.patch("/{agente_id}/atribuicoes/{atribuicao_id}/concluir", response_model=agente_schema.AtribuicaoPaciente, tags=["Atribuições"])
async def concluir_atribuicao(agente_id: int, atribuicao_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Marca a visita como concluída manualmente."""
    return AtribuicaoPacienteService.concluir_atribuicao(db, atribuicao_id)

# ============================================
# 3. SINCRONIZAÇÃO E IA
# ============================================

@router.post("/audio/summarized", tags=["Sincronização"])
async def receive_audio_summary(data: dict = Body(...), db: Session = Depends(get_db)):
    """
    RECEBIMENTO DA IA: Salva a sumarização do Gemini no banco.
    """
    payload = data.get("payload", {})
    atribuicao_id = payload.get("patient_id") 

    atribuicao = db.query(AtribuicaoPaciente).filter(AtribuicaoPaciente.id == atribuicao_id).first()

    if not atribuicao:
        logger.error(f"❌ Atribuição ID {atribuicao_id} não encontrada.")
        return {"status": "error", "message": "Atribuição não encontrada"}

    atribuicao.anotacoes_visita = payload.get("transcription_text")
    atribuicao.relatorio_visita = {
        "sumarizacao": payload.get("summarization_text"),
        "audio_record_id": payload.get("audio_record_id"),
        "processado_em": datetime.now().isoformat()
    }
    atribuicao.data_visita_realizada = datetime.now()

    db.commit()
    logger.info(f"✅ Sucesso: Atribuição {atribuicao.id} atualizada pela IA.")
    return {"status": "success"}

@router.post("/{agente_id}/atribuicoes/{atribuicao_id}/enviar-app", tags=["Sincronização"])
async def enviar_atribuicao_para_app(agente_id: int, atribuicao_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Gera o payload para sincronização manual se necessário."""
    payload = AtribuicaoPacienteService.enviar_para_app(db, agente_id, atribuicao_id)
    return {"status": "preparado", "payload": payload}