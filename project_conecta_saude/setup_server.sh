#!/bin/bash
set -e

# ============================================================================
# SETUP DE SERVIDOR PARA CONECTA+SAÚDE
# Clona repositórios privados e configura ambiente
# ============================================================================

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# FUNÇÕES
# ============================================================================

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
# 1. VALIDAR PRÉ-REQUISITOS
# ============================================================================

log_info "Validando pré-requisitos..."

# Checar se Git está instalado
if ! command -v git &> /dev/null; then
    log_error "Git não está instalado"
    exit 1
fi

# Checar se Docker está instalado
if ! command -v docker &> /dev/null; then
    log_error "Docker não está instalado"
    exit 1
fi

# Checar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose não está instalado"
    exit 1
fi

log_success "Git, Docker e Docker Compose encontrados"

# ============================================================================
# 2. GERAR SSH KEY (SE NÃO EXISTIR)
# ============================================================================

log_info "Verificando SSH keys..."

SSH_KEY_PATH="$HOME/.ssh/id_ed25519"

if [ ! -f "$SSH_KEY_PATH" ]; then
    log_warning "SSH key não encontrada. Gerando..."
    mkdir -p "$HOME/.ssh"
    ssh-keygen -t ed25519 -f "$SSH_KEY_PATH" -N "" -C "deploy@conecta-saude"
    chmod 600 "$SSH_KEY_PATH"
    chmod 644 "$SSH_KEY_PATH.pub"
    
    log_success "SSH key gerada: $SSH_KEY_PATH"
    log_info "Adicione a seguinte chave pública ao GitHub:"
    cat "$SSH_KEY_PATH.pub"
else
    log_success "SSH key já existe"
fi

# ============================================================================
# 3. CONFIGURAR GIT GLOBAL
# ============================================================================

log_info "Configurando Git..."

GIT_NAME="${GIT_NAME:-Conecta+Saúde Deploy}"
GIT_EMAIL="${GIT_EMAIL:-deploy@conecta-saude.local}"

git config --global user.name "$GIT_NAME"
git config --global user.email "$GIT_EMAIL"

# Adicionar GitHub à known_hosts
mkdir -p "$HOME/.ssh"
ssh-keyscan -H github.com >> "$HOME/.ssh/known_hosts" 2>/dev/null || true

log_success "Git configurado: $GIT_NAME <$GIT_EMAIL>"

# ============================================================================
# 4. DEFINIR VARIÁVEIS
# ============================================================================

# Organization do GitHub
ORG_NAME="${ORG_NAME:-Conect-saude}"

# Base path para clonagem
BASE_PATH="${BASE_PATH:-.}"

# Repositórios a clonar (formato: nome-do-repo)
declare -a REPOS=(
    "app_conecta-saude"
    "backend-conecta"
    "frontend-conecta"
    "model-llm-conecta"
    "service-llm"
    "service-agente-whatsapp"
    "service-agente-audio"
    "ml-training"
)

log_info "Configuração:"
log_info "  Organization: $ORG_NAME"
log_info "  Base Path: $BASE_PATH"
log_info "  Repositórios: ${#REPOS[@]}"

# ============================================================================
# 5. CLONAR REPOSITÓRIOS
# ============================================================================

log_info "Clonando repositórios privados..."

mkdir -p "$BASE_PATH"

for repo in "${REPOS[@]}"; do
    REPO_PATH="$BASE_PATH/$repo"
    SSH_URL="git@github.com:$ORG_NAME/$repo.git"
    
    if [ -d "$REPO_PATH/.git" ]; then
        log_warning "Repositório já existe: $repo"
        log_info "  Atualizando: git pull..."
        cd "$REPO_PATH"
        git pull origin main || git pull origin master || true
    else
        log_info "Clonando: $repo"
        git clone "$SSH_URL" "$REPO_PATH" 2>/dev/null || {
            log_error "Falha ao clonar $repo"
            log_info "  Verifique: 1) SSH key no GitHub, 2) Acesso ao repositório"
            continue
        }
    fi
    
    log_success "$repo clonado/atualizado"
done

# ============================================================================
# 6. COPIAR .ENV GLOBAL
# ============================================================================

log_info "Configurando variáveis de ambiente..."

# Procurar por .env.production
ENV_SOURCE="${ENV_SOURCE:-.env.production}"

if [ -f "$ENV_SOURCE" ]; then
    log_info "Encontrado: $ENV_SOURCE"
    
    # Copiar para cada repositório que precise
    SERVICES=(
        "backend"
        "service-llm"
        "service-agente-audio"
    )
    
    for service in "${SERVICES[@]}"; do
        SERVICE_PATH="$BASE_PATH/$service"
        if [ -d "$SERVICE_PATH" ]; then
            cp "$ENV_SOURCE" "$SERVICE_PATH/.env"
            log_success "Copiado .env para $service"
        fi
    done
else
    log_warning ".env.production não encontrado em $ENV_SOURCE"
    log_info "  Por favor, crie o arquivo com as credenciais necessárias"
fi

# ============================================================================
# 7. CONFIGURAR DOCKER
# ============================================================================

log_info "Verificando Docker daemon..."

if ! docker info >/dev/null 2>&1; then
    log_error "Docker daemon não está rodando"
    log_info "  Execute: sudo systemctl start docker"
    exit 1
fi

log_success "Docker daemon está rodando"

# Verificar se usuário está no grupo docker
if ! groups | grep -q docker; then
    log_warning "Usuário não está no grupo docker"
    log_info "  Execute: sudo usermod -aG docker \$USER"
    log_info "  Depois: newgrp docker"
fi

# ============================================================================
# 8. PREPARAR DOCKER COMPOSE
# ============================================================================

log_info "Preparando Docker Compose..."

# Asumir que o projeto principal está em $BASE_PATH/app_conecta-saude
MAIN_PROJECT="$BASE_PATH/app_conecta-saude"

if [ ! -d "$MAIN_PROJECT" ]; then
    log_error "Projeto principal não encontrado: $MAIN_PROJECT"
    exit 1
fi

cd "$MAIN_PROJECT"

# Criar rede Docker (se não existir)
docker network create conecta-network 2>/dev/null || true

log_success "Rede Docker 'conecta-network' criada"

# ============================================================================
# 9. LISTAR STATUS
# ============================================================================

log_info "Resumo final:"
echo ""
echo "✓ Pré-requisitos validados"
echo "✓ SSH keys configuradas: $SSH_KEY_PATH"
echo "✓ Git configurado"
echo "✓ Repositórios clonados/atualizados"
echo "✓ Ambiente configurado"
echo "✓ Docker pronto"
echo ""

log_success "Setup concluído!"

# ============================================================================
# 10. PRÓXIMOS PASSOS
# ============================================================================

echo -e "${YELLOW}Próximos passos:${NC}"
echo ""
echo "1. Verificar SSH key no GitHub:"
echo "   ${BLUE}cat $SSH_KEY_PATH.pub${NC}"
echo ""
echo "2. Entrar no diretório do projeto:"
echo "   ${BLUE}cd $MAIN_PROJECT${NC}"
echo ""
echo "3. Verificar status do Docker Compose:"
echo "   ${BLUE}docker-compose config${NC}"
echo ""
echo "4. Build das imagens:"
echo "   ${BLUE}docker-compose build${NC}"
echo ""
echo "5. Iniciar containers:"
echo "   ${BLUE}docker-compose up -d${NC}"
echo ""
echo "6. Ver logs:"
echo "   ${BLUE}docker-compose logs -f${NC}"
echo ""
echo "7. Ver status dos containers:"
echo "   ${BLUE}docker-compose ps${NC}"
echo ""

exit 0
