"""
Service Agente Audio Sumarizado - API Principal (v2.0)
Microsserviço para transcrição e sumarização de áudios dos agentes de saúde
Usando LangGraph + Gemini API
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import init_db
from app.routes import audio, health

# Lifecycle events
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gerencia inicialização e encerramento da aplicação."""
    # Startup
    print("🚀 Inicializando Service Agente Audio Sumarizado v2.0...")
    await init_db()
    print("✅ Banco de dados inicializado")
    print("✅ LangGraph e Gemini API configurados")
    yield
    # Shutdown
    print("🛑 Encerrando Service Agente Audio Sumarizado...")

# Criar aplicação FastAPI
app = FastAPI(
    title="Service Agente Audio Sumarizado",
    description="API para transcrição e sumarização com LangGraph + Gemini",
    version="2.0.0",
    lifespan=lifespan,
)



app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir rotas
app.include_router(health.router, prefix="/api/v1", tags=["Health"])
app.include_router(audio.router, prefix="/api/v1", tags=["Audio"])

@app.get("/", tags=["Health"])
async def root():
    """Endpoint raiz para health check."""
    return {
        "status": "ok",
        "service": "Audio Sumarizado Agent",
        "version": "2.0.0",
        "description": "API com LangGraph + Gemini para transcrição e sumarização",
        "port": 8005
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005)
