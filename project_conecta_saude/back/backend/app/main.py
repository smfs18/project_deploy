from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.api_v1.api import api_router

app = FastAPI(
    title="Conecta+Saúde - Backend Principal",
    description="API para gerenciamento de pacientes e orquestração de serviços de ML/LLM.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/", tags=["Health Check"])
def health_check():
    return {"status": "ok", "service": "Backend Principal"}
@app.get("/health", tags=["Health Check"])
def health_check():
    """Rota específica para o Healthcheck do Docker."""
    return {"status": "healthy"}
