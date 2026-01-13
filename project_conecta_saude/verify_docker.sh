#!/bin/bash

# ============================================
# Script: Verificação Completa de Docker
# Conecta+Saúde - 12 de janeiro de 2026
# ============================================

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Emojis
CHECK="✅"
CROSS="❌"
WARN="⚠️"
ROCKET="🚀"
HEALTH="🏥"

# Contador
PASSED=0
FAILED=0
WARNINGS=0

# Funções
success() {
    echo -e "${GREEN}${CHECK}${NC} $1"
    ((PASSED++))
}

error() {
    echo -e "${RED}${CROSS}${NC} $1"
    ((FAILED++))
}

warning() {
    echo -e "${YELLOW}${WARN}${NC} $1"
    ((WARNINGS++))
}

info() {
    echo -e "${BLUE}ℹ️${NC} $1"
}

section() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# ============================================
# SEÇÃO 1: Verificações Preliminares
# ============================================
section "${ROCKET} VERIFICAÇÕES PRELIMINARES"

# Verificar Docker
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | cut -d',' -f1)
    success "Docker instalado: $DOCKER_VERSION"
else
    error "Docker não encontrado. Instale em: https://docs.docker.com/get-docker"
    exit 1
fi

# Verificar Docker Compose
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version | cut -d' ' -f4)
    success "Docker Compose instalado: $COMPOSE_VERSION"
else
    error "Docker Compose não encontrado"
    exit 1
fi

# Verificar Docker daemon
if docker ps &> /dev/null; then
    success "Docker daemon está rodando"
else
    error "Docker daemon não está respondendo. Execute: sudo systemctl start docker"
    exit 1
fi

# Verificar arquivo docker-compose.yml
if [ -f "docker-compose.yml" ]; then
    success "Arquivo docker-compose.yml encontrado"
else
    error "docker-compose.yml não encontrado no diretório atual"
    exit 1
fi

# ============================================
# SEÇÃO 2: Verificação de Dockerfiles
# ============================================
section "${ROCKET} VERIFICAÇÃO DE DOCKERFILES"

DOCKERFILES=(
    "back/backend/Dockerfile"
    "frontend/Dockerfile"
    "model-LLM/Dockerfile"
    "service_llm/Dockerfile"
    "service_agente_whatsapp/Dockerfile"
    "service_agente_audio_sumarizado/Dockerfile"
)

for dockerfile in "${DOCKERFILES[@]}"; do
    if [ -f "$dockerfile" ]; then
        success "Dockerfile encontrado: $dockerfile"
    else
        error "Dockerfile NÃO encontrado: $dockerfile"
    fi
done

# ============================================
# SEÇÃO 3: Verificação de docker-compose.yml
# ============================================
section "${ROCKET} VERIFICAÇÃO DO docker-compose.yml"

SERVICES=(
    "postgres"
    "redis"
    "backend"
    "frontend"
    "model-llm"
    "service_llm"
    "whatsapp-agent"
    "service_agente_audio_sumarizado"
)

info "Validando arquivo docker-compose.yml..."

if docker-compose config > /dev/null 2>&1; then
    success "docker-compose.yml é válido"
else
    error "docker-compose.yml tem erros de sintaxe"
    docker-compose config
    exit 1
fi

info ""
info "Verificando serviços definidos..."

for service in "${SERVICES[@]}"; do
    if docker-compose config | grep -q "  $service:"; then
        success "Serviço encontrado: $service"
    else
        error "Serviço NÃO encontrado: $service"
    fi
done

# ============================================
# SEÇÃO 4: Status de Containers
# ============================================
section "${HEALTH} STATUS DE CONTAINERS"

info "Verificando containers rodando..."
echo ""

if docker-compose ps | grep -q "Up"; then
    success "Existem containers rodando"
    docker-compose ps
else
    warning "Nenhum container está rodando (esperado se ainda não iniciou)"
fi

# ============================================
# SEÇÃO 5: Verificação de Portas
# ============================================
section "${ROCKET} VERIFICAÇÃO DE PORTAS"

PORTS=(
    "5432:PostgreSQL"
    "6379:Redis"
    "8082:Backend"
    "8001:Model LLM"
    "8002:Whatsapp Agent"
    "8003:Service LLM"
    "8004:Audio Sumarizado"
    "5173:Frontend"
)

info "Portas configuradas no docker-compose:"
echo ""

for port_info in "${PORTS[@]}"; do
    PORT=$(echo $port_info | cut -d':' -f1)
    SERVICE=$(echo $port_info | cut -d':' -f2)
    
    if docker-compose config | grep -q "$PORT"; then
        success "Porta $PORT ($SERVICE) configurada"
    else
        warning "Porta $PORT ($SERVICE) não encontrada"
    fi
done

# ============================================
# SEÇÃO 6: Verificação de Imagens
# ============================================
section "${ROCKET} VERIFICAÇÃO DE IMAGENS DOCKER"

info "Procurando por imagens do projeto..."
echo ""

docker images | grep -E "conecta|backend|frontend|llm|audio|whatsapp" || {
    warning "Nenhuma imagem do projeto encontrada (esperado se ainda não fez build)"
}

# ============================================
# SEÇÃO 7: Teste de Conectividade (se containers estão rodando)
# ============================================
section "${HEALTH} TESTE DE CONECTIVIDADE"

if [ $(docker-compose ps -q | wc -l) -gt 0 ]; then
    success "Containers detectados, realizando health checks..."
    echo ""
    
    # Backend
    info "Testando Backend (http://localhost:8082/health)..."
    if curl -s http://localhost:8082/health > /dev/null 2>&1; then
        success "Backend respondendo ✓"
    else
        warning "Backend não respondendo (pode estar iniciando)"
    fi
    
    # Audio Sumarizado
    info "Testando Audio Sumarizado (http://localhost:8004/api/v1/health)..."
    if curl -s http://localhost:8004/api/v1/health > /dev/null 2>&1; then
        success "Audio Sumarizado respondendo ✓"
    else
        warning "Audio Sumarizado não respondendo (pode estar iniciando)"
    fi
    
    # PostgreSQL
    info "Testando PostgreSQL..."
    if docker exec $(docker-compose ps -q postgres) psql -U postgres -c "SELECT 1;" > /dev/null 2>&1; then
        success "PostgreSQL respondendo ✓"
    else
        warning "PostgreSQL não respondendo"
    fi
    
    # Redis
    info "Testando Redis..."
    if redis-cli ping > /dev/null 2>&1; then
        success "Redis respondendo ✓"
    else
        warning "Redis não respondendo (redis-cli pode não estar instalado localmente)"
    fi
else
    warning "Nenhum container rodando. Execute: docker-compose up -d"
fi

# ============================================
# SEÇÃO 8: Análise de Volumes
# ============================================
section "${ROCKET} VERIFICAÇÃO DE VOLUMES"

info "Volumes configurados:"
docker-compose config | grep -A 5 "volumes:" || warning "Nenhum volume encontrado"

# ============================================
# SEÇÃO 9: Análise de Dependências
# ============================================
section "${ROCKET} VERIFICAÇÃO DE DEPENDÊNCIAS ENTRE SERVIÇOS"

info "Dependências de serviços:"
info ""
info "whatsapp-agent → depende de: backend, redis"
info "service_agente_audio_sumarizado → depende de: backend, postgres"
info "backend → depende de: postgres"
info "frontend → depende de: backend"

# ============================================
# SEÇÃO 10: Verificação de Variáveis de Ambiente
# ============================================
section "${ROCKET} VERIFICAÇÃO DE VARIÁVEIS DE AMBIENTE"

ENVS=(
    "DATABASE_URL"
    "JWT_SECRET"
    "CORS_ORIGINS"
)

info "Variáveis de ambiente no docker-compose:"
for env in "${ENVS[@]}"; do
    if docker-compose config | grep -q "$env"; then
        success "Variável encontrada: $env"
    else
        warning "Variável NÃO encontrada: $env (pode estar em .env file)"
    fi
done

# ============================================
# RESUMO FINAL
# ============================================
section "${ROCKET} RESUMO FINAL"

TOTAL=$((PASSED + FAILED + WARNINGS))

echo -e "${GREEN}✅ Verificações passadas: $PASSED${NC}"
echo -e "${RED}❌ Verificações falhadas: $FAILED${NC}"
echo -e "${YELLOW}⚠️  Avisos: $WARNINGS${NC}"
echo ""
echo "Total verificado: $TOTAL"

# ============================================
# Recomendações
# ============================================
section "${ROCKET} PRÓXIMAS AÇÕES"

if [ $FAILED -eq 0 ]; then
    success "Tudo pronto para iniciar!"
    echo ""
    echo "Comandos recomendados:"
    echo ""
    echo "  1. Build de todas as imagens:"
    echo "     ${BLUE}docker-compose build${NC}"
    echo ""
    echo "  2. Iniciar todos os serviços:"
    echo "     ${BLUE}docker-compose up -d${NC}"
    echo ""
    echo "  3. Verificar status:"
    echo "     ${BLUE}docker-compose ps${NC}"
    echo ""
    echo "  4. Ver logs em tempo real:"
    echo "     ${BLUE}docker-compose logs -f${NC}"
    echo ""
else
    warning "Existem problemas a resolver antes de prosseguir!"
    echo ""
    echo "Ações necessárias:"
    echo "  1. Revisar os erros acima"
    echo "  2. Certificar que todos os Dockerfiles existem"
    echo "  3. Validar docker-compose.yml manualmente:"
    echo "     ${BLUE}docker-compose config${NC}"
fi

echo ""
echo -e "${BLUE}═════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Verificação concluída em: $(date)${NC}"
echo -e "${BLUE}═════════════════════════════════════════════════════════════${NC}"

# Exit code
if [ $FAILED -gt 0 ]; then
    exit 1
else
    exit 0
fi
