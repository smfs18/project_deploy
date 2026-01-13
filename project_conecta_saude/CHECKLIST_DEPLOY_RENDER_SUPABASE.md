# ✅ Checklist Deploy Render + Supabase - Conecta+Saúde

## 🎯 Fase 1: Preparação Inicial

### Criação de Contas
- [ ] Criar conta no **Render** (render.com)
- [ ] Criar conta no **Supabase** (supabase.com)
- [ ] Fazer login no GitHub
- [ ] Sincronizar repositório local com `git pull`

### Verificação de Pré-requisitos
- [ ] Git instalado (`git --version`)
- [ ] Python 3.11+ instalado (`python3 --version`)
- [ ] Node.js 18+ instalado (`node --version`)
- [ ] Docker disponível localmente (`docker --version`)

---

## 🗄️ Fase 2: Configuração Supabase

### Criar Projeto
- [ ] Acessar supabase.com
- [ ] Clicar em **"New Project"**
- [ ] **Project Name**: `conecta-saude-prod`
- [ ] **Database Password**: Gerar senha forte
- [ ] **Region**: `sa-east-1` (São Paulo)
- [ ] **Pricing Plan**: `Free`
- [ ] Anotar **Project ID**: `[project-id]`
- [ ] Aguardar criação (~2 minutos)

### Anotar Credenciais
```
SUPABASE_PROJECT_ID: ________________
SUPABASE_PASSWORD: ________________
SUPABASE_REGION: sa-east-1
SUPABASE_URL: https://[project-id].supabase.co
SUPABASE_ANON_KEY: ________________
SUPABASE_SERVICE_KEY: ________________
```

### Localizar Connection Pooling
- [ ] Settings → Database → Connection Pooling
- [ ] Copiar **Connection String (Pooling)**
- [ ] Formato: `postgresql://postgres.[id]:[pwd]@aws-0-[region].pooler.supabase.com:6543/postgres`

### Executar Migrações
- [ ] Acessar **SQL Editor** no Supabase
- [ ] Importar arquivo de migrações do projeto
- [ ] **OU** Executar script de criação de tabelas
- [ ] Validar que tabelas foram criadas

---

## 🔐 Fase 3: Configuração Local

### Gerar Chaves de Segurança
```bash
# No terminal, executar:
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
# Copiar resultado para JWT_SECRET
```

JWT_SECRET gerado: `________________`

### Executar Script de Setup (Opcional)
```bash
bash setup_deploy.sh
# Responder às perguntas interativas
```

### Ou Configurar Manualmente

**1. Criar arquivo `.env.production` em `back/backend/`:**
```bash
cp back/backend/.env.example back/backend/.env.production
```

**2. Editar `back/backend/.env.production`:**
```env
DATABASE_URL=postgresql://postgres.[project-id]:[password]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
JWT_SECRET=seu-jwt-secret-aleatorio
ENVIRONMENT=production
LOG_LEVEL=info
CORS_ORIGINS=https://conecta-saude-frontend.onrender.com
```

- [ ] DATABASE_URL configurada
- [ ] JWT_SECRET preenchido
- [ ] Arquivo salvo em `back/backend/.env.production`

### Preparar Frontend
- [ ] Verificar `frontend/vite.config.ts`
- [ ] Confirmar `npm build` gera pasta `dist`
- [ ] Verificar `frontend/package.json` tem `"build": "tsc && vite build"`

---

## 🚀 Fase 4: Deploy Backend no Render

### Preparar Repositório
```bash
git checkout develop
git pull origin develop
git checkout -b release/v1.0.0
git add -A
git commit -m "Configure Render and Supabase deployment"
git push origin release/v1.0.0
```

- [ ] Branch `release/v1.0.0` criada
- [ ] Arquivos commitados e pusheados para GitHub

### Conectar GitHub ao Render
- [ ] Acessar render.com
- [ ] Clique em **"+ New +"** → **"Web Service"**
- [ ] **"Connect your GitHub repository"**
- [ ] Autorizar Render no GitHub
- [ ] Selecionar repositório: `app_conecta-saude`

### Configurar Serviço Web Backend
| Campo | Valor |
|-------|-------|
| **Name** | `conecta-saude-api` |
| **Environment** | `Docker` |
| **Region** | `São Paulo (sa-east-1)` |
| **Branch** | `release/v1.0.0` |
| **Dockerfile path** | `back/backend/Dockerfile` |
| **Root directory** | `back/backend` |

- [ ] Configurações preenchidas corretamente

### Adicionar Variáveis de Ambiente (Backend)
Clique em **"Environment"** e adicione:

```env
DATABASE_URL=postgresql://postgres.[project-id]:[password]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
JWT_SECRET=[seu-jwt-secret]
ENVIRONMENT=production
LOG_LEVEL=info
DEBUG=false
PORT=8000
CORS_ORIGINS=https://conecta-saude-frontend.onrender.com
```

- [ ] Todas as 7 variáveis adicionadas
- [ ] Valores verificados

### Deploy
- [ ] Clique em **"Create Web Service"**
- [ ] Acompanhar **"Logs"** da construção
- [ ] Aguardar até que fique com status ✅ **Live**
- [ ] Anotar URL: `https://conecta-saude-api.onrender.com`

Backend URL: `________________`

---

## 🎨 Fase 5: Deploy Frontend no Render

### Configurar Frontend
- [ ] Verificar `frontend/package.json` tem `"build"` script
- [ ] Adicionar `"engines": {"node": "18.x"}` em `package.json`

### Conectar Frontend no Render
- [ ] Acesse render.com
- [ ] **"+ New +"** → **"Web Service"** (para Node.js)
- [ ] Conectar GitHub novamente
- [ ] Selecionar repositório: `app_conecta-saude`

### Configurar Serviço Web Frontend
| Campo | Valor |
|-------|-------|
| **Name** | `conecta-saude-frontend` |
| **Environment** | `Node` |
| **Region** | `São Paulo (sa-east-1)` |
| **Branch** | `release/v1.0.0` |
| **Root directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run preview` |

- [ ] Configurações preenchidas

### Adicionar Variáveis de Ambiente (Frontend)
```env
VITE_API_URL=https://conecta-saude-api.onrender.com
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_ANON_KEY=[your-anon-key]
NODE_VERSION=18
```

- [ ] Todas as 4 variáveis adicionadas

### Deploy
- [ ] Clique em **"Create Web Service"**
- [ ] Acompanhar logs
- [ ] Aguardar status ✅ **Live**
- [ ] Anotar URL: `https://conecta-saude-frontend.onrender.com`

Frontend URL: `________________`

---

## 🧪 Fase 6: Testes e Validação

### Testar Backend
```bash
# Verificar se está online
curl https://conecta-saude-api.onrender.com/health

# Esperado: {"status": "ok"}
```
- [ ] Health check retorna sucesso
- [ ] Logs sem erros

### Testar Conectividade ao Banco
```bash
# Ou via Python
python3 << 'EOF'
import psycopg2
conn = psycopg2.connect("postgresql://postgres.[id]:[pwd]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres")
print("✓ Conectado com sucesso!")
conn.close()
EOF
```
- [ ] Conexão com banco funcionando

### Testar Frontend
- [ ] Acessar `https://conecta-saude-frontend.onrender.com`
- [ ] Verificar se página carrega
- [ ] Abrir DevTools (F12) → Console
- [ ] Não há erros críticos
- [ ] Formulários carregam corretamente

### Testar Login
- [ ] Tentar fazer login com credenciais
- [ ] Verificar se consegue acessar dashboard
- [ ] Testar navegação básica

### Verificar Logs
- [ ] Render Dashboard → Backend → Logs (sem erros)
- [ ] Render Dashboard → Frontend → Logs (sem erros)
- [ ] Supabase → Logs → Conexões bem-sucedidas

---

## 📊 Fase 7: Configurações Adicionais (Opcional)

### Configurar Domínio Customizado
- [ ] Comprar domínio (Namecheap, GoDaddy, etc.)
- [ ] Em Render → Settings → Custom Domain
- [ ] Adicionar `seu-dominio.com`
- [ ] Configurar DNS records conforme instruções Render

### Configurar SSL
- [ ] Render ativa SSL automaticamente
- [ ] Verificar em browser: 🔒 HTTPS

### Configurar Backups Automáticos (Supabase)
- [ ] Supabase Dashboard → Settings → Backups
- [ ] Ativar backups automáticos
- [ ] Definir frequência (diária recomendada)

### Configurar Monitoramento
- [ ] Render → Settings → Health Checks
- [ ] Definir `/health` endpoint
- [ ] Configurar alertas (opcional)

---

## 🔄 Fase 8: Manutenção Contínua

### Updates e Atualizações
```bash
# Para fazer novo deploy após mudanças
git add -A
git commit -m "Update: descrição da mudança"
git push origin release/v1.0.0

# Render fará rebuild automaticamente
```
- [ ] Pipeline de CI/CD entendido

### Monitoramento
- [ ] [ ] Revisar logs regularmente (Render Dashboard)
- [ ] [ ] Monitorar uso de banco (Supabase)
- [ ] [ ] Acompanhar quotas (Supabase Free)

### Escalabilidade
Se precisar de mais recursos:
- [ ] Render → Upgrade para plano pago
- [ ] Supabase → Upgrade para Pro
- [ ] Aumentar recursos de compute/storage

---

## 📝 Resumo de URLs e Chaves

```
🔗 URLs Importantes:
├── Frontend: https://conecta-saude-frontend.onrender.com
├── Backend: https://conecta-saude-api.onrender.com
├── Supabase: https://[project-id].supabase.co
├── Render Dashboard: https://dashboard.render.com
└── Supabase Dashboard: https://app.supabase.com

🔐 Chaves Importantes (GUARDAR EM LOCAL SEGURO):
├── DATABASE_URL: ________________________________
├── JWT_SECRET: ________________________________
├── SUPABASE_ANON_KEY: ________________________________
├── SUPABASE_SERVICE_KEY: ________________________________
└── GitHub PAT: ________________________________
```

---

## ✅ Checklist Final

- [ ] Todos os passos das 8 fases completados
- [ ] Testes passando
- [ ] Logs sem erros críticos
- [ ] URLs anotadas e funcionando
- [ ] Backups configurados
- [ ] Time informado sobre URLs de produção
- [ ] Documentação atualizada
- [ ] Sistema monitorado

---

## 🆘 Problemas Comuns

### ❌ Build falha no Render
→ Verificar Logs → Render Dashboard → Logs

### ❌ Erro de conexão com banco
→ Verificar DATABASE_URL
→ Confirmar IP em Supabase whitelist

### ❌ Frontend não carrega
→ Limpar cache (Ctrl+Shift+Del)
→ Verificar VITE_API_URL
→ Verificar logs do browser (F12)

### ❌ Erro CORS
→ Verificar CORS_ORIGINS no backend
→ Deve incluir URL do frontend

---

**Última atualização: 12 de janeiro de 2026**
**Status: ⏳ Pendente de Deploy**
