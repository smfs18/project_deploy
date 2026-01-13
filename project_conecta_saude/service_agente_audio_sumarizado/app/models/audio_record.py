"""
Modelo para registrar áudios
"""

from sqlalchemy import Column, String, Integer, DateTime, Float, Enum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from datetime import datetime
import uuid
import enum
from app.database import Base

class AudioStatus(str, enum.Enum):
    """Estados possíveis de um áudio."""
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    TRANSCRIBED = "transcribed"
    SUMMARIZED = "summarized"
    COMPLETED = "completed"
    ERROR = "error"

class AudioRecord(Base):
    """Registro de áudio processado."""
    __tablename__ = "audio_records"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    agent_id = Column(String(100), nullable=False, index=True)
    patient_id = Column(String(100), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=True)
    file_size = Column(Integer, nullable=True)
    file_format = Column(String(10), nullable=False)
    duration = Column(Float, nullable=True)
    
    status = Column(Enum(AudioStatus), default=AudioStatus.UPLOADED, nullable=False)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    processed_at = Column(DateTime, nullable=True)
    
    # Adicional
    notes = Column(String(500), nullable=True)
    extra_metadata = Column("metadata", JSONB, nullable=True)
    
    def __repr__(self):
        return f"<AudioRecord {self.id} - {self.agent_id} - {self.status}>"
