#!/bin/bash

# ============================================================================
# Script de Deploy - Conecta Saúde para Produção
# ============================================================================
# Realiza o deploy com as configurações corretas de produção
# Data: 14 de janeiro de 2026

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Main
print_header "Deploy - Conecta Saúde"

# 1. Verificar pré-requisitos
print_header "1️⃣  Verificando Pré-requisitos"

if ! command -v docker &> /dev/null; then
    print_error "Docker não está instalado"
fi
print_success "Docker encontrado"

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose não está instalado"
fi
print_success "Docker Compose encontrado"

# 2. Verificar arquivo .env
print_header "2️⃣  Validando Configuração"

if [ ! -f ".env" ]; then
    print_error "Arquivo .env não encontrado. Crie-o baseado no .env.example"
fi
print_success "Arquivo .env encontrado"

# Verificar variáveis críticas
print_info "Verificando variáveis de ambiente críticas..."

REQUIRED_VARS=(
    "DATABASE_URL"
    "SUPABASE_URL"
    "BACKEND_URL"
    "ML_SERVICE_URL"
    "LLM_SERVICE_URL"
)

for var in "${REQUIRED_VARS[@]}"; do
    if grep -q "^${var}=" .env; then
        VALUE=$(grep "^${var}=" .env | cut -d'=' -f2)
        print_success "$var definido"
    else
        print_error "$var não definido em .env"
    fi
done

# 3. Build das imagens
print_header "3️⃣  Construindo Imagens Docker"

print_info "Construindo imagens..."
docker-compose build --no-cache

print_success "Imagens construídas com sucesso"

# 4. Pull de imagens base
print_header "4️⃣  Verificando Imagens Base"

print_info "Puxando imagens oficiais..."
docker pull node:18-alpine
docker pull nginx:alpine
docker pull python:3.11-slim
docker pull redis:7-alpine

print_success "Imagens base atualizadas"

# 5. Parar serviços antigos (se houver)
print_header "5️⃣  Parando Serviços Anteriores"

if docker-compose ps | grep -q "conecta-"; then
    print_warning "Serviços anteriores encontrados. Parando..."
    docker-compose down
    print_success "Serviços parados"
else
    print_info "Nenhum serviço anterior encontrado"
fi

# 6. Iniciar novos serviços
print_header "6️⃣  Iniciando Serviços"

print_info "Iniciando containers..."
docker-compose up -d

print_success "Containers iniciados"

# 7. Aguardar serviços estarem prontos
print_header "7️⃣  Aguardando Inicialização dos Serviços"

MAX_ATTEMPTS=30
ATTEMPTS=0

print_info "Aguardando backend estar pronto..."
while [ $ATTEMPTS -lt $MAX_ATTEMPTS ]; do
    if docker-compose exec -T backend curl -f http://localhost:8000/health > /dev/null 2>&1; then
        print_success "Backend pronto"
        break
    fi
    ATTEMPTS=$((ATTEMPTS + 1))
    echo -n "."
    sleep 2
done

if [ $ATTEMPTS -eq $MAX_ATTEMPTS ]; then
    print_warning "Backend não ficou pronto em tempo hábil"
else
    print_success "Serviços iniciados com sucesso"
fi

# 8. Verificar saúde dos serviços
print_header "8️⃣  Verificando Saúde dos Serviços"

echo ""
echo "Status dos containers:"
docker-compose ps

# 9. Testes básicos
print_header "9️⃣  Realizando Testes Básicos"

echo ""
print_info "Testando conectividade..."

# Test backend
if curl -f http://localhost:8082/health > /dev/null 2>&1; then
    print_success "Backend acessível em http://localhost:8082"
else
    print_warning "Backend não respondeu ao health check"
fi

# Test frontend
if curl -f http://localhost:5173/ > /dev/null 2>&1; then
    print_success "Frontend acessível em http://localhost:5173"
else
    print_warning "Frontend não respondeu"
fi

# 10. Mostrar logs iniciais
print_header "🔟 Primeiros Logs"

echo ""
print_info "Backend logs (últimas 5 linhas):"
docker-compose logs --tail=5 backend

echo ""
print_info "Frontend logs (últimas 5 linhas):"
docker-compose logs --tail=5 frontend

# 11. Próximos passos
print_header "✅ Deploy Concluído"

echo ""
print_info "Serviços rodando em:"
echo "  - Backend:  http://localhost:8082"
echo "  - Frontend: http://localhost:5173"
echo "  - Redis:    localhost:6379"
echo ""

print_info "Comandos úteis:"
echo "  Ver logs:          docker-compose logs -f [service]"
echo "  Parar serviços:    docker-compose down"
echo "  Reiniciar:         docker-compose restart [service]"
echo "  Acessar container: docker-compose exec [service] bash"
echo ""

print_success "Sistema pronto para uso!"
print_info "Hora: $(date)"
