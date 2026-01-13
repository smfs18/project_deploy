# 📋 Relatório: Análise de Dockerização - Conecta+Saúde

**Data**: 12 de janeiro de 2026  
**Status**: ⚠️ **INCOMPLETO** - Microsserviço faltando no docker-compose

---

## 📊 Resumo Executivo

| Componente | Dockerfile | Docker Compose | Status |
|-----------|-----------|-----------------|--------|
| Backend FastAPI | ✅ | ✅ | ✓ OK |
| Frontend React | ✅ | ✅ | ✓ OK |
| Model LLM | ✅ | ✅ | ✓ OK |
| Service LLM | ✅ | ✅ | ✓ OK |
| Whatsapp Agent | ✅ | ✅ | ✓ OK |
| Audio Sumarizado | ✅ | ❌ | ⚠️ **FALTANDO** |
| App Mobile (Expo) | ❌ | ❌ | ⚠️ **NÃO DOCKERIZADO** |
| Redis | ➖ | ✅ | ✓ OK |
| PostgreSQL | ➖ | ✅ | ✓ OK |

---

## 🔴 Problema Identificado

### 1️⃣ **Microsserviço de Transcrição/Sumarização NÃO ESTÁ NO docker-compose.yml**

**Informações encontradas:**
```
✅ Arquivo: service_agente_audio_sumarizado/
   ├── Dockerfile (EXISTS)
   ├── main.py (FastAPI Application - Port 8003)
   ├── requirements.txt
   ├── app/
   │   ├── routes/
   │   │   ├── audio.py
   │   │   └── health.py
   │   ├── database.py
   │   └── ...
   └── README.md

⚠️ Status: TEM DOCKERFILE MAS NÃO ESTÁ NO DOCKER-COMPOSE
```

**Porta esperada:** `8003`

**Dockerfile encontrado:**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
# ... ffmpeg, dependências de áudio instaladas
EXPOSE 8003
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3
```

---

### 2️⃣ **App Mobile (Expo) NÃO TEM DOCKERFILE**

**Informações encontradas:**
```
❌ Arquivo: app_conecta-saude/appconecta/
   ├── package.json
   ├── app.json (Expo Config)
   ├── tsconfig.json
   ├── src/
   ├── app/
   └── ❌ SEM DOCKERFILE
```

**Tipo:** React Native + Expo  
**Porta esperada:** `19000` (dev) ou `3000` (web)  
**Situação:** App mobile, geralmente não é dockerizado (roda localmente ou via Expo)

---

## ✅ Componentes Corretos com Docker

### 1. Backend FastAPI (`back/backend/`)
```
✅ Dockerfile presente
✅ No docker-compose como: "backend"
✅ Porta: 8082:8000
✅ Depende de: postgres
```

### 2. Frontend React (`frontend/`)
```
❌ Dockerfile NÃO ENCONTRADO
✅ No docker-compose como: "frontend"
✅ Porta: 5173:80
```

**NOTA:** Frontend comentado no docker-compose ("frontend removed by request")

### 3. Model LLM (`model-LLM/`)
```
✅ Dockerfile presente
✅ No docker-compose como: "model-llm"
✅ Porta: 8001:8002
```

### 4. Service LLM (`service_llm/`)
```
✅ Dockerfile presente
✅ No docker-compose como: "service_llm"
✅ Porta: 8003:8001
```

### 5. Whatsapp Agent (`service_agente_whatsapp/`)
```
✅ Dockerfile presente
✅ No docker-compose como: "whatsapp-agent"
✅ Porta: 8002:8001
✅ Depende de: backend, redis
```

### 6. Redis
```
✅ Image padrão: redis:7
✅ No docker-compose
✅ Porta: 6379:6379
```

### 7. PostgreSQL
```
✅ Image padrão: postgres:15-alpine
✅ No docker-compose como: "postgres"
✅ Porta: 5432:5432
```

---

## 🔧 Soluções Necessárias

### 🔴 CRÍTICO: Adicionar Audio Sumarizado ao docker-compose

O arquivo `docker-compose.yml` deve ser atualizado para incluir:

```yaml
service_agente_audio_sumarizado:
  build:
    context: ./service_agente_audio_sumarizado
    dockerfile: Dockerfile
  ports:
    - '8004:8003'  # Port 8003 inside container, 8004 on host
  environment:
    - BACKEND_API_URL=http://backend:8000
    - BACKEND_API_KEY=changeme
    - GEMINI_API_KEY=${GEMINI_API_KEY}
    - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/conecta
  depends_on:
    - backend
    - postgres
  volumes:
    - ./service_agente_audio_sumarizado:/app
```

---

### ⚠️ AVISO: App Mobile (Expo)

**Decisão necessária:**

**Opção 1: Não Dockerizar (Recomendado)**
- App mobile roda no servidor Expo
- Será buildado para APK/IPA conforme necessidade
- Acessa backend remoto

**Opção 2: Dockerizar (Avançado)**
- Criar Dockerfile para Expo (web version)
- Rodar app como web service no Render/Docker
- Mais complexo, menos comum

**Status Atual:** ✅ Sem Dockerfile é o padrão

---

## 📝 Arquivos que Precisam de Ajuste

### 1. `docker-compose.yml` - ATUALIZAR
**Ação:** Adicionar serviço `service_agente_audio_sumarizado`

### 2. Frontend - REVISAR
**Ação:** Confirmar se existe `frontend/Dockerfile` ou adicionar

### 3. `README.md` - DOCUMENTAR
**Ação:** Adicionar instruções sobre todos os microsserviços

---

## 🚀 Próximas Etapas

### ✅ TODO List

- [ ] Adicionar `service_agente_audio_sumarizado` ao `docker-compose.yml`
- [ ] Testar build com: `docker-compose up --build`
- [ ] Verificar conectividade entre serviços
- [ ] Atualizar documentação com todas as portas
- [ ] Criar script de verificação de saúde de todos os serviços
- [ ] Testar load balancing se necessário

---

## 📊 Mapa de Portas Atual

```
Host         → Container        Service
────────────────────────────────────────────
5432:5432   → 5432             PostgreSQL
6379:6379   → 6379             Redis
8000:8000   → 8000             Backend (FastAPI)
8001:8002   → 8002             Model LLM
8002:8001   → 8001             Whatsapp Agent
8003:8001   → 8001             Service LLM
5173:80     → 80               Frontend React

⚠️ FALTANDO:
8004:8003   → 8003             Audio Sumarizado (NÃO ESTÁ)
```

---

## ⚡ Comandos Úteis

```bash
# Ver todos os Dockerfiles
find . -name "Dockerfile" -type f

# Verificar o que está no docker-compose
docker-compose config

# Build de todos os serviços
docker-compose up --build

# Testar se todos os serviços estão rodando
docker-compose ps

# Ver logs de um serviço específico
docker-compose logs service_agente_audio_sumarizado
```

---

## 📚 Referências Criadas

Este relatório faz parte do processo de deploy para:
- **GUIA_DEPLOY_RENDER_SUPABASE.md**
- **CHECKLIST_DEPLOY_RENDER_SUPABASE.md**
- **FAQ_DEPLOY.md**

---

**Status Final:** ⚠️ **REQUER AÇÕES** - Microsserviço de áudio precisa ser adicionado ao compose

