# 🎤 Service Agente Audio Sumarizado

Microsserviço para transcrição e sumarização de áudios dos agentes de saúde.

## 📋 Descrição

O **Service Agente Audio Sumarizado** é um microsserviço que implementa dois agentes inteligentes:

### 🎙️ Agente de Transcrição
- Recebe áudios do aplicativo dos agentes de saúde
- Transcreve o áudio para texto usando OpenAI Whisper ou modelo local
- Armazena a transcrição no banco de dados
- Suporta múltiplos formatos: MP3, WAV, M4A, OGG

### 📝 Agente de Sumarização
- Recebe o texto transcrito
- Sumariza utilizando modelos de IA avançados (BART, etc.)
- Calcula taxa de compressão
- Armazena o resumo no banco de dados

## 🏗️ Arquitetura

```
┌─────────────────────┐
│   Aplicativo Agentes│
│   ou Frontend/Back  │
└──────────┬──────────┘
           │
           ▼
┌──────────────────────────────────┐
│  Service Audio Sumarizado        │
├──────────────────────────────────┤
│ ┌────────────────────────────┐  │
│ │ API FastAPI                │  │
│ │ - Upload de áudio          │  │
│ │ - Processar por URL        │  │
│ │ - Consultar resultados     │  │
│ └────────────────────────────┘  │
│           │                      │
│           ▼                      │
│ ┌────────────────────────────┐  │
│ │ Agente Transcrição         │  │
│ │ (OpenAI Whisper / Local)   │  │
│ └────────────────────────────┘  │
│           │                      │
│           ▼                      │
│ ┌────────────────────────────┐  │
│ │ Agente Sumarização         │  │
│ │ (BART / Transformers)      │  │
│ └────────────────────────────┘  │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│ PostgreSQL                       │
│ (Áudios, Transcrições, Resumos)  │
└──────────────────────────────────┘
```

## 🚀 Quick Start

### Pré-requisitos
- Docker e Docker Compose
- Python 3.11+
- OpenAI API Key (opcional)

### 1. Clonar o repositório
```bash
git clone https://github.com/Conect-saude/service_agente_audio_sumarizado.git
cd service_agente_audio_sumarizado
```

### 2. Configurar variáveis de ambiente
```bash
cp .env.example .env
# Editar .env com suas configurações
```

### 3. Iniciar com Docker Compose
```bash
docker-compose up -d
```

### 4. Verificar saúde
```bash
curl http://localhost:8003/api/v1/health
```

## 📚 API Endpoints

### Health Check
```bash
GET /api/v1/health
GET /api/v1/health/agents
```

### Upload de Áudio
```bash
POST /api/v1/audio/upload
Content-Type: multipart/form-data

{
  "file": <arquivo de áudio>,
  "agent_id": "agent_123",
  "patient_id": "patient_456"
}
```

**Resposta:**
```json
{
  "id": "uuid",
  "agent_id": "agent_123",
  "patient_id": "patient_456",
  "filename": "audio.mp3",
  "file_format": "mp3",
  "status": "uploaded",
  "created_at": "2024-01-05T10:30:00Z",
  "updated_at": "2024-01-05T10:30:00Z"
}
```

### Processar Áudio por URL
```bash
POST /api/v1/audio/process-url
Content-Type: application/json

{
  "agent_id": "agent_123",
  "patient_id": "patient_456",
  "file_url": "https://example.com/audio.mp3",
  "filename": "audio.mp3"
}
```

### Obter Resultado Completo
```bash
GET /api/v1/audio/{audio_record_id}
```

**Resposta:**
```json
{
  "audio_record": {
    "id": "uuid",
    "status": "completed",
    "created_at": "2024-01-05T10:30:00Z"
  },
  "transcription": {
    "text": "Paciente relata sintomas de febre...",
    "confidence": 0.95,
    "processing_time": 5.2
  },
  "summarization": {
    "text": "Febre, tosse seca...",
    "compression_ratio": 0.35,
    "processing_time": 3.1
  },
  "processing_time": 8.3,
  "status": "completed"
}
```

### Obter Transcrição
```bash
GET /api/v1/audio/{audio_record_id}/transcription
```

### Obter Sumarização
```bash
GET /api/v1/audio/{audio_record_id}/summarization
```

## 📊 Status do Áudio

- `uploaded`: Áudio recebido, aguardando processamento
- `processing`: Processamento em andamento
- `transcribed`: Transcrição concluída
- `summarized`: Sumarização concluída
- `completed`: Processo completo finalizado
- `error`: Erro durante o processamento

## 🔔 Notificações

Após processar um áudio, o serviço notifica automaticamente:

1. **Backend Principal** (`BACKEND_URL`)
   ```
   POST /api/v1/audio/summarized
   ```

2. **Frontend** (`FRONTEND_URL`)
   ```
   POST /api/v1/audio/processed
   ```

3. **Aplicativo** (`APPCONECTA_URL`)
   ```
   POST /api/v1/audio/ready
   ```

## 🛠️ Configuração

### Variáveis de Ambiente

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/conecta_saude_audio

# OpenAI
OPENAI_API_KEY=sk-your-key

# URLs dos sistemas
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
APPCONECTA_URL=http://localhost:3001

# Modelos
TRANSCRIPTION_MODEL=whisper-1
SUMMARIZATION_MODEL=facebook/bart-large-cnn
LANGUAGE=pt-BR

# API
API_PORT=8003
DEBUG=True
```

## 📦 Modelos Suportados

### Transcrição
- **OpenAI Whisper** (`whisper-1`) - Recomendado
- **Modelo Local** (`openai/whisper-base`)

### Sumarização
- **BART-Large-CNN** (padrão)
- **T5-Base**
- **mT5** (multilíngue)

## 🧪 Testes

### Health Check
```bash
curl http://localhost:8003/api/v1/health
```

### Upload de Teste
```bash
curl -X POST http://localhost:8003/api/v1/audio/upload \
  -F "file=@/path/to/audio.mp3" \
  -F "agent_id=test_agent" \
  -F "patient_id=test_patient"
```

### Verificar Processamento
```bash
curl http://localhost:8003/api/v1/audio/{audio_id}
```

## 🔐 Segurança

- Validação de tipos de arquivo
- Limite de tamanho de arquivo (50MB padrão)
- CORS configurado
- Tokens JWT para autenticação (opcional)

## 📝 Logs

Os logs são exibidos no console e podem ser capturados com Docker:

```bash
docker-compose logs -f audio_service
```

## 🐛 Troubleshooting

### Erro: Modelo não carregado
- Certifique-se de que os modelos foram baixados
- Verifique espaço em disco

### Erro: Banco de dados não conecta
- Verifique URL do banco em `.env`
- Aguarde inicialização do PostgreSQL

### Áudio processado muito lentamente
- Use GPU se disponível
- Reduza `max_length` na sumarização
- Verifique recursos de CPU/Memória

## 📚 Documentação Completa

Acesse a documentação interativa em:
```
http://localhost:8003/docs
```

## 🤝 Contribuindo

Consulte [CONTRIBUTING.md](CONTRIBUTING.md)

## 📄 Licença

MIT License - Veja [LICENSE](LICENSE)

## 👥 Autor

Desenvolvido por Conect Saúde

## 📧 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.
