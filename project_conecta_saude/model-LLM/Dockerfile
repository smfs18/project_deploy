# ============================================================================
# MODEL LLM - Classificação com ML (scikit-learn + numpy)
# Otimizado para produção com multi-stage build
# ============================================================================

# STAGE 1: Builder (compile dependencies)
FROM python:3.11-slim as builder

WORKDIR /build

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    gfortran \
    libopenblas-dev \
    liblapack-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --user --no-cache-dir --no-warn-script-location -r requirements.txt

# STAGE 2: Runtime (imagem mínima)
FROM python:3.11-slim

WORKDIR /app

# Instalar APENAS dependências runtime (BLAS para numpy/scikit-learn)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libopenblas0 \
    liblapack3 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar bibliotecas Python instaladas do builder
COPY --from=builder /root/.local /root/.local

# Copiar código e modelos
COPY . /app

# Ajustar PATH
ENV PATH=/root/.local/bin:$PATH \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

EXPOSE 8002

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8002/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8002", "--workers", "1"]