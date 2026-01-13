"""
Configurações da aplicação - Versão Corrigida
"""

from pydantic_settings import BaseSettings
from typing import List, Optional
import os

class Settings(BaseSettings):
    """Configurações globais da aplicação."""
    
    # Database
    database_url: str 
    database_echo: bool = False
    
    # Gemini
    gemini_api_key: str = ""
    
    # Backend URLs (Corrigido com os atributos que o service exige)
    backend_url: str 
    backend_api_key: str = "" # Necessário para o AudioProcessingService
    
    # Frontend/App URLs
    frontend_url: str         # Necessário para o AudioProcessingService
    appconecta_url: str 
    
    # Audio
    max_audio_size: int = 50000000  # 50MB
    supported_formats: List[str] = ["mp3", "wav", "m4a", "ogg"]
    
    # Language
    language: str = "pt-BR"
    
    # LangGraph
    langraph_verbose: bool = True
    
    # API
    api_port: int = 8005
    api_host: str = "0.0.0.0"
    debug: bool = True
    
    # Service
    service_name: str = "Audio_Sumarizado_Agent"
    service_version: str = "2.0.0"
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# Instância global de configurações
settings = Settings()