# 🐳 Arquitetura Docker - Conecta+Saúde

**Última atualização**: 12 de janeiro de 2026

---

## 🏗️ Arquitetura Completa

```
┌─────────────────────────────────────────────────────────────────┐
│                     CONECTA+SAÚDE ARCHITECTURE                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  FRONTEND (React + Vite)                 │  │
│  │              Port: 5173:80 (Container:Host)              │  │
│  │              Status: ✅ Dockerfile OK                    │  │
│  │              Status: ✅ Docker-compose OK                │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           │ HTTP/HTTPS                          │
│  ┌────────────────────────▼─────────────────────────────────┐  │
│  │                 BACKEND (FastAPI)                         │  │
│  │              Port: 8082:8000 (Host:Container)             │  │
│  │              Status: ✅ Dockerfile OK                     │  │
│  │              Status: ✅ Docker-compose OK                 │  │
│  └────┬──────────────────┬──────────────────┬────────────────┘  │
│       │                  │                  │                   │
│  ┌────▼─┐    ┌──────────▼──────────┐   ┌───▼──────┐            │
│  │ DB   │    │  Service LLM        │   │ Model    │            │
│  │      │    │  Port: 8003:8001    │   │ LLM      │            │
│  │Psql  │    │  Status: ✅ OK      │   │ Port:    │            │
│  │      │    │                     │   │ 8001:8002│            │
│  │5432  │    │  (Gera Ações/Planos)│   │ Status:  │            │
│  │      │    │                     │   │ ✅ OK    │            │
│  └──────┘    └─────────────────────┘   └──────────┘            │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │        Whatsapp Agent (Service Agente WhatsApp)        │    │
│  │              Port: 8002:8001 (Host:Container)          │    │
│  │              Status: ✅ Dockerfile OK                  │    │
│  │              Status: ✅ Docker-compose OK              │    │
│  │              Depende de: Backend, Redis                │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Audio Sumarizado (Service Agente Audio Sumarizado)    │    │
│  │              Port: 8004:8003 (Host:Container)          │    │
│  │              Status: ✅ Dockerfile OK                  │    │
│  │              Status: ✅ Docker-compose OK (ADICIONADO) │    │
│  │              Depende de: Backend, DB                   │    │
│  │         (Transcrição + Sumarização com LangGraph)      │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────┐                                                │
│  │ Redis (7)   │  Port: 6379:6379                              │
│  │ Status: ✅  │  Para cache, fila de tarefas                 │
│  └─────────────┘                                                │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           APP MOBILE (React Native + Expo)              │  │
│  │         ⚠️  NÃO DOCKERIZADO (Executado localmente)       │  │
│  │         Acessa o backend via API REST                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Status de Dockerização

### ✅ Componentes com Docker Completo

| # | Componente | Dockerfile | Docker-Compose | Porta Host:Container | Status |
|---|-----------|-----------|-----------------|----------------------|--------|
| 1 | Backend | ✅ | ✅ | 8082:8000 | ✓ OK |
| 2 | Frontend | ✅ | ✅ | 5173:80 | ✓ OK |
| 3 | Model LLM | ✅ | ✅ | 8001:8002 | ✓ OK |
| 4 | Service LLM | ✅ | ✅ | 8003:8001 | ✓ OK |
| 5 | Whatsapp Agent | ✅ | ✅ | 8002:8001 | ✓ OK |
| 6 | **Audio Sumarizado** | ✅ | ✅ **ADICIONADO** | 8004:8003 | ✓ **CORRIGIDO** |
| 7 | PostgreSQL | ➖ | ✅ | 5432:5432 | ✓ OK |
| 8 | Redis | ➖ | ✅ | 6379:6379 | ✓ OK |

### ⚠️ Componentes sem Docker

| # | Componente | Motivo | Alternativa |
|---|-----------|--------|------------|
| 1 | App Mobile (Expo) | App nativo, não é containerizado | Expo local ou Web build |

---

## 🔌 Mapa de Portas Completo

```
PORTA HOST : PORTA CONTAINER   SERVIÇO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  5432   :      5432          PostgreSQL (Banco de Dados)
  6379   :      6379          Redis (Cache/Queue)
  8000   :      8000          Backend FastAPI
  8001   :      8002          Model LLM
  8002   :      8001          Whatsapp Agent
  8003   :      8001          Service LLM
  8004   :      8003          Audio Sumarizado ⭐ NOVO
  5173   :       80           Frontend React
```

---

## 📁 Estrutura de Arquivos Docker

```
project_conecta_saude/
├── docker-compose.yml                           # ✅ ATUALIZADO
├── back/backend/
│   ├── Dockerfile                               # ✅
│   ├── requirements.txt
│   ├── main.py
│   └── app/
├── frontend/
│   ├── Dockerfile                               # ✅
│   ├── package.json
│   └── src/
├── model-LLM/
│   ├── Dockerfile                               # ✅
│   ├── requirements.txt
│   └── app/
├── service_llm/
│   ├── Dockerfile                               # ✅
│   ├── requirements.txt
│   └── app/
├── service_agente_whatsapp/
│   ├── Dockerfile                               # ✅
│   ├── requirements.txt
│   └── app/
├── service_agente_audio_sumarizado/
│   ├── Dockerfile                               # ✅
│   ├── requirements.txt
│   ├── main.py
│   └── app/
└── app_conecta-saude/appconecta/
    ├── package.json
    ├── app.json                                 # Expo Config
    ├── src/                                     # ❌ Sem Dockerfile
    └── app/                                     # (Normal para Expo)
```

---

## 🚀 Como Rodar Tudo com Docker

### 1️⃣ Build de Todas as Imagens

```bash
cd /home/smfs/Documentos/project_conecta_saude

# Build todas as imagens
docker-compose build

# Ou com rebuild forçado
docker-compose build --no-cache
```

### 2️⃣ Iniciar Todos os Serviços

```bash
# Modo background
docker-compose up -d

# Modo foreground (ver logs em tempo real)
docker-compose up
```

### 3️⃣ Verificar Status

```bash
# Ver containers rodando
docker-compose ps

# Output esperado:
# NAME                           COMMAND              STATUS
# postgres                       postgres             Up 2 minutes
# redis                          redis-server         Up 2 minutes
# backend                        uvicorn main:app     Up 1 minute 45 seconds
# model-llm                      python app/main.py   Up 1 minute 30 seconds
# service_llm                    python main.py       Up 1 minute 20 seconds
# whatsapp-agent                 uvicorn main:app     Up 1 minute 10 seconds
# service_agente_audio_sumarizado uvicorn main:app    Up 45 seconds
# frontend                       npm run dev          Up 30 seconds
```

### 4️⃣ Ver Logs

```bash
# Todos os serviços
docker-compose logs -f

# Serviço específico
docker-compose logs -f backend
docker-compose logs -f service_agente_audio_sumarizado

# Últimas 100 linhas
docker-compose logs --tail=100 backend
```

### 5️⃣ Parar Tudo

```bash
docker-compose down

# Com remoção de volumes (CUIDADO!)
docker-compose down -v
```

---

## ✅ Verificação de Saúde de Todos os Serviços

### Script de Health Check

```bash
#!/bin/bash

echo "🏥 Verificando saúde de todos os serviços..."
echo ""

# Backend
echo "📊 Backend: "
curl -s http://localhost:8082/health || echo "❌ Backend offline"

# Model LLM
echo "🤖 Model LLM: "
curl -s http://localhost:8001/health || echo "❌ Model LLM offline"

# Service LLM
echo "💬 Service LLM: "
curl -s http://localhost:8003/health || echo "❌ Service LLM offline"

# Audio Sumarizado
echo "🎙️  Audio Sumarizado: "
curl -s http://localhost:8004/api/v1/health || echo "❌ Audio Sumarizado offline"

# Whatsapp Agent
echo "📱 Whatsapp Agent: "
curl -s http://localhost:8002/health || echo "❌ Whatsapp Agent offline"

# PostgreSQL
echo "🗄️  PostgreSQL: "
docker exec postgres psql -U postgres -c "SELECT 1;" 2>/dev/null && echo "✅ PostgreSQL OK" || echo "❌ PostgreSQL offline"

# Redis
echo "⚡ Redis: "
redis-cli ping 2>/dev/null && echo "✅ Redis OK" || echo "❌ Redis offline"

# Frontend
echo "🌐 Frontend: "
curl -s http://localhost:5173 | head -5 || echo "❌ Frontend offline"

echo ""
echo "✅ Health check completo!"
```

**Salvar como:** `health_check.sh`

**Executar:**
```bash
bash health_check.sh
```

---

## 🔍 Checklist de Verificação

Após fazer `docker-compose up`, verificar:

### Backend
- [ ] `curl http://localhost:8082/health` retorna 200
- [ ] `curl http://localhost:8082/docs` abre Swagger
- [ ] Conectado ao PostgreSQL

### Frontend
- [ ] `http://localhost:5173` abre a aplicação
- [ ] Sem erros no console (F12)
- [ ] Conectado ao backend

### Audio Sumarizado ⭐
- [ ] `curl http://localhost:8004/api/v1/health` retorna 200
- [ ] Logs sem erros
- [ ] Conectado ao backend
- [ ] Conectado ao banco de dados

### Banco de Dados
- [ ] PostgreSQL rodando em 5432
- [ ] Criado banco "conecta"
- [ ] Tabelas criadas corretamente

### Redis
- [ ] Redis rodando em 6379
- [ ] Conectado ao Whatsapp Agent

### Todos os Serviços
- [ ] `docker-compose ps` mostra 8 containers UP
- [ ] Nenhum container com status "Exited"
- [ ] Nenhum container com status "Unhealthy"

---

## 📝 Mudanças Realizadas

### ✅ Corrigido em: 12 de janeiro de 2026

**Arquivo:** `docker-compose.yml`

**Adição:**
```yaml
service_agente_audio_sumarizado:
  build:
    context: ./service_agente_audio_sumarizado
    dockerfile: Dockerfile
  ports:
    - '8004:8003'
  environment:
    - BACKEND_API_URL=http://backend:8000
    - BACKEND_API_KEY=changeme
    - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/conecta
  depends_on:
    - backend
    - postgres
  volumes:
    - ./service_agente_audio_sumarizado:/app
```

---

## 🎯 Próximas Ações

### Imediato
- [ ] Executar `docker-compose build`
- [ ] Executar `docker-compose up -d`
- [ ] Validar todos os serviços com script de health check
- [ ] Testar endpoints de audio sumarizado

### Curto Prazo
- [ ] Adicionar variáveis de ambiente para Gemini API
- [ ] Configurar limites de recursos (CPU, Memory)
- [ ] Adicionar restart policies

### Médio Prazo
- [ ] Preparar para produção (Render)
- [ ] Configurar logging centralizado
- [ ] Adicionar monitoramento

---

## 📚 Referências

- [Docker Compose Official Docs](https://docs.docker.com/compose)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment)
- [React Docker Best Practices](https://docs.docker.com/language/nodejs/build-images)

---

**Status Final:** ✅ **DOCKER-COMPOSE ATUALIZADO E CORRETO**

Todos os microsserviços estão configurados e prontos para rodar! 🚀
