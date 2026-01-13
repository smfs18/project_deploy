"""
Rotas de Health Check
"""

from fastapi import APIRouter
from datetime import datetime

router = APIRouter()

@router.get("/health", tags=["Health"])
async def health_check():
    """Health check da aplicação."""
    return {
        "status": "ok",
        "service": "Audio Sumarizado Agent",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }

@router.get("/health/agents", tags=["Health"])
async def agents_health():
    """Status dos agentes."""
    from app.agents import TranscriptionAgent, SummarizationAgent
    
    transcription_agent = TranscriptionAgent()
    summarization_agent = SummarizationAgent()
    
    return {
        "transcription_agent": await transcription_agent.get_status(),
        "summarization_agent": await summarization_agent.get_status()
    }
