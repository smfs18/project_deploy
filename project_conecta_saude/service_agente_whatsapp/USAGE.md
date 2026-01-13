# 📘 Guia de Uso - Service Agente WhatsApp

## 🎯 Objetivo

Este guia explica como usar e integrar o **Service Agente WhatsApp** no sistema Conecta Saúde.

## 🔧 Configuração Inicial

### 1. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# API do Google Gemini
GOOGLE_API_KEY=sua_chave_api_google_gemini

# MongoDB
MONGO_URI=mongodb://localhost:27017/
MONGO_DB_NAME=whatsapp_agent_db

# Backend
BACKEND_URL=http://localhost:8000/api/v1

# Porta (opcional)
PORT=8002
```

### 2. Iniciar o MongoDB

**Docker**:
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Local**:
```bash
mongod --dbpath /caminho/para/data
```

### 3. Iniciar o Serviço

```bash
cd service_agente_whatsapp
python main.py
```

## 📞 Como Usar a API

### Exemplo 1: Conversa Simples (Sem Dados do Backend)

```bash
curl -X POST "http://localhost:8002/api/v1/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "whatsapp_5511999999999",
    "message": "Olá, preciso atualizar meus dados"
  }'
```

**Resposta**:
```json
{
  "response": "Olá! Fico feliz em ajudar você a atualizar seus dados. Vamos começar: qual é seu nome completo?"
}
```

### Exemplo 2: Conversa com Dados do Paciente

**Primeiro, faça login no backend e obtenha um token**:

```bash
# Login no backend
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "profissional@clinica.com",
    "password": "senha123"
  }'
```

**Resposta** (exemplo):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Agora use o token para enviar mensagem com dados do paciente**:

```bash
curl -X POST "http://localhost:8002/api/v1/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "whatsapp_5511999999999",
    "message": "Olá",
    "patient_email": "paciente@email.com",
    "auth_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**Resposta** (com dados do paciente):
```json
{
  "response": "Olá, João! Tudo bem? Vou confirmar alguns dados com você. Seu endereço atual ainda é Rua das Flores, 123?"
}
```

### Exemplo 3: Atualizando Pressão Arterial

```bash
curl -X POST "http://localhost:8002/api/v1/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "whatsapp_5511999999999",
    "message": "Minha pressão hoje está 130/85",
    "patient_email": "paciente@email.com",
    "auth_token": "seu_token_aqui"
  }'
```

**Resposta**:
```json
{
  "response": "Obrigada por informar, João! Anotei sua pressão: 130/85 mmHg. E a glicemia, você mediu recentemente?"
}
```

### Exemplo 4: Situação de Emergência

```bash
curl -X POST "http://localhost:8002/api/v1/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "whatsapp_5511987654321",
    "message": "Estou com uma dor muito forte no peito e falta de ar"
  }'
```

**Resposta**:
```json
{
  "response": "Com base no que você descreveu, seus sintomas podem indicar uma situação de emergência. Por favor, interrompa nossa conversa e procure o pronto-socorro mais próximo ou ligue para o SAMU (192) imediatamente. Sua saúde é a prioridade."
}
```

## 🔄 Fluxo de Conversa Completo

### Passo 1: Início da Conversa

**Cliente → Agente**:
```
"Olá"
```

**Agente → Cliente**:
```
"Olá, João! Tudo bem? Vou confirmar alguns dados com você. 
Seu endereço atual ainda é Rua das Flores, 123?"
```

### Passo 2: Confirmação de Dados

**Cliente → Agente**:
```
"Sim, continua o mesmo"
```

**Agente → Cliente**:
```
"Perfeito! E sua data de nascimento continua sendo 15/03/1980?"
```

### Passo 3: Coleta de Dados Clínicos

**Cliente → Agente**:
```
"Sim. Minha pressão hoje está 130/85"
```

**Agente → Cliente**:
```
"Obrigada! 130/85 mmHg anotado. E a glicemia, você mediu recentemente?"
```

### Passo 4: Mais Dados

**Cliente → Agente**:
```
"Sim, estava 110 em jejum"
```

**Agente → Cliente**:
```
"Ótimo, 110 mg/dL registrado. Como está sua dieta atualmente? 
Você diria que é excelente, boa, regular ou ruim?"
```

### Passo 5: Finalização

**Cliente → Agente**:
```
"Diria que está boa. Tenho me alimentado bem."
```

**Agente → Cliente**:
```
"Que bom saber! Acabei de atualizar todas as suas informações no sistema. 
Obrigada pela colaboração! Um profissional de saúde entrará em contato 
se necessário. Cuide-se!"
```

## 🧪 Testando com Python

```python
import requests

# Configuração
BASE_URL = "http://localhost:8002/api/v1"
SESSION_ID = "test_session_001"

# Função para enviar mensagem
def send_message(message, email=None, token=None):
    payload = {
        "session_id": SESSION_ID,
        "message": message
    }
    
    if email:
        payload["patient_email"] = email
    if token:
        payload["auth_token"] = token
    
    response = requests.post(f"{BASE_URL}/chat", json=payload)
    return response.json()

# Teste de conversa
print("=== Teste de Conversa ===\n")

# Mensagem 1
resp1 = send_message("Olá")
print(f"Agente: {resp1['response']}\n")

# Mensagem 2
resp2 = send_message("Minha pressão está 120/80")
print(f"Agente: {resp2['response']}\n")

# Mensagem 3
resp3 = send_message("Glicemia 95")
print(f"Agente: {resp3['response']}\n")
```

## 🔌 Integração com WhatsApp (Webhook)

Para integrar com WhatsApp real, você precisa:

1. **Configurar WhatsApp Business API**
2. **Configurar Webhook** apontando para seu serviço
3. **Processar mensagens recebidas**

### Exemplo de Webhook Handler

```python
from fastapi import Request
from app.routes.webhook import router

@router.post("/whatsapp-webhook")
async def whatsapp_webhook(request: Request):
    """Recebe mensagens do WhatsApp."""
    data = await request.json()
    
    # Extrai informações da mensagem
    phone = data["from"]  # Número do remetente
    message = data["message"]["text"]  # Texto da mensagem
    
    # Cria session_id baseado no número
    session_id = f"whatsapp_{phone}"
    
    # Processa com o agente
    response = await whatsapp_agent.handle_message(
        session_id=session_id,
        user_message=message
    )
    
    # Envia resposta de volta para o WhatsApp
    # (implementação específica da API do WhatsApp)
    return {"status": "ok", "response": response}
```

## 📊 Monitoramento

### Verificar Sessões Ativas

```python
from app.db.database import get_database

db = get_database()
sessions = db.sessions.find({})

for session in sessions:
    print(f"Session: {session['session_id']}")
    print(f"Mensagens: {len(session['messages'])}")
    print(f"Status: {session['conversation_status']}")
    print("---")
```

### Limpar Sessões Antigas

```python
from datetime import datetime, timedelta
from app.db.database import get_database

db = get_database()

# Remove sessões com mais de 7 dias
seven_days_ago = datetime.utcnow() - timedelta(days=7)
result = db.sessions.delete_many({
    "updated_at": {"$lt": seven_days_ago}
})

print(f"Sessões removidas: {result.deleted_count}")
```

## 🐛 Solução de Problemas

### Erro: "Import pymongo could not be resolved"

**Solução**: Instale as dependências
```bash
pip install -r requeriments.txt
```

### Erro: "GOOGLE_API_KEY não definida"

**Solução**: Configure a variável de ambiente
```bash
export GOOGLE_API_KEY="sua_chave_aqui"
```

### Erro: "Connection to MongoDB failed"

**Solução**: Verifique se o MongoDB está rodando
```bash
# Testar conexão
mongosh mongodb://localhost:27017/
```

### Agente não atualiza dados no backend

**Verifique**:
1. Token de autenticação válido
2. Backend rodando na URL correta
3. Email do paciente existe no banco
4. Logs do serviço para erros

## 📚 Recursos Adicionais

- [Documentação do LangChain](https://python.langchain.com/)
- [Documentação do LangGraph](https://langchain-ai.github.io/langgraph/)
- [Google Gemini API](https://ai.google.dev/)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)

## 🆘 Suporte

Para dúvidas ou problemas, entre em contato com a equipe de desenvolvimento.
