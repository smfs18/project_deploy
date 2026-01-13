# 🚀 Quick Start - Audio Sumarizado

Guia rápido para começar a usar o Service Agente Audio Sumarizado.

## ⚡ Inicialização Rápida (5 minutos)

### 1. Pré-requisitos
```bash
# Instalar Docker e Docker Compose
# Confirmar que Python 3.11+ está instalado
python --version
```

### 2. Clonar e Configurar
```bash
git clone https://github.com/Conect-saude/service_agente_audio_sumarizado.git
cd service_agente_audio_sumarizado

# Copiar configurações
cp .env.example .env

# Editar .env com suas chaves (especialmente OPENAI_API_KEY)
nano .env
```

### 3. Iniciar Serviço
```bash
# Com Docker Compose (recomendado)
docker-compose up -d

# Ou manualmente
pip install -r requirements.txt
python main.py
```

### 4. Verificar Status
```bash
curl http://localhost:8003/api/v1/health

# Resposta esperada:
# {
#   "status": "ok",
#   "service": "Audio Sumarizado Agent",
#   "version": "1.0.0"
# }
```

## 📤 Usar a API

### Upload de Áudio
```bash
curl -X POST http://localhost:8003/api/v1/audio/upload \
  -F "file=@meu_audio.mp3" \
  -F "agent_id=agent_123" \
  -F "patient_id=patient_456"

# Salve o "id" retornado para próximos passos
```

### Consultar Resultado
```bash
# Aguarde alguns segundos após o upload
sleep 5

# Consulte o resultado
curl http://localhost:8003/api/v1/audio/{audio_id}

# Resposta contém:
# - transcription_text: Texto transcrito
# - summarization_text: Texto sumarizado
# - processing_time: Tempo total
# - status: completed
```

## 🐍 Usar com Python

```python
import httpx
import asyncio

async def process_audio():
    # Upload
    with open("audio.mp3", "rb") as f:
        files = {"file": f}
        data = {
            "agent_id": "agent_123",
            "patient_id": "patient_456"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "http://localhost:8003/api/v1/audio/upload",
                files=files,
                data=data
            )
            audio_id = response.json()["id"]
    
    # Aguardar e consultar
    await asyncio.sleep(5)
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"http://localhost:8003/api/v1/audio/{audio_id}"
        )
        result = response.json()
        
        print(f"Transcrição: {result['transcription']['text']}")
        print(f"Sumarização: {result['summarization']['text']}")

asyncio.run(process_audio())
```

## 🔗 Integração com Backend

O serviço notifica automaticamente quando um áudio é processado:

```bash
# Backend recebe POST em:
POST {BACKEND_URL}/api/v1/audio/summarized

# Payload:
{
  "type": "audio_summarized",
  "payload": {
    "audio_record_id": "uuid",
    "agent_id": "agent_123",
    "patient_id": "patient_456",
    "transcription_text": "...",
    "summarization_text": "...",
    "processed_at": "2024-01-05T10:30:00Z"
  }
}
```

## 📱 Integração com Aplicativo

O serviço também notifica o aplicativo:

```bash
# App recebe POST em:
POST {APPCONECTA_URL}/api/v1/audio/ready

# Payload:
{
  "type": "audio_ready",
  "data": {
    "audio_record_id": "uuid",
    "agent_id": "agent_123",
    "patient_id": "patient_456",
    "transcription": "...",
    "summary": "...",
    "processed_at": "2024-01-05T10:30:00Z"
  }
}
```

## 🛠️ Troubleshooting

### Erro: Porta 8003 já em uso
```bash
# Alterar em .env
API_PORT=8004

# Ou verificar qual serviço está usando
lsof -i :8003
```

### Erro: Banco de dados não conecta
```bash
# Verificar se PostgreSQL está rodando
docker-compose ps

# Reiniciar
docker-compose restart postgres
```

### Modelo não carrega
```bash
# Baixar modelos manualmente
python -c "from transformers import pipeline; pipeline('summarization', model='facebook/bart-large-cnn')"
```

## 📚 Documentação Completa

- Acesse a documentação interativa: http://localhost:8003/docs
- API reference: http://localhost:8003/redoc
- Leia [README.md](README.md) para mais detalhes

## 💡 Dicas

1. **Use GPU**: Se tiver CUDA disponível, os modelos serão ~10x mais rápidos
2. **Cache de modelos**: Os modelos são baixados uma vez e reutilizados
3. **Processamento assíncrono**: Não bloqueia - processa em background
4. **Monitorar logs**: `docker-compose logs -f audio_service`

## ✅ Próximos Passos

1. Editar `.env` com suas configurações
2. Executar testes: `./test_api.sh`
3. Integrar com seu backend
4. Fazer deploy em produção

Sucesso! 🎉
