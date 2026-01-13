# 🚀 Guia Rápido - Testando o Simulador WhatsApp

## ⚡ Setup Rápido (5 minutos)

### 1️⃣ Terminal 1 - Inicie o Serviço do Agente

```bash
cd service_agente_whatsapp

# Se ainda não configurou o .env
cp .env.example .env
# Edite o .env e adicione GOOGLE_API_KEY

# Inicie o serviço
python main.py
```

✅ Você deve ver: `Uvicorn running on http://0.0.0.0:8002`

### 2️⃣ Terminal 2 - Inicie o Frontend

```bash
cd frontend

# Se ainda não instalou as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

✅ Você deve ver: `Local: http://localhost:5173/`

### 3️⃣ Navegador - Teste!

1. Abra: http://localhost:5173
2. Faça login (use credenciais do sistema)
3. Clique no **botão verde do WhatsApp** (canto inferior direito)
4. Comece a conversar!

## 💬 Mensagens de Teste

### Teste Básico
```
Olá
```

### Atualizar Pressão
```
Minha pressão hoje está 130/85
```

### Atualizar Glicemia
```
Minha glicemia está em 110 mg/dL
```

### Informar Hábitos
```
Estou me alimentando bem, minha dieta está boa
```

### Teste de Emergência ⚠️
```
Estou com dor forte no peito
```

## 🎯 O Que Esperar

### Resposta Normal
- ✅ Mensagem aparece como bolha branca (bot) ou verde (você)
- ✅ Horário aparece embaixo da mensagem
- ✅ Indicador de "digitando..." aparece durante processamento

### Resposta de Emergência
- 🚨 Banner VERMELHO aparece no topo
- 🚨 Mensagem em vermelho com orientações
- 🚨 Recomendação para procurar SAMU (192)

## 🐛 Problemas Comuns

### "Erro ao comunicar com o agente"

**Solução**: Verifique se o serviço está rodando
```bash
curl http://localhost:8002/
```

Deve retornar:
```json
{"status":"ok","service":"WhatsApp Agent","version":"2.0.0"}
```

### Botão do WhatsApp não aparece

**Solução**: Limpe o cache do navegador (Ctrl+Shift+R)

### CORS Error

**Solução**: Verifique se o serviço tem CORS configurado:
```python
# Em main.py do service_agente_whatsapp
allow_origins=["*"]
```

## 📸 Screenshots Esperados

### 1. Dashboard com Botão Flutuante
```
[Dashboard]
┌──────────────────────────────────────┐
│  Gerenciamento de Pacientes          │
│  [Tabela de pacientes...]            │
│                                       │
│                           🟢 WhatsApp│ <- Botão aqui
└──────────────────────────────────────┘
```

### 2. Simulador WhatsApp
```
┌─────────────────────────────────────┐
│ ← LIA - Assistente Virtual   ⋮     │ <- Header verde
├─────────────────────────────────────┤
│                                     │
│  Olá! Eu sou a LIA...        ⏰    │ <- Mensagem do bot
│                                     │
│              Minha pressão é 120/80 │ <- Sua mensagem
│                              ⏰     │
│                                     │
├─────────────────────────────────────┤
│ [Digite uma mensagem...] [🚀]       │ <- Input
└─────────────────────────────────────┘
```

## 🎬 Demo Completo

```bash
# 1. Abra o simulador
http://localhost:5173/whatsapp-simulator

# 2. Envie mensagem
"Olá"

# 3. Aguarde resposta (1-3 segundos)
Bot: "Olá! Eu sou a LIA..."

# 4. Continue a conversa
"Minha pressão está 130/85"

# 5. Bot responde
Bot: "Obrigada! 130/85 mmHg anotado..."

# 6. Teste emergência
"Dor no peito forte"

# 7. Banner vermelho aparece
⚠️ ATENÇÃO: Situação de emergência detectada...
```

## ✅ Checklist de Verificação

Antes de reportar um problema, verifique:

- [ ] Service_agente_whatsapp rodando na porta 8002
- [ ] Frontend rodando na porta 5173 (ou 5174)
- [ ] MongoDB rodando (se usando MongoDB local)
- [ ] GOOGLE_API_KEY configurada no .env
- [ ] Navegador moderno (Chrome, Firefox, Safari, Edge)
- [ ] Console do navegador sem erros (F12)

## 🔄 Resetar Teste

Para começar uma nova conversa:

**Opção 1**: Recarregue a página (F5)

**Opção 2**: Use o endpoint de reset:
```bash
curl -X POST "http://localhost:8002/api/v1/reset-session?session_id=session_123"
```

## 📚 Documentação Completa

- **Frontend**: Ver `WHATSAPP_SIMULATOR.md`
- **Backend**: Ver `service_agente_whatsapp/README.md`
- **Setup**: Ver `service_agente_whatsapp/SETUP.md`

## 🎉 Pronto!

Agora você pode:
- ✅ Demonstrar o agente para stakeholders
- ✅ Testar novas funcionalidades
- ✅ Validar respostas do LLM
- ✅ Treinar profissionais de saúde

**Divirta-se testando! 🚀**
