# Dockerfile para Service Agente WhatsApp

FROM python:3.11-slim

WORKDIR /app

# Instala dependências do sistema
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copia requirements
COPY requeriments.txt .

# Instala dependências Python
RUN pip install --no-cache-dir -r requeriments.txt

# Copia código da aplicação
COPY . .

# Expõe a porta
EXPOSE 8002

# Comando para iniciar o serviço
CMD ["python", "main.py"]
