from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import webhook
import uvicorn

app = FastAPI(
    title="Service Agente WhatsApp",
    description="API for WhatsApp Agent Service - Coleta e atualização de dados de pacientes",
    version="2.0.0",
)   

origins = [
    "*",
    "null",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(webhook.router, prefix="/api/v1")

@app.get("/", tags=["Health"])
async def root():
    """Health check endpoint."""
    return {
        "status": "ok",
        "service": "WhatsApp Agent",
        "version": "2.0.0"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8002)