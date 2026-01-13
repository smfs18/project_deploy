from fastapi import APIRouter, Body, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db 
from app.models.agente_models import AtribuicaoPaciente 
from datetime import datetime
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/summarized")
async def receive_audio_summary(
    data: dict = Body(...), 
    db: Session = Depends(get_db)
):
    """
    Endpoint chamado pelo microsserviço após o processamento da IA.
    Recebe transcrição e sumarização.
    """
    payload = data.get("payload", {})
    
    # O 'patient_id' enviado pelo microsserviço/app é o ID da Atribuição
    atribuicao_id = payload.get("patient_id")
    
    # Busca direta pela chave primária da Atribuição
    atribuicao = db.query(AtribuicaoPaciente).filter(
        AtribuicaoPaciente.id == atribuicao_id
    ).first()

    if not atribuicao:
        logger.error(f"❌ Atribuição ID {atribuicao_id} não encontrada no banco.")
        return {"status": "error", "message": f"Atribuição {atribuicao_id} não encontrada"}

    # Atualiza os dados clínicos com o retorno da IA
    atribuicao.data_visita_realizada = datetime.now()
    atribuicao.anotacoes_visita = payload.get("transcription_text")
    
    # Salva o JSON estruturado no campo JSONB
    atribuicao.relatorio_visita = {
        "audio_record_id": payload.get("audio_record_id"),
        "sumarizacao": payload.get("summarization_text"),
        "processado_em": payload.get("processed_at") or datetime.now().isoformat()
    }

    db.commit()
    logger.info(f"✅ Dados da IA salvos com sucesso na atribuição {atribuicao.id}")
    
    return {"status": "success", "message": "Relatório clínico atualizado"}