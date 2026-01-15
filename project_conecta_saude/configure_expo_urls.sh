#!/bin/bash

# ============================================
# Script para Configurar URLs do App Expo
# ============================================
# Este script ajuda a descobrir seu IP local e
# atualizar o app.json com as URLs corretas

echo "🔍 Procurando IP da máquina..."
echo ""

# Detecta o IP de diferentes formas
if command -v ifconfig &> /dev/null; then
    IP=$(ifconfig | grep "inet " | grep -v "127.0.0.1" | awk '{print $2}' | head -1)
    if [ -z "$IP" ]; then
        IP=$(ifconfig | grep "inet " | grep -v "127.0.0.1" | sed 's/.*inet \([^ ]*\).*/\1/' | head -1)
    fi
elif command -v ip &> /dev/null; then
    IP=$(ip addr show | grep "inet " | grep -v "127.0.0.1" | awk '{print $2}' | cut -d'/' -f1 | head -1)
fi

if [ -z "$IP" ]; then
    echo "❌ Não foi possível detectar o IP automaticamente"
    echo "🔧 Digite seu IP manualmente:"
    read -p "IP da máquina: " IP
fi

echo "✅ IP detectado: $IP"
echo ""

# Pergunta qual é o ambiente
echo "Qual ambiente você quer configurar?"
echo "1) Desenvolvimento (WiFi local)"
echo "2) Produção (Domínio)"
echo "3) Produção (IP Público)"
read -p "Escolha (1-3): " CHOICE

case $CHOICE in
    1)
        BACKEND_URL="http://$IP:8082"
        AUDIO_URL="http://$IP:8005"
        ENV="Desenvolvimento"
        ;;
    2)
        read -p "Digite seu domínio (ex: seu-dominio.com): " DOMAIN
        BACKEND_URL="https://$DOMAIN:8082"
        AUDIO_URL="https://$DOMAIN:8005"
        ENV="Produção (Domínio)"
        ;;
    3)
        read -p "Digite seu IP público: " PUBLIC_IP
        BACKEND_URL="http://$PUBLIC_IP:8082"
        AUDIO_URL="http://$PUBLIC_IP:8005"
        ENV="Produção (IP Público)"
        ;;
    *)
        echo "❌ Opção inválida"
        exit 1
        ;;
esac

echo ""
echo "📝 Configuração a ser aplicada:"
echo "================================"
echo "Ambiente: $ENV"
echo "Backend URL: $BACKEND_URL"
echo "Audio URL: $AUDIO_URL"
echo ""

read -p "Confirma? (s/n): " CONFIRM

if [ "$CONFIRM" != "s" ] && [ "$CONFIRM" != "S" ]; then
    echo "❌ Operação cancelada"
    exit 0
fi

# Atualiza o app.json
APP_JSON_PATH="app_conecta-saude/appconecta/app.json"

if [ ! -f "$APP_JSON_PATH" ]; then
    echo "❌ Arquivo $APP_JSON_PATH não encontrado"
    exit 1
fi

echo ""
echo "📝 Atualizando $APP_JSON_PATH..."

# Usa Python para atualizar o JSON corretamente
python3 << EOF
import json

with open('$APP_JSON_PATH', 'r') as f:
    data = json.load(f)

# Atualiza as URLs
data['expo']['extra']['backendUrl'] = '$BACKEND_URL'
data['expo']['extra']['audioServiceUrl'] = '$AUDIO_URL'

with open('$APP_JSON_PATH', 'w') as f:
    json.dump(data, f, indent=2)

print(f"✅ app.json atualizado com sucesso!")
print(f"   Backend: $BACKEND_URL")
print(f"   Audio: $AUDIO_URL")
EOF

echo ""
echo "🚀 Próximos passos:"
echo "1. cd app_conecta-saude/appconecta"
echo "2. expo start --clear"
echo "3. Escaneie o QR code no seu celular"
echo ""
echo "✨ Pronto! O app deve conectar aos serviços agora."
