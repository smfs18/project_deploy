# 🚀 Deployment Guide

Guia completo para fazer deploy do Service Agente Audio Sumarizado em produção.

## 1. Preparação para Produção

### 1.1 Checklist de Segurança

```bash
# ✅ Verificar configurações sensíveis
- OPENAI_API_KEY não em git
- DATABASE_URL com senha forte
- DEBUG=False em produção
- BACKEND_API_KEY configurada
- CORS apenas para domínios confiáveis
```

### 1.2 Otimizar Configurações

```env
# .env (produção)
DEBUG=False
API_HOST=0.0.0.0
API_PORT=8003

# Database
DATABASE_URL=postgresql://user:senha_forte@db.prod.exemplo.com:5432/conecta_audio
DATABASE_ECHO=False

# OpenAI
OPENAI_API_KEY=${OPENAI_API_KEY}  # Use secrets manager

# Serviços
BACKEND_URL=https://api.conectasaude.com.br
FRONTEND_URL=https://conectasaude.com.br
APPCONECTA_URL=https://app.conectasaude.com.br

# Modelos (otimizados)
SUMMARIZATION_MODEL=facebook/bart-large-cnn
```

## 2. Docker Deployment

### 2.1 Build de Imagem

```bash
# Build local
docker build -t conectasaude/audio-service:1.0.0 .

# Tag para registry
docker tag conectasaude/audio-service:1.0.0 \
  registry.exemplo.com/conectasaude/audio-service:1.0.0

# Push
docker push registry.exemplo.com/conectasaude/audio-service:1.0.0
```

### 2.2 Docker Compose em Produção

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: conecta_audio_postgres
    restart: always
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: conecta_saude_audio
    ports:
      - "127.0.0.1:5432:5432"  # Apenas localhost
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  audio_service:
    image: registry.exemplo.com/conectasaude/audio-service:1.0.0
    container_name: conecta_audio_service
    restart: always
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/conecta_saude_audio
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      BACKEND_URL: ${BACKEND_URL}
      DEBUG: "False"
    ports:
      - "8003:8003"
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8003/api/v1/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

volumes:
  postgres_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /data/postgres
```

**Iniciar em produção:**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 3. Kubernetes Deployment

### 3.1 ConfigMap

```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: audio-service-config
  namespace: conecta-saude
data:
  API_PORT: "8003"
  DEBUG: "False"
  LANGUAGE: "pt-BR"
  TRANSCRIPTION_MODEL: "whisper-1"
  SUMMARIZATION_MODEL: "facebook/bart-large-cnn"
```

### 3.2 Secret

```yaml
# k8s/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: audio-service-secrets
  namespace: conecta-saude
type: Opaque
stringData:
  DATABASE_URL: postgresql://user:password@postgres:5432/db
  OPENAI_API_KEY: sk-xxx
  BACKEND_API_KEY: xxx
```

### 3.3 Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: audio-service
  namespace: conecta-saude
spec:
  replicas: 2
  selector:
    matchLabels:
      app: audio-service
  template:
    metadata:
      labels:
        app: audio-service
    spec:
      containers:
      - name: audio-service
        image: registry.exemplo.com/conectasaude/audio-service:1.0.0
        ports:
        - containerPort: 8003
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: audio-service-secrets
              key: DATABASE_URL
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: audio-service-secrets
              key: OPENAI_API_KEY
        - name: API_PORT
          valueFrom:
            configMapKeyRef:
              name: audio-service-config
              key: API_PORT
        - name: DEBUG
          valueFrom:
            configMapKeyRef:
              name: audio-service-config
              key: DEBUG
        livenessProbe:
          httpGet:
            path: /api/v1/health
            port: 8003
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/v1/health
            port: 8003
          initialDelaySeconds: 10
          periodSeconds: 5
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
---
apiVersion: v1
kind: Service
metadata:
  name: audio-service
  namespace: conecta-saude
spec:
  selector:
    app: audio-service
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8003
  type: LoadBalancer
```

**Deploy:**
```bash
kubectl apply -f k8s/
```

## 4. AWS Deployment

### 4.1 ECR (Elastic Container Registry)

```bash
# Login
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com

# Push
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/conecta/audio-service:1.0.0
```

### 4.2 ECS (Elastic Container Service)

```json
{
  "family": "audio-service",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "containerDefinitions": [
    {
      "name": "audio-service",
      "image": "123456789.dkr.ecr.us-east-1.amazonaws.com/conecta/audio-service:1.0.0",
      "portMappings": [
        {
          "containerPort": 8003,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "API_PORT",
          "value": "8003"
        },
        {
          "name": "DEBUG",
          "value": "False"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789:secret:database_url"
        },
        {
          "name": "OPENAI_API_KEY",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789:secret:openai_key"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/audio-service",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

## 5. Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/audio-service
upstream audio_service {
    server 127.0.0.1:8003;
}

server {
    listen 443 ssl http2;
    server_name api-audio.conectasaude.com.br;

    ssl_certificate /etc/letsencrypt/live/api-audio.conectasaude.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api-audio.conectasaude.com.br/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;

    # CORS
    add_header Access-Control-Allow-Origin "https://conectasaude.com.br" always;
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;

    # Proxy
    location /api/v1/ {
        proxy_pass http://audio_service;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Rate limiting
    location /api/v1/audio/upload {
        limit_req zone=upload_limit burst=5 nodelay;
        proxy_pass http://audio_service;
    }
}

# Rate limiting zones
limit_req_zone $binary_remote_addr zone=upload_limit rate=10r/m;
```

## 6. Monitoramento em Produção

### 6.1 Prometheus Metrics

```python
# app/metrics.py
from prometheus_client import Counter, Histogram, Gauge
import time

audio_uploads_total = Counter(
    'audio_uploads_total',
    'Total de áudios enviados'
)

processing_time = Histogram(
    'processing_time_seconds',
    'Tempo de processamento'
)

active_jobs = Gauge(
    'active_jobs',
    'Tarefas processando'
)
```

### 6.2 Logging Centralizado

```python
# Usando ELK Stack
import logging
from pythonjsonlogger import jsonlogger

logger = logging.getLogger()
handler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter()
handler.setFormatter(formatter)
logger.addHandler(handler)
```

## 7. Backup e Disaster Recovery

### 7.1 Backup Automático

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups/audio-service"
DB_NAME="conecta_saude_audio"
DB_USER="conecta_user"

# Daily backup
docker-compose exec -T postgres pg_dump \
  -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/backup_$(date +%Y%m%d).sql.gz

# Keep last 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

# Upload to S3
aws s3 cp $BACKUP_DIR/backup_$(date +%Y%m%d).sql.gz s3://conecta-backups/audio-service/
```

### 7.2 Restore

```bash
# Restore do backup
zcat backup_20240105.sql.gz | docker-compose exec -T postgres psql -U conecta_user conecta_saude_audio
```

## 8. Health Checks e Alerts

```yaml
# Alertmanager config
groups:
  - name: audio-service
    rules:
    - alert: AudioServiceDown
      expr: up{job="audio-service"} == 0
      for: 5m
      
    - alert: HighErrorRate
      expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
      for: 5m
```

## 9. Checklist de Deploy

```
PRÉ-DEPLOYMENT:
- [ ] Testes passando
- [ ] Documentação atualizada
- [ ] Segredos configurados
- [ ] Backups prontos

DURANTE DEPLOYMENT:
- [ ] Health checks passando
- [ ] Logs monitorados
- [ ] Performance normal
- [ ] Sem erros críticos

PÓS-DEPLOYMENT:
- [ ] Testes de fumaça (smoke tests)
- [ ] Verificar integrações
- [ ] Notificar stakeholders
- [ ] Documentar mudanças
```

## 10. Rollback

```bash
# Se algo der errado
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d

# Ou com Kubernetes
kubectl rollout undo deployment/audio-service -n conecta-saude
```

---

**Suporte**: suporte@conectasaude.com
