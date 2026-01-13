# 💬 Simulador WhatsApp - LIA

## 📋 Descrição

Interface de simulação do WhatsApp integrada ao frontend para testar o agente LIA (Assistente Virtual de Saúde) de forma visual e interativa.

## ✨ Funcionalidades

- **Interface Similar ao WhatsApp**: Design familiar e intuitivo
- **Botão Flutuante**: Ícone do WhatsApp sempre visível no Dashboard
- **Conversa em Tempo Real**: Mensagens instantâneas com o agente
- **Detecção de Emergências**: Banner vermelho para situações críticas
- **Indicador de Digitação**: Mostra quando o agente está processando
- **Histórico de Conversa**: Mantém todo o histórico da sessão

## 🚀 Como Usar

### 1. Iniciar o Serviço do Agente

Primeiro, certifique-se de que o serviço do agente está rodando:

```bash
cd service_agente_whatsapp
python main.py
```

O serviço deve estar disponível em: `http://localhost:8002`

### 2. Iniciar o Frontend

```bash
cd frontend
npm run dev
```

O frontend estará em: `http://localhost:5173`

### 3. Acessar o Simulador

**Opção 1** - Via Dashboard:
1. Faça login no sistema
2. Vá para o Dashboard
3. Clique no **botão verde flutuante do WhatsApp** (canto inferior direito)

**Opção 2** - Via URL direta:
- Acesse: `http://localhost:5173/whatsapp-simulator`

### 4. Conversar com a LIA

Experimente mensagens como:

**Saudação**:
```
Olá
```

**Atualização de Pressão**:
```
Minha pressão hoje está 130/85
```

**Atualização de Glicemia**:
```
Minha glicemia está em 110
```

**Informações sobre Dieta**:
```
Estou me alimentando bem, minha dieta está boa
```

**Teste de Emergência** (⚠️ CUIDADO):
```
Estou com dor forte no peito e falta de ar
```

## 🎨 Design

### Cores
- **Header**: Verde WhatsApp (`#075e54`)
- **Mensagens do Usuário**: Verde claro (`#dcf8c6`)
- **Mensagens do Bot**: Branco (`#ffffff`)
- **Fundo**: Bege WhatsApp (`#e5ddd5`)
- **Emergência**: Vermelho (`#ff4444`)

### Elementos Visuais
- ✅ Avatar do bot com ícone de robô
- ✅ Bolhas de mensagem com cauda
- ✅ Horário de envio em cada mensagem
- ✅ Indicador de "digitando..."
- ✅ Botão de envio verde
- ✅ Background com textura

## 🔧 Configuração

### URL do Serviço

O simulador está configurado para conectar em `http://localhost:8002`.

Se o serviço estiver em outra porta, edite em:
```typescript
// src/pages/WhatsAppSimulator/WhatsAppSimulator.tsx
const response = await fetch('http://localhost:8002/api/v1/chat', {
  // ...
});
```

### Session ID

Cada simulação gera um `session_id` único baseado no timestamp:
```typescript
const [sessionId] = useState(() => `session_${Date.now()}`);
```

Isso garante que cada teste seja independente.

## 🧪 Cenários de Teste

### Teste 1: Conversa Básica
```
Você: Olá
LIA: Olá! Eu sou a LIA...

Você: Minha pressão está 120/80
LIA: Obrigada! 120/80 mmHg anotado...
```

### Teste 2: Mudança de Endereço
```
Você: Mudei de endereço
LIA: Entendi. Qual é seu novo endereço?

Você: Rua Nova, 456
LIA: Perfeito! Atualizei seu endereço...
```

### Teste 3: Emergência
```
Você: Dor no peito muito forte
LIA: ⚠️ Com base no que você descreveu...
```

Banner vermelho aparece no topo!

## 📱 Responsividade

O simulador é totalmente responsivo:
- ✅ Desktop: Layout completo
- ✅ Tablet: Ajustado
- ✅ Mobile: Interface mobile-first

## 🐛 Solução de Problemas

### Erro: "Erro ao comunicar com o agente"

**Causa**: Serviço do agente não está rodando

**Solução**:
```bash
cd service_agente_whatsapp
python main.py
```

### Erro: CORS

**Causa**: Configuração de CORS no serviço

**Solução**: Verifique se o serviço tem:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ou ["http://localhost:5173"]
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Mensagens não aparecem

**Causa**: Problema de scroll

**Solução**: O scroll é automático. Se não funcionar, atualize a página.

### Botão flutuante não aparece

**Causa**: Componente não importado

**Solução**: Verifique se `WhatsAppFloatingButton` está importado no Dashboard:
```typescript
import WhatsAppFloatingButton from "../../components/WhatsAppFloatingButton";
```

## 🔐 Integração com Dados Reais

Para testar com dados reais do paciente:

1. Obtenha um token de autenticação:
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@email.com", "password": "senha123"}'
```

2. Modifique o código para incluir email e token:
```typescript
// Em WhatsAppSimulator.tsx
const response = await fetch('http://localhost:8002/api/v1/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    session_id: sessionId,
    message: inputValue,
    patient_email: "paciente@email.com",  // Adicione isso
    auth_token: "Bearer seu_token_aqui"   // Adicione isso
  }),
});
```

## 📊 Métricas

O simulador permite monitorar:
- ✅ Tempo de resposta do agente
- ✅ Número de mensagens trocadas
- ✅ Detecção de emergências
- ✅ Experiência do usuário

## 🎓 Para Desenvolvedores

### Estrutura de Arquivos
```
frontend/src/
├── pages/
│   └── WhatsAppSimulator/
│       ├── WhatsAppSimulator.tsx  # Componente principal
│       └── styles.ts              # Estilos styled-components
└── components/
    └── WhatsAppFloatingButton.tsx # Botão flutuante
```

### Adicionar Funcionalidades

**Enviar imagens**:
```typescript
// Adicione input de arquivo
<input type="file" accept="image/*" />
```

**Áudio**:
```typescript
// Use MediaRecorder API
navigator.mediaDevices.getUserMedia({ audio: true })
```

**Emojis**:
```typescript
// Instale emoji-picker-react
npm install emoji-picker-react
```

## 🌟 Melhorias Futuras

- [ ] Suporte a emojis
- [ ] Envio de imagens
- [ ] Gravação de áudio
- [ ] Múltiplas conversas simultâneas
- [ ] Exportar conversa
- [ ] Modo escuro
- [ ] Notificações sonoras

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique se ambos os serviços estão rodando
2. Confira o console do navegador (F12)
3. Verifique os logs do serviço do agente
4. Consulte a documentação do serviço

---

**Desenvolvido pela equipe Conecta Saúde** 🚀
