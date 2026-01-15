# 🚀 GUIA DE CONFIGURAÇÃO EM PRODUÇÃO

**Data:** 14 de janeiro de 2026  
**Objetivo:** Configurar o sistema Conecta Saúde para funcionar corretamente em produção

---

## 📋 Checklist Pre-Deploy

### 1. Verificação de Código
- [x] Remover todos os hardcodes de `localhost`
- [x] Usar variáveis de ambiente para URLs
- [x] Certificar que o Docker Compose usa nomes de serviço
- [x] Frontend está configurado para ler env vars

### 2. Variáveis de Ambiente
- [ ] Criar arquivo `.env` com as configurações corretas
- [ ] Definir URLs de produção do backend
- [ ] Definir URLs dos microsserviços
- [ ] Configurar CORS para incluir seu domínio de produção
- [ ] Definir credenciais seguras para JWT e API keys

### 3. Banco de Dados
- [ ] Verificar conexão com Supabase
- [ ] Confirmar MongoDB está acessível
- [ ] Testar Redis está funcionando

### 4. Certificados e HTTPS
- [ ] Gerar/atualizar certificados SSL
- [ ] Configurar nginx para HTTPS
- [ ] Redirecionar HTTP para HTTPS

---

## 🔧 Configuração do .env para Produção

Copie o template abaixo e preencha com seus valores reais:

```bash
# ============================================
# DATABASE - Supabase PostgreSQL
# ============================================
DATABASE_URL=postgresql://user:senha@seu-host.supabase.co:5432/seu-db

# ============================================
# SUPABASE Configuration
# ============================================
SUPABASE_URL=https://seu-project.supabase.co
SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_KEY=sua-service-key

# ============================================
# JWT / Segurança
# ============================================
JWT_SECRET=gere-uma-chave-segura-aqui
SECRET_KEY=outra-chave-segura
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=43200

# ============================================
# Environment
# ============================================
ENVIRONMENT=production
LOG_LEVEL=info
DEBUG=False
PORT=8000

# ============================================
# CORS Configuration
# ============================================
CORS_ORIGINS=https://seu-frontend-dominio.com,https://outro-dominio-se-houver.com

# ============================================
# URLs dos Microsserviços (dentro do Docker)
# ============================================
ML_SERVICE_URL=http://model-llm:8002/classify
LLM_SERVICE_URL=http://service_llm:8001/generate-actions
BACKEND_URL=http://backend:8000/api/v1
BACKEND_API_URL=http://backend:8000
WHATSAPP_AGENT_URL=http://service_agente_whatsapp:8001
AUDIO_AGENT_URL=http://service_agente_audio_sumarizado:8003
APP_CONECTA_URL=http://app-conecta:3001

# ============================================
# Cache Configuration
# ============================================
REDIS_URL=redis://redis:6379/0

# ============================================
# MongoDB Configuration
# ============================================
MONGO_URI=mongodb://seu-host:27017/
MONGO_DB_NAME=whatsapp_agent_db

# ============================================
# External APIs
# ============================================
GEMINI_API_KEY=sua-chave-gemini
GOOGLE_API_KEY=sua-chave-google

# ============================================
# SMTP Configuration (se usar email)
# ============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASSWORD=sua-senha-app

# ============================================
# Backend API Keys
# ============================================
BACKEND_API_KEY=gere-uma-chave-aleatoria
```

---

## 🐳 Docker Compose em Produção

### Antes de fazer `docker-compose up`:

1. **Verifique as portas:**
   ```bash
   # Certificar que as portas estão disponíveis
   sudo netstat -tlnp | grep -E ':(8000|8001|8002|8003|8004|5173|6379|27017)'
   ```

2. **Crie volume de backup:**
   ```bash
   docker volume create audio_uploads_backup
   ```

3. **Configure logging:**
   ```bash
   # Adicione ao docker-compose.yml em cada serviço:
   logging:
     driver: "json-file"
     options:
       max-size: "10m"
       max-file: "3"
   ```

4. **Inicie os serviços:**
   ```bash
   docker-compose up -d
   ```

5. **Verifique o status:**
   ```bash
   docker-compose ps
   docker-compose logs -f
   ```

---

## 🔒 Segurança em Produção

### 1. Credenciais
```bash
# Gerar chaves seguras para JWT
openssl rand -hex 32

# Exemplo:
JWT_SECRET=a7f3e8d2c5b9f1a4e7c2d5f8a1b4e7c0d3f6a9c2e5f8a1b4d7e0c3f6a9
```

### 2. CORS Restritivo
```bash
# NÃO USE isso em produção:
CORS_ORIGINS=*

# USE isso:
CORS_ORIGINS=https://seu-dominio.com,https://outro-dominio.com
```

### 3. Firewall
```bash
# Permitir apenas portas necessárias
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8082/tcp  # Backend (se exposto)
```

### 4. Certificados SSL
```bash
# Usar Let's Encrypt com Certbot
sudo certbot certonly --standalone -d seu-dominio.com

# Ou usar Docker com image nginx-certbot
```

---

## 🌐 Configuração do Frontend para Produção

### 1. Arquivo `.env.production`
```bash
VITE_API_URL=https://seu-backend.onrender.com
VITE_WHATSAPP_AGENT_URL=https://seu-whatsapp.onrender.com/api/v1
VITE_AUDIO_AGENT_URL=https://seu-audio.onrender.com/api/v1
VITE_ENVIRONMENT=production
VITE_DEBUG=false
```

### 2. Build para Produção
```bash
cd frontend
npm run build

# O output estará em ./dist
```

### 3. Servir com Nginx
```bash
# O Dockerfile já faz isso
docker build -t conecta-frontend .
docker run -p 80:80 conecta-frontend
```

---

## 📊 Monitoramento em Produção

### 1. Verificar Saúde dos Serviços
```bash
# Backend
curl https://seu-backend.onrender.com/health

# Frontend
curl https://seu-frontend.onrender.com

# Cada microsserviço (ajuste conforme sua URL)
curl https://seu-whatsapp.onrender.com/health
curl https://seu-audio.onrender.com/api/v1/health
```

### 2. Logs
```bash
# Ver logs em tempo real
docker-compose logs -f

# Ver logs específicos
docker-compose logs -f backend
docker-compose logs -f service_agente_whatsapp

# Ver logs históricos
docker-compose logs --tail=100 backend
```

### 3. Performance
```bash
# Ver uso de memória
docker stats

# Ver métricas detalhadas
docker ps --format "table {{.Names}}\t{{.Status}}"
```

---

## 🔧 Troubleshooting Comum

### Problema: "Connection refused" entre serviços
**Solução:**
```bash
# Verificar se os containers estão na mesma rede
docker network ls
docker network inspect conecta-network

# Testar conectividade interna
docker-compose exec backend ping service_agente_whatsapp
```

### Problema: "CORS policy" no navegador
**Solução:**
```bash
# Atualizar CORS_ORIGINS em .env
CORS_ORIGINS=https://seu-dominio.com

# Reiniciar backend
docker-compose restart backend
```

### Problema: "Service unavailable" em microsserviços
**Solução:**
```bash
# Verificar se o serviço está rodando
docker-compose ps service_agente_whatsapp

# Verificar logs
docker-compose logs service_agente_whatsapp

# Reiniciar o serviço
docker-compose restart service_agente_whatsapp
```

### Problema: Banco de dados recusando conexão
**Solução:**
```bash
# Verificar variáveis de conexão
grep DATABASE_URL .env

# Testar conectividade
docker-compose exec backend python -c "import psycopg2; psycopg2.connect('DATABASE_URL')"
```

---

## 📈 Escala e Performance

### Aumentar recursos para containers
```yaml
# docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G
```

### Usar replicas (Swarm/Kubernetes)
```bash
# Docker Swarm
docker service update --replicas 3 backend

# Kubernetes
kubectl scale deployment backend --replicas=3
```

---

## ✅ Checklist de Deploy Final

Antes de considerar o deploy concluído:

- [ ] Todos os containers estão rodando (`docker-compose ps`)
- [ ] Health checks passam para todos os serviços
- [ ] Backend consegue acessar banco de dados
- [ ] Frontend consegue acessar backend (sem CORS errors)
- [ ] Microsserviços conseguem se comunicar
- [ ] Logs não mostram erros de conexão
- [ ] Certificados SSL estão válidos
- [ ] Backups estão configurados
- [ ] Monitoramento está ativo
- [ ] Time foi notificado sobre o novo deploy

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique o arquivo `RELATORIO_CORRECAO_LOCALHOST.md` para detalhes de cada correção
2. Execute `./validate_production.sh` para validação automática
3. Verifique os logs: `docker-compose logs -f`
4. Teste conectividade manualmente com `curl`

---

**Última atualização:** 14 de janeiro de 2026
