import os
import json
from pathlib import Path
from dotenv import load_dotenv
from .schemas import PatientDataForLLM # Importação corrigida (sem ponto)

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI

# Carrega as variáveis de ambiente (GEMINI_API_KEY)
load_dotenv()

# --- Caminho Corrigido (como fizemos antes) ---
CURRENT_FILE_PATH = Path(__file__).resolve()
PROJECT_ROOT = CURRENT_FILE_PATH.parent.parent
VECTOR_STORE_PATH = PROJECT_ROOT / "vector_store"
# --- Fim da Correção de Caminho ---

EMBEDDINGS_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
LLM_MODEL_NAME = "gemini-2.5-flash" 

def load_rag_chain():
    """
    Carrega e configura a cadeia RAG (Retrieval-Augmented Generation).
    """
    print("Carregando o serviço do agente LLM...")

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY não definida no .env")

    print(f"Carregando embeddings locais: {EMBEDDINGS_MODEL_NAME}...")
    embeddings = HuggingFaceEmbeddings(
        model_name=EMBEDDINGS_MODEL_NAME,
        model_kwargs={'device': 'cpu'}
    )
    
    if not VECTOR_STORE_PATH.exists():
        raise FileNotFoundError(f"Pasta '{VECTOR_STORE_PATH}' não encontrada. Rode o create_index.py primeiro.")
    
    print(f"Carregando índice FAISS de: {VECTOR_STORE_PATH}...")
    vector_store = FAISS.load_local(
        str(VECTOR_STORE_PATH), 
        embeddings, 
        allow_dangerous_deserialization=True
    )
    
    retriever = vector_store.as_retriever(search_kwargs={"k": 5})
    print("Índice carregado. Configurando o LLM...")

    llm = ChatGoogleGenerativeAI(
        model=LLM_MODEL_NAME, 
        google_api_key=api_key,
        temperature=0.3
    )

    prompt_template = """
    Você é um assistente de saúde especializado em analisar dados de pacientes
    e recomendar ações com base em protocolos clínicos oficiais.
    
    Sua tarefa é gerar um plano de ação claro e objetivo ("Medidas a serem tomadas")
    para o profissional de saúde, com base nos dados do paciente e nos protocolos fornecidos.

    **Contexto (Protocolos Relevantes):**
    {contexto}

    **Dados do Paciente (Outlier):**
    {dados_paciente}

    **Plano de Ação Gerado (Medidas a serem tomadas):**
    """
    
    prompt = ChatPromptTemplate.from_template(prompt_template)

    
    def formatar_paciente_para_prompt(patient_data: PatientDataForLLM) -> str:
        """Helper para formatar os dados do paciente como um JSON bonito."""
        data_dict = patient_data.model_dump()
        filtered_data = {k: v for k, v in data_dict.items() if v is not None}
        return json.dumps(filtered_data, indent=2, ensure_ascii=False)
    
    def formatar_contexto_dos_docs(docs):
        """Helper para juntar os pedaços de PDF encontrados."""
        return "\n---\n".join(doc.page_content for doc in docs)

    # 1. Define o primeiro passo: formatar o objeto Paciente para uma string JSON
    format_input_step = RunnablePassthrough() | formatar_paciente_para_prompt

    # 2. Define a cadeia RAG. Agora, os dois ramos (contexto e dados)
    #    receberão a *string* formatada, não o objeto.
    rag_chain = (
        format_input_step
        | {
            # O retriever agora recebe a string (JSON do paciente) para usar como busca
            "contexto": retriever | formatar_contexto_dos_docs, 
            # Os dados do paciente (a string JSON) são passados diretamente
            "dados_paciente": RunnablePassthrough() 
        }
        | prompt
        | llm
        | StrOutputParser()
    )
    
    print("✅ Agente LLM (RAG) pronto para receber requisições.")
    return rag_chain

# --- FIM DO ARQUIVO ---