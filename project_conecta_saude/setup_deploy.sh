#!/bin/bash

# ============================================
# Script de Setup para Deploy Render + Supabase
# ============================================
# Este script ajuda a configurar o deploy do projeto
# Uso: bash setup_deploy.sh

set -e

echo "🚀 Conecta+Saúde - Setup Deploy Render + Supabase"
echo "=================================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para exibir sucesso
success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Função para exibir aviso
warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Função para exibir erro
error() {
    echo -e "${RED}✗${NC} $1"
}

# ============================================
# 1. Verificar Pré-requisitos
# ============================================
echo "📋 Verificando pré-requisitos..."
echo ""

# Verificar Git
if command -v git &> /dev/null; then
    success "Git instalado: $(git --version | cut -d' ' -f3)"
else
    error "Git não encontrado. Instale em: https://git-scm.com"
    exit 1
fi

# Verificar Python
if command -v python3 &> /dev/null; then
    success "Python instalado: $(python3 --version)"
else
    warning "Python não encontrado. Será necessário para testes locais"
fi

# Verificar Node
if command -v node &> /dev/null; then
    success "Node.js instalado: $(node --version)"
else
    warning "Node.js não encontrado. Necessário para frontend"
fi

echo ""

# ============================================
# 2. Coletar Informações do Usuário
# ============================================
echo "📝 Informações necessárias:"
echo ""

read -p "Digite o ID do seu projeto Supabase: " SUPABASE_PROJECT_ID
read -p "Digite a senha do banco de dados Supabase: " SUPABASE_PASSWORD
read -p "Digite a região (padrão: sa-east-1): " SUPABASE_REGION
SUPABASE_REGION=${SUPABASE_REGION:-sa-east-1}

read -p "Digite seu JWT_SECRET (ou deixe vazio para gerar): " JWT_SECRET
if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))" 2>/dev/null || echo "seu-jwt-secret-aleatorio")
    success "JWT_SECRET gerado: $JWT_SECRET"
fi

echo ""

# ============================================
# 3. Construir DATABASE_URL
# ============================================
DATABASE_URL="postgresql://postgres.${SUPABASE_PROJECT_ID}:${SUPABASE_PASSWORD}@aws-0-${SUPABASE_REGION}.pooler.supabase.com:6543/postgres"

echo "📊 Database URL configurada:"
echo "postgresql://postgres.${SUPABASE_PROJECT_ID}:***@aws-0-${SUPABASE_REGION}.pooler.supabase.com:6543/postgres"
echo ""

# ============================================
# 4. Criar/Atualizar arquivo .env
# ============================================
echo "📄 Criando arquivo .env do backend..."

cat > "back/backend/.env.production" << EOF
# Database
DATABASE_URL=${DATABASE_URL}

# JWT
JWT_SECRET=${JWT_SECRET}

# Environment
ENVIRONMENT=production
LOG_LEVEL=info
DEBUG=false
PORT=8000

# CORS
CORS_ORIGINS=https://conecta-saude-frontend.onrender.com,http://localhost:3000

# Services (Configure após deploy do ML e LLM)
ML_SERVICE_URL=https://seu-ml-service.onrender.com
LLM_SERVICE_URL=https://seu-llm-service.onrender.com

# Supabase
SUPABASE_URL=https://${SUPABASE_PROJECT_ID}.supabase.co
EOF

success ".env.production criado em back/backend/"
echo ""

# ============================================
# 5. Criar arquivo render.yaml do frontend
# ============================================
echo "📄 Criando arquivo render.yaml do frontend..."

cat > "frontend/render.yaml" << 'EOF'
services:
  - type: web
    name: conecta-saude-frontend
    env: node
    region: sa-east-1
    plan: free
    
    buildCommand: npm install && npm run build
    startCommand: npm run preview
    
    envVars:
      - key: VITE_API_URL
        value: https://conecta-saude-api.onrender.com
      - key: VITE_SUPABASE_URL
        sync: false
      - key: VITE_SUPABASE_ANON_KEY
        sync: false
      - key: NODE_VERSION
        value: "18"
    
    buildFilter:
      paths:
        - frontend/**
    
    plan: free
EOF

success "render.yaml criado em frontend/"
echo ""

# ============================================
# 6. Instruções de Deploy
# ============================================
echo "✅ Setup local completo!"
echo ""
echo "📋 Próximos passos:"
echo ""
echo "1️⃣  Configure as credenciais no Supabase:"
echo "   • Acesse: https://app.supabase.com"
echo "   • Projeto: ${SUPABASE_PROJECT_ID}"
echo "   • Copie as chaves do projeto"
echo ""
echo "2️⃣  Sincronize as migrações do banco:"
echo "   • Execute o SQL de migrações no Supabase SQL Editor"
echo ""
echo "3️⃣  Configure no Render:"
echo "   • Backend: https://dashboard.render.com"
echo "   • Conecte seu GitHub"
echo "   • Use branch: release/v1.0.0"
echo ""
echo "4️⃣  Adicione variáveis de ambiente no Render:"
cat > "/tmp/render_env.txt" << EOF
DATABASE_URL=${DATABASE_URL}
JWT_SECRET=${JWT_SECRET}
CORS_ORIGINS=https://conecta-saude-frontend.onrender.com
ENVIRONMENT=production
EOF

echo "   Copie estas variáveis:"
cat /tmp/render_env.txt | sed 's/^/   • /'
echo ""
echo "5️⃣  Faça commit e push:"
echo "   $ git add -A"
echo "   $ git commit -m 'Configure Render and Supabase deployment'"
echo "   $ git push origin release/v1.0.0"
echo ""
echo "📚 Leia o guia completo em:"
echo "   GUIA_DEPLOY_RENDER_SUPABASE.md"
echo ""
echo "🎉 Boa sorte com o deploy!"
