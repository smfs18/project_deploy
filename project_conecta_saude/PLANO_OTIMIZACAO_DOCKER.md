# 🚀 PLANO DE AÇÃO: Otimizar Dockerfiles

**Prioridade**: 🔴 CRÍTICO  
**Impacto**: Deploy vai falhar sem isso

---

## RESUMO DO PROBLEMA

```
Situação Atual:
- Render free tem limite de 30 minutos para build
- Render free tem limite de ~2.5GB por imagem
- service_llm + model-LLM + audio_sumarizado = 7GB+ ❌

Solução:
- Otimizar para < 1GB total
- Build em < 10 minutos
- Multi-stage builds para remover dependências de compilação
```

---

## TAREFAS A FAZER

### 🔴 TAREFA 1: Otimizar service_llm/Dockerfile

**Problema Atual:**
```dockerfile
FROM python:3.12-slim  # 200MB
RUN apt-get install... # mais 500MB
RUN pip install torch sentence-transformers langchain  # 1.5GB+
```

**Solução:**
```dockerfile
# ✅ Multi-stage build
FROM python:3.12-alpine as builder
WORKDIR /app
COPY requirements.txt .
RUN apk add --no-cache gcc musl-dev  # Mínimo necessário
RUN pip install --user -r requirements.txt  # Install em /root/.local

FROM python:3.12-alpine  # Base pequena
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY . .
ENV PATH=/root/.local/bin:$PATH
EXPOSE 8001
CMD ["python", "main.py"]
```

**Tamanho Esperado:** 300-400MB ✅

---

### 🔴 TAREFA 2: Otimizar model-LLM/Dockerfile

**Problema Atual:**
```dockerfile
FROM python:3.11-slim  # Grande
RUN pip install torch transformers ...  # 3GB+
```

**Solução:**
- Usar alpine base
- Remover modelos pré-treinados do Dockerfile
- Carregar modelos em runtime se necessário

**Tamanho Esperado:** 200-250MB ✅

---

### 🔴 TAREFA 3: Otimizar service_agente_audio_sumarizado/Dockerfile

**Problema Atual:**
```dockerfile
FROM python:3.11-slim
RUN apt-get install ffmpeg ...
RUN pip install langgraph google-genai ...
```

**Solução:**
- Usar alpine com ffmpeg
- Multi-stage build
- Manter ffmpeg (necessário para áudio)

**Tamanho Esperado:** 400-500MB ✅

---

### ⚠️ TAREFA 4: Criar frontend/Dockerfile

**Problema Atual:**
- Não existe Dockerfile para frontend

**Solução:**
```dockerfile
# ✅ Multi-stage build para React
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

**Tamanho Esperado:** 100-150MB ✅

---

### ⚠️ TAREFA 5: Verificar service_agente_whatsapp/Dockerfile

**Status**: Verificar tamanho atual

---

## 🎯 REQUIREMENTS.TXT - O que Remover

### service_llm/requirements.txt

```
❌ REMOVER (Pesados):
- torch
- sentence-transformers
- tensorflow
- scikit-learn
- scipy

✅ MANTER (Necessários):
- fastapi
- uvicorn
- pydantic
- python-jose
- sqlalchemy
- psycopg2-binary
- httpx
- langchain
- google-genai
- langgraph
```

### model-LLM/requirements.txt

```
❌ REMOVER:
- torch
- transformers
- huggingface_hub (se tiver)

✅ MANTER:
- fastapi
- uvicorn
- (verificar quais são realmente usados)
```

### service_agente_audio_sumarizado/requirements.txt

```
✅ MANTER TUDO:
- fastapi
- uvicorn
- ffmpeg-python  (áudio)
- pydantic
- sqlalchemy
- langchain
- google-genai
- langgraph
- librosa  (áudio)
- soundfile  (áudio)

❌ REMOVER:
- qualquer coisa desnecessária
```

---

## 🔧 IMPLEMENTAÇÃO PASSO A PASSO

### Passo 1: Parar tudo
```bash
pkill -f docker
docker-compose down -v
```

### Passo 2: Criar ./dockerignore em cada serviço

```
# .dockerignore (copiar para cada pasta)
__pycache__/
*.pyc
*.pyo
*.pyd
.Python
.env
.git
.gitignore
node_modules/
.pytest_cache/
*.egg-info/
dist/
build/
.DS_Store
.vscode/
.idea/
```

### Passo 3: Otimizar cada Dockerfile

Para cada serviço:

1. Usar alpine base
2. Implementar multi-stage build
3. Remover dependências desnecessárias
4. Adicionar healthcheck

### Passo 4: Testar build local

```bash
# Testar cada imagem individualmente
docker build -t test-backend ./back/backend
docker build -t test-service-llm ./service_llm
docker build -t test-model-llm ./model-LLM
docker build -t test-audio ./service_agente_audio_sumarizado

# Ver tamanhos
docker images | grep test

# Exemplo output esperado:
# test-backend              latest    150MB
# test-service-llm          latest    300MB
# test-model-llm            latest    200MB
# test-audio                latest    400MB
```

### Passo 5: Testar docker-compose

```bash
docker-compose up -d
# Deve terminar em < 10 minutos
docker-compose ps
# Todos com status "Up"
```

---

## 📊 CHECKLIST

### Antes da Otimização
- [ ] Backup dos Dockerfiles atuais
- [ ] Documentar requirements atuais

### Otimização
- [ ] Criar Dockerfile otimizado - backend
- [ ] Criar Dockerfile otimizado - frontend
- [ ] Criar Dockerfile otimizado - model-llm
- [ ] Criar Dockerfile otimizado - service_llm
- [ ] Criar Dockerfile otimizado - audio_sumarizado
- [ ] Verificar service_agente_whatsapp
- [ ] Criar .dockerignore em cada pasta

### Testes
- [ ] Build cada imagem individualmente
- [ ] Verificar tamanho de cada imagem
- [ ] docker-compose build (teste local)
- [ ] docker-compose up (teste local)
- [ ] Testar endpoints
- [ ] Verificar logs

### Deploy
- [ ] Commit das mudanças
- [ ] Push para GitHub
- [ ] Deploy no Render
- [ ] Verificar build no Render
- [ ] Teste endpoints em produção

---

## ⏱️ TEMPO ESTIMADO

| Tarefa | Tempo |
|--------|-------|
| Backup/Prep | 5 min |
| Otimizar 5 Dockerfiles | 20 min |
| Testes locais | 15 min |
| Ajustes | 20 min |
| Git commit/push | 5 min |
| **TOTAL** | **~65 minutos** |

---

## 🎯 RESULTADO ESPERADO

**Após otimizar:**
```
✅ Build termina em < 10 minutos (vs 45-60 antes)
✅ Tamanho total < 1.5GB (vs 8GB antes)
✅ Render consegue fazer build
✅ Containers iniciam sem erro
✅ Deploy bem-sucedido
```

---

**Pronto para começar a otimizar?** ✅

Vou criar os Dockerfiles otimizados agora!

