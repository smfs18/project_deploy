# 🚀 Guia de Setup Rápido - Service Agente WhatsApp

Este guia vai te ajudar a colocar o serviço no ar em poucos minutos.

---

## ✅ Pré-requisitos

Antes de começar, certifique-se de ter:

- [ ] Python 3.11 ou superior instalado
- [ ] MongoDB instalado ou acesso ao MongoDB Atlas
- [ ] Backend do Conecta Saúde rodando (opcional para testes básicos)
- [ ] Chave da API do Google Gemini ([obter aqui](https://makersuite.google.com/app/apikey))

---

## 📋 Passo a Passo

### 1️⃣ Navegue até a pasta do serviço

```bash
cd service_agente_whatsapp
```

### 2️⃣ Crie um ambiente virtual (recomendado)

```bash
python -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate
```

### 3️⃣ Instale as dependências

```bash
pip install -r requeriments.txt
```

**Tempo estimado**: 2-3 minutos

### 4️⃣ Configure as variáveis de ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o arquivo .env com suas credenciais
nano .env  # ou use seu editor favorito
```

**Conteúdo do .env**:
```env
# OBRIGATÓRIO - Obtenha em https://makersuite.google.com/app/apikey
GOOGLE_API_KEY=sua_chave_api_aqui

# MongoDB - Use estas configurações para desenvolvimento local
MONGO_URI=mongodb://localhost:27017/
MONGO_DB_NAME=whatsapp_agent_db

# Backend - Ajuste a porta se necessário
BACKEND_URL=http://localhost:8000/api/v1

# Porta do serviço (padrão: 8002)
PORT=8002
```

### 5️⃣ Inicie o MongoDB

**Opção A - Docker (recomendado)**:
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Opção B - MongoDB Local**:
```bash
mongod --dbpath /caminho/para/data
```

**Opção C - MongoDB Atlas**:
```env
# No .env, altere MONGO_URI para:
MONGO_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/
```

### 6️⃣ Inicie o serviço

```bash
python main.py
```

Você deve ver algo como:
```
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8002 (Press CTRL+C to quit)
```

### 7️⃣ Teste se está funcionando

**Teste rápido no navegador**:
Abra: http://localhost:8002

Você deve ver:
```json
{
  "status": "ok",
  "service": "WhatsApp Agent",
  "version": "2.0.0"
}
```

**Teste com curl**:
```bash
curl http://localhost:8002/
```

---

## 🧪 Primeiros Testes

### Teste 1: Mensagem Simples

```bash
curl -X POST "http://localhost:8002/api/v1/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test_001",
    "message": "Olá"
  }'
```

**Resposta esperada** (exemplo):
```json
{
  "response": "Olá! Sou a LIA, assistente virtual de saúde. Como posso ajudar você hoje?"
}
```

### Teste 2: Script Interativo

```bash
python test_local.py
```

Este script oferece um menu interativo com vários testes.

---

## 🔧 Opções de Setup

### Opção A: Setup Básico (Apenas MongoDB)

**Use quando**: Quiser testar o agente sem integração com backend

**Vantagens**: 
- ✅ Setup rápido
- ✅ Sem dependências externas

**Limitações**:
- ❌ Não carrega dados do paciente
- ❌ Não atualiza banco de dados

**Como usar**:
```bash
# No .env, deixe vazio:
BACKEND_URL=

# Nas chamadas, não envie patient_email nem auth_token
```

### Opção B: Setup Completo (MongoDB + Backend)

**Use quando**: Quiser testar integração completa

**Vantagens**:
- ✅ Funcionalidade completa
- ✅ Testa atualização de dados
- ✅ Conversa contextualizada

**Pré-requisitos**:
- Backend rodando em http://localhost:8000
- Paciente cadastrado no banco
- Token de autenticação válido

**Como usar**:
1. Inicie o backend:
   ```bash
   cd ../back/backend
   uvicorn app.main:app --reload
   ```

2. Faça login e obtenha token:
   ```bash
   curl -X POST "http://localhost:8000/api/v1/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@email.com", "password": "senha123"}'
   ```

3. Use o token nas chamadas ao agente

### Opção C: Setup com Docker Compose

**Use quando**: Quiser um ambiente isolado e reproduzível

```bash
# Na pasta service_agente_whatsapp
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
```

---

## 🐛 Resolução de Problemas

### ❌ Erro: "GOOGLE_API_KEY não definida"

**Causa**: Variável de ambiente não configurada

**Solução**:
1. Obtenha chave em https://makersuite.google.com/app/apikey
2. Adicione ao `.env`:
   ```env
   GOOGLE_API_KEY=sua_chave_aqui
   ```
3. Reinicie o serviço

### ❌ Erro: "Import pymongo could not be resolved"

**Causa**: Dependências não instaladas

**Solução**:
```bash
pip install -r requeriments.txt
```

### ❌ Erro: "Connection to MongoDB failed"

**Causa**: MongoDB não está rodando

**Solução**:
```bash
# Docker
docker start mongodb

# Ou inicie um novo container
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Teste a conexão**:
```bash
# Se tiver MongoDB CLI instalado
mongosh mongodb://localhost:27017/
```

### ❌ Erro: "Error connecting to backend"

**Causa**: Backend não está rodando ou URL incorreta

**Solução**:
1. Verifique se backend está rodando:
   ```bash
   curl http://localhost:8000/
   ```

2. Ajuste URL no `.env`:
   ```env
   BACKEND_URL=http://localhost:8000/api/v1
   ```

### ❌ Erro: Port 8002 already in use

**Causa**: Porta já está sendo usada

**Solução**:
```bash
# Opção 1: Encontre e mate o processo
lsof -i :8002
kill -9 <PID>

# Opção 2: Use outra porta
# No .env:
PORT=8003

# Reinicie o serviço
```

---

## 📊 Verificação do Setup

Execute este checklist para verificar se tudo está OK:

### Checklist de Verificação

```bash
# 1. Verificar Python
python --version  # Deve ser 3.11+

# 2. Verificar dependências
pip freeze | grep fastapi  # Deve mostrar fastapi e versão

# 3. Verificar MongoDB
# Docker:
docker ps | grep mongo
# Ou local:
mongosh --eval "db.version()"

# 4. Verificar variável de ambiente
echo $GOOGLE_API_KEY  # Não deve estar vazio

# 5. Verificar serviço
curl http://localhost:8002/  # Deve retornar JSON

# 6. Verificar endpoint de chat
curl -X POST "http://localhost:8002/api/v1/chat" \
  -H "Content-Type: application/json" \
  -d '{"session_id": "test", "message": "Olá"}'
# Deve retornar resposta do agente
```

**Se todos os itens acima funcionarem, seu setup está correto! ✅**

---

## 📚 Próximos Passos

Agora que o serviço está rodando, você pode:

1. **Ler a documentação completa**:
   - `README.md` - Visão geral
   - `USAGE.md` - Guia de uso
   - `OVERVIEW.md` - Arquitetura detalhada

2. **Executar os testes**:
   ```bash
   pytest
   ```

3. **Testar integração com backend**:
   - Cadastre um paciente no sistema
   - Obtenha um token de autenticação
   - Teste conversa com dados do paciente

4. **Explorar o código**:
   - `app/services/triage_agent.py` - Lógica do agente
   - `app/services/backend_client.py` - Integração com backend
   - `app/utils/emergency.py` - Detecção de emergências

5. **Personalizar o agente**:
   - Edite `SYSTEM_PROMPT` para mudar o comportamento
   - Adicione novos campos em `EXTRACTION_PROMPT`
   - Customize respostas de emergência

---

## 🎯 Dicas Importantes

### Performance
- Use MongoDB com índices para melhor performance
- Configure timeout adequado para chamadas ao backend
- Monitore uso de memória e tokens do LLM

### Segurança
- **NUNCA** commite o arquivo `.env` com credenciais reais
- Use HTTPS em produção
- Implemente rate limiting
- Valide e sanitize entradas do usuário

### Produção
- Use um processo supervisor (systemd, supervisord)
- Configure logs estruturados
- Implemente health checks
- Monitore métricas e alertas

---

## 💡 Recursos Úteis

### Comandos Úteis

```bash
# Ver logs em tempo real
tail -f logs/agent.log

# Verificar sessões no MongoDB
mongosh whatsapp_agent_db --eval "db.sessions.count()"

# Limpar sessões antigas
mongosh whatsapp_agent_db --eval "db.sessions.deleteMany({})"

# Reiniciar serviço (com systemd)
sudo systemctl restart whatsapp-agent

# Ver uso de porta
netstat -tulpn | grep 8002
```

### Links Importantes

- [Google Gemini API](https://ai.google.dev/)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [LangChain Docs](https://python.langchain.com/)
- [LangGraph Docs](https://langchain-ai.github.io/langgraph/)
- [MongoDB Docs](https://docs.mongodb.com/)

---

## 🎉 Pronto!

Seu **Service Agente WhatsApp** está configurado e pronto para uso!

Se tiver dúvidas, consulte a documentação ou entre em contato com a equipe.

**Boa sorte! 🚀**
