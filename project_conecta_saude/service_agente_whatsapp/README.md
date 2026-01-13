# 🤖 Service Agente WhatsApp - LIA

Agente inteligente de WhatsApp para acompanhamento de saúde de pacientes.

## 📋 Descrição

O **Service Agente WhatsApp** é um microsserviço que implementa a **LIA** (assistente virtual), responsável por:

### Funcionalidades Principais

1. **Verificação de Informações Pessoais**
   - Confirma dados cadastrais (nome, endereço, data de nascimento)
   - Detecta mudanças de endereço
   - Atualiza informações desatualizadas

2. **Coleta de Dados Clínicos**
   - Pressão arterial (sistólica/diastólica)
   - Glicemia em jejum
   - Colesterol (total, HDL)
   - Triglicerídeos
   - IMC (Índice de Massa Corporal)

3. **Monitoramento de Hábitos de Vida**
   - Qualidade da dieta
   - Qualidade do sono
   - Nível de atividade física
   - Consumo de álcool
   - Tabagismo
   - Nível de estresse

4. **Protocolo de Emergência**
   - Detecção automática de sintomas de emergência
   - Orientação para procurar atendimento imediato
   - Integração com SAMU (192)

5. **Integração com Backend**
   - Busca dados atuais do paciente
   - Atualiza informações no banco de dados PostgreSQL
   - Mantém histórico de conversas no MongoDB

## 🏗️ Arquitetura

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────┐
│   WhatsApp  │────────▶│  Service Agent   │────────▶│   Backend   │
│   Cliente   │         │   (FastAPI)      │         │  (FastAPI)  │
└─────────────┘         └──────────────────┘         └─────────────┘
                               │                             │
                               │                             │
                               ▼                             ▼
                        ┌─────────────┐             ┌──────────────┐
                        │   MongoDB   │             │  PostgreSQL  │
                        │  (Sessões)  │             │  (Pacientes) │
                        └─────────────┘             └──────────────┘
```

### Fluxo de Dados

1. **Recepção da Mensagem** → Webhook recebe mensagem do WhatsApp
2. **Verificação de Emergência** → LLM analisa se há situação de risco
3. **Carregamento de Dados** → Busca informações do paciente no backend
4. **Conversa Contextualizada** → LIA conversa usando dados do paciente
5. **Extração de Informações** → LLM extrai dados estruturados da conversa
6. **Atualização do Backend** → Envia dados atualizados para o backend

## 🚀 Instalação

### Pré-requisitos

- Python 3.11+
- MongoDB (local ou Atlas)
- Acesso ao backend do sistema
- Chave da API do Google Gemini

### Passos

1. **Clone o repositório** (se ainda não fez)

2. **Instale as dependências**:
   ```bash
   cd service_agente_whatsapp
   pip install -r requeriments.txt
   ```

3. **Configure as variáveis de ambiente**:
   ```bash
   cp .env.example .env
   # Edite o .env com suas configurações
   ```

4. **Configure o MongoDB**:
   - Local: certifique-se de que o MongoDB está rodando
   - Atlas: use a URI de conexão no `.env`

5. **Inicie o serviço**:
   ```bash
   python main.py
   ```

O serviço estará disponível em: `http://localhost:8002`

## 📡 API Endpoints

### POST `/api/v1/chat`

Processa mensagens do WhatsApp.

**Request Body**:
```json
{
  "session_id": "whatsapp_5511999999999",
  "message": "Olá, minha pressão hoje está 130/85",
  "patient_email": "paciente@email.com",
  "auth_token": "Bearer token_de_autenticacao"
}
```

**Response**:
```json
{
  "response": "Obrigada por informar! 130/85 mmHg está anotado. Me conta, você mediu sua glicemia recentemente?"
}
```

### POST `/api/v1/reset-session`

Reseta uma sessão de conversa.

**Query Parameters**:
- `session_id`: ID da sessão a ser resetada

**Response**:
```json
{
  "message": "Sessão resetada com sucesso"
}
```

### GET `/`

Health check do serviço.

**Response**:
```json
{
  "status": "ok",
  "service": "WhatsApp Agent",
  "version": "2.0.0"
}
```

## 🧠 Tecnologias Utilizadas

- **FastAPI**: Framework web assíncrono
- **LangChain**: Framework para aplicações com LLMs
- **LangGraph**: Orquestração de fluxos com grafos de estado
- **Google Gemini**: Modelo de linguagem (LLM)
- **MongoDB**: Armazenamento de sessões e conversas
- **httpx**: Cliente HTTP assíncrono
- **Pydantic**: Validação de dados

## 🔒 Segurança

- **Tokens de Autenticação**: Comunicação com backend requer token JWT
- **Dados Sensíveis**: Informações de saúde são criptografadas em trânsito
- **Protocolo de Emergência**: Prioriza segurança do paciente

## 🧪 Testes

```bash
# Executar testes
pytest

# Com cobertura
pytest --cov=app --cov-report=html
```

## 📊 Estrutura de Dados

### Sessão no MongoDB

```python
{
  "session_id": "whatsapp_5511999999999",
  "patient_email": "paciente@email.com",
  "patient_data": {...},  # Dados do backend
  "messages": [
    {
      "role": "user",
      "content": "Olá",
      "timestamp": "2025-11-24T20:00:00Z"
    },
    {
      "role": "assistant",
      "content": "Olá! Como posso ajudar?",
      "timestamp": "2025-11-24T20:00:01Z"
    }
  ],
  "is_emergency": false,
  "conversation_status": "collecting",
  "collected_data": {...},
  "updated_at": "2025-11-24T20:00:01Z"
}
```

## 🔄 Integração com Backend

O agente se comunica com o backend através das seguintes operações:

1. **GET** `/api/v1/pacientes/` - Busca paciente por email
2. **PUT** `/api/v1/pacientes/{id}` - Atualiza dados do paciente

### Campos Atualizados no Backend

- Informações pessoais (nome, endereço)
- Medições clínicas (pressão, glicemia, colesterol)
- Hábitos de vida (dieta, sono, atividade física)
- Observações adicionais (em `acoes_geradas_llm`)

## 🚨 Protocolo de Emergência

O agente detecta situações de emergência baseado em:

- Sintomas cardiovasculares (dor no peito, palpitações)
- Sintomas respiratórios (falta de ar)
- Sintomas neurológicos (desmaio, confusão)
- Sangramento intenso
- Dor insuportável

**Resposta de Emergência**:
> "Com base no que você descreveu, seus sintomas podem indicar uma situação de emergência. Por favor, interrompa nossa conversa e procure o pronto-socorro mais próximo ou ligue para o SAMU (192) imediatamente. Sua saúde é a prioridade."

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto faz parte do sistema Conecta Saúde.

## 👥 Equipe

Desenvolvido pela equipe Conecta Saúde.

---

**Nota**: Este serviço é parte de um sistema maior de gestão de saúde e deve ser usado em conjunto com o backend e frontend do projeto.
