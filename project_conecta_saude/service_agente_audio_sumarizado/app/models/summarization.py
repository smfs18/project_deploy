"""
Modelo para sumarizações
"""

from sqlalchemy import Column, String, Text, DateTime, Float, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from datetime import datetime
import uuid
from app.database import Base

class Summarization(Base):
    """Sumarização de transcrição."""
    __tablename__ = "summarizations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    audio_record_id = Column(UUID(as_uuid=True), ForeignKey("audio_records.id"), nullable=False, index=True)
    transcription_id = Column(UUID(as_uuid=True), ForeignKey("transcriptions.id"), nullable=False, index=True)
    
    # Conteúdo
    text = Column(Text, nullable=False)
    original_length = Column(Integer, nullable=True)
    summarized_length = Column(Integer, nullable=True)
    compression_ratio = Column(Float, nullable=True)
    
    # Processamento
    model_used = Column(String(100), nullable=False)
    processing_time = Column(Float, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Adicional
    extra_metadata = Column("metadata", JSONB, nullable=True)
    
    def __repr__(self):
        return f"<Summarization {self.id} - {len(self.text)} chars>"
