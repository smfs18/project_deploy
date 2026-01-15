"""
Exemplo de integração com o Aplicativo (appconecta)
"""

import httpx
import asyncio
import os
from datetime import datetime
from typing import Dict, Any

class AppConectaIntegration:
    """Integração com o aplicativo Conecta Saúde."""
    
    def __init__(self, app_url: str, api_key: str = None):
        """
        Inicializa integração com aplicativo.
        
        Args:
            app_url: URL base do aplicativo
            api_key: Chave de API (opcional)
        """
        self.app_url = app_url
        self.api_key = api_key
        self.headers = {"Content-Type": "application/json"}
        
        if api_key:
            self.headers["Authorization"] = f"Bearer {api_key}"
    
    async def notify_audio_ready(
        self,
        agent_id: str,
        patient_id: str,
        transcription_text: str,
        summarization_text: str,
        audio_record_id: str,
        metadata: Dict[str, Any] = None
    ) -> dict:
        """
        Notifica o aplicativo que um áudio foi processado.
        
        Args:
            agent_id: ID do agente
            patient_id: ID do paciente
            transcription_text: Texto transcrito
            summarization_text: Texto sumarizado
            audio_record_id: ID do registro
            metadata: Metadata adicional
            
        Returns:
            Resposta do aplicativo
        """
        payload = {
            "type": "audio_ready",
            "data": {
                "audio_record_id": audio_record_id,
                "agent_id": agent_id,
                "patient_id": patient_id,
                "transcription": transcription_text,
                "summary": summarization_text,
                "processed_at": datetime.utcnow().isoformat(),
                "metadata": metadata or {}
            }
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.app_url}/api/v1/audio/ready",
                json=payload,
                headers=self.headers,
                timeout=10.0
            )
            
            return {
                "status_code": response.status_code,
                "response": response.json() if response.status_code < 300 else {"error": response.text}
            }
    
    async def send_notification(
        self,
        notification_type: str,
        user_id: str,
        title: str,
        message: str,
        data: Dict[str, Any] = None
    ) -> dict:
        """
        Envia notificação push para o usuário.
        
        Args:
            notification_type: Tipo de notificação
            user_id: ID do usuário
            title: Título da notificação
            message: Mensagem
            data: Dados adicionais
            
        Returns:
            Resposta do aplicativo
        """
        payload = {
            "type": notification_type,
            "user_id": user_id,
            "title": title,
            "message": message,
            "data": data or {},
            "sent_at": datetime.utcnow().isoformat()
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.app_url}/api/v1/notifications/send",
                json=payload,
                headers=self.headers,
                timeout=10.0
            )
            
            return {
                "status_code": response.status_code,
                "response": response.json() if response.status_code < 300 else {"error": response.text}
            }


# Exemplo de uso
async def example():
    """Exemplo de como usar a integração."""
    
    app = AppConectaIntegration(
        app_url=os.getenv("APP_CONECTA_URL", "http://app-conecta:3001"),
        api_key="app-api-key"
    )
    
    # Notificar que áudio foi processado
    result = await app.notify_audio_ready(
        agent_id="agent_001",
        patient_id="patient_123",
        transcription_text="O paciente relata febre alta...",
        summarization_text="Febre alta, necessário acompanhamento",
        audio_record_id="uuid-do-audio"
    )
    
    print("Resultado:", result)
    
    # Enviar notificação
    notification = await app.send_notification(
        notification_type="audio_processed",
        user_id="user_123",
        title="Áudio Processado",
        message="Seu áudio foi transcrito e sumarizado com sucesso!",
        data={"audio_id": "uuid-do-audio"}
    )
    
    print("Notificação:", notification)


if __name__ == "__main__":
    asyncio.run(example())
