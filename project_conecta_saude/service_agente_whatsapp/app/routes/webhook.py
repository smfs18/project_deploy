from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.triage_agent import whatsapp_agent


router = APIRouter()


class UserInput(BaseModel):
    """Modelo de entrada para mensagens do WhatsApp."""
    session_id: str
    message: str
    patient_email: Optional[str] = None  # Email do paciente para buscar dados no backend
    auth_token: Optional[str] = None  # Token de autenticação para o backend


@router.post("/chat", tags=["Chat"])
async def handle_chat_message(user_input: UserInput):
    """
    Endpoint principal para processar mensagens do WhatsApp.
    
    - Verifica emergências médicas
    - Carrega dados do paciente se disponível
    - Conduz conversa para coletar/atualizar informações
    - Atualiza banco de dados quando conversa termina
    """
    if not user_input.message or not user_input.session_id:
        raise HTTPException(
            status_code=400, 
            detail="session_id e message são obrigatórios."
        )
    
    try:
        response = await whatsapp_agent.handle_message(
            session_id=user_input.session_id,
            user_message=user_input.message,
            patient_email=user_input.patient_email,
            auth_token=user_input.auth_token
        )
        return {"response": response}
    except Exception as e:
        print(f"❌ Erro ao processar mensagem: {e}")
        raise HTTPException(
            status_code=500, 
            detail="Ocorreu um erro interno no servidor."
        )


@router.post("/reset-session", tags=["Chat"])
async def reset_session(session_id: str):
    """
    Reseta uma sessão de conversa.
    Útil para testar ou quando o paciente quer começar uma nova conversa.
    """
    try:
        from app.db.database import get_database
        db = get_database()
        result = db.delete_one({"session_id": session_id})
        
        if result.deleted_count > 0:
            return {"message": "Sessão resetada com sucesso"}
        else:
            return {"message": "Sessão não encontrada"}
    except Exception as e:
        print(f"❌ Erro ao resetar sessão: {e}")
        raise HTTPException(
            status_code=500,
            detail="Erro ao resetar sessão"
        )

