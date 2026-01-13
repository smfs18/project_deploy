"""
Rotas para processamento de áudio
"""

import asyncio
import logging
import os
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, BackgroundTasks, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from uuid import UUID

from app.database import get_db
from app.models.audio_record import AudioRecord, AudioStatus
from app.models.transcription import Transcription
from app.models.summarization import Summarization
from app import schemas
from app.services import AudioProcessingService

logger = logging.getLogger(__name__)
router = APIRouter()

# ============= UPLOAD E PROCESSAMENTO =============

@router.post("/audio/upload", response_model=schemas.AudioRecordResponse, tags=["Audio"])
async def upload_audio(
    file: UploadFile = File(...),
    agent_id: str = Form(...),
    patient_id: str = Form(...),
    db: AsyncSession = Depends(get_db),
    background_tasks: BackgroundTasks = None
) -> schemas.AudioRecordResponse:
    """
    Upload de arquivo de áudio.
    
    O processamento (transcrição + sumarização) é feito em background.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="Nome do arquivo inválido")
    
    if not agent_id or not patient_id:
        raise HTTPException(status_code=400, detail="agent_id e patient_id são obrigatórios")
    
    # Extrair informações do arquivo
    file_format = file.filename.split(".")[-1].lower() if "." in file.filename else "unknown"
    
    # Criar registro de áudio
    audio_record = AudioRecord(
        agent_id=agent_id,
        patient_id=patient_id,
        filename=file.filename,
        file_format=file_format,
        file_size=file.size,
        status=AudioStatus.UPLOADED,
        metadata={}
    )
    if not isinstance(audio_record.metadata, dict):
        audio_record.metadata = {}
    db.add(audio_record)
    await db.commit()
    await db.refresh(audio_record)
    
    # Salvar arquivo
    file_path = f"/tmp/{audio_record.id}.{file_format}"
    try:
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
        
        # Atualizar caminho do arquivo
        audio_record.file_path = file_path
        await db.commit()
        await db.refresh(audio_record)
        
        # Agendar processamento em background
        if background_tasks:
            background_tasks.add_task(
                _process_audio_background,
                audio_record.id,
                file_path,
                agent_id,
                patient_id,
            )
        
        logger.info(f"✅ Áudio {audio_record.id} recebido e agendado para processamento")
        
    except Exception as e:
        logger.error(f"❌ Erro ao salvar arquivo: {e}")
        audio_record.status = AudioStatus.ERROR
        await db.commit()
        raise HTTPException(status_code=500, detail=f"Erro ao salvar arquivo: {e}")
    audio_record.metadata = {}
    return audio_record

@router.post("/audio/process-url", response_model=schemas.ProcessAudioResponse, tags=["Audio"])
async def process_audio_from_url(
    request: schemas.ProcessAudioRequest,
    db: AsyncSession = Depends(get_db),
    background_tasks: BackgroundTasks = None
) -> schemas.ProcessAudioResponse:
    """
    Processar áudio a partir de uma URL.
    
    O arquivo é baixado e processado (transcrição + sumarização) em background.
    """
    try:
        # Criar registro de áudio
        audio_record = AudioRecord(
            agent_id=request.agent_id,
            patient_id=request.patient_id,
            filename=request.filename,
            file_format=request.filename.split(".")[-1].lower() if "." in request.filename else "unknown",
            file_size=request.file_size,
            duration=request.duration,
            status=AudioStatus.UPLOADED,
            metadata=request.metadata or {}
        )
        
        db.add(audio_record)
        await db.commit()
        await db.refresh(audio_record)
        
        # Download do arquivo
        file_path = await _download_audio(request.file_url, str(audio_record.id))
        audio_record.file_path = file_path
        await db.commit()
        await db.refresh(audio_record)
        
        # Agendar processamento
        if background_tasks:
            background_tasks.add_task(
                _process_audio_background,
                audio_record.id,
                file_path,
                request.agent_id,
                request.patient_id
            )
        
        logger.info(f"✅ Áudio {audio_record.id} baixado de URL e agendado para processamento")
        
        return schemas.ProcessAudioResponse(
            audio_record_id=audio_record.id,
            transcription_id=None,
            summarization_id=None,
            transcription_text="",
            summarization_text="",
            processing_time=0.0,
            status=AudioStatus.UPLOADED
        )
        
    except Exception as e:
        logger.error(f"❌ Erro ao processar URL: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============= CONSULTAS =============

@router.get("/audio/{audio_record_id}", response_model=schemas.AudioProcessingResult, tags=["Audio"])
async def get_audio_processing(
    audio_record_id: UUID,
    db: AsyncSession = Depends(get_db)
) -> schemas.AudioProcessingResult:
    """Obter resultado do processamento de um áudio."""
    
    # Buscar registro de áudio
    stmt = select(AudioRecord).where(AudioRecord.id == audio_record_id)
    result = await db.execute(stmt)
    audio_record = result.scalar_one_or_none()
    
    if not audio_record:
        raise HTTPException(status_code=404, detail="Áudio não encontrado")
    
    # Buscar transcrição
    stmt = select(Transcription).where(Transcription.audio_record_id == audio_record_id)
    result = await db.execute(stmt)
    transcription = result.scalar_one_or_none()
    
    # Buscar sumarização
    stmt = select(Summarization).where(Summarization.audio_record_id == audio_record_id)
    result = await db.execute(stmt)
    summarization = result.scalar_one_or_none()
    
    if not transcription or not summarization:
        raise HTTPException(status_code=404, detail="Processamento ainda não concluído")
    
    processing_time = 0.0
    if transcription.processing_time and summarization.processing_time:
        processing_time = transcription.processing_time + summarization.processing_time
    if hasattr(audio_record, 'metadata') and not isinstance(audio_record.metadata, dict):
        audio_record.metadata = {}
    return schemas.AudioProcessingResult(
        audio_record=audio_record,
        transcription=transcription,
        summarization=summarization,
        processing_time=processing_time,
        status=audio_record.status.value
    )

@router.get("/audio/{audio_record_id}/transcription", response_model=schemas.TranscriptionResponse, tags=["Audio"])
async def get_transcription(
    audio_record_id: UUID,
    db: AsyncSession = Depends(get_db)
) -> schemas.TranscriptionResponse:
    """Obter transcrição de um áudio."""
    
    stmt = select(Transcription).where(Transcription.audio_record_id == audio_record_id)
    result = await db.execute(stmt)
    transcription = result.scalar_one_or_none()
    
    if not transcription:
        raise HTTPException(status_code=404, detail="Transcrição não encontrada")
    
    return transcription

@router.get("/audio/{audio_record_id}/summarization", response_model=schemas.SummarizationResponse, tags=["Audio"])
async def get_summarization(
    audio_record_id: UUID,
    db: AsyncSession = Depends(get_db)
) -> schemas.SummarizationResponse:
    """Obter sumarização de um áudio."""
    
    stmt = select(Summarization).where(Summarization.audio_record_id == audio_record_id)
    result = await db.execute(stmt)
    summarization = result.scalar_one_or_none()
    
    if not summarization:
        raise HTTPException(status_code=404, detail="Sumarização não encontrada")
    
    return summarization

# ============= FUNÇÕES AUXILIARES =============

async def _process_audio_background(
    audio_record_id: UUID,
    file_path: str,
    agent_id: str,
    patient_id: str
    # REMOVA A LINHA: db: AsyncSession
):
    """Processa áudio em background com sua própria sessão."""
    # Importação local para evitar import circular se necessário
    from app.database import async_session 
    
    async with async_session() as session:
        service = AudioProcessingService(session)
        result = await service.process_audio(
            audio_record_id=audio_record_id,
            file_path=file_path,
            agent_id=agent_id,
            patient_id=patient_id
        )
        # O commit agora é feito dentro do service ou aqui
        await session.commit()
        logger.info(f"✅ Processamento concluído para {audio_record_id}: {result}")
        if os.path.exists(file_path):
            os.remove(file_path) # Remove o áudio de /tmp/
            logger.info(f"🗑️ Arquivo temporário removido: {file_path}")

async def _download_audio(url: str, audio_id: str) -> str:
    """Baixa áudio de uma URL."""
    import httpx
    
    file_path = f"/tmp/{audio_id}.mp3"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, timeout=30.0)
        response.raise_for_status()
        
        with open(file_path, "wb") as f:
            f.write(response.content)
    
    return file_path
