# 📱 Guia de Configuração - App Conecta Saúde (Expo)

## ⚠️ PROBLEMA: App Expo no Celular não Consegue Acessar Localhost

Quando o app está rodando no seu **celular via Expo**, ele **NÃO consegue** acessar `localhost` ou IPs internos da sua máquina local. O celular precisa de:

1. **IP da rede local** (se estiver na mesma rede WiFi)
2. **Domínio/IP público** (se estiver em uma rede diferente ou em produção)

---

## 🔧 Como Configurar para Diferentes Ambientes

### 1️⃣ DESENVOLVIMENTO (Celular na mesma rede WiFi)

Se você está testando o app no celular enquanto o backend roda no seu computador:

#### Passo 1: Descubra o IP da sua máquina
```bash
# No Linux/Mac
ifconfig | grep "inet " | grep -v 127.0.0.1

# No Windows
ipconfig | findstr "IPv4"
```

Procure por algo como: `192.168.1.10` ou `192.168.0.5`

#### Passo 2: Configure o app.json
Edite `app_conecta-saude/appconecta/app.json`:

```json
{
  "expo": {
    ...
    "extra": {
      "backendUrl": "http://SEU_IP_DA_MAQUINA:8082",
      "audioServiceUrl": "http://SEU_IP_DA_MAQUINA:8005"
    }
  }
}
```

**Exemplo real:**
```json
{
  "expo": {
    ...
    "extra": {
      "backendUrl": "http://192.168.1.10:8082",
      "audioServiceUrl": "http://192.168.1.10:8005"
    }
  }
}
```

#### Passo 3: Rebuild o app
```bash
cd app_conecta-saude/appconecta
expo start --clear
```

Escaneie o QR code com seu celular.

---

### 2️⃣ PRODUÇÃO (Celular em qualquer rede)

Você precisa saber qual é o **domínio ou IP público** do seu servidor.

#### Opção A: Usando Domínio (RECOMENDADO ✅)
```json
{
  "expo": {
    ...
    "extra": {
      "backendUrl": "https://seu-dominio.com:8082",
      "audioServiceUrl": "https://seu-dominio.com:8005"
    }
  }
}
```

#### Opção B: Usando IP Público
```json
{
  "expo": {
    ...
    "extra": {
      "backendUrl": "http://SEU_IP_PUBLICO:8082",
      "audioServiceUrl": "http://SEU_IP_PUBLICO:8005"
    }
  }
}
```

#### Opção C: Usando Render/Cloud Provider
Se seu backend está no Render (https://seu-backend.onrender.com):

```json
{
  "expo": {
    ...
    "extra": {
      "backendUrl": "https://seu-backend.onrender.com",
      "audioServiceUrl": "https://seu-audio-service.onrender.com"
    }
  }
}
```

---

## 🚀 Checklist de Configuração em Produção

- [ ] **Certifique-se de que as portas estão abertas no firewall**
  ```bash
  # Exemplo: Abrir porta 8082
  sudo ufw allow 8082
  sudo ufw allow 8005
  ```

- [ ] **Configure um proxy reverso (nginx/Apache)** para servir HTTPS
  ```nginx
  server {
    listen 443 ssl;
    server_name seu-dominio.com;
    
    location / {
      proxy_pass http://localhost:8082;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
    }
  }
  ```

- [ ] **Use HTTPS em produção** (obrigatório para segurança)
  ```json
  {
    "backendUrl": "https://seu-dominio.com",
    "audioServiceUrl": "https://seu-dominio.com:8005"
  }
  ```

- [ ] **Teste a conexão antes de buildar o app**
  ```bash
  # Teste de conectividade (do seu celular ou outro dispositivo)
  curl https://seu-dominio.com/api/v1/health
  ```

---

## 🔍 Como Debugar Problemas de Conexão

### 1. Verifique os logs do app
No Expo, procure por linhas como:
```
🌐 Backend API URL: http://192.168.1.10:8082
🎙️ Audio Microservice URL: http://192.168.1.10:8005
```

### 2. Verifique a conectividade
```bash
# Do seu celular, tente pingar o servidor
# (Se tiver um terminal no celular via ADB)
adb shell ping 192.168.1.10
```

### 3. Verifique se os serviços estão rodando
```bash
# No servidor
docker ps  # Verifique se os containers estão UP
curl http://localhost:8082/health
curl http://localhost:8005/health
```

### 4. Verifique os logs do axios
Os logs do app mostrarão a URL que está tentando acessar:
```
POST http://192.168.1.10:8082/api/v1/auth/login/agente
```

Se o URL estiver errado, revise a configuração no `app.json`.

---

## 🐳 Configuração no Docker Compose para Produção

Se você está usando Docker Compose, certifique-se de que os serviços estão expostos:

```yaml
services:
  backend:
    ports:
      - "8082:8000"  # Expor para fora do container
    environment:
      - CORS_ORIGINS=https://seu-dominio.com

  service_agente_audio_sumarizado:
    ports:
      - "8005:8003"  # Expor para fora do container
```

---

## 📋 Variáveis de Ambiente Suportadas

O app tenta ler URLs nesta ordem:

1. **`Constants.expoConfig.extra`** (em `app.json`) ✅ RECOMENDADO
2. **`process.env.BACKEND_API_URL`** (de `.env.local`)
3. **Fallback padrão**: `http://localhost:8082`

Ou seja, **sempre edite o `app.json`** para produção!

---

## ⚡ Quick Fix: IP da Máquina Mudou?

Se seu IP local mudou e o app parou de conectar:

```bash
cd app_conecta-saude/appconecta
ifconfig | grep "inet " | grep -v 127.0.0.1  # Descubra o novo IP
# Atualize o app.json com o novo IP
expo start --clear
```

---

## 🎯 Resumo

| Ambiente | Backend URL | Audio URL |
|----------|------------|-----------|
| **Dev (WiFi)** | `http://192.168.1.10:8082` | `http://192.168.1.10:8005` |
| **Produção (Domínio)** | `https://seu-dominio.com` | `https://seu-dominio.com:8005` |
| **Produção (IP Público)** | `http://seu-ip-publico:8082` | `http://seu-ip-publico:8005` |
| **Cloud (Render)** | `https://seu-backend.onrender.com` | `https://seu-audio.onrender.com` |

**👉 Próximo Passo**: Edite o `app.json` com suas URLs reais e teste!
