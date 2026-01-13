"""
Exemplo de integração com o Backend Principal
"""

import httpx
import asyncio
from datetime import datetime

class BackendIntegration:
    """Integração com o backend principal."""
    
    def __init__(self, backend_url: str, api_key: str = None):
        """
        Inicializa integração com backend.
        
        Args:
            backend_url: URL base do backend
            api_key: Chave de API (opcional)
        """
        self.backend_url = backend_url
        self.api_key = api_key
        self.headers = {}
        
        if api_key:
            self.headers["Authorization"] = f"Bearer {api_key}"
    
    async def send_audio_summary(
        self,
        agent_id: str,
        patient_id: str,
        transcription_text: str,
        summarization_text: str,
        audio_record_id: str
    ) -> dict:
        """
        Envia sumarização de áudio para o backend.
        
        Args:
            agent_id: ID do agente
            patient_id: ID do paciente
            transcription_text: Texto transcrito
            summarization_text: Texto sumarizado
            audio_record_id: ID do registro de áudio
            
        Returns:
            Resposta do backend
        """
        payload = {
            "type": "audio_summarized",
            "payload": {
                "audio_record_id": audio_record_id,
                "agent_id": agent_id,
                "patient_id": patient_id,
                "transcription_text": transcription_text,
                "summarization_text": summarization_text,
                "processed_at": datetime.utcnow().isoformat()
            }
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.backend_url}/api/v1/audio/summarized",
                json=payload,
                headers=self.headers,
                timeout=10.0
            )
            
            return {
                "status_code": response.status_code,
                "response": response.json() if response.status_code < 300 else {"error": response.text}
            }
    
    async def get_patient_data(self, patient_id: str) -> dict:
        """
        Busca dados do paciente no backend.
        
        Args:
            patient_id: ID do paciente
            
        Returns:
            Dados do paciente
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.backend_url}/api/v1/patients/{patient_id}",
                headers=self.headers,
                timeout=10.0
            )
            
            return response.json() if response.status_code == 200 else None
    
    async def get_agent_data(self, agent_id: str) -> dict:
        """
        Busca dados do agente no backend.
        
        Args:
            agent_id: ID do agente
            
        Returns:
            Dados do agente
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.backend_url}/api/v1/agents/{agent_id}",
                headers=self.headers,
                timeout=10.0
            )
            
            return response.json() if response.status_code == 200 else None


# Exemplo de uso
async def example():
    """Exemplo de como usar a integração."""
    
    backend = BackendIntegration(
        backend_url="http://localhost:8082",
    )
    
    # Enviar sumarização
    result = await backend.send_audio_summary(
        agent_id="agent_001",
        patient_id="patient_123",
        transcription_text="O paciente relata febre alta...",
        summarization_text="Febre alta, necessário acompanhamento",
        audio_record_id="uuid-do-audio"
    )
    
    print("Resultado:", result)
    
    # Buscar dados do paciente
    patient = await backend.get_patient_data("patient_123")
    print("Paciente:", patient)
    
    # Buscar dados do agente
    agent = await backend.get_agent_data("agent_001")
    print("Agente:", agent)


if __name__ == "__main__":
    asyncio.run(example())
