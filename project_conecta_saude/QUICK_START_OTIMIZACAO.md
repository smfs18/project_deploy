# 🚀 QUICK START - Deploy Otimizado para Render

**Tempo total**: ~2 horas  
**Dificuldade**: Médio  
**Risco**: Baixo (local antes de produção)

---

## ⏱️ 5 MINUTOS: Validação Local

```bash
cd /home/smfs/Documentos/project_conecta_saude

# 1. Validar sintaxe do docker-compose
docker-compose config > /dev/null && echo "✅ Válido" || echo "❌ Erro"

# 2. Executar verificação completa
bash verify_optimization.sh
```

**Resultado esperado**:
```
✓ docker-compose.yml é válido
✓ Build concluído em 8-10 minutos
✓ Tamanho total < 2GB
✓ 8 healthchecks configurados
✓ Limites de memória definidos
```

---

## ⏱️ 10 MINUTOS: Setup em Servidor Novo

Se você vai usar um servidor novo (VPS, Render, etc):

```bash
# 1. Clonar repositório
git clone git@github.com:Conect-saude/app_conecta-saude.git
cd app_conecta-saude

# 2. Executar setup automático
bash setup_server.sh

# Isto fará:
# - Gerar SSH keys
# - Clonar todos os 8 repositórios
# - Copiar .env global
# - Criar rede Docker
# - Listar próximos passos

# 3. Responder aos prompts:
# ✓ Adicionar SSH key ao GitHub
# ✓ Confirmar clonagem dos repos
# ✓ Confirmar .env global
```

---

## ⏱️ 8-10 MINUTOS: Build Local

```bash
# Dentro do diretório principal
cd app_conecta-saude

# 1. Build com verificação
time docker-compose build

# 2. Ver tamanho das imagens
docker images --format "table {{.Repository}}\t{{.Size}}" | grep -E "backend|service|model|audio|frontend"

# Resultado esperado:
# backend                ~150 MB
# service_llm            ~400-500 MB  
# model-llm              ~250-300 MB
# audio_sumarizado       ~400-500 MB
# frontend               ~100-150 MB
# postgres               ~130 MB
# redis                  ~60 MB
# TOTAL: ~1.5-2 GB
```

---

## ⏱️ 5 MINUTOS: Testar Containers Localmente

```bash
# 1. Iniciar
docker-compose up -d

# 2. Aguardar healthchecks
sleep 10

# 3. Ver status
docker-compose ps

# Todos com "Up"? ✅

# 4. Ver logs
docker-compose logs -f | head -50

# 5. Testar endpoints
echo "Backend:"
curl http://localhost:8082/health

echo "Model LLM:"
curl http://localhost:8001/health

echo "Service LLM:"
curl http://localhost:8003/health

echo "Audio:"
curl http://localhost:8004/health || curl http://localhost:8004/api/v1/health

echo "Frontend:"
curl -I http://localhost:5173/ | head -5

# 6. Parar
docker-compose down
```

---

## ⏱️ 30 MINUTOS: Deploy no Render

### Passo 1: Preparar GitHub

```bash
# 1. Criar branch de release
git checkout -b release/v1.0.0

# 2. Commit de mudanças
git add .
git commit -m "refactor: optimize docker for 2GB RAM (multi-stage builds, memory limits, healthchecks)"
git push origin release/v1.0.0

# 3. Criar Pull Request (opcional)
# Merge para develop após review
```

### Passo 2: Criar Web Service no Render

1. Ir para https://render.com/dashboard
2. Clicar em "+ New" → "Web Service"
3. Conectar GitHub account
4. Selecionar repositório `app_conecta-saude`
5. Selecionar branch `release/v1.0.0` (ou `develop`)

### Passo 3: Configurar Serviço

```
Name: conecta-saude-api
Runtime: Docker
Build Command: docker-compose build
Start Command: docker-compose up -d
```

### Passo 4: Environment Variables

Adicionar no Render Dashboard:

```env
DATABASE_URL=postgresql://postgres:@2025Conecta+Saude@db.unfrurozqcmxzdkhalrk.supabase.co:5432/postgres
SUPABASE_URL=https://unfrurozqcmxzdkhalrk.supabase.co
SUPABASE_ANON_KEY=sb_publishable_ODkkhq5CB09u4eUqqdW6xg_3uguS2GR
SUPABASE_SERVICE_KEY=<seu-service-key>
GEMINI_API_KEY=<sua-chave-gemini>
JWT_SECRET=<gerar-novo>
ENVIRONMENT=production
DEBUG=false
CORS_ORIGINS=https://seu-frontend.render.com,https://seu-dominio.com
```

### Passo 5: Deploy

1. Clicar em "Create Web Service"
2. Render começará o build (~8-10 minutos)
3. Acompanhar logs no dashboard
4. Confirmar que todos os containers iniciaram

### Passo 6: Validação

```bash
# Testar endpoints remotos
curl https://conecta-saude-api.onrender.com/health
curl https://conecta-saude-api.onrender.com/api/v1/status

# Ver logs
# Dashboard → Logs → filter por "health" ou "error"
```

---

## 🆘 TROUBLESHOOTING

### Build falha localmente

```bash
# 1. Limpar tudo
docker-compose down -v
docker system prune -a

# 2. Tentar novamente
docker-compose build --no-cache

# 3. Se erro em requirements.txt
# Editar service_llm/requirements.txt:
# Remover torch (usar apenas faiss-cpu)
```

### Containers não iniciam

```bash
# 1. Ver logs
docker-compose logs

# 2. Verificar limites de memória
docker stats

# 3. Se RAM baixa:
# - Usar VM com mais memória
# - Reduzir limites temporariamente (aumentar depois)
```

### Endpoints retornam erro

```bash
# 1. Verificar saúde do container
docker-compose ps
docker logs conecta-backend

# 2. Verificar conectividade interna
docker-compose exec backend curl http://redis:6379
docker-compose exec backend curl http://postgres:5432

# 3. Verificar variáveis
docker-compose config | grep -A 5 "environment:"
```

### Build timeout no Render

```
Problema: Build demora mais de 30 minutos

Solução 1: Verificar se .dockerignore está ignorando node_modules
Solução 2: Remover volumes do docker-compose.yml para produção
Solução 3: Usar build cache (Render suporta)
```

---

## 📊 MONITORAMENTO PÓS-DEPLOY

```bash
# 1. Acessar Dashboard do Render
# https://render.com/dashboard

# 2. Verificar:
# - Service Health: ✅ Live
# - CPU Usage: < 50%
# - Memory Usage: < 1.5GB
# - Disk Usage: < 2GB

# 3. Ver logs
# Dashboard → Logs → "health" ou erros

# 4. Performance
curl https://seu-app.onrender.com/metrics
```

---

## ✅ CHECKLIST FINAL

### Antes do Deploy:

- [ ] `docker-compose config` sem erros
- [ ] `bash verify_optimization.sh` passa
- [ ] Build local completa em < 10 min
- [ ] Tamanho total < 2GB
- [ ] Todos containers iniciam com "Up"
- [ ] Healthchecks passando
- [ ] `.env.production` com credenciais
- [ ] Código commitado no GitHub

### No Render:

- [ ] Repositório conectado
- [ ] Branch correto selecionado
- [ ] Variáveis de ambiente configuradas
- [ ] Build command correto
- [ ] Start command correto

### Pós-Deploy:

- [ ] Status "Live" no Dashboard
- [ ] Build completou em < 10 min
- [ ] Containers iniciaram
- [ ] Healthchecks respondendo
- [ ] Endpoints acessíveis
- [ ] Logs sem erros críticos
- [ ] RAM usage < 1.5GB

---

## 📚 DOCUMENTAÇÃO RELACIONADA

- **OTIMIZACAO_IMPLEMENTADA.md** - Detalhes técnicos
- **CHECKLIST_OTIMIZACAO_4_PASSOS.md** - Verificação linha por linha
- **PLANO_OTIMIZACAO_DOCKER.md** - Contexto das mudanças
- **GUIA_DEPLOY_RENDER_SUPABASE.md** - Deploy step-by-step

---

## 🎯 RESUMO EM 3 LINHAS

```
1. bash verify_optimization.sh  → Validar local
2. git push + criar no Render   → Deploy
3. curl https://seu-app/health → Confirmar
```

**Pronto? Vamos lá!** 🚀
