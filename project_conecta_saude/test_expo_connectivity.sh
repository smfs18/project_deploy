#!/bin/bash

# ============================================
# Script de Teste - Conectividade App Expo
# ============================================
# Testa se o app consegue se conectar aos serviços
# Use este script ANTES de tentar usar o app

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir com cores
info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Detecta o IP local
get_local_ip() {
    if command -v ifconfig &> /dev/null; then
        ifconfig | grep "inet " | grep -v "127.0.0.1" | awk '{print $2}' | head -1
    elif command -v ip &> /dev/null; then
        ip addr show | grep "inet " | grep -v "127.0.0.1" | awk '{print $2}' | cut -d'/' -f1 | head -1
    fi
}

# Função para testar conectividade
test_endpoint() {
    local url=$1
    local name=$2
    
    info "Testando: $name"
    info "URL: $url"
    
    if curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null | grep -q "200\|404\|401"; then
        success "$name está acessível"
        return 0
    else
        error "$name NÃO está acessível"
        return 1
    fi
}

# Início do script
clear
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   🧪 Teste de Conectividade - App Expo                         ║"
echo "║                                                                ║"
echo "║   Este script verifica se seu app consegue conectar aos       ║"
echo "║   serviços (Backend e Audio)                                   ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Pergunta qual é o IP/domínio a testar
echo "Digite o IP ou domínio do seu servidor:"
echo ""
echo "Exemplos:"
echo "  • Desenvolvimento: 192.168.1.10"
echo "  • Produção: seu-dominio.com"
echo "  • Cloud: seu-backend.onrender.com"
echo ""

read -p "IP/Domínio: " SERVER_HOST

if [ -z "$SERVER_HOST" ]; then
    # Tenta autodetectar
    LOCAL_IP=$(get_local_ip)
    if [ -n "$LOCAL_IP" ]; then
        SERVER_HOST=$LOCAL_IP
        info "IP local detectado: $LOCAL_IP"
    else
        error "Não foi possível detectar o IP. Abortar."
        exit 1
    fi
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "📋 Configuração a Testar"
echo "════════════════════════════════════════════════════════════════"
echo "Host: $SERVER_HOST"
echo "Backend: http://$SERVER_HOST:8082"
echo "Audio: http://$SERVER_HOST:8005"
echo ""

# Testes
echo "════════════════════════════════════════════════════════════════"
echo "🧪 Executando Testes"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Teste 1: Ping (se disponível)
if command -v ping &> /dev/null; then
    info "Testando conectividade básica (ping)..."
    if ping -c 1 "$SERVER_HOST" &> /dev/null; then
        success "Ping bem-sucedido"
    else
        warning "Ping falhou - pode ser que ICMP esteja bloqueado"
    fi
else
    warning "Ping não disponível"
fi
echo ""

# Teste 2: DNS (se for domínio)
if [[ "$SERVER_HOST" =~ ^[a-zA-Z] ]]; then
    info "Resolvendo DNS: $SERVER_HOST"
    if host "$SERVER_HOST" &> /dev/null || nslookup "$SERVER_HOST" &> /dev/null; then
        DNS_IP=$(dig +short "$SERVER_HOST" | tail -n1)
        success "DNS resolvido para: $DNS_IP"
    else
        error "Não conseguiu resolver DNS"
    fi
    echo ""
fi

# Teste 3: Porta 8082 (Backend)
info "Testando porta 8082 (Backend)..."
if timeout 3 bash -c "echo > /dev/tcp/$SERVER_HOST/8082" 2>/dev/null; then
    success "Porta 8082 aberta"
    
    # Tenta chamar endpoint de health
    if curl -s "http://$SERVER_HOST:8082/health" | grep -q "ok\|healthy\|running"; then
        success "Backend respondendo (/health)"
    else
        warning "Porta 8082 aberta, mas /health retornou resposta inesperada"
    fi
else
    error "Porta 8082 NÃO está acessível"
fi
echo ""

# Teste 4: Porta 8005 (Audio Service)
info "Testando porta 8005 (Audio Service)..."
if timeout 3 bash -c "echo > /dev/tcp/$SERVER_HOST/8005" 2>/dev/null; then
    success "Porta 8005 aberta"
    
    # Tenta chamar endpoint de health
    if curl -s "http://$SERVER_HOST:8005/health" | grep -q "ok\|healthy\|running"; then
        success "Audio Service respondendo (/health)"
    else
        warning "Porta 8005 aberta, mas /health retornou resposta inesperada"
    fi
else
    error "Porta 8005 NÃO está acessível"
fi
echo ""

# Teste 5: Endpoints reais
echo "════════════════════════════════════════════════════════════════"
echo "🔍 Testando Endpoints da API"
echo "════════════════════════════════════════════════════════════════"
echo ""

info "GET /api/v1/health"
curl -s "http://$SERVER_HOST:8082/api/v1/health" && echo "" || echo "Falhou" && echo ""

info "GET /docs (Swagger)"
if curl -s -o /dev/null -w "%{http_code}" "http://$SERVER_HOST:8082/docs" | grep -q "200"; then
    success "Documentação Swagger disponível"
else
    warning "Documentação Swagger não encontrada (pode ser normal)"
fi
echo ""

# Resumo Final
echo ""
echo "════════════════════════════════════════════════════════════════"
echo "📊 Resumo"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Para usar o app Expo, edite o arquivo:"
echo "  app_conecta-saude/appconecta/app.json"
echo ""
echo "E atualize com:"
echo ""
echo "  \"extra\": {"
echo "    \"backendUrl\": \"http://$SERVER_HOST:8082\","
echo "    \"audioServiceUrl\": \"http://$SERVER_HOST:8005\""
echo "  }"
echo ""
echo "Depois execute:"
echo "  cd app_conecta-saude/appconecta"
echo "  expo start --clear"
echo ""

# Se tudo passou
if [ $? -eq 0 ]; then
    success "Testes completos! ✨"
else
    error "Alguns testes falharam. Verifique a configuração."
fi

echo ""
