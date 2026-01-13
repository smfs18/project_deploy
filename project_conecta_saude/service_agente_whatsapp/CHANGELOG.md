# 📋 Changelog - Service Agente WhatsApp

## Versão 2.0.0 - Remodelação Completa

### 🎯 Objetivo da Remodelação

Transformar o agente de **triagem médica** para um **agente de acompanhamento e atualização de dados de pacientes**.

---

## 🔄 Principais Mudanças

### 1. ✅ Nova Missão do Agente

**ANTES (v1.0)**:
- Foco em triagem médica
- Coletar: Queixa Principal, Sintomas, Duração, Intensidade, Histórico, Medidas Tomadas
- Não interagia com banco de dados de pacientes

**AGORA (v2.0)**:
- Foco em acompanhamento e atualização
- Verificar/atualizar informações pessoais (nome, endereço)
- Coletar dados clínicos atualizados (pressão, glicemia, colesterol)
- Monitorar hábitos de vida (dieta, sono, atividade física)
- **Integração completa com backend** para ler e atualizar dados

---

### 2. 🗄️ Integração com Backend

#### Nova Funcionalidade: `backend_client.py`

```python
class BackendClient:
    async def get_patient_by_email(email, token)
    async def update_patient(patient_id, data, token)
```

**Fluxo**:
1. Recebe email do paciente na mensagem
2. Busca dados atuais no PostgreSQL (via backend)
3. Usa dados para contextualizar conversa
4. Atualiza dados ao final da conversa

**Campos Atualizados**:
- ✅ Informações pessoais (nome, endereço, data_nascimento)
- ✅ Medições clínicas (pressão, glicemia, colesterol, HDL, triglicerídeos, IMC)
- ✅ Hábitos de vida (dieta, sono, atividade_fisica, consumo_alcool, tabagismo, estresse)
- ✅ Observações adicionais (salvas em `acoes_geradas_llm`)

---

### 3. 📊 Nova Estrutura de Estado

**ANTES**:
```python
class TriageState:
    messages: List[BaseMessage]
    is_emergency: bool
    triage_status: str
    triage_summary: Optional[Dict]
```

**AGORA**:
```python
class AgentState:
    messages: List[BaseMessage]
    is_emergency: bool
    conversation_status: str  # "collecting" ou "complete"
    collected_data: Optional[Dict]  # Dados extraídos da conversa
    patient_data: Optional[Dict]    # Dados do backend
    patient_email: Optional[str]    # Email para buscar no backend
    auth_token: Optional[str]       # Token JWT para backend
```

---

### 4. 🔄 Novo Fluxo do Grafo

**ANTES**:
```
emergency_check → triage_agent → triage_router → summarize_data
```

**AGORA**:
```
emergency_check → load_patient_data → conversation_agent → 
conversation_router → extract_and_update
```

#### Novos Nós:

1. **`load_patient_data_node`**
   - Busca dados do paciente no backend
   - Carrega informações atuais para contextualizar conversa

2. **`conversation_agent_node`**
   - Conversa natural com paciente
   - Usa dados carregados para confirmar informações
   - Coleta atualizações e novos dados

3. **`extract_and_update_node`**
   - Extrai dados estruturados da conversa
   - **Atualiza o backend automaticamente**
   - Salva observações em histórico

---

### 5. 💬 Novo Prompt do Sistema

**Mudanças no SYSTEM_PROMPT**:

```python
# ANTES
"""
Você é a LIA, uma assistente de TRIAGEM.
Missão: coletar Queixa Principal, Sintomas, etc.
"""

# AGORA
"""
Você é a LIA, uma assistente de ACOMPANHAMENTO.
Missão:
1. Verificar e atualizar informações pessoais
2. Coletar dados clínicos atualizados
3. Perguntar sobre hábitos de vida
4. Identificar emergências médicas
"""
```

**Novos Campos de Extração**:
- Informações Pessoais: nome, endereco, data_nascimento
- Medições Clínicas: pressao_sistolica/diastolica, glicemia, colesterol, HDL, triglicerides, IMC
- Hábitos: qualidade_dieta, qualidade_sono, atividade_fisica, consumo_alcool, tabagismo, nivel_estresse
- Outros: consultas_ultimo_ano, aderencia_medicamento, observacoes_adicionais

---

### 6. 🆕 Novos Arquivos Criados

```
service_agente_whatsapp/
├── app/
│   ├── db/
│   │   └── database.py          # ✨ NOVO - Conexão MongoDB
│   ├── services/
│   │   ├── backend_client.py    # ✨ NOVO - Cliente HTTP para backend
│   │   ├── triage_agent.py      # 🔄 MODIFICADO - Remodelado
│   │   └── llm_client.py        # ✅ Mantido
│   ├── routes/
│   │   └── webhook.py           # 🔄 MODIFICADO - Endpoint assíncrono
│   └── utils/
│       └── emergency.py         # ✅ Mantido - Protocolo de emergência
├── tests/
│   └── test_agent.py            # ✨ NOVO - Testes unitários
├── README.md                     # ✨ NOVO - Documentação completa
├── USAGE.md                      # ✨ NOVO - Guia de uso
├── CHANGELOG.md                  # ✨ NOVO - Este arquivo
├── .env.example                  # ✨ NOVO - Exemplo de configuração
└── requeriments.txt             # 🔄 MODIFICADO - Removido easyocr
```

---

### 7. 🔐 Novos Parâmetros da API

**Endpoint**: `POST /api/v1/chat`

**ANTES**:
```json
{
  "session_id": "string",
  "message": "string"
}
```

**AGORA**:
```json
{
  "session_id": "string",
  "message": "string",
  "patient_email": "string (opcional)",
  "auth_token": "string (opcional)"
}
```

**Novo Endpoint**: `POST /api/v1/reset-session`
- Reseta uma sessão de conversa

---

### 8. 🧪 Sistema de Testes

**Adicionados**:
- `test_handle_message_basic()` - Teste básico de mensagem
- `test_emergency_detection()` - Teste de emergência
- `test_load_patient_data()` - Teste de carregamento de dados
- `test_conversation_flow()` - Teste de fluxo completo
- `test_update_patient_in_backend()` - Teste de atualização
- `test_session_persistence()` - Teste de persistência

---

## 🔄 Comparação: Antes vs Agora

| Aspecto | v1.0 (Antes) | v2.0 (Agora) |
|---------|--------------|--------------|
| **Objetivo** | Triagem médica | Acompanhamento e atualização |
| **Banco de Dados** | Apenas MongoDB (sessões) | MongoDB + PostgreSQL (via backend) |
| **Integração** | Isolado | Integrado com backend |
| **Dados Coletados** | Sintomas e queixas | Dados clínicos e hábitos |
| **Atualização** | Não atualiza nada | Atualiza paciente no backend |
| **Contexto** | Sem contexto do paciente | Usa dados atuais do paciente |
| **API** | 1 endpoint (chat) | 2 endpoints (chat + reset) |

---

## 📋 Checklist de Funcionalidades

### ✅ Implementado

- [x] Verificação de informações pessoais
- [x] Coleta de dados de pressão arterial
- [x] Coleta de dados de glicemia
- [x] Coleta de dados de colesterol e triglicerídeos
- [x] Monitoramento de hábitos (dieta, sono, atividade física)
- [x] Protocolo de emergência mantido
- [x] Integração com backend para buscar paciente
- [x] Integração com backend para atualizar paciente
- [x] Persistência de sessões no MongoDB
- [x] Extração automática de dados da conversa
- [x] Documentação completa
- [x] Testes unitários

### 🔮 Melhorias Futuras

- [ ] Integração direta com WhatsApp Business API
- [ ] Suporte a múltiplos idiomas
- [ ] Análise de tendências de dados clínicos
- [ ] Alertas automáticos para profissionais de saúde
- [ ] Dashboard de monitoramento de conversas
- [ ] Exportação de relatórios

---

## 🚀 Como Migrar da v1.0 para v2.0

### 1. Atualizar Dependências

```bash
pip install -r requeriments.txt
```

### 2. Configurar Variáveis de Ambiente

Adicione ao `.env`:
```env
BACKEND_URL=http://localhost:8000/api/v1
MONGO_URI=mongodb://localhost:27017/
MONGO_DB_NAME=whatsapp_agent_db
```

### 3. Atualizar Chamadas da API

**Antes**:
```python
response = requests.post("/chat", json={
    "session_id": "123",
    "message": "Olá"
})
```

**Agora**:
```python
response = requests.post("/api/v1/chat", json={
    "session_id": "123",
    "message": "Olá",
    "patient_email": "paciente@email.com",  # Novo
    "auth_token": "Bearer token"  # Novo
})
```

### 4. Limpar Dados Antigos (Opcional)

```python
from app.db.database import get_database
db = get_database()
db.sessions.delete_many({})  # Remove todas as sessões antigas
```

---

## 📞 Suporte

Para dúvidas sobre a remodelação, consulte:
- **README.md** - Visão geral e instalação
- **USAGE.md** - Guia de uso detalhado
- **tests/test_agent.py** - Exemplos de uso

---

**Data de Lançamento**: 24 de novembro de 2025  
**Desenvolvido por**: Equipe Conecta Saúde
