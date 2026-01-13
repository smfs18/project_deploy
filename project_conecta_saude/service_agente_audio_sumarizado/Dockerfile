# ============================================================================
# SERVICE AGENTE AUDIO SUMARIZADO - Otimizado para produção
# Mantém ffmpeg necessário para processamento de áudio
# ============================================================================

# STAGE 1: Builder (compile dependencies)
FROM python:3.11-slim as builder

WORKDIR /build

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    make \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --user --no-cache-dir --no-warn-script-location -r requirements.txt

# STAGE 2: Runtime (imagem mínima)
FROM python:3.11-slim

WORKDIR /app

# Instalar APENAS dependências runtime (ffmpeg para áudio)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libsndfile1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar bibliotecas Python instaladas do builder
COPY --from=builder /root/.local /root/.local

# Copiar código
COPY . .

# Ajustar PATH
ENV PATH=/root/.local/bin:$PATH \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# Criar diretório para uploads
RUN mkdir -p /app/uploads

EXPOSE 8003

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8003/api/v1/health || exit 1

CMD ["python", "main.py"]
