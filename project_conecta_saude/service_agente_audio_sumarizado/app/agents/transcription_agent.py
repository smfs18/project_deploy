"""
Agente de Transcrição Atualizado - Google Genai SDK (v2.0)
"""

import logging
import time
from typing import Dict, Any
from pathlib import Path
from datetime import datetime
from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

class TranscriptionAgent:
    """Agente de transcrição usando o SDK oficial do Google GenAI."""
    
    def __init__(self, gemini_api_key: str, language: str = "pt-BR"):
        """
        Inicializa agente de transcrição.
        """
        self.gemini_api_key = gemini_api_key
        self.language = language
        self.is_available = False
        self._initialize_agent()
    
    def _initialize_agent(self):
        """Inicializa o cliente oficial do Google GenAI."""
        try:
            # Inicializa o cliente padrão do Google
            self.client = genai.Client(api_key=self.gemini_api_key)
            self.is_available = True
            logger.info("✅ Agente de Transcrição (Google GenAI SDK) inicializado")
        except Exception as e:
            logger.error(f"❌ Erro ao inicializar SDK: {e}")
            self.is_available = False
    
    async def transcribe(self, file_path: str) -> Dict[str, Any]:
        """
        Transcreve um arquivo de áudio usando Gemini 2.0 Flash.
        """
        if not self.is_available:
            return {
                "text": "",
                "success": False,
                "error": "Modelo não disponível"
            }
        
        start_time = time.time()
        
        try:
            file_path_obj = Path(file_path)
            if not file_path_obj.exists():
                raise FileNotFoundError(f"Arquivo não encontrado: {file_path}")
            
            # Mapeamento de MIME types para o Gemini
            ext = file_path_obj.suffix.lower()
            mime_types = {
                ".mp3": "audio/mpeg",
                ".wav": "audio/wav",
                ".m4a": "audio/mp4",
                ".ogg": "audio/ogg"
            }
            mime_type = mime_types.get(ext, "audio/mpeg")
            
            # Lendo o arquivo binário diretamente (sem necessidade de base64 manual)
            with open(file_path, "rb") as audio_file:
                audio_bytes = audio_file.read()
            
            prompt = f"""Você é um assistente de transcrição de áudio médico. 
Sua tarefa é transcrever EXATAMENTE o seguinte áudio para texto em {self.language}.
Regras:
1. Transcreva palavra por palavra.
2. Preserve pontuação.
3. Se houver palavras inaudíveis, indique com [inaudível].
4. Mantenha termos médicos exatos."""
            
            # Chamada otimizada usando Parts (Padrão da Documentação)
            response = self.client.models.generate_content(
                model="gemini-2.5-flash", # Atualizado para a versão 2.0
                contents=[
                    types.Part.from_bytes(data=audio_bytes, mime_type=mime_type),
                    types.Part.from_text(text=prompt)
                ]
            )
            
            processing_time = time.time() - start_time
            
            return {
                "text": response.text,
                "confidence": 0.95,
                "language": self.language,
                "processing_time": processing_time,
                "model_used": "gemini-2.0-flash",
                "success": True
            }
            
        except Exception as e:
            logger.error(f"Erro na transcrição: {e}")
            return {
                "text": "",
                "success": False,
                "error": str(e),
                "processing_time": time.time() - start_time
            }

    async def get_status(self) -> Dict[str, Any]:
        return {
            "agent": "TranscriptionAgent",
            "implementation": "Google GenAI SDK",
            "is_available": self.is_available,
            "timestamp": datetime.utcnow().isoformat()
        }