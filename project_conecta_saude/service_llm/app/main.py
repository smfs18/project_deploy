from fastapi import FastAPI, HTTPException
from contextlib import asynccontextmanager
from .schemas import LLMInput, ActionResponse
from .agent import load_rag_chain # Importa nossa função de carregamento

# Variável global para armazenar a cadeia RAG carregada
rag_chain = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Função de inicialização (startup) do FastAPI.
    Isso é executado ANTES do servidor começar a aceitar requisições.
    """
    global rag_chain
    try:
        # Carrega o agente RAG (que carrega o índice FAISS, embeddings e o LLM)
        rag_chain = load_rag_chain()
    except Exception as e:
        print(f"Erro CRÍTICO ao carregar o agente RAG: {e}")
        # Se o agente não carregar, o servidor não deve iniciar
        raise e
    
    yield
    # (Código de shutdown, se necessário, viria aqui)

# Cria a aplicação FastAPI com o 'lifespan'
app = FastAPI(
    title="Conecta+Saúde - Serviço de Agente LLM (RAG)",
    description="API que recebe dados de pacientes e gera ações com base em protocolos (PDFs).",
    version="1.0.0",
    lifespan=lifespan # Informa ao FastAPI para rodar a função 'lifespan'
)

@app.post("/generate-actions", response_model=ActionResponse)
async def generate_actions(
    input_data: LLMInput
):
    """
    Recebe os dados de um paciente e gera um plano de ação
    usando o agente RAG (Gemini + Protocolos PDF).
    """
    if not rag_chain:
        # Isso só deve acontecer se o startup falhar
        raise HTTPException(
            status_code=503, # Service Unavailable
            detail="O Agente LLM não está pronto. Verifique os logs do servidor."
        )

    try:
        # 1. Extrai os dados do paciente da requisição
        patient_data = input_data.patient_data
        
        # 2. Invoca a cadeia RAG com os dados do paciente
        # O 'invoke' é assíncrono porque o LLM (Gemini) é chamado via rede
        generated_text = await rag_chain.ainvoke(patient_data)
        
        # 3. Retorna a resposta no formato JSON esperado
        return ActionResponse(generated_actions=generated_text)
        
    except Exception as e:
        # Captura qualquer erro durante a invocação do LLM
        print(f"Erro durante a invocação do agente: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao gerar ações: {e}"
        )

@app.get("/")
def health_check():
    return {"status": "ok", "service": "LLM Agent"}
@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "llm-agent",
        "rag": "ready"
    }
