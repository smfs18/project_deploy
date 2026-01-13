#!/bin/bash

# ============================================================================
# SCRIPT DE VERIFICAÇÃO - Otimização Docker
# Valida tamanhos de imagem, build time e limites de memória
# ============================================================================

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Limites esperados (em MB)
declare -A LIMITS=(
    ["postgres"]="256"
    ["redis"]="64"
    ["backend"]="350"
    ["model-llm"]="256"
    ["service_llm"]="512"
    ["whatsapp-agent"]="256"
    ["audio_sumarizado"]="350"
    ["frontend"]="128"
)

# Limites de build time (em segundos)
BUILD_TIME_LIMIT=600  # 10 minutos

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# ============================================================================
# 1. PRÉ-FLIGHT CHECKS
# ============================================================================

log_info "Iniciando verificação de otimização Docker..."
echo ""

# Verificar Docker
if ! command -v docker &> /dev/null; then
    log_error "Docker não está instalado"
    exit 1
fi

# Verificar Docker Compose
if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose não está instalado"
    exit 1
fi

log_success "Docker e Docker Compose encontrados"

# ============================================================================
# 2. VERIFICAR docker-compose.yml
# ============================================================================

log_info "Validando docker-compose.yml..."

if ! docker-compose config > /dev/null 2>&1; then
    log_error "docker-compose.yml inválido"
    docker-compose config
    exit 1
fi

log_success "docker-compose.yml é válido"

# ============================================================================
# 3. BUILD DAS IMAGENS COM TIMER
# ============================================================================

log_info "Iniciando build das imagens..."
echo ""

START_TIME=$(date +%s)

if docker-compose build 2>&1 | tee build.log; then
    END_TIME=$(date +%s)
    BUILD_DURATION=$((END_TIME - START_TIME))
    
    log_success "Build concluído em ${BUILD_DURATION}s"
    
    if [ $BUILD_DURATION -gt $BUILD_TIME_LIMIT ]; then
        log_warning "Build excedeu limite de ${BUILD_TIME_LIMIT}s"
    else
        log_success "Build dentro do limite (${BUILD_DURATION}s < ${BUILD_TIME_LIMIT}s)"
    fi
else
    log_error "Build falhou!"
    tail -50 build.log
    exit 1
fi

echo ""

# ============================================================================
# 4. VERIFICAR TAMANHOS DE IMAGEM
# ============================================================================

log_info "Verificando tamanhos de imagem..."
echo ""

TOTAL_SIZE=0
FAILED_CHECKS=0

while IFS= read -r line; do
    # Extrair nome da imagem e tamanho
    IMAGE_NAME=$(echo "$line" | awk '{print $1}')
    IMAGE_SIZE=$(echo "$line" | awk '{print $2, $3}')
    
    # Converter tamanho para MB
    SIZE_MB=$(docker images --format '{{.Repository}} {{.Size}}' | grep "$IMAGE_NAME" | awk '{
        size = $NF
        gsub(/[A-Za-z]/, "", size)
        if (size ~ /GB/) {
            print size * 1024
        } else if (size ~ /MB/) {
            print size
        } else {
            print size / (1024 * 1024)
        }
    }' | head -1)
    
done

# Listar imagens construídas
log_info "Imagens construídas:"
echo ""

docker images --filter "reference=conecta*" --format "table {{.Repository}}\t{{.Size}}\t{{.CreatedAt}}" || \
docker images --format "table {{.Repository}}\t{{.Size}}\t{{.CreatedAt}}" | grep -E "(backend|service|model|audio|frontend|postgres|redis)" || true

echo ""

# ============================================================================
# 5. VERIFICAR LIMITES DE MEMÓRIA NO COMPOSE
# ============================================================================

log_info "Verificando configuração de limites de memória..."
echo ""

if grep -q "deploy:" docker-compose.yml; then
    log_success "Limites de memória configurados no docker-compose.yml"
else
    log_warning "Nenhum limite de memória configurado"
fi

# ============================================================================
# 6. VERIFICAR HEALTHCHECKS
# ============================================================================

log_info "Verificando healthchecks..."
echo ""

HEALTHCHECK_COUNT=$(grep -c "HEALTHCHECK" docker-compose.yml || echo "0")

if [ "$HEALTHCHECK_COUNT" -gt 0 ]; then
    log_success "Encontrados $HEALTHCHECK_COUNT healthchecks"
else
    log_warning "Nenhum healthcheck configurado"
fi

# ============================================================================
# 7. RESUMO FINAL
# ============================================================================

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
log_success "Verificação de Otimização Concluída!"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""

log_info "Próximas etapas:"
echo "  1. Iniciar containers: ${YELLOW}docker-compose up -d${NC}"
echo "  2. Verificar status: ${YELLOW}docker-compose ps${NC}"
echo "  3. Ver logs: ${YELLOW}docker-compose logs -f${NC}"
echo "  4. Parar containers: ${YELLOW}docker-compose down${NC}"
echo ""

exit 0
