# 🚀 Guia Rápido: Deploy em 10 Passos

**⏱️ Tempo estimado: 30 minutos**

---

## PASSO 1: Criar Projeto Supabase

```
1. Vá para https://supabase.com
2. Clique "New Project"
3. Preencha:
   - Name: conecta-saude-prod
   - Password: senhaForte123!
   - Region: São Paulo (sa-east-1)
4. Clique "Create new project"
5. AGUARDE ~2 minutos
```

**Resultado esperado:**
```
✓ Projeto criado
✓ Email de confirmação recebido
```

---

## PASSO 2: Copiar Credenciais Supabase

```
1. Na página do projeto, vá em:
   Settings → Database → Connection Pooling
2. Copie a CONNECTION STRING
3. Salve em um arquivo seguro (.txt)

Formato:
postgresql://postgres.[project-id]:[password]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
```

**Anotar:**
```
📌 Project ID: ______________________
📌 Password: ______________________
📌 Connection URL: ______________________
```

---

## PASSO 3: Executar Migrações no Supabase

```
1. Clique em "SQL Editor"
2. Clique "New Query"
3. Cole seu SQL de criação de tabelas
4. Clique "Run"
5. Verifique se tabelas foram criadas
```

**Verificar:**
```
1. Vá em "Table Editor"
2. Veja a lista de tabelas criadas
```

---

## PASSO 4: Configurar Arquivo .env Local

```bash
# 1. Abra terminal
cd /home/smfs/Documentos/project_conecta_saude/back/backend

# 2. Crie o arquivo .env.production
cat > .env.production << 'EOF'
DATABASE_URL=postgresql://postgres.[seu-project-id]:[sua-password]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
JWT_SECRET=gere-uma-chave-aleatoria-aqui
ENVIRONMENT=production
LOG_LEVEL=info
DEBUG=false
PORT=8000
CORS_ORIGINS=https://conecta-saude-frontend.onrender.com
EOF

# 3. Para gerar JWT_SECRET:
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
# Copie o resultado e coloque no arquivo
```

---

## PASSO 5: Fazer Commit e Push para GitHub

```bash
cd /home/smfs/Documentos/project_conecta_saude

# Criar branch de deploy
git checkout develop
git pull origin develop
git checkout -b release/v1.0.0

# Fazer commit
git add -A
git commit -m "Setup Render and Supabase deployment"
git push origin release/v1.0.0
```

**Resultado esperado:**
```
✓ Branch criada e enviada para GitHub
✓ Visível em github.com
```

---

## PASSO 6: Deploy Backend no Render

```
1. Vá para https://dashboard.render.com
2. Clique "+ New +"
3. Selecione "Web Service"
4. Clique "Connect your GitHub repo"
5. Autorize Render no GitHub
6. Selecione: app_conecta-saude
```

**Configure:**
```
Name: conecta-saude-api
Environment: Docker
Region: São Paulo (sa-east-1)
Branch: release/v1.0.0
Dockerfile path: back/backend/Dockerfile
```

**Clique em "Create Web Service"**

```
⏳ Aguarde o build (leva ~5-10 minutos)
✓ Quando ficar "Live", está pronto!
```

---

## PASSO 7: Adicionar Variáveis de Ambiente (Backend)

```
No dashboard do Render:
1. Clique em "conecta-saude-api"
2. Vá em "Environment"
3. Clique "+ Add Environment Variable"
4. Adicione cada variável:
```

| Variável | Valor |
|----------|-------|
| DATABASE_URL | postgresql://postgres.[id]:[pwd]@... |
| JWT_SECRET | [seu-valor-gerado] |
| ENVIRONMENT | production |
| LOG_LEVEL | info |
| DEBUG | false |
| PORT | 8000 |
| CORS_ORIGINS | https://conecta-saude-frontend.onrender.com |

```
5. Clique "Save"
6. Render irá reiniciar automaticamente
```

---

## PASSO 8: Deploy Frontend no Render

```
1. Em https://dashboard.render.com
2. Clique "+ New +"
3. Selecione "Web Service"
4. Conecte GitHub novamente
5. Selecione: app_conecta-saude
```

**Configure:**
```
Name: conecta-saude-frontend
Environment: Node
Region: São Paulo (sa-east-1)
Branch: release/v1.0.0
Root directory: frontend
Build Command: npm install && npm run build
Start Command: npm run preview
```

**Clique em "Create Web Service"**

```
⏳ Aguarde o build (~10-15 minutos)
```

---

## PASSO 9: Adicionar Variáveis de Ambiente (Frontend)

```
No dashboard do Render:
1. Clique em "conecta-saude-frontend"
2. Vá em "Environment"
3. Adicione:
```

| Variável | Valor |
|----------|-------|
| VITE_API_URL | https://conecta-saude-api.onrender.com |
| VITE_SUPABASE_URL | https://[project-id].supabase.co |
| VITE_SUPABASE_ANON_KEY | [seu-anon-key] |
| NODE_VERSION | 18 |

```
4. Clique "Save"
```

---

## PASSO 10: Testar Tudo

```bash
# 1. Testar Backend
curl https://conecta-saude-api.onrender.com/health

# Resultado esperado: {"status": "ok"}

# 2. Testar Frontend
# Abra no navegador:
# https://conecta-saude-frontend.onrender.com

# 3. Tente fazer login
# (usuario: admin@conectsaude.com, senha: admin123)

# 4. Se não tiver credenciais ainda, crie um novo usuário
```

---

## ✅ Pronto!

```
✓ Backend rodando em: https://conecta-saude-api.onrender.com
✓ Frontend rodando em: https://conecta-saude-frontend.onrender.com
✓ Banco de dados: Supabase
✓ Auto-deploy ativado (qualquer push em release/v1.0.0 faz novo deploy)
```

---

## 🆘 Se algo deu errado

### Erro no Build?
```
Render → [seu-app] → Logs
Procure por linhas em VERMELHO
```

### Erro de Conexão?
```
1. Verifique DATABASE_URL
2. Verifique JWT_SECRET
3. Restart a aplicação em Render
```

### Frontend branco?
```
1. F12 → Console
2. Procure por erros
3. Verifique VITE_API_URL
```

---

## 📚 Documentos de Referência

Criados neste setup:
- **GUIA_DEPLOY_RENDER_SUPABASE.md** - Guia completo detalhado
- **CHECKLIST_DEPLOY_RENDER_SUPABASE.md** - Checklist interativo
- **FAQ_DEPLOY.md** - Perguntas frequentes

---

## 🎉 Pronto para Deploy!

Você tem tudo que precisa. Execute os 10 passos acima e sua aplicação estará em produção! 🚀

**Dúvidas?** Consulte os outros arquivos de documentação.
