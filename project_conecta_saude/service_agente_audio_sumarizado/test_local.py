#!/usr/bin/env python
"""
Script para testes locais da API
"""

import asyncio
import httpx
import json
from pathlib import Path

# Configuração
BASE_URL = "http://localhost:8003/api/v1"
AGENT_ID = "health_agent_001"
PATIENT_ID = "patient_12345"


async def test_health_check():
    """Testa health check."""
    print("\n🔍 Testando Health Check...")
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200


async def test_agents_status():
    """Testa status dos agentes."""
    print("\n🤖 Testando Status dos Agentes...")
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/health/agents")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200


async def test_upload_audio():
    """Testa upload de áudio."""
    print("\n📤 Testando Upload de Áudio...")
    
    # Verificar se existe arquivo de teste
    test_file = Path("test_audio.mp3")
    if not test_file.exists():
        print("⚠️  Arquivo de teste não encontrado. Criando...")
        # Você pode criar um arquivo de teste aqui ou usar um existente
        print("❌ Por favor, adicione um arquivo test_audio.mp3")
        return False
    
    async with httpx.AsyncClient() as client:
        with open(test_file, "rb") as f:
            files = {"file": (test_file.name, f, "audio/mpeg")}
            data = {
                "agent_id": AGENT_ID,
                "patient_id": PATIENT_ID
            }
            
            response = await client.post(
                f"{BASE_URL}/audio/upload",
                files=files,
                data=data
            )
            
            print(f"Status: {response.status_code}")
            print(f"Response: {json.dumps(response.json(), indent=2)}")
            
            if response.status_code == 200:
                audio_id = response.json().get("id")
                return audio_id
    
    return None


async def test_get_audio_status(audio_id):
    """Testa obtenção de status de áudio."""
    print(f"\n📊 Testando Get Audio Status ({audio_id})...")
    
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/audio/{audio_id}")
        
        if response.status_code == 200:
            print(f"Status: {response.status_code}")
            print(f"Response: {json.dumps(response.json(), indent=2, default=str)}")
        elif response.status_code == 404:
            print(f"Status: {response.status_code} - Ainda processando...")
        else:
            print(f"Status: {response.status_code}")
            print(f"Error: {response.text}")
        
        return response.status_code


async def main():
    """Executa testes."""
    print("=" * 60)
    print("🎤 Testes da API de Audio Sumarizado")
    print("=" * 60)
    
    # Test 1: Health Check
    health_ok = await test_health_check()
    
    if not health_ok:
        print("\n❌ Health check falhou! Serviço não está rodando.")
        print("Inicie com: docker-compose up -d")
        return
    
    # Test 2: Agents Status
    await test_agents_status()
    
    # Test 3: Upload Audio
    audio_id = await test_upload_audio()
    
    if audio_id:
        print(f"\n⏳ Aguardando processamento (audio_id: {audio_id})...")
        await asyncio.sleep(5)
        
        # Test 4: Get Status
        await test_get_audio_status(audio_id)
    
    print("\n" + "=" * 60)
    print("✅ Testes concluídos!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
