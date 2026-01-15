# ✅ CHECKLIST - App Expo em Produção

## 🚨 PROBLEMA IDENTIFICADO
- [ ] App Expo conectava com `localhost` em desenvolvimento
- [ ] Em produção, celular não consegue acessar `localhost`
- [ ] Precisa-se de IP local (WiFi) ou IP público (internet)

---

## 🔧 SOLUÇÃO IMPLEMENTADA

### Arquivos Modificados
- [x] `app_conecta-saude/appconecta/src/services/api.ts`
  - Alterado para usar variáveis de ambiente via `app.json`
  - Remova hardcodes de IP (`192.168.1.18`)
  - Adicione fallback para `localhost`

- [x] `app_conecta-saude/appconecta/app.json`
  - Adicionado campo `extra.backendUrl`
  - Adicionado campo `extra.audioServiceUrl`
  - Valores padrão: `http://localhost:8082` e `http://localhost:8005`

### Arquivos Criados
- [x] `app_conecta-saude/appconecta/.env.local.example`
  - Exemplo de configuração para diferentes ambientes
  
- [x] `GUIA_CONFIGURACAO_EXPO_PRODUCAO.md`
  - Guia completo de configuração
  - Soluções para WiFi local e produção
  - Troubleshooting e debug

- [x] `configure_expo_urls.sh`
  - Script interativo para configurar URLs automaticamente
  - Detecta IP local, domínio ou IP público
  - Atualiza `app.json` automaticamente

---

## 📋 COMO USAR

### Opção 1: Script Automático (Recomendado)
```bash
./configure_expo_urls.sh
```

Ele vai:
1. Detectar seu IP local
2. Perguntar qual é o ambiente (dev/prod)
3. Atualizar o `app.json` automaticamente

### Opção 2: Manual
Edite `app_conecta-saude/appconecta/app.json`:

```json
{
  "expo": {
    ...
    "extra": {
      "backendUrl": "http://SEU_IP:8082",
      "audioServiceUrl": "http://SEU_IP:8005"
    }
  }
}
```

### Opção 3: Usando Variables de Ambiente
Crie `.env.local` em `app_conecta-saude/appconecta/`:

```bash
BACKEND_API_URL=http://seu-ip:8082
AUDIO_SERVICE_URL=http://seu-ip:8005
```

---

## 🎯 CENÁRIOS DE CONFIGURAÇÃO

### Desenvolvimento (Celular + Computador na mesma WiFi)
```json
"extra": {
  "backendUrl": "http://192.168.1.10:8082",
  "audioServiceUrl": "http://192.168.1.10:8005"
}
```
- Celular consegue acessar o IP da máquina
- Funciona apenas na mesma rede

### Produção (Celular em qualquer rede)
```json
"extra": {
  "backendUrl": "https://seu-dominio.com",
  "audioServiceUrl": "https://seu-dominio.com:8005"
}
```
- Usa domínio ou IP público do servidor
- Funciona em qualquer rede

### Cloud (Render/AWS/DigitalOcean)
```json
"extra": {
  "backendUrl": "https://seu-backend.onrender.com",
  "audioServiceUrl": "https://seu-audio-service.onrender.com"
}
```
- Usa URLs dos serviços hospedados em cloud

---

## 🔍 TROUBLESHOOTING

### Problema: "Connection Refused"
```
❌ Erro: ECONNREFUSED 192.168.1.10:8082
```

**Solução:**
1. Verifique se o backend está rodando: `docker ps`
2. Verifique se o IP está correto: `ifconfig | grep inet`
3. Verifique firewall: `sudo ufw status`

### Problema: "Cannot GET /api/v1/auth/login/agente"
```
❌ Erro: 404 Not Found
```

**Solução:**
1. Verifique os logs do backend: `docker logs backend`
2. Teste a URL manualmente: `curl http://SEU_IP:8082/api/v1/health`
3. Verifique se há CORS configurado

### Problema: App não se conecta em produção
```
❌ Conexão timeout após N segundos
```

**Solução:**
1. Verifique se o domínio está correto
2. Verifique portas abertas: `nmap -p 8082 seu-ip`
3. Configure um proxy reverso (nginx/Apache) com HTTPS
4. Use certificado SSL válido

### Problema: "SSL Certificate Error"
```
❌ Erro: Certificate verification failed
```

**Solução (Desenvolvimento):**
```json
"extra": {
  "backendUrl": "http://seu-ip:8082"  // Use HTTP, não HTTPS
}
```

**Solução (Produção):**
- Obtenha certificado SSL válido (Let's Encrypt)
- Configure HTTPS corretamente no servidor

---

## 🚀 DEPLOYMENT CHECKLIST

### Antes de fazer Build de Produção
- [ ] IP/Domínio definido no `app.json`
- [ ] Firewall permite acesso às portas (8082, 8005)
- [ ] Backend está rodando: `docker ps`
- [ ] CORS configurado corretamente no backend
- [ ] Testou conexão manualmente: `curl https://seu-dominio/api/v1/health`
- [ ] HTTPS configurado se for produção
- [ ] Certificado SSL válido (Let's Encrypt)

### Depois de fazer Build
- [ ] App abre e não mostra erro de conexão
- [ ] Login funciona
- [ ] Upload de áudio funciona
- [ ] Busca de pacientes funciona
- [ ] Todos os endpoints respondendo

---

## 📊 Resumo das Mudanças

| Arquivo | Mudança | Motivo |
|---------|---------|--------|
| `api.ts` | Remover IP hardcoded | Permitir configuração dinâmica |
| `app.json` | Adicionar `extra.*` | Centralizar configuração |
| `.env.local.example` | Criado | Documentar variáveis de ambiente |
| Script `configure_*.sh` | Criado | Automatizar configuração |
| `GUIA_*.md` | Criado | Documentar solução |

---

## 💡 DICA IMPORTANTE

**Para Produção com Celular em qualquer rede:**

1. Configure um proxy reverso (nginx) com HTTPS
2. Use um domínio (ex: `conecta-saude.com.br`)
3. Atualize o `app.json` com `https://seu-dominio.com`
4. Não use IPs privados (192.168.x.x) em produção
5. Use certificado SSL válido (Let's Encrypt é grátis)

```nginx
# Exemplo de nginx.conf para produção
server {
    listen 443 ssl;
    server_name conecta-saude.com.br;
    
    ssl_certificate /etc/letsencrypt/live/conecta-saude.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/conecta-saude.com.br/privkey.pem;
    
    location / {
        proxy_pass http://localhost:8082;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

---

## 🎓 Referências

- Expo: https://docs.expo.dev/
- React Native Axios: https://github.com/axios/axios
- CORS: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
- Let's Encrypt: https://letsencrypt.org/

---

**Status**: ✅ Problema Resolvido
**Data**: 15 de janeiro de 2026
**Próximo Passo**: Configure as URLs com o script e rebuild o app!
