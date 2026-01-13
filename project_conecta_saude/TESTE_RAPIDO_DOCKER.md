# 🧪 TESTE RÁPIDO: Validar Dockerização

**Tempo estimado:** 5-10 minutos  
**Objetivo:** Validar que a correção funcionou

---

## ⚡ Teste 1: Verificação Rápida (1 minuto)

```bash
# Ir para o diretório do projeto
cd /home/smfs/Documentos/project_conecta_saude

# Verificar se docker-compose.yml está válido
docker-compose config > /dev/null && echo "✅ docker-compose.yml válido" || echo "❌ Erro no arquivo"

# Verificar se o serviço audio está no compose
docker-compose config | grep -q "service_agente_audio_sumarizado" && \
  echo "✅ Audio Sumarizado encontrado no compose" || \
  echo "❌ Audio Sumarizado NÃO está no compose"

# Verificar porta 8004
docker-compose config | grep -q "8004" && \
  echo "✅ Porta 8004 configurada" || \
  echo "❌ Porta 8004 não encontrada"
```

**Resultado esperado:**
```
✅ docker-compose.yml válido
✅ Audio Sumarizado encontrado no compose
✅ Porta 8004 configurada
```

---

## ⚡ Teste 2: Executar Script de Verificação (3-5 minutos)

```bash
# Dar permissão de execução
chmod +x verify_docker.sh

# Executar script
./verify_docker.sh
```

**Resultado esperado:**
```
✅ Docker instalado
✅ Docker Compose instalado
✅ Docker daemon está rodando
✅ Arquivo docker-compose.yml encontrado
✅ Dockerfile encontrado: back/backend/Dockerfile
✅ Dockerfile encontrado: frontend/Dockerfile
✅ Dockerfile encontrado: model-LLM/Dockerfile
✅ Dockerfile encontrado: service_llm/Dockerfile
✅ Dockerfile encontrado: service_agente_whatsapp/Dockerfile
✅ Dockerfile encontrado: service_agente_audio_sumarizado/Dockerfile
✅ docker-compose.yml é válido
✅ Serviço encontrado: postgres
✅ Serviço encontrado: redis
✅ Serviço encontrado: backend
✅ Serviço encontrado: frontend
✅ Serviço encontrado: model-llm
✅ Serviço encontrado: service_llm
✅ Serviço encontrado: whatsapp-agent
✅ Serviço encontrado: service_agente_audio_sumarizado
...
```

---

## ⚡ Teste 3: Build (5-10 minutos)

```bash
# Fazer build de todas as imagens
docker-compose build

# Acompanhar a saída
# Deve mostrar build bem-sucedido para cada container
```

**Resultado esperado:**
```
Building postgres
Building redis
Building backend
Building frontend
Building model-llm
Building service_llm
Building whatsapp-agent
Building service_agente_audio_sumarizado
...
```

---

## ⚡ Teste 4: Start (3-5 minutos)

```bash
# Iniciar todos os containers
docker-compose up -d

# Aguardar ~30 segundos para tudo inicializar

# Verificar status
docker-compose ps
```

**Resultado esperado:**
```
NAME                                COMMAND              STATUS
postgres                            postgres             Up 30 seconds
redis                               redis-server         Up 30 seconds
backend                             uvicorn main:app     Up 25 seconds
model-llm                           python app/main.py   Up 20 seconds
service_llm                         python main.py       Up 15 seconds
whatsapp-agent                      uvicorn main:app     Up 10 seconds
service_agente_audio_sumarizado     uvicorn main:app     Up 5 seconds
frontend                            npm run preview      Up 2 seconds
```

**Todos com status "Up" = ✅ SUCESSO**

---

## ⚡ Teste 5: Health Checks (2 minutos)

```bash
# Aguardar 30 segundos para todos os serviços iniciarem
sleep 30

# Backend
echo "Backend:"
curl -s http://localhost:8082/health | jq . || echo "❌ Backend offline"

# Audio Sumarizado (NOVO - o que foi adicionado)
echo ""
echo "Audio Sumarizado:"
curl -s http://localhost:8004/api/v1/health | jq . || echo "❌ Audio offline"

# PostgreSQL
echo ""
echo "PostgreSQL:"
docker exec postgres psql -U postgres -c "SELECT 1;" 2>/dev/null && echo "✅ OK" || echo "❌ Offline"

# Redis
echo ""
echo "Redis:"
redis-cli ping 2>/dev/null && echo "✅ OK" || echo "❌ redis-cli não instalado"
```

**Resultado esperado:**
```
Backend:
{"status": "ok"}

Audio Sumarizado:
{"status": "ok"}

PostgreSQL:
✅ OK

Redis:
✅ OK
```

---

## ⚡ Teste 6: Acessar Endpoints

```bash
# 1. Backend Swagger
echo "Abrindo Backend Swagger em http://localhost:8082/docs"
# Abrir no navegador

# 2. Frontend
echo "Abrindo Frontend em http://localhost:5173"
# Abrir no navegador

# 3. Audio Sumarizado docs
echo "Abrindo Audio Sumarizado Swagger em http://localhost:8004/docs"
# Abrir no navegador
```

---

## ⚡ Teste 7: Verificar Logs

```bash
# Ver todos os logs
docker-compose logs -f

# Ou específicos (pressione Ctrl+C para sair)
docker-compose logs -f service_agente_audio_sumarizado

# Verificar se tem erros (linhas em vermelho)
```

**Resultado esperado:**
```
service_agente_audio_sumarizado | 🚀 Inicializando Service Agente Audio Sumarizado v2.0...
service_agente_audio_sumarizado | ✅ Banco de dados inicializado
service_agente_audio_sumarizado | ✅ LangGraph e Gemini API configurados
service_agente_audio_sumarizado | INFO:     Uvicorn running on http://0.0.0.0:8003
```

---

## 📋 Checklist de Testes

```
Teste 1: Verificação Rápida
  [ ] docker-compose.yml válido
  [ ] Audio Sumarizado encontrado
  [ ] Porta 8004 configurada
  Tempo: ~1 minuto
  
Teste 2: Script de Verificação
  [ ] Script executa sem erros
  [ ] Todos os Dockerfiles encontrados
  [ ] Todos os serviços reconhecidos
  Tempo: ~3-5 minutos

Teste 3: Build
  [ ] Build completo sem erros
  [ ] Todas as imagens criadas
  Tempo: ~5-10 minutos
  
Teste 4: Start
  [ ] 8 containers UP
  [ ] Nenhum container "Exited"
  Tempo: ~3-5 minutos
  
Teste 5: Health Checks
  [ ] Backend respondendo
  [ ] Audio Sumarizado respondendo
  [ ] PostgreSQL OK
  [ ] Redis OK
  Tempo: ~2 minutos
  
Teste 6: Acessar Endpoints
  [ ] Backend Swagger funciona
  [ ] Frontend carrega
  [ ] Audio Swagger funciona
  Tempo: ~2 minutos
  
Teste 7: Verificar Logs
  [ ] Sem erros críticos
  [ ] Todos inicializaram com sucesso
  Tempo: ~1 minuto
```

---

## 🎯 Resultado Final

Se todos os testes passarem ✅, significa que:

- ✅ docker-compose.yml está correto
- ✅ Todos os 8 serviços estão configurados
- ✅ Audio Sumarizado foi adicionado com sucesso
- ✅ Nenhuma porta está em conflito
- ✅ Todos os containers podem iniciar
- ✅ Comunicação entre serviços funciona
- ✅ **Projeto está pronto para deploy em Render + Supabase**

---

## ❌ Se algo der erro

### Erro: "docker-compose: command not found"
```bash
# Instalar Docker Compose
sudo apt-get install docker-compose
# ou
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Erro: "Cannot connect to Docker daemon"
```bash
# Iniciar Docker
sudo systemctl start docker

# Ou se usando Docker Desktop
# Abra Docker Desktop
```

### Erro: Build falha
```bash
# Ver logs detalhados
docker-compose build --no-cache

# Ou testar Dockerfile específico
docker build -t audio-sumarizado ./service_agente_audio_sumarizado
```

### Erro: Container não inicia
```bash
# Ver logs detalhados
docker-compose logs service_agente_audio_sumarizado

# Procurar por erros (linhas em vermelho)
# Ajustar ambiente conforme necessário
```

---

## 🚀 Próximas Etapas Após Sucesso

1. **Preparar para Render:**
   ```bash
   git add docker-compose.yml ARQUITETURA_DOCKER.md RELATORIO_ANALISE_DOCKER.md
   git commit -m "Fix: Add service_agente_audio_sumarizado to docker-compose"
   git push origin release/v1.0.0
   ```

2. **Atualizar Render Dashboard** com novas variáveis de ambiente

3. **Configurar Supabase** com banco de dados de produção

4. **Fazer deploy** seguindo guia GUIA_DEPLOY_RENDER_SUPABASE.md

---

## 📞 Referência Rápida

| Comando | Descrição |
|---------|-----------|
| `docker-compose build` | Build de todas as imagens |
| `docker-compose up -d` | Iniciar todos os containers |
| `docker-compose ps` | Ver status dos containers |
| `docker-compose logs -f` | Ver logs em tempo real |
| `docker-compose down` | Parar todos os containers |
| `docker-compose restart` | Reiniciar os containers |
| `curl http://localhost:8004/api/v1/health` | Health check Audio |

---

**Tempo Total Estimado:** 15-20 minutos  
**Dificuldade:** ⭐ Fácil  
**Resultado:** ✅ Projeto 100% Dockerizado

