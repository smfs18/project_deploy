"""
Agente de Sumarização Atualizado - Google GenAI SDK (v2.0)
"""

import logging
import time
from typing import Optional, Dict, Any
from datetime import datetime
from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

class SummarizationAgent:
    """Agente de sumarização usando o SDK oficial do Google GenAI."""
    
    def __init__(self, gemini_api_key: str, language: str = "pt-BR"):
        """Inicializa o agente de sumarização."""
        self.gemini_api_key = gemini_api_key
        self.language = language
        self.is_available = False
        self._initialize_agent()
    
    def _initialize_agent(self):
        """Inicializa o cliente oficial do Google GenAI."""
        try:
            # Inicializa o cliente padrão do Google para evitar o erro 404
            self.client = genai.Client(api_key=self.gemini_api_key)
            self.is_available = True
            logger.info("✅ Agente de Sumarização (Google GenAI SDK) inicializado")
        except Exception as e:
            logger.error(f"❌ Erro ao inicializar SDK de Sumarização: {e}")
            self.is_available = False

    async def summarize(
        self,
        text: str,
        max_length: Optional[int] = None,
        min_length: Optional[int] = None
    ) -> Dict[str, Any]:
        """Sumariza o texto utilizando o modelo Gemini 1.5 Flash."""
        if not self.is_available:
            return {"text": text, "success": False, "error": "Modelo não disponível"}
        
        start_time = time.time()
        
        try:
            # Validação de entrada
            if not text or len(text.strip()) < 50:
                return {
                    "text": text,
                    "original_length": len(text),
                    "summarized_length": len(text),
                    "compression_ratio": 1.0,
                    "success": True,
                    "warning": "Texto muito curto para sumarização"
                }

            prompt = f"""Você é um assistente de sumarização de textos médicos.
Sua tarefa é criar um resumo conciso e informativo do seguinte texto em {self.language}.

Requisitos:
1. Mantenha as informações essenciais (Queixas, Conduta, Medicamentos).
2. Use linguagem clara e objetiva.
3. Preserve detalhes clínicos importantes.

Texto para sumarizar:
{text}

Resumo:"""

            # Chamada direta ao SDK para evitar erros de rota de API (404)
            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            
            summarized_text = response.text
            original_len = len(text)
            summarized_len = len(summarized_text)
            
            return {
                "text": summarized_text,
                "original_length": original_len,
                "summarized_length": summarized_len,
                "compression_ratio": summarized_len / original_len,
                "processing_time": time.time() - start_time,
                "model_used": "gemini-1.5-flash",
                "success": True
            }
            
        except Exception as e:
            logger.error(f"Erro na sumarização: {e}")
            return {
                "text": text,
                "success": False,
                "error": str(e)
            }

    async def get_status(self) -> Dict[str, Any]:
        return {
            "agent": "SummarizationAgent",
            "implementation": "Google GenAI SDK",
            "is_available": self.is_available,
            "timestamp": datetime.utcnow().isoformat()
        }