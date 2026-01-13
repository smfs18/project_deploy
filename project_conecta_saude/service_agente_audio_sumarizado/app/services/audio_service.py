"""
Serviço de Processamento de Áudio com LangGraph + Gemini
"""

import asyncio
import time
import logging
from typing import Optional, Tuple
from datetime import datetime
from uuid import UUID
import httpx

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.agents import TranscriptionAgent, SummarizationAgent
from app.models.audio_record import AudioRecord, AudioStatus
from app.models.transcription import Transcription
from app.models.summarization import Summarization
from app.config import settings

logger = logging.getLogger(__name__)

class AudioProcessingService:
    """Serviço para processar áudios (transcrição e sumarização) com LangGraph."""
    
    def __init__(self, db: AsyncSession):
        """
        Inicializa o serviço.
        
        Args:
            db: Sessão do banco de dados
        """
        self.db = db
        self.transcription_agent = TranscriptionAgent(
            gemini_api_key=settings.gemini_api_key,
            language=settings.language
        )
        self.summarization_agent = SummarizationAgent(
            gemini_api_key=settings.gemini_api_key,
            language=settings.language
        )
    
    async def process_audio(
        self,
        audio_record_id: UUID,
        file_path: str,
        agent_id: str,
        patient_id: str
    ) -> dict:
        """
        Processa um áudio completo (transcrição + sumarização) com LangGraph.
        
        Args:
            audio_record_id: ID do registro de áudio
            file_path: Caminho do arquivo
            agent_id: ID do agente
            patient_id: ID do paciente
            
        Returns:
            Resultado do processamento
        """
        start_time = time.time()
        
        try:
            # 1. Atualizar status para processing
            await self._update_audio_status(audio_record_id, AudioStatus.PROCESSING)
            
            # 2. Transcrever áudio com LangGraph
            logger.info(f"🎤 Iniciando transcrição (LangGraph) para {audio_record_id}")
            transcription_result = await self.transcription_agent.transcribe(file_path)
            
            if not transcription_result.get("success", False):
                raise Exception(f"Erro na transcrição: {transcription_result.get('error')}")
            
            transcription_text = transcription_result["text"]
            logger.info(f"✅ Transcrição concluída: {len(transcription_text)} caracteres")
            
            # 3. Salvar transcrição
            transcription_id = await self._save_transcription(
                audio_record_id=audio_record_id,
                text=transcription_text,
                language=settings.language,
                confidence=transcription_result.get("confidence"),
                model_used=transcription_result.get("model_used", "gemini-1.5-flash"),
                processing_time=transcription_result.get("processing_time")
            )
            await self._update_audio_status(audio_record_id, AudioStatus.TRANSCRIBED)
            
            # 4. Sumarizar texto com LangGraph
            logger.info(f"📝 Iniciando sumarização (LangGraph) para {audio_record_id}")
            summarization_result = await self.summarization_agent.summarize(
                text=transcription_text
            )
            
            if not summarization_result.get("success", False) and "error" in summarization_result:
                logger.warning(f"Aviso em sumarização: {summarization_result.get('error')}")
            
            summarization_text = summarization_result["text"]
            logger.info(f"✅ Sumarização concluída: {len(summarization_text)} caracteres")
            
            # 5. Salvar sumarização
            summarization_id = await self._save_summarization(
                audio_record_id=audio_record_id,
                transcription_id=transcription_id,
                text=summarization_text,
                original_length=summarization_result.get("original_length"),
                summarized_length=summarization_result.get("summarized_length"),
                compression_ratio=summarization_result.get("compression_ratio"),
                model_used=summarization_result.get("model_used", "gemini-1.5-flash"),
                processing_time=summarization_result.get("processing_time")
            )
            await self._update_audio_status(audio_record_id, AudioStatus.SUMMARIZED)
            
            # 6. Notificar sistemas externos
            processing_time = time.time() - start_time
            await self._notify_external_systems(
                audio_record_id=audio_record_id,
                agent_id=agent_id,
                patient_id=patient_id,
                transcription_text=transcription_text,
                summarization_text=summarization_text
            )
            
            # 7. Marcar como concluído
            await self._update_audio_status(audio_record_id, AudioStatus.COMPLETED)
            
            return {
                "success": True,
                "audio_record_id": audio_record_id,
                "transcription_id": transcription_id,
                "summarization_id": summarization_id,
                "transcription_text": transcription_text,
                "summarization_text": summarization_text,
                "processing_time": processing_time
            }
            
        except Exception as e:
            logger.error(f"❌ Erro ao processar áudio {audio_record_id}: {e}")
            await self._update_audio_status(audio_record_id, AudioStatus.ERROR)
            return {
                "success": False,
                "audio_record_id": audio_record_id,
                "error": str(e),
                "processing_time": time.time() - start_time
            }
    
    async def _save_transcription(
        self,
        audio_record_id: UUID,
        text: str,
        language: str,
        confidence: Optional[float],
        model_used: str,
        processing_time: Optional[float]
    ) -> UUID:
        """Salva transcrição no banco."""
        transcription = Transcription(
            audio_record_id=audio_record_id,
            text=text,
            language=language,
            confidence=confidence,
            model_used=model_used,
            processing_time=processing_time
        )
        self.db.add(transcription)
        await self.db.flush()
        return transcription.id
    
    async def _save_summarization(
        self,
        audio_record_id: UUID,
        transcription_id: UUID,
        text: str,
        original_length: Optional[int],
        summarized_length: Optional[int],
        compression_ratio: Optional[float],
        model_used: str,
        processing_time: Optional[float]
    ) -> UUID:
        """Salva sumarização no banco."""
        summarization = Summarization(
            audio_record_id=audio_record_id,
            transcription_id=transcription_id,
            text=text,
            original_length=original_length,
            summarized_length=summarized_length,
            compression_ratio=compression_ratio,
            model_used=model_used,
            processing_time=processing_time
        )
        self.db.add(summarization)
        await self.db.flush()
        return summarization.id
    
    async def _update_audio_status(self, audio_record_id: UUID, status: AudioStatus):
        """Atualiza status do registro de áudio."""
        stmt = select(AudioRecord).where(AudioRecord.id == audio_record_id)
        result = await self.db.execute(stmt)
        audio_record = result.scalar_one_or_none()
        
        if audio_record:
            audio_record.status = status
            audio_record.updated_at = datetime.utcnow()
            if status in [AudioStatus.COMPLETED, AudioStatus.SUMMARIZED]:
                audio_record.processed_at = datetime.utcnow()
            await self.db.flush()
    
    async def _notify_external_systems(
        self,
        audio_record_id: UUID,
        agent_id: str,
        patient_id: str,
        transcription_text: str,
        summarization_text: str
    ):
        """Notifica os sistemas externos sobre o processamento concluído."""
        payload = {
            "audio_record_id": str(audio_record_id),
            "agent_id": agent_id,
            "patient_id": patient_id,
            "transcription_text": transcription_text,
            "summarization_text": summarization_text,
            "processed_at": datetime.utcnow().isoformat()
        }
        
        # Executa notificações em paralelo para ganhar performance
        await asyncio.gather(
            self._notify_backend(payload),
            self._notify_frontend(payload),
            self._notify_app(payload),
            return_exceptions=True # Evita que uma falha em um sistema pare os outros
        )

    async def _notify_backend(self, payload: dict):
        """Notifica o backend principal usando backend_url e backend_api_key."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{settings.backend_url}/api/v1/audio/summarized",
                    json={"type": "audio_summarized", "payload": payload},
                    # Usa o atributo corrigido no Settings
                    headers={"Authorization": f"Bearer {settings.backend_api_key}"},
                    timeout=10.0
                )
                logger.info(f"✅ Backend notificado: {response.status_code}")
        except Exception as e:
            logger.error(f"❌ Erro ao notificar backend em {settings.backend_url}: {e}")

    async def _notify_frontend(self, payload: dict):
        """Notifica o frontend usando frontend_url."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{settings.frontend_url}/api/v1/audio/processed",
                    json={"type": "audio_processed", "payload": payload},
                    timeout=10.0
                )
                logger.info(f"✅ Frontend notificado: {response.status_code}")
        except Exception as e:
            logger.error(f"❌ Erro ao notificar frontend em {settings.frontend_url}: {e}")

    async def _notify_app(self, payload: dict):
        """Notifica o aplicativo móvel usando appconecta_url."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{settings.appconecta_url}/api/v1/audio/ready",
                    json={"type": "audio_ready", "data": payload},
                    timeout=10.0
                )
                logger.info(f"✅ App notificado: {response.status_code}")
        except Exception as e:
            logger.error(f"❌ Erro ao notificar app em {settings.appconecta_url}: {e}")