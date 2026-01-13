#!/bin/bash
# Script para iniciar o Service Agente WhatsApp sem Docker

echo "🚀 Iniciando Service Agente WhatsApp..."
echo ""

# Verificar se está no diretório correto
if [ ! -f "main.py" ]; then
    echo "❌ Erro: Execute este script na pasta service_agente_whatsapp"
    exit 1
fi

# Verificar se .env existe
if [ ! -f ".env" ]; then
    echo "⚠️  Arquivo .env não encontrado!"
    echo "📝 Copiando .env.example para .env..."
    cp .env.example .env
    echo ""
    echo "✏️  Por favor, edite o arquivo .env com suas credenciais:"
    echo "   - GOOGLE_API_KEY (obrigatório)"
    echo "   - MONGO_URI (MongoDB Atlas ou local)"
    echo ""
    echo "Depois de configurar, execute este script novamente."
    exit 1
fi

# Verificar se GOOGLE_API_KEY está configurada
if grep -q "sua_chave_api_aqui" .env; then
    echo "⚠️  GOOGLE_API_KEY ainda não foi configurada no .env!"
    echo "📝 Obtenha sua chave em: https://makersuite.google.com/app/apikey"
    echo "✏️  Edite o arquivo .env e substitua 'sua_chave_api_aqui' pela sua chave"
    exit 1
fi

# Verificar se venv existe, se não, criar
if [ ! -d "venv" ]; then
    echo "📦 Criando ambiente virtual..."
    python3 -m venv venv
fi

# Ativar ambiente virtual
echo "🔧 Ativando ambiente virtual..."
source venv/bin/activate

# Instalar/atualizar dependências
echo "📥 Instalando dependências..."
pip install -r requeriments.txt --quiet

echo ""
echo "✅ Configuração completa!"
echo ""
echo "🎯 Iniciando servidor na porta 8002..."
echo "   Acesse: http://localhost:8002"
echo ""
echo "⏹️  Para parar: Pressione Ctrl+C"
echo ""

# Iniciar servidor
python main.py
