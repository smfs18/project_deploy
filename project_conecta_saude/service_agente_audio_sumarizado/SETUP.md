# 🏗️ Setup Completo - Guia de Instalação

Guia detalhado para instalar e configurar o Service Agente Audio Sumarizado.

## 📋 Pré-requisitos

### Requisitos do Sistema
- **OS**: Linux, macOS ou Windows (WSL2 recomendado)
- **RAM**: Mínimo 4GB, recomendado 8GB+
- **Disco**: Mínimo 20GB livre
- **CPU**: Multi-core recomendado para melhor performance

### Software Necessário
```bash
# Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Docker Compose (v2+)
docker --version  # >= 20.10
docker-compose --version  # >= 2.0

# Python (para desenvolvimento)
python --version  # >= 3.11
```

## 🔧 Instalação

### 1. Clonar Repositório

```bash
git clone https://github.com/Conect-saude/service_agente_audio_sumarizado.git
cd service_agente_audio_sumarizado
```

### 2. Configurar Variáveis de Ambiente

```bash
# Copiar template
cp .env.example .env

# Editar arquivo
nano .env  # ou use seu editor favorito
```

**Configurações Essenciais:**

```env
# ⚠️ OBRIGATÓRIO - OpenAI API
OPENAI_API_KEY=sk-your-actual-key-here

# Database
DATABASE_URL=postgresql://conecta_user:conecta_password@postgres:5432/conecta_saude_audio

# URLs dos Sistemas (ajuste conforme seu ambiente)
BACKEND_URL=http://localhost:8000        # ou seu backend real
FRONTEND_URL=http://localhost:3000       # ou seu frontend real
APPCONECTA_URL=http://localhost:3001     # ou seu app real

# Modelos (opcionais - use defaults se não souber)
TRANSCRIPTION_MODEL=whisper-1
SUMMARIZATION_MODEL=facebook/bart-large-cnn
LANGUAGE=pt-BR

# API
API_PORT=8003
DEBUG=True  # Mude para False em produção
```

### 3. Iniciar com Docker Compose

```bash
# Iniciar todos os serviços
docker-compose up -d

# Aguardar inicialização (~30 segundos)
docker-compose ps

# Ver logs
docker-compose logs -f audio_service
```

**Saída esperada:**
```
✅ Banco de dados inicializado
✅ Modelo de transcrição inicializado
✅ Modelo de sumarização inicializado
Application startup complete
```

### 4. Verificar Instalação

```bash
# Health Check
curl http://localhost:8003/api/v1/health

# Status dos Agentes
curl http://localhost:8003/api/v1/health/agents

# Documentação Interativa
open http://localhost:8003/docs
```

## 📦 Instalação Manual (Sem Docker)

Se preferir instalar manualmente:

```bash
# 1. Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

# 2. Instalar dependências
pip install -r requirements.txt

# 3. Configurar banco de dados
# Instalar PostgreSQL localmente ou usar container separado
# docker run -d \
#   -e POSTGRES_USER=conecta_user \
#   -e POSTGRES_PASSWORD=conecta_password \
#   -e POSTGRES_DB=conecta_saude_audio \
#   -p 5432:5432 \
#   postgres:15

# 4. Atualizar DATABASE_URL no .env para localhost

# 5. Baixar modelos (primeira vez - demora ~2 minutos)
python -c "from transformers import pipeline; pipeline('automatic-speech-recognition', model='openai/whisper-base')"
python -c "from transformers import pipeline; pipeline('summarization', model='facebook/bart-large-cnn')"

# 6. Rodar aplicação
python main.py
```

## 🧪 Testes de Instalação

```bash
# 1. Test básico
curl http://localhost:8003/api/v1/health

# 2. Test com arquivo
bash test_api.sh

# 3. Test Python
python test_local.py
```

## 🔐 Configuração em Produção

### 1. Segurança

```env
# .env (produção)
DEBUG=False                      # Desabilitar debug mode
OPENAI_API_KEY=sk-sua-chave      # Usar secrets manager
DATABASE_URL=postgresql://user:password@db.sua-empresa.com:5432/db
BACKEND_API_KEY=seu-token-secreto
```

### 2. Performance

```env
# Usar modelos otimizados
TRANSCRIPTION_MODEL=whisper-1    # Modelo da OpenAI é otimizado
SUMMARIZATION_MODEL=distilbart-cnn-6-6  # Versão menor e mais rápida

# Aumentar recursos se disponível
```

### 3. Persistence

```bash
# Backup do banco de dados
docker-compose exec postgres pg_dump -U conecta_user conecta_saude_audio > backup.sql

# Restore
docker-compose exec -T postgres psql -U conecta_user conecta_saude_audio < backup.sql
```

## 📊 Monitoramento

### Logs
```bash
# Logs do serviço
docker-compose logs -f audio_service

# Logs do banco
docker-compose logs -f postgres

# Salvar logs
docker-compose logs > logs.txt
```

### Métricas Básicas
```bash
# CPU e Memória
docker stats

# Tamanho do banco
docker-compose exec postgres psql -U conecta_user -d conecta_saude_audio -c "
  SELECT 
    datname,
    pg_size_pretty(pg_database_size(datname)) as size
  FROM pg_database;
"
```

## 🚨 Troubleshooting

### Problema: Porta 8003 em uso

```bash
# Encontrar o processo
lsof -i :8003

# Opção 1: Matar processo
kill -9 <PID>

# Opção 2: Usar porta diferente
# Editar docker-compose.yml
ports:
  - "8004:8003"  # Mudar porta
```

### Problema: Banco não conecta

```bash
# Verificar status do PostgreSQL
docker-compose ps postgres

# Reiniciar
docker-compose restart postgres

# Verificar logs
docker-compose logs postgres

# Recriar do zero
docker-compose down -v
docker-compose up -d
```

### Problema: Modelos não baixam

```bash
# Aumentar timeout
export HF_HUB_READ_TIMEOUT=600

# Baixar manualmente
python -c "
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
model = AutoModelForSeq2SeqLM.from_pretrained('facebook/bart-large-cnn')
"

# Limpar cache
rm -rf ~/.cache/huggingface/
```

### Problema: Erro de memória

```bash
# Aumentar swap (Linux)
fallocate -l 4G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile

# Ou usar modelo menor
SUMMARIZATION_MODEL=distilbart-cnn-6-6
```

## 📚 Próximas Etapas

1. [Quick Start](QUICK_START.md) - Começar a usar a API
2. [README](README.md) - Documentação completa
3. [Integração Backend](#) - Conectar com seu backend
4. [Deployment](#) - Publicar em produção

## 💬 Suporte

- Documentação: http://localhost:8003/docs
- Issues: https://github.com/Conect-saude/service_agente_audio_sumarizado/issues
- Email: suporte@conectasaude.com

---

**Última atualização**: Janeiro 2024
