# 📋 RELATÓRIO DE CORREÇÃO - Problemas de Conexão em Produção
**Data:** 14 de janeiro de 2026  
**Situação:** Sistema subido em produção com problemas de conexão entre microsserviços

---

## 🔴 PROBLEMAS IDENTIFICADOS

### 1. **Backend - Referências a localhost**
- `service_agente_whatsapp/app/services/backend_client.py` → Linha 14
  - ❌ `http://localhost:8000/api/v1`
  - ✅ `http://backend:8000/api/v1` (com fallback via env var)

### 2. **MongoDB - Conexão via localhost**
- `service_agente_whatsapp/app/db/database.py` → Linha 14
  - ❌ `mongodb://localhost:27017/`
  - ✅ `mongodb://mongo:27017/` (com fallback via env var)

### 3. **Microsserviço Audio - Hardcodes de localhost**
- `service_agente_audio_sumarizado/app/integrations/backend_integration.py` → Linha 117
  - ❌ `http://localhost:8082`
  - ✅ Usa `os.getenv("BACKEND_API_URL", "http://backend:8000")`

- `service_agente_audio_sumarizado/app/integrations/appconecta_integration.py` → Linha 126
  - ❌ `http://localhost:3001`
  - ✅ Usa `os.getenv("APP_CONECTA_URL", "http://app-conecta:3001")`

### 4. **Frontend - Referências a localhost**
- `frontend/src/pages/WhatsAppSimulator/WhatsAppSimulator.tsx` → Linhas 103 e 144
  - ❌ `http://localhost:8002/api/v1/chat`
  - ✅ Usa `import.meta.env.VITE_WHATSAPP_AGENT_URL`

### 5. **Arquivos de Teste - Sem env vars**
- `service_agente_whatsapp/test_local.py` → Linha 11
  - ❌ `BASE_URL = "http://localhost:8002/api/v1"`
  - ✅ `os.getenv("WHATSAPP_AGENT_URL", "http://localhost:8002/api/v1")`

- `service_agente_audio_sumarizado/test_local.py` → Linha 12
  - ❌ `BASE_URL = "http://localhost:8003/api/v1"`
  - ✅ `os.getenv("AUDIO_AGENT_URL", "http://localhost:8003/api/v1")`

### 6. **Docker Compose - Endereço fixo no build**
- `docker-compose.yml` → Frontend build args
  - ❌ `VITE_API_URL=http://165.227.186.94:8082`
  - ✅ Agora usa variáveis de ambiente dinâmicas

---

## ✅ CORREÇÕES REALIZADAS

### **Arquivos Modificados (11 arquivos):**

#### 1️⃣ **Backend - WhatsApp Agent**
```python
# service_agente_whatsapp/app/services/backend_client.py
- self.base_url = os.getenv("BACKEND_URL", "http://localhost:8000/api/v1")
+ self.base_url = os.getenv("BACKEND_URL", "http://backend:8000/api/v1")
```

#### 2️⃣ **Backend - MongoDB**
```python
# service_agente_whatsapp/app/db/database.py
- mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
+ mongo_uri = os.getenv("MONGO_URI", "mongodb://mongo:27017/")
```

#### 3️⃣ **Audio Agent - Backend Integration**
```python
# service_agente_audio_sumarizado/app/integrations/backend_integration.py
+ import os  # Adicionado
- backend_url="http://localhost:8082"
+ backend_url=os.getenv("BACKEND_API_URL", "http://backend:8000")
```

#### 4️⃣ **Audio Agent - App Integration**
```python
# service_agente_audio_sumarizado/app/integrations/appconecta_integration.py
+ import os  # Adicionado
- app_url="http://localhost:3001"
+ app_url=os.getenv("APP_CONECTA_URL", "http://app-conecta:3001")
```

#### 5️⃣ **Frontend - WhatsApp Simulator**
```typescript
// frontend/src/pages/WhatsAppSimulator/WhatsAppSimulator.tsx
- const response = await fetch('http://localhost:8002/api/v1/chat', {
+ const whatsappAgentUrl = import.meta.env.VITE_WHATSAPP_AGENT_URL || 'http://localhost:8002/api/v1';
+ const response = await fetch(`${whatsappAgentUrl}/chat`, {
```

#### 6️⃣ **Tests - WhatsApp Agent**
```python
# service_agente_whatsapp/test_local.py
+ import os  # Adicionado
- BASE_URL = "http://localhost:8002/api/v1"
+ BASE_URL = os.getenv("WHATSAPP_AGENT_URL", "http://localhost:8002/api/v1")
```

#### 7️⃣ **Tests - Audio Agent**
```python
# service_agente_audio_sumarizado/test_local.py
+ import os  # Adicionado
- BASE_URL = "http://localhost:8003/api/v1"
+ BASE_URL = os.getenv("AUDIO_AGENT_URL", "http://localhost:8003/api/v1")
```

#### 8️⃣ **Docker Compose**
```yaml
# docker-compose.yml - Frontend build args
- args:
    - VITE_API_URL=http://165.227.186.94:8082
+ args:
    - VITE_API_URL=http://backend:8000
    - VITE_WHATSAPP_AGENT_URL=http://service_agente_whatsapp:8001/api/v1
    - VITE_AUDIO_AGENT_URL=http://service_agente_audio_sumarizado:8003/api/v1
```

#### 9️⃣ **Dockerfile Frontend**
```dockerfile
# frontend/Dockerfile
  ARG VITE_API_URL
+ ARG VITE_WHATSAPP_AGENT_URL
+ ARG VITE_AUDIO_AGENT_URL
  ENV VITE_API_URL=$VITE_API_URL
+ ENV VITE_WHATSAPP_AGENT_URL=$VITE_WHATSAPP_AGENT_URL
+ ENV VITE_AUDIO_AGENT_URL=$VITE_AUDIO_AGENT_URL
```

#### 🔟 **Arquivo .env Principal**
```properties
# .env - Adicionadas variáveis de ambiente
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173,https://conecta-saude-frontend.onrender.com

# URLs dos microsserviços
BACKEND_URL=http://backend:8000/api/v1
WHATSAPP_AGENT_URL=http://service_agente_whatsapp:8001
AUDIO_AGENT_URL=http://service_agente_audio_sumarizado:8003
APP_CONECTA_URL=http://app-conecta:3001
```

### **Arquivos Criados (2 arquivos):**

#### 📄 **frontend/.env.example**
```bash
VITE_API_URL=http://backend:8000
VITE_WHATSAPP_AGENT_URL=http://service_agente_whatsapp:8001/api/v1
VITE_AUDIO_AGENT_URL=http://service_agente_audio_sumarizado:8003/api/v1
VITE_ENVIRONMENT=production
VITE_DEBUG=false
```

#### 📄 **frontend/.env.production**
```bash
VITE_API_URL=https://conecta-saude-backend.onrender.com
VITE_WHATSAPP_AGENT_URL=https://conecta-saude-whatsapp.onrender.com/api/v1
VITE_AUDIO_AGENT_URL=https://conecta-saude-audio.onrender.com/api/v1
VITE_ENVIRONMENT=production
VITE_DEBUG=false
```

---

## 🔧 VARIÁVEIS DE AMBIENTE NECESSÁRIAS EM PRODUÇÃO

### **Para o Backend (.env na raiz do projeto):**
```bash
# Serviços Externos
BACKEND_URL=http://backend:8000/api/v1
ML_SERVICE_URL=http://model-llm:8002/classify
LLM_SERVICE_URL=http://service_llm:8001/generate-actions
WHATSAPP_AGENT_URL=http://service_agente_whatsapp:8001
AUDIO_AGENT_URL=http://service_agente_audio_sumarizado:8003
APP_CONECTA_URL=http://app-conecta:3001

# CORS
CORS_ORIGINS=https://conecta-saude-frontend.onrender.com

# Banco de Dados
MONGO_URI=mongodb://mongo:27017/
REDIS_URL=redis://redis:6379/0
```

### **Para o Frontend (devem ser passadas no build do Docker):**
```bash
VITE_API_URL=https://seu-backend.com
VITE_WHATSAPP_AGENT_URL=https://seu-whatsapp.com/api/v1
VITE_AUDIO_AGENT_URL=https://seu-audio.com/api/v1
VITE_ENVIRONMENT=production
```

---

## 🚀 PRÓXIMOS PASSOS

### 1. **Atualizar as URLs em Produção (Render/Deploy)**
Se você está usando Render ou outro serviço:

1. Atualizar `frontend/.env.production` com as URLs REAIS do seu deploy
   - `https://conecta-saude-backend.onrender.com` → Sua URL real
   - `https://conecta-saude-whatsapp.onrender.com` → Sua URL real
   - `https://conecta-saude-audio.onrender.com` → Sua URL real

2. No seu ambiente de produção (Render), adicionar as variáveis de ambiente:
   ```bash
   BACKEND_URL=https://seu-backend.com/api/v1
   MONGO_URI=mongodb+srv://user:pass@seu-cluster.mongodb.net/db
   REDIS_URL=redis://seu-redis-host:6379/0
   ```

### 2. **Testar Localmente com Docker Compose**
```bash
# Antes de subir em produção
docker-compose up --build

# Verificar logs
docker-compose logs -f backend
docker-compose logs -f service_agente_whatsapp
```

### 3. **Verificar Conectividade Entre Serviços**
```bash
# Dentro de um container, teste:
curl http://backend:8000/health
curl http://service_agente_whatsapp:8001/health
curl http://service_agente_audio_sumarizado:8003/health
```

### 4. **Atualizar DNS/CORS se necessário**
Se seus serviços estão em domínios diferentes:
```bash
CORS_ORIGINS=https://seu-frontend.com,https://seu-outro-dominio.com
```

---

## 📊 RESUMO DA SITUAÇÃO

| Componente | Antes | Depois | Status |
|-----------|-------|--------|--------|
| Backend ↔ WhatsApp | `localhost:8000` | `backend:8000` | ✅ Corrigido |
| MongoDB | `localhost:27017` | `mongo:27017` | ✅ Corrigido |
| Frontend ↔ Serviços | Hardcoded IPs | Env vars | ✅ Corrigido |
| Audio Agent | `localhost:8082` | Env vars | ✅ Corrigido |
| CORS | Apenas localhost | Inclui produção | ✅ Corrigido |
| Docker Build | IP fixo | Dinâmico | ✅ Corrigido |

---

## ⚠️ IMPORTANTE

Se você estiver rodando em um ambiente de **contêineres orquestrados** (como Docker Compose, Kubernetes):
- Use nomes de serviço como `http://backend:8000`
- **NÃO use** `localhost` ou `127.0.0.1`
- Certifique-se que todos os serviços estão na **mesma rede Docker**

Se você estiver rodando em máquinas diferentes:
- Use IPs reais ou domínios
- Configure firewall para permitir as portas necessárias

---

## 📞 Próximas Ações Recomendadas

1. ✅ **Revisar .env em produção** - Confirme que tem todas as variáveis
2. ✅ **Testar conexão entre serviços** - Use `curl` para validar
3. ✅ **Monitorar logs** - Procure por erros de conexão recusada
4. ✅ **Validar CORS** - Confirme que o frontend consegue acessar o backend
5. ✅ **Testes de integração** - Execute fluxos completos

Tudo corrígido! 🎉
