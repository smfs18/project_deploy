#!/bin/bash

# Script para iniciar o serviço de áudio sumarizado

echo "🚀 Iniciando Service Agente Audio Sumarizado..."

# Criar arquivo .env se não existir
if [ ! -f ".env" ]; then
    echo "📝 Criando arquivo .env..."
    cp .env.example .env
fi

# Instalar dependências Python
echo "📦 Instalando dependências..."
pip install -r requirements.txt

# Criar diretórios necessários
mkdir -p /tmp/audio_uploads

# Iniciar aplicação
echo "✅ Iniciando aplicação..."
python main.py
