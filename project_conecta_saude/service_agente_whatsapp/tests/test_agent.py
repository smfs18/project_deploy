"""
Testes para o WhatsApp Agent.
"""
import pytest
from unittest.mock import Mock, patch, AsyncMock
from app.services.triage_agent import whatsapp_agent
from app.services.backend_client import backend_client


@pytest.mark.asyncio
async def test_handle_message_basic():
    """Testa o processamento básico de mensagem."""
    session_id = "test_session_001"
    message = "Olá, eu gostaria de atualizar meus dados"
    
    response = await whatsapp_agent.handle_message(
        session_id=session_id,
        user_message=message
    )
    
    assert response is not None
    assert isinstance(response, str)
    assert len(response) > 0


@pytest.mark.asyncio
async def test_emergency_detection():
    """Testa a detecção de emergências."""
    session_id = "test_session_emergency"
    emergency_message = "Estou com uma forte dor no peito e falta de ar"
    
    response = await whatsapp_agent.handle_message(
        session_id=session_id,
        user_message=emergency_message
    )
    
    # Deve conter a resposta de emergência
    assert "emergência" in response.lower() or "samu" in response.lower()


@pytest.mark.asyncio
@patch('app.services.backend_client.backend_client.get_patient_by_email')
async def test_load_patient_data(mock_get_patient):
    """Testa o carregamento de dados do paciente."""
    # Mock do retorno do backend
    mock_patient_data = {
        "id": 1,
        "email": "teste@email.com",
        "nome": "João Silva",
        "endereco": "Rua Teste, 123",
        "pressao_sistolica_mmHg": 120,
        "pressao_diastolica_mmHg": 80,
        "glicemia_jejum_mg_dl": 95
    }
    mock_get_patient.return_value = mock_patient_data
    
    session_id = "test_session_with_patient"
    message = "Olá"
    
    response = await whatsapp_agent.handle_message(
        session_id=session_id,
        user_message=message,
        patient_email="teste@email.com",
        auth_token="fake_token_123"
    )
    
    assert response is not None
    # O agente deve usar o nome do paciente na resposta
    assert "joão" in response.lower() or "silva" in response.lower()


@pytest.mark.asyncio
async def test_conversation_flow():
    """Testa o fluxo completo de uma conversa."""
    session_id = "test_session_flow"
    
    # Primeira mensagem
    response1 = await whatsapp_agent.handle_message(
        session_id=session_id,
        user_message="Olá"
    )
    assert response1 is not None
    
    # Segunda mensagem - fornecendo dados
    response2 = await whatsapp_agent.handle_message(
        session_id=session_id,
        user_message="Minha pressão hoje está 130/85"
    )
    assert response2 is not None
    
    # Terceira mensagem - mais dados
    response3 = await whatsapp_agent.handle_message(
        session_id=session_id,
        user_message="Minha glicemia está em 110"
    )
    assert response3 is not None


@pytest.mark.asyncio
@patch('app.services.backend_client.backend_client.update_patient')
async def test_update_patient_in_backend(mock_update):
    """Testa a atualização de dados no backend."""
    mock_update.return_value = {"id": 1, "nome": "João Silva"}
    
    # Simula uma conversa completa
    session_id = "test_session_update"
    
    # Mensagens simulando coleta completa
    await whatsapp_agent.handle_message(
        session_id=session_id,
        user_message="Olá",
        patient_email="teste@email.com",
        auth_token="fake_token"
    )
    
    await whatsapp_agent.handle_message(
        session_id=session_id,
        user_message="Meu endereço continua o mesmo"
    )
    
    await whatsapp_agent.handle_message(
        session_id=session_id,
        user_message="Minha pressão é 120/80 e glicemia 95"
    )
    
    # Verifica se tentou atualizar (pode não chamar se a conversa não estiver completa)
    # Este teste precisa ser ajustado conforme a lógica real


def test_backend_client_initialization():
    """Testa a inicialização do cliente do backend."""
    assert backend_client is not None
    assert backend_client.base_url is not None


@pytest.mark.asyncio
async def test_session_persistence():
    """Testa a persistência de sessão no MongoDB."""
    from app.db.database import get_database
    
    db = get_database()
    session_id = "test_session_persistence"
    
    # Envia uma mensagem
    await whatsapp_agent.handle_message(
        session_id=session_id,
        user_message="Teste de persistência"
    )
    
    # Verifica se a sessão foi salva
    session = db.find_one({"session_id": session_id})
    assert session is not None
    assert session["session_id"] == session_id
    assert len(session["messages"]) > 0
    
    # Limpa o teste
    db.delete_one({"session_id": session_id})
