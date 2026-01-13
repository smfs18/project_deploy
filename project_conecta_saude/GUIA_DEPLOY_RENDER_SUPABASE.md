# 🚀 Guia Completo: Deploy Render + Supabase

## 📋 Índice
1. [Pré-requisitos](#pré-requisitos)
2. [Configuração Supabase](#configuração-supabase)
3. [Deploy Backend no Render](#deploy-backend-no-render)
4. [Deploy Frontend no Render](#deploy-frontend-no-render)
5. [Variáveis de Ambiente](#variáveis-de-ambiente)
6. [Testes e Validação](#testes-e-validação)
7. [Troubleshooting](#troubleshooting)

---

## 📦 Pré-requisitos

- [ ] Conta no **Render** (render.com)
- [ ] Conta no **Supabase** (supabase.com)
- [ ] GitHub com repositório sincronizado
- [ ] Git instalado localmente
- [ ] Acesso ao código do projeto

---

## 🔧 Configuração Supabase

### 1️⃣ Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em **"New Project"**
3. Preencha os dados:
   - **Project Name**: `conecta-saude-prod`
   - **Database Password**: Gere uma senha forte
   - **Region**: Escolha a região mais próxima (Brasil = `sa-east-1`)
   - **Pricing Plan**: `Free` (para começar)

4. Aguarde o projeto ser criado (leva ~2 min)

### 2️⃣ Copiar Credenciais de Conexão

Após criação, vá em:
```
Settings → Database → Connection Pooling
```

Copie a **Connection String**:
```
postgresql://postgres.[project-id]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

**OU** vá em:
```
Settings → Database → Connection String (Standard)
```

### 3️⃣ Executar Migrações do Banco

Abra SQL Editor no Supabase e execute:

```sql
-- Criar schema se não existir
CREATE SCHEMA IF NOT EXISTS conecta_saude;

-- Criar tabelas (copie do seu SQL de migrações)
-- Se tiver arquivo de migrações, execute aqui
```

### 4️⃣ Anotar Credenciais

```
SUPABASE_URL: https://[project-id].supabase.co
SUPABASE_ANON_KEY: [public-anon-key]
SUPABASE_SERVICE_KEY: [service-role-key]
DATABASE_URL: postgresql://postgres.[project-id]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

---

## 🌐 Deploy Backend no Render

### 1️⃣ Preparar Repositório GitHub

```bash
# Criar branch de produção
git checkout develop
git pull origin develop
git checkout -b release/v1.0.0

# Adicionar arquivo render.yaml na raiz do backend
# (Veja arquivo render.yaml abaixo)

git add render.yaml
git commit -m "Add Render configuration"
git push origin release/v1.0.0
```

### 2️⃣ Conectar GitHub ao Render

1. Acesse [render.com](https://render.com)
2. Clique em **"+ New +"** → **"Web Service"**
3. Clique em **"Connect your GitHub repository"**
4. Authorize Render no GitHub
5. Selecione: `app_conecta-saude`
6. Escolha a branch: `release/v1.0.0` (ou `develop`)

### 3️⃣ Configurar Serviço Web

**Preencher com:**

| Campo | Valor |
|-------|-------|
| **Name** | `conecta-saude-api` |
| **Environment** | `Docker` |
| **Region** | `São Paulo (sa-east-1)` |
| **Branch** | `release/v1.0.0` |
| **Dockerfile path** | `back/backend/Dockerfile` |
| **Build Command** | (deixe em branco) |
| **Start Command** | (deixe em branco) |

### 4️⃣ Definir Variáveis de Ambiente

Clique em **"Environment"** e adicione:

```env
DATABASE_URL=postgresql://postgres.[project-id]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
JWT_SECRET=gere-uma-chave-aleatoria-forte-aqui
ENVIRONMENT=production
LOG_LEVEL=info
CORS_ORIGINS=https://seu-frontend.onrender.com
```

**Para gerar JWT_SECRET, use:**
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 5️⃣ Configurar Health Check

Em **"Redirect URL"**:
```
/health
```

### 6️⃣ Deploy

1. Clique em **"Create Web Service"**
2. Render irá fazer build automaticamente
3. Acompanhe logs em **"Logs"**
4. Após sucesso, você terá:
```
https://conecta-saude-api.onrender.com
```

---

## 🎨 Deploy Frontend no Render

### 1️⃣ Preparar Build Frontend

No arquivo `frontend/vite.config.ts`, adicione:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
  },
})
```

### 2️⃣ Atualizar package.json

Adicione a versão do Node no `frontend/package.json`:

```json
{
  "name": "conecta-saude-frontend",
  "version": "1.0.0",
  "type": "module",
  "engines": {
    "node": "18.x"
  },
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  },
  ...
}
```

### 3️⃣ Criar arquivo `render.yaml` no frontend

```bash
cat > frontend/render.yaml << 'EOF'
services:
  - type: web
    name: conecta-saude-frontend
    env: node
    region: São Paulo
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm run preview
    envVars:
      - key: NODE_VERSION
        value: 18
      - key: VITE_API_URL
        value: https://conecta-saude-api.onrender.com
      - key: VITE_SUPABASE_URL
        value: https://[project-id].supabase.co
      - key: VITE_SUPABASE_ANON_KEY
        value: [public-anon-key]
EOF
```

### 4️⃣ Fazer Deploy Frontend

1. Acesse [render.com](https://render.com)
2. Clique em **"+ New +"** → **"Static Site"**
3. **OU** use **"Web Service"** com Node.js:

**Configurações:**

| Campo | Valor |
|-------|-------|
| **Name** | `conecta-saude-frontend` |
| **Environment** | `Node` |
| **Region** | `São Paulo (sa-east-1)` |
| **Branch** | `release/v1.0.0` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run preview` |
| **Root Directory** | `frontend` |

### 5️⃣ Variáveis de Ambiente Frontend

```env
VITE_API_URL=https://conecta-saude-api.onrender.com
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_ANON_KEY=[public-anon-key]
NODE_VERSION=18
```

---

## 🔐 Variáveis de Ambiente

### Backend (`back/backend/.env.production`)

```env
# Database
DATABASE_URL=postgresql://postgres.[project-id]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

# JWT
JWT_SECRET=sua-chave-aleatoria-forte

# Environment
ENVIRONMENT=production
LOG_LEVEL=info
DEBUG=false

# Services
ML_SERVICE_URL=https://seu-ml-service.onrender.com
LLM_SERVICE_URL=https://seu-llm-service.onrender.com

# CORS
CORS_ORIGINS=https://conecta-saude-frontend.onrender.com

# Port
PORT=8000
```

### Frontend (`.env.production`)

```env
VITE_API_URL=https://conecta-saude-api.onrender.com
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_ANON_KEY=[public-anon-key]
```

---

## 🧪 Testes e Validação

### 1️⃣ Testar Backend

```bash
# Verificar se API está online
curl https://conecta-saude-api.onrender.com/health

# Resposta esperada:
# {"status": "ok"}
```

### 2️⃣ Testar Conexão com Banco

```bash
# Via psql (se tiver instalado)
psql "postgresql://postgres.[project-id]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"

# Ou via Python
python3 << 'EOF'
import psycopg2
conn = psycopg2.connect("postgresql://postgres.[project-id]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres")
print("Conectado com sucesso!")
EOF
```

### 3️⃣ Testar Frontend

1. Acesse: `https://conecta-saude-frontend.onrender.com`
2. Verifique se carrega corretamente
3. Tente fazer login
4. Abra DevTools (F12) → Console para verificar erros

### 4️⃣ Monitorar Logs

**Backend:**
```
Render Dashboard → conecta-saude-api → Logs
```

**Frontend:**
```
Render Dashboard → conecta-saude-frontend → Logs
```

---

## 📝 Dockerfile (Backend)

Certifique-se que `back/backend/Dockerfile` está assim:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 🎯 Passos Finais

### ✅ Checklist de Deploy

- [ ] Supabase projeto criado e credenciais anotadas
- [ ] Banco de dados migrado no Supabase
- [ ] GitHub sincronizado com código mais recente
- [ ] Backend deployado no Render
- [ ] Frontend deployado no Render
- [ ] Variáveis de ambiente configuradas em ambos
- [ ] Testes de conectividade executados
- [ ] DNS/Domínio configurado (opcional)
- [ ] Backups configurados no Supabase
- [ ] Logs sendo monitorados

### 🔗 Links Importantes

- 📊 [Render Dashboard](https://dashboard.render.com)
- 🗄️ [Supabase Dashboard](https://app.supabase.com)
- 🐙 [GitHub Repositório](https://github.com/Conect-saude/app_conecta-saude)

---

## ⚠️ Troubleshooting

### ❌ Build falha no Render

**Solução:**
1. Verifique logs: `Render Dashboard → Logs`
2. Garanta que `requirements.txt` está correto
3. Verifique permissões de arquivo
4. Tente fazer rebuild manual

### ❌ Erro de conexão com banco

**Solução:**
1. Verifique `DATABASE_URL` está correto
2. Confirme IP em whitelist (Supabase)
3. Teste conexão local: `psql $DATABASE_URL`
4. Verifique firewall do Supabase

### ❌ Frontend não carrega

**Solução:**
1. Verifique logs do build
2. Confira `VITE_API_URL` em variáveis de ambiente
3. Teste CORS em DevTools
4. Limpe cache do navegador (Ctrl+Shift+Delete)

### ❌ Erro CORS

**Solução:**
1. Verifique `CORS_ORIGINS` no backend
2. Deve ser: `https://conecta-saude-frontend.onrender.com`
3. Reinicie os serviços

---

## 📞 Suporte

Para dúvidas específicas:
- Render Support: https://render.com/docs
- Supabase Docs: https://supabase.com/docs
- FastAPI Docs: https://fastapi.tiangolo.com

**Boa sorte com o deploy! 🚀**
