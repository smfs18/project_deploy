#!/bin/bash

# ========================================
# EXEMPLOS DE REQUISIÇÕES PARA A API DE AGENTES
# ========================================
# 
# Antes de rodar, configure:
# export TOKEN="seu_token_jwt_aqui"
# export BASE_URL="http://localhost:8082"

TOKEN="${TOKEN:-seu_token_aqui}"
BASE_URL="${BASE_URL:-http://localhost:8082}"

echo "📌 Usando TOKEN: ${TOKEN:0:20}..."
echo "📌 Usando BASE_URL: $BASE_URL"
echo ""

# ========================================
# 1. CRIAR NOVO AGENTE
# ========================================
echo "🟢 [1] Criando novo agente..."
curl -X POST "$BASE_URL/api/v1/agentes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João da Silva",
    "email": "joao.silva@ubs.com",
    "telefone": "(11) 98765-4321",
    "cpf": "12345678901",
    "tipo_profissional": "ACS",
    "numero_registro": "ACS-001",
    "ubs_nome": "UBS Centro",
    "endereco": "Rua Principal, 100"
  }' | jq .

echo ""
echo "---"
echo ""

# ========================================
# 2. LISTAR AGENTES COM PAGINAÇÃO
# ========================================
echo "🟢 [2] Listando agentes (página 1, 10 por página)..."
curl -X GET "$BASE_URL/api/v1/agentes?page=1&page_size=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq .

echo ""
echo "---"
echo ""

# ========================================
# 3. BUSCAR AGENTE POR ID
# ========================================
echo "🟢 [3] Buscando agente por ID..."
curl -X GET "$BASE_URL/api/v1/agentes/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq .

echo ""
echo "---"
echo ""

# ========================================
# 4. ATUALIZAR AGENTE
# ========================================
echo "🟢 [4] Atualizando agente..."
curl -X PUT "$BASE_URL/api/v1/agentes/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "telefone": "(11) 99999-9999"
  }' | jq .

echo ""
echo "---"
echo ""

# ========================================
# 5. ATRIBUIR PACIENTE A AGENTE
# ========================================
echo "🟢 [5] Atribuindo paciente a agente..."
curl -X POST "$BASE_URL/api/v1/agentes/1/atribuicoes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "paciente_id": 5,
    "nome_paciente": "Maria Santos",
    "localizacao": "Rua das Flores, 123 - Apto 45",
    "informacoes_clinicas": {
      "condicoes": ["Hipertensão", "Diabetes"],
      "medicamentos": ["Losartana 50mg", "Metformina 500mg"],
      "alergias": "Penicilina",
      "pressao_ultima": "140/90 mmHg"
    },
    "notas_gestor": "Paciente com atraso nas consultas. Necessário acompanhamento especial."
  }' | jq .

echo ""
echo "---"
echo ""

# ========================================
# 6. LISTAR ATRIBUIÇÕES DO AGENTE
# ========================================
echo "🟢 [6] Listando pacientes atribuídos ao agente..."
curl -X GET "$BASE_URL/api/v1/agentes/1/atribuicoes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq .

echo ""
echo "---"
echo ""

# ========================================
# 7. OBTER ATRIBUIÇÃO ESPECÍFICA
# ========================================
echo "🟢 [7] Buscando atribuição específica..."
curl -X GET "$BASE_URL/api/v1/agentes/1/atribuicoes/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq .

echo ""
echo "---"
echo ""

# ========================================
# 8. ATUALIZAR ATRIBUIÇÃO
# ========================================
echo "🟢 [8] Atualizando atribuição..."
curl -X PUT "$BASE_URL/api/v1/agentes/1/atribuicoes/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "notas_gestor": "Novas notas atualizadas"
  }' | jq .

echo ""
echo "---"
echo ""

# ========================================
# 9. ENVIAR ATRIBUIÇÃO PARA APP
# ========================================
echo "🟢 [9] Enviando atribuição para app conecta+saúde..."
curl -X POST "$BASE_URL/api/v1/agentes/1/atribuicoes/1/enviar-app" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq .

echo ""
echo "---"
echo ""

# ========================================
# 10. MARCAR ATRIBUIÇÃO COMO CONCLUÍDA
# ========================================
echo "🟢 [10] Marcando atribuição como concluída..."
curl -X PATCH "$BASE_URL/api/v1/agentes/1/atribuicoes/1/concluir" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq .

echo ""
echo "---"
echo ""

# ========================================
# 11. DELETAR ATRIBUIÇÃO
# ========================================
echo "🟢 [11] Deletando atribuição..."
curl -X DELETE "$BASE_URL/api/v1/agentes/1/atribuicoes/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

echo ""
echo ""

# ========================================
# 12. DESATIVAR AGENTE
# ========================================
echo "🟢 [12] Desativando agente..."
curl -X PATCH "$BASE_URL/api/v1/agentes/1/desativar" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq .

echo ""
echo "---"
echo ""

# ========================================
# 13. DELETAR AGENTE
# ========================================
echo "🟢 [13] Deletando agente..."
curl -X DELETE "$BASE_URL/api/v1/agentes/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

echo ""
echo "✅ Testes concluídos!"
