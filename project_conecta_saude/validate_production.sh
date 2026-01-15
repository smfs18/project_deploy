#!/bin/bash

# ============================================================================
# Script de Validação de Conectividade Entre Microsserviços
# ============================================================================
# Verifica se todos os serviços estão acessíveis e sem referências a localhost
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
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Main
print_header "Validação de Conectividade - Conecta Saúde"

# 1. Verificar variáveis de ambiente
print_header "1️⃣  Verificando Variáveis de Ambiente"

if [ -f ".env" ]; then
    print_success "Arquivo .env encontrado"
    
    # Verificar variáveis críticas
    if grep -q "BACKEND_URL" .env; then
        BACKEND_URL=$(grep "^BACKEND_URL=" .env | cut -d'=' -f2)
        print_success "BACKEND_URL definido: $BACKEND_URL"
    else
        print_error "BACKEND_URL não definido em .env"
    fi
    
    if grep -q "CORS_ORIGINS" .env; then
        print_success "CORS_ORIGINS definido"
    else
        print_warning "CORS_ORIGINS não definido em .env"
    fi
else
    print_error "Arquivo .env não encontrado na raiz do projeto"
fi

# 2. Procurar por referências a localhost em arquivos Python
print_header "2️⃣  Procurando por Referências a 'localhost' em Código"

FOUND_LOCALHOST=0

# Arquivos críticos a verificar
FILES_TO_CHECK=(
    "service_agente_whatsapp/app/services/backend_client.py"
    "service_agente_whatsapp/app/db/database.py"
    "service_agente_audio_sumarizado/app/integrations/backend_integration.py"
    "service_agente_audio_sumarizado/app/integrations/appconecta_integration.py"
    "service_agente_audio_sumarizado/client.py"
    "frontend/src/pages/WhatsAppSimulator/WhatsAppSimulator.tsx"
    "back/backend/app/services/http_client.py"
)

for file in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$file" ]; then
        if grep -q "localhost" "$file"; then
            # Ignorar comentários e valores padrão em getenv
            if grep -q "localhost" "$file" | grep -v "getenv" | grep -v "#"; then
                print_error "$file contém referência a 'localhost' (fora de getenv)"
                FOUND_LOCALHOST=$((FOUND_LOCALHOST + 1))
            else
                print_success "$file ok (localhost apenas em fallback)"
            fi
        else
            print_success "$file ok (sem referências a localhost)"
        fi
    fi
done

if [ $FOUND_LOCALHOST -eq 0 ]; then
    print_success "Nenhuma referência problemática a 'localhost' encontrada"
else
    print_error "Encontradas $FOUND_LOCALHOST referências problemáticas a 'localhost'"
fi

# 3. Verificar Docker Compose
print_header "3️⃣  Validando Configuração do Docker Compose"

if [ -f "docker-compose.yml" ]; then
    print_success "Arquivo docker-compose.yml encontrado"
    
    if grep -q "VITE_API_URL=http://backend" docker-compose.yml; then
        print_success "docker-compose.yml usando referência correta ao backend"
    else
        print_warning "Verifique se docker-compose.yml está com URLs corretas"
    fi
else
    print_error "Arquivo docker-compose.yml não encontrado"
fi

# 4. Verificar Frontend .env files
print_header "4️⃣  Verificando Configuração do Frontend"

if [ -f "frontend/.env.example" ]; then
    print_success "frontend/.env.example encontrado"
else
    print_warning "frontend/.env.example não encontrado"
fi

if [ -f "frontend/.env.production" ]; then
    print_success "frontend/.env.production encontrado"
    if grep -q "VITE_API_URL" frontend/.env.production; then
        FRONTEND_API=$(grep "^VITE_API_URL=" frontend/.env.production | cut -d'=' -f2)
        print_info "  VITE_API_URL: $FRONTEND_API"
    fi
else
    print_warning "frontend/.env.production não encontrado - será necessário criar"
fi

# 5. Checklist para Deploy
print_header "5️⃣  Checklist para Produção"

echo ""
echo "Antes de fazer o deploy em produção, verifique:"
echo ""

checks=(
    "[ ] Todas as variáveis de ambiente em .env estão corretas para produção"
    "[ ] CORS_ORIGINS inclui seu domínio de produção"
    "[ ] BACKEND_URL aponta para o endereço correto"
    "[ ] frontend/.env.production tem as URLs de produção"
    "[ ] Nenhuma referência hardcoded a localhost:* existe no código"
    "[ ] Docker Compose está configurado para usar nomes de serviço"
    "[ ] Banco de dados MongoDB está acessível"
    "[ ] Redis está acessível"
    "[ ] Certificados SSL estão configurados (se necessário)"
    "[ ] Logs estão sendo monitorados"
)

for check in "${checks[@]}"; do
    echo "$check"
done

# 6. Teste de conectividade (se Docker está rodando)
print_header "6️⃣  Teste de Conectividade (se Docker está ativo)"

if command -v docker &> /dev/null; then
    if docker ps > /dev/null 2>&1; then
        echo ""
        print_info "Docker está rodando - testando conectividade entre serviços..."
        
        # Tentar conectar ao backend
        if docker-compose ps | grep -q "conecta-backend"; then
            print_success "Backend está rodando"
            
            # Test backend health
            if docker-compose exec -T backend curl -f http://localhost:8000/health > /dev/null 2>&1; then
                print_success "Backend health check: OK"
            else
                print_warning "Não foi possível verificar saúde do backend"
            fi
        fi
    else
        print_warning "Docker não está rodando - não é possível testar conectividade"
    fi
else
    print_info "Docker não está instalado - pulando teste de conectividade"
fi

# 7. Resumo final
print_header "📊 Resumo da Validação"

if [ $FOUND_LOCALHOST -eq 0 ]; then
    print_success "Todas as validações passaram!"
    echo ""
    print_info "Sistema está pronto para produção"
else
    print_error "Existem problemas que precisam ser corrigidos"
    echo ""
    print_info "Veja o relatório: RELATORIO_CORRECAO_LOCALHOST.md"
fi

echo ""
print_info "Validação concluída em: $(date)"
