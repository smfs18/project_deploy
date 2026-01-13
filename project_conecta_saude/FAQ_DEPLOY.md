# ❓ FAQ - Deploy Render + Supabase

## 🤔 Perguntas Frequentes

### 1. **Por que usar Render + Supabase?**

| Critério | Render | Supabase |
|----------|--------|----------|
| **Custo** | Grátis até certos limites | Grátis até 500MB |
| **Facilidade** | Deploy automático com GitHub | Interface amigável |
| **Escalabilidade** | Fácil upgrade | Planos escalonados |
| **Suporte** | Comunidade ativa | Comunidade + Docs |

✅ **Melhor para**: Startups, MVPs, projetos em desenvolvimento

---

### 2. **Qual é o processo simplificado?**

```
1. Criar projeto no Supabase
2. Migrar banco de dados
3. Fazer deploy backend no Render
4. Fazer deploy frontend no Render
5. Testar tudo
6. Monitorar
```

**Tempo estimado**: 30-45 minutos

---

### 3. **Posso usar meu domínio próprio?**

**Sim!** Render aceita domínios customizados.

```bash
1. Compre domínio em Namecheap, GoDaddy, etc.
2. No Render Dashboard:
   - Settings → Custom Domain
   - Adicione seu domínio
   - Configure DNS records conforme instruções
3. Espere propagação DNS (até 48h)
```

Exemplo:
```
conectasaude.com.br → https://api.conectasaude.com.br
```

---

### 4. **Como fazer rollback se der erro?**

```bash
# Ver histórico de deploys
git log --oneline

# Voltar para commit anterior
git revert [commit-hash]
git push origin release/v1.0.0

# Render reconstrói automaticamente
```

**No Render Dashboard:**
- Histórico de deploys fica visível
- Pode clicar em "Redeploy" em versão anterior

---

### 5. **E se o banco ficar muito grande?**

Supabase Free: **500MB**

Se ultrapassar:
```
1. Upgrade para Supabase Pro ($25/mês)
2. Ou migrar para PostgreSQL gerenciado
3. Ou limpar dados desnecessários
```

---

### 6. **Como fazer backups?**

**Supabase faz automaticamente**, mas você pode:

```bash
# Backup manual via pgdump
pg_dump postgresql://user:pwd@host/db > backup.sql

# Restaurar
psql postgresql://user:pwd@host/db < backup.sql
```

**Supabase Dashboard:**
- Settings → Backups
- Ativar backups automáticos (gratuito)

---

### 7. **Posso usar AI/ML services?**

**Sim!** Render também hospeda:
- Serviço de ML
- Serviço de LLM
- Outros microserviços

```yaml
# No render.yaml, adicione mais serviços:
services:
  - type: web
    name: conecta-saude-api
    ...
  
  - type: web
    name: conecta-saude-ml
    dockerfilePath: ./model-LLM/Dockerfile
    envVars:
      - key: MODEL_PATH
        value: /models
```

---

### 8. **Como monitorar a aplicação?**

**Render Dashboard:**
1. **Logs**: Real-time dos containers
2. **Metrics**: CPU, Memória, Rede
3. **Alerts**: Email se algo der erro

**Supabase Dashboard:**
1. **Logs**: Queries do banco
2. **Database**: Tamanho, conexões
3. **API Usage**: Requisições por hora

---

### 9. **Quanto vai custar no total?**

| Serviço | Plano Gratuito | Pago |
|---------|---|---|
| **Render** | ~0.10 USD/mês | 12+ USD/mês |
| **Supabase** | Grátis | 25+ USD/mês |
| **Domínio** | - | 10-15 USD/ano |
| **Total** | ~0 | ~50 USD/mês |

✅ Grátis é viável! Plano pago começa em ~$50/mês

---

### 10. **Posso ter ambiente staging + produção?**

**Sim!** Crie dois projetos:

**Produção** (main/release):
```
Backend: conecta-saude-api.onrender.com
Frontend: conecta-saude-frontend.onrender.com
Banco: Supabase Project (prod)
```

**Staging** (develop):
```
Backend: conecta-saude-api-staging.onrender.com
Frontend: conecta-saude-staging.onrender.com
Banco: Supabase Project (staging)
```

Deploy automático:
```
git push origin develop → Deploy staging
git push origin release/v1.0.0 → Deploy produção
```

---

## 🆘 Troubleshooting Rápido

### ❌ Erro: "Build failed"

**Verificar:**
```bash
# 1. Logs no Render
Render Dashboard → [seu-app] → Logs

# 2. Requirements.txt correto?
cat back/backend/requirements.txt

# 3. Python version suportada?
# Render usa Python 3.11+ por padrão

# 4. Dockerfile correto?
cat back/backend/Dockerfile
```

**Solução:**
```bash
# Fazer rebuild manual
git push origin release/v1.0.0
# Render reconstrói automaticamente
```

---

### ❌ Erro: "Cannot connect to database"

**Verificar:**
```bash
# 1. DATABASE_URL existe?
echo $DATABASE_URL

# 2. Credenciais corretas?
# Ir em: Render → [app] → Environment

# 3. IP liberado no Supabase?
# Supabase → Settings → Database → Allowed IPs
# (Adicionar 0.0.0.0/0 para permitir todos)

# 4. Testar conexão
psql [DATABASE_URL]
```

**Solução:**
```
Supabase Settings → Database → Allowed IPs
→ Adicione IP do Render (geralmente liberado automaticamente)
```

---

### ❌ Erro: "CORS error"

**Verificar:**
```bash
# 1. CORS_ORIGINS configurado?
# Render → [app] → Environment

# 2. URL do frontend está incluída?
# Deve ser: https://conecta-saude-frontend.onrender.com
```

**Solução:**
```bash
# Backend .env:
CORS_ORIGINS=https://conecta-saude-frontend.onrender.com,http://localhost:3000

# Restart backend
# Render → [app] → Manual Restart
```

---

### ❌ Erro: "Frontend não carrega"

**Verificar:**
```bash
# 1. Build passou?
# Render → [app] → Logs

# 2. Variáveis de ambiente?
# Render → [app] → Environment
# VITE_API_URL deve estar lá

# 3. DevTools
# F12 → Console → Verificar erros
```

**Solução:**
```bash
# Limpar cache do navegador
Ctrl + Shift + Delete

# Ou fazer rebuild
git push origin release/v1.0.0
```

---

### ❌ Erro: "JWT_SECRET não definido"

**Solução:**
```bash
# Gerar chave nova
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# Copiar resultado para Render → Environment:
JWT_SECRET=[resultado-acima]

# Reiniciar aplicação
```

---

## 📚 Links Úteis

### Documentação Oficial
- 📖 [Render Docs](https://render.com/docs)
- 📖 [Supabase Docs](https://supabase.com/docs)
- 📖 [FastAPI Guide](https://fastapi.tiangolo.com/deployment)
- 📖 [PostgreSQL Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres)

### Tutoriais
- 🎥 [Deploy FastAPI no Render](https://www.youtube.com/results?search_query=render+fastapi)
- 🎥 [Configurar Supabase](https://www.youtube.com/results?search_query=supabase+setup)
- 🎥 [React + Vite Deploy](https://www.youtube.com/results?search_query=vite+react+deploy)

### Comunidades
- 💬 [Render Discord](https://discord.gg/render)
- 💬 [Supabase Discord](https://discord.gg/supabase)
- 💬 [Stack Overflow](https://stackoverflow.com/questions/tagged/render+supabase)

---

## 🚀 Próximos Passos Após Deploy

### 1. Configurar CI/CD avançado
```yaml
# GitHub Actions para testes automáticos
name: Test and Deploy
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm test
      - run: python -m pytest
```

### 2. Adicionar Monitoring
- New Relic, DataDog, ou Sentry

### 3. Configurar Alertas
- Email se aplicação cair
- Slack notifications

### 4. Planejar Escalabilidade
- Quando vai precisar de mais recursos?
- Upgrade para planos pagos
- Considerar Kubernetes (mais complexo)

---

## 💡 Dicas Profissionais

### ✅ Do's
- ✅ Use `.env` files para secrets
- ✅ Faça backups regularmente
- ✅ Monitore logs diariamente
- ✅ Teste staging antes de produção
- ✅ Documente mudanças
- ✅ Use versionamento semântico (v1.0.0)

### ❌ Don'ts
- ❌ Não committe secrets no GitHub
- ❌ Não use mesma senha para dev/prod
- ❌ Não delete banco sem backup
- ❌ Não deixe DEBUG=true em produção
- ❌ Não ignore logs de erro

---

## 📞 Suporte

Se tiver dúvidas:
1. Verifique este FAQ
2. Leia a documentação oficial
3. Procure no Stack Overflow
4. Peça help na comunidade do Render/Supabase
5. Contate suporte (se plano pago)

---

**Última atualização: 12 de janeiro de 2026**

*Agora você está pronto para fazer o deploy! 🚀*
