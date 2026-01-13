# 📖 Documentação da API

API Reference para o Service Agente Audio Sumarizado.

## Base URL

```
http://localhost:8003/api/v1
```

## Autenticação

Atualmente não requerida, mas prepare-se para adicionar:

```bash
Authorization: Bearer {api_token}
```

## 🏥 Health & Status

### GET /health
Health check básico.

**Response 200:**
```json
{
  "status": "ok",
  "service": "Audio Sumarizado Agent",
  "timestamp": "2024-01-05T10:30:00Z",
  "version": "1.0.0"
}
```

### GET /health/agents
Status dos agentes.

**Response 200:**
```json
{
  "transcription_agent": {
    "agent": "TranscriptionAgent",
    "model": "whisper-1",
    "is_available": true,
    "timestamp": "2024-01-05T10:30:00Z"
  },
  "summarization_agent": {
    "agent": "SummarizationAgent",
    "model": "facebook/bart-large-cnn",
    "is_available": true,
    "timestamp": "2024-01-05T10:30:00Z"
  }
}
```

## 🎤 Audio Management

### POST /audio/upload
Fazer upload de arquivo de áudio.

**Request:**
```bash
curl -X POST http://localhost:8003/api/v1/audio/upload \
  -F "file=@audio.mp3" \
  -F "agent_id=agent_123" \
  -F "patient_id=patient_456"
```

**Parameters:**
- `file` (multipart/form-data, required): Arquivo de áudio
- `agent_id` (string, required): ID do agente de saúde
- `patient_id` (string, required): ID do paciente
- `notes` (string, optional): Notas adicionais

**Response 200:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "agent_id": "agent_123",
  "patient_id": "patient_456",
  "filename": "audio.mp3",
  "file_path": "/tmp/550e8400-e29b-41d4-a716-446655440000.mp3",
  "file_size": 12345,
  "file_format": "mp3",
  "duration": null,
  "status": "uploaded",
  "created_at": "2024-01-05T10:30:00Z",
  "updated_at": "2024-01-05T10:30:00Z",
  "processed_at": null,
  "notes": null,
  "metadata": null
}
```

**Status Codes:**
- `200`: Sucesso
- `400`: Dados inválidos
- `500`: Erro no servidor

---

### POST /audio/process-url
Processar áudio a partir de URL.

**Request:**
```json
{
  "agent_id": "agent_123",
  "patient_id": "patient_456",
  "file_url": "https://example.com/audio.mp3",
  "filename": "audio.mp3",
  "file_size": 12345,
  "duration": 30.5,
  "notes": "Consulta de acompanhamento",
  "metadata": {
    "clinic": "clinic_001"
  }
}
```

**Response 200:**
```json
{
  "audio_record_id": "550e8400-e29b-41d4-a716-446655440000",
  "transcription_id": null,
  "summarization_id": null,
  "transcription_text": "",
  "summarization_text": "",
  "processing_time": 0.0,
  "status": "uploaded"
}
```

**Status Codes:**
- `200`: Sucesso
- `400`: Dados inválidos
- `500`: Erro na requisição

---

### GET /audio/{audio_record_id}
Obter resultado completo do processamento.

**Parameters:**
- `audio_record_id` (path, required): UUID do registro de áudio

**Response 200:**
```json
{
  "audio_record": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "agent_id": "agent_123",
    "patient_id": "patient_456",
    "filename": "audio.mp3",
    "status": "completed",
    "created_at": "2024-01-05T10:30:00Z",
    "processed_at": "2024-01-05T10:35:00Z"
  },
  "transcription": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "audio_record_id": "550e8400-e29b-41d4-a716-446655440000",
    "text": "Paciente relata febre alta desde ontem...",
    "language": "pt-BR",
    "confidence": 0.95,
    "model_used": "whisper-1",
    "processing_time": 3.2,
    "created_at": "2024-01-05T10:32:00Z"
  },
  "summarization": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "audio_record_id": "550e8400-e29b-41d4-a716-446655440000",
    "text": "Febre alta. Repouso e hidratação recomendados.",
    "original_length": 234,
    "summarized_length": 55,
    "compression_ratio": 0.23,
    "model_used": "facebook/bart-large-cnn",
    "processing_time": 2.1,
    "created_at": "2024-01-05T10:34:00Z"
  },
  "processing_time": 5.3,
  "status": "completed"
}
```

**Status Codes:**
- `200`: Sucesso
- `404`: Áudio ou resultado não encontrado
- `500`: Erro no servidor

---

### GET /audio/{audio_record_id}/transcription
Obter apenas a transcrição.

**Response 200:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "audio_record_id": "550e8400-e29b-41d4-a716-446655440000",
  "text": "Paciente relata febre alta...",
  "language": "pt-BR",
  "confidence": 0.95,
  "model_used": "whisper-1",
  "processing_time": 3.2,
  "created_at": "2024-01-05T10:32:00Z",
  "metadata": null
}
```

---

### GET /audio/{audio_record_id}/summarization
Obter apenas a sumarização.

**Response 200:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "audio_record_id": "550e8400-e29b-41d4-a716-446655440000",
  "transcription_id": "550e8400-e29b-41d4-a716-446655440001",
  "text": "Febre alta. Repouso recomendado.",
  "original_length": 234,
  "summarized_length": 55,
  "compression_ratio": 0.23,
  "model_used": "facebook/bart-large-cnn",
  "processing_time": 2.1,
  "created_at": "2024-01-05T10:34:00Z",
  "metadata": null
}
```

## 📊 Status Codes

| Code | Meaning | Descrição |
|------|---------|-----------|
| 200 | OK | Requisição bem-sucedida |
| 400 | Bad Request | Dados inválidos ou incompletos |
| 404 | Not Found | Recurso não encontrado |
| 500 | Server Error | Erro interno do servidor |

## 🔄 Estados do Áudio

| Estado | Descrição |
|--------|-----------|
| `uploaded` | Áudio recebido, aguardando processamento |
| `processing` | Processamento em andamento |
| `transcribed` | Transcrição concluída |
| `summarized` | Sumarização concluída |
| `completed` | Processo completo |
| `error` | Erro durante o processamento |

## 📦 Tipos de Dados

### AudioRecord
```json
{
  "id": "uuid",
  "agent_id": "string",
  "patient_id": "string",
  "filename": "string",
  "file_path": "string|null",
  "file_size": "integer|null",
  "file_format": "string",
  "duration": "float|null",
  "status": "uploaded|processing|transcribed|summarized|completed|error",
  "created_at": "ISO 8601 datetime",
  "updated_at": "ISO 8601 datetime",
  "processed_at": "ISO 8601 datetime|null",
  "notes": "string|null",
  "metadata": "object|null"
}
```

### Transcription
```json
{
  "id": "uuid",
  "audio_record_id": "uuid",
  "text": "string",
  "language": "string|null",
  "confidence": "float|null",
  "model_used": "string",
  "processing_time": "float|null",
  "created_at": "ISO 8601 datetime",
  "metadata": "object|null"
}
```

### Summarization
```json
{
  "id": "uuid",
  "audio_record_id": "uuid",
  "transcription_id": "uuid",
  "text": "string",
  "original_length": "integer|null",
  "summarized_length": "integer|null",
  "compression_ratio": "float|null",
  "model_used": "string",
  "processing_time": "float|null",
  "created_at": "ISO 8601 datetime",
  "metadata": "object|null"
}
```

## 🔗 Exemplos Completos

### Exemplo 1: Upload e Processamento

```bash
# 1. Upload
RESPONSE=$(curl -X POST http://localhost:8003/api/v1/audio/upload \
  -F "file=@meu_audio.mp3" \
  -F "agent_id=agent_001" \
  -F "patient_id=patient_123")

AUDIO_ID=$(echo $RESPONSE | jq -r '.id')

# 2. Aguardar (processamento assíncrono)
sleep 5

# 3. Obter resultado
curl http://localhost:8003/api/v1/audio/$AUDIO_ID | jq .
```

### Exemplo 2: Processamento por URL

```bash
curl -X POST http://localhost:8003/api/v1/audio/process-url \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "agent_001",
    "patient_id": "patient_123",
    "file_url": "https://example.com/audio.mp3",
    "filename": "audio.mp3",
    "notes": "Consulta de follow-up"
  }'
```

---

**Documentação gerada**: Janeiro 2024
