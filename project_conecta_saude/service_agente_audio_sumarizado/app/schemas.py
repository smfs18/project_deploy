"""
Schemas para API
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
import uuid

class AudioStatus(str, Enum):
    """Estados possíveis de um áudio."""
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    TRANSCRIBED = "transcribed"
    SUMMARIZED = "summarized"
    COMPLETED = "completed"
    ERROR = "error"

# ============= AUDIO RECORDS =============

class AudioRecordCreate(BaseModel):
    """Criar novo registro de áudio."""
    agent_id: str = Field(..., description="ID do agente de saúde")
    patient_id: str = Field(..., description="ID do paciente")
    filename: str = Field(..., description="Nome do arquivo")
    file_format: str = Field(..., description="Formato do arquivo (mp3, wav, m4a, ogg)")
    file_size: Optional[int] = Field(None, description="Tamanho do arquivo em bytes")
    duration: Optional[float] = Field(None, description="Duração do áudio em segundos")
    notes: Optional[str] = Field(None, description="Notas adicionais")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Metadata adicional")

class AudioRecordResponse(BaseModel):
    """Resposta com registro de áudio."""
    id: uuid.UUID
    agent_id: str
    patient_id: str
    filename: str
    file_path: Optional[str]
    file_size: Optional[int]
    file_format: str
    duration: Optional[float]
    status: AudioStatus
    created_at: datetime
    updated_at: datetime
    processed_at: Optional[datetime]
    notes: Optional[str]
    metadata: Optional[Dict[str, Any]] = {}

    class Config:
        from_attributes = True

# ============= TRANSCRIPTIONS =============

class TranscriptionCreate(BaseModel):
    """Criar nova transcrição."""
    audio_record_id: uuid.UUID = Field(..., description="ID do registro de áudio")
    text: str = Field(..., description="Texto transcrito")
    language: Optional[str] = Field(None, description="Idioma detectado")
    confidence: Optional[float] = Field(None, description="Confiança da transcrição")
    model_used: str = Field(..., description="Modelo utilizado")
    processing_time: Optional[float] = Field(None, description="Tempo de processamento")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Metadata adicional")

class TranscriptionResponse(BaseModel):
    """Resposta com transcrição."""
    id: uuid.UUID
    audio_record_id: uuid.UUID
    text: str
    language: Optional[str]
    confidence: Optional[float]
    model_used: str
    processing_time: Optional[float]
    created_at: datetime
    metadata: Optional[Dict[str, Any]]

    class Config:
        from_attributes = True

# ============= SUMMARIZATIONS =============

class SummarizationCreate(BaseModel):
    """Criar nova sumarização."""
    audio_record_id: uuid.UUID = Field(..., description="ID do registro de áudio")
    transcription_id: uuid.UUID = Field(..., description="ID da transcrição")
    text: str = Field(..., description="Texto sumarizado")
    original_length: Optional[int] = Field(None, description="Tamanho do texto original")
    summarized_length: Optional[int] = Field(None, description="Tamanho do resumo")
    compression_ratio: Optional[float] = Field(None, description="Taxa de compressão")
    model_used: str = Field(..., description="Modelo utilizado")
    processing_time: Optional[float] = Field(None, description="Tempo de processamento")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Metadata adicional")

class SummarizationResponse(BaseModel):
    """Resposta com sumarização."""
    id: uuid.UUID
    audio_record_id: uuid.UUID
    transcription_id: uuid.UUID
    text: str
    original_length: Optional[int]
    summarized_length: Optional[int]
    compression_ratio: Optional[float]
    model_used: str
    processing_time: Optional[float]
    created_at: datetime
    metadata: Optional[Dict[str, Any]]

    class Config:
        from_attributes = True

# ============= PROCESSING REQUESTS =============

class ProcessAudioRequest(BaseModel):
    """Request para processar áudio."""
    agent_id: str = Field(..., description="ID do agente de saúde")
    patient_id: str = Field(..., description="ID do paciente")
    file_url: str = Field(..., description="URL do arquivo de áudio")
    filename: str = Field(..., description="Nome do arquivo")
    file_size: Optional[int] = Field(None, description="Tamanho em bytes")
    duration: Optional[float] = Field(None, description="Duração em segundos")
    notes: Optional[str] = Field(None, description="Notas")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Metadata")

class ProcessAudioResponse(BaseModel):
    """Response do processamento de áudio."""
    audio_record_id: uuid.UUID
    transcription_id: uuid.UUID
    summarization_id: uuid.UUID
    transcription_text: str
    summarization_text: str
    processing_time: float
    status: AudioStatus

class AudioProcessingResult(BaseModel):
    """Resultado completo do processamento."""
    audio_record: AudioRecordResponse
    transcription: TranscriptionResponse
    summarization: SummarizationResponse
    processing_time: float
    status: str

# ============= NOTIFICATIONS =============

class NotificationPayload(BaseModel):
    """Payload para notificar sistemas externos."""
    audio_record_id: uuid.UUID
    agent_id: str
    patient_id: str
    transcription_text: str
    summarization_text: str
    status: AudioStatus
    created_at: datetime
    processed_at: datetime

class BackendNotification(BaseModel):
    """Notificação para backend principal."""
    type: str = "audio_summarized"
    payload: NotificationPayload

class FrontendNotification(BaseModel):
    """Notificação para frontend."""
    type: str = "audio_processed"
    payload: NotificationPayload

class AppNotification(BaseModel):
    """Notificação para aplicativo móvel."""
    type: str = "audio_ready"
    data: Dict[str, Any]
