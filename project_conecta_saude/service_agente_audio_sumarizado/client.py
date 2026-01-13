"""
Cliente Python para interagir com o Service Agente Audio Sumarizado
"""

import asyncio
import httpx
from pathlib import Path
from typing import Optional, Dict, Any
import json


class AudioSummarizadoClient:
    """Cliente para consumir a API de Audio Sumarizado."""
    
    def __init__(
        self,
        base_url: str = "http://localhost:8003/api/v1",
        timeout: float = 30.0
    ):
        """
        Inicializa o cliente.
        
        Args:
            base_url: URL base da API
            timeout: Timeout das requisições
        """
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
    
    async def health_check(self) -> Dict[str, Any]:
        """Verifica saúde da API."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/health",
                timeout=self.timeout
            )
            response.raise_for_status()
            return response.json()
    
    async def get_agents_status(self) -> Dict[str, Any]:
        """Obtém status dos agentes."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/health/agents",
                timeout=self.timeout
            )
            response.raise_for_status()
            return response.json()
    
    async def upload_audio(
        self,
        file_path: str,
        agent_id: str,
        patient_id: str,
        notes: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Faz upload de arquivo de áudio.
        
        Args:
            file_path: Caminho do arquivo
            agent_id: ID do agente
            patient_id: ID do paciente
            notes: Notas adicionais
            
        Returns:
            Resposta com ID do áudio
        """
        file_path = Path(file_path)
        
        if not file_path.exists():
            raise FileNotFoundError(f"Arquivo não encontrado: {file_path}")
        
        async with httpx.AsyncClient() as client:
            with open(file_path, "rb") as f:
                files = {"file": (file_path.name, f, "audio/mpeg")}
                data = {
                    "agent_id": agent_id,
                    "patient_id": patient_id,
                }
                if notes:
                    data["notes"] = notes
                
                response = await client.post(
                    f"{self.base_url}/audio/upload",
                    files=files,
                    data=data,
                    timeout=self.timeout
                )
                response.raise_for_status()
                return response.json()
    
    async def process_audio_from_url(
        self,
        file_url: str,
        agent_id: str,
        patient_id: str,
        filename: str,
        duration: Optional[float] = None,
        notes: Optional[str] = None,
        metadata: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Processa áudio a partir de URL.
        
        Args:
            file_url: URL do arquivo
            agent_id: ID do agente
            patient_id: ID do paciente
            filename: Nome do arquivo
            duration: Duração em segundos
            notes: Notas
            metadata: Metadata adicional
            
        Returns:
            Resposta com ID do áudio
        """
        payload = {
            "file_url": file_url,
            "agent_id": agent_id,
            "patient_id": patient_id,
            "filename": filename,
        }
        
        if duration:
            payload["duration"] = duration
        if notes:
            payload["notes"] = notes
        if metadata:
            payload["metadata"] = metadata
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/audio/process-url",
                json=payload,
                timeout=self.timeout
            )
            response.raise_for_status()
            return response.json()
    
    async def get_audio_result(self, audio_id: str) -> Dict[str, Any]:
        """
        Obtém resultado completo do processamento.
        
        Args:
            audio_id: ID do áudio
            
        Returns:
            Resultado com transcrição e sumarização
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/audio/{audio_id}",
                timeout=self.timeout
            )
            response.raise_for_status()
            return response.json()
    
    async def get_transcription(self, audio_id: str) -> Dict[str, Any]:
        """Obtém apenas a transcrição."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/audio/{audio_id}/transcription",
                timeout=self.timeout
            )
            response.raise_for_status()
            return response.json()
    
    async def get_summarization(self, audio_id: str) -> Dict[str, Any]:
        """Obtém apenas a sumarização."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/audio/{audio_id}/summarization",
                timeout=self.timeout
            )
            response.raise_for_status()
            return response.json()
    
    async def process_and_wait(
        self,
        file_path: str,
        agent_id: str,
        patient_id: str,
        wait_timeout: int = 60,
        poll_interval: int = 2
    ) -> Dict[str, Any]:
        """
        Faz upload e aguarda o resultado.
        
        Args:
            file_path: Caminho do arquivo
            agent_id: ID do agente
            patient_id: ID do paciente
            wait_timeout: Timeout em segundos
            poll_interval: Intervalo entre polls
            
        Returns:
            Resultado completo
        """
        # Upload
        print("📤 Fazendo upload...")
        upload_result = await self.upload_audio(
            file_path, agent_id, patient_id
        )
        audio_id = upload_result["id"]
        print(f"✅ Áudio enviado: {audio_id}")
        
        # Aguardar
        print("⏳ Aguardando processamento...")
        elapsed = 0
        while elapsed < wait_timeout:
            try:
                result = await self.get_audio_result(audio_id)
                if result["audio_record"]["status"] == "completed":
                    print("✅ Processamento concluído!")
                    return result
            except httpx.HTTPStatusError:
                pass
            
            await asyncio.sleep(poll_interval)
            elapsed += poll_interval
        
        raise TimeoutError(f"Processamento não concluído em {wait_timeout}s")


# Exemplo de uso
async def example():
    """Exemplo de uso do cliente."""
    
    # Criar cliente
    client = AudioSummarizadoClient(
        base_url="http://localhost:8003/api/v1"
    )
    
    try:
        # 1. Health check
        print("🔍 Verificando saúde da API...")
        health = await client.health_check()
        print(f"Status: {health['status']}")
        print()
        
        # 2. Status dos agentes
        print("🤖 Status dos agentes...")
        agents = await client.get_agents_status()
        print(json.dumps(agents, indent=2))
        print()
        
        # 3. Upload de áudio (substitua pelo seu arquivo)
        print("📤 Fazendo upload de áudio...")
        # audio_result = await client.upload_audio(
        #     file_path="meu_audio.mp3",
        #     agent_id="agent_001",
        #     patient_id="patient_123"
        # )
        # audio_id = audio_result["id"]
        # print(f"Audio ID: {audio_id}")
        # print()
        
        # 4. Processar e aguardar (comentado - use se tiver arquivo)
        # print("⏳ Processando áudio...")
        # result = await client.process_and_wait(
        #     file_path="meu_audio.mp3",
        #     agent_id="agent_001",
        #     patient_id="patient_123",
        #     wait_timeout=60
        # )
        # print("Resultado:")
        # print(json.dumps(result, indent=2, default=str))
        
    except Exception as e:
        print(f"❌ Erro: {e}")


if __name__ == "__main__":
    asyncio.run(example())
