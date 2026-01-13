"""
Modelo para transcrições de áudio
"""

from sqlalchemy import Column, String, Text, DateTime, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from datetime import datetime
import uuid
from app.database import Base

class Transcription(Base):
    """Transcrição de áudio."""
    __tablename__ = "transcriptions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    audio_record_id = Column(UUID(as_uuid=True), ForeignKey("audio_records.id"), nullable=False, index=True)
    
    # Conteúdo
    text = Column(Text, nullable=False)
    language = Column(String(10), nullable=True)
    confidence = Column(Float, nullable=True)
    
    # Processamento
    model_used = Column(String(100), nullable=False)
    processing_time = Column(Float, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Adicional
    extra_metadata = Column("metadata", JSONB, nullable=True)
    
    def __repr__(self):
        return f"<Transcription {self.id} - {len(self.text)} chars>"
