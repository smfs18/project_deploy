#!/bin/bash

# Script para testar a API de Audio Sumarizado

API_URL="http://localhost:8003/api/v1"
AGENT_ID="health_agent_001"
PATIENT_ID="patient_12345"

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎤 Testando Service Agente Audio Sumarizado${NC}\n"

# 1. Health Check
echo -e "${BLUE}1️⃣  Health Check${NC}"
curl -s "$API_URL/health" | jq .
echo ""

# 2. Status dos Agentes
echo -e "${BLUE}2️⃣  Status dos Agentes${NC}"
curl -s "$API_URL/health/agents" | jq .
echo ""

# 3. Upload de Áudio
echo -e "${BLUE}3️⃣  Upload de Áudio${NC}"

# Criar um arquivo de áudio de teste (silence de 1 segundo)
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 1 -q:a 9 -acodec libmp3lame test_audio.mp3 2>/dev/null

if [ -f "test_audio.mp3" ]; then
    UPLOAD_RESPONSE=$(curl -s -X POST "$API_URL/audio/upload" \
      -F "file=@test_audio.mp3" \
      -F "agent_id=$AGENT_ID" \
      -F "patient_id=$PATIENT_ID")
    
    echo "$UPLOAD_RESPONSE" | jq .
    
    # Extrair audio_id
    AUDIO_ID=$(echo "$UPLOAD_RESPONSE" | jq -r '.id' 2>/dev/null)
    
    if [ "$AUDIO_ID" != "null" ] && [ ! -z "$AUDIO_ID" ]; then
        echo -e "${GREEN}✅ Áudio enviado com sucesso: $AUDIO_ID${NC}\n"
        
        # 4. Aguardar processamento
        echo -e "${BLUE}4️⃣  Aguardando processamento...${NC}"
        sleep 5
        
        # 5. Consultar resultado
        echo -e "${BLUE}5️⃣  Resultado do Processamento${NC}"
        curl -s "$API_URL/audio/$AUDIO_ID" | jq .
        echo ""
        
        # 6. Obter Transcrição
        echo -e "${BLUE}6️⃣  Transcrição${NC}"
        curl -s "$API_URL/audio/$AUDIO_ID/transcription" | jq .
        echo ""
        
        # 7. Obter Sumarização
        echo -e "${BLUE}7️⃣  Sumarização${NC}"
        curl -s "$API_URL/audio/$AUDIO_ID/summarization" | jq .
        echo ""
    else
        echo -e "${RED}❌ Erro ao fazer upload do áudio${NC}\n"
    fi
    
    # Limpar arquivo de teste
    rm test_audio.mp3
else
    echo -e "${RED}❌ Erro ao criar arquivo de teste${NC}"
fi

echo -e "${GREEN}✅ Testes concluídos!${NC}"
