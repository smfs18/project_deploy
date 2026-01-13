import os
from pathlib import Path
from dotenv import load_dotenv

from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_community.vectorstores import FAISS
# REMOVA A IMPORTAÇÃO DO GOOGLE
# from langchain_google_genai import GoogleGenerativeAIEmbeddings 
# ADICIONE A IMPORTAÇÃO DO HUGGING FACE
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Carrega as variáveis de ambiente (ainda precisamos para o AGENTE depois)
load_dotenv()

# Caminhos
PDF_PATH = Path("protocols_pdf")
VECTOR_STORE_PATH = Path("vector_store")

def create_index():
    """
    Lê os PDFs, cria os embeddings localmente e salva o índice FAISS.
    """
    
    # 1. Carregar os PDFs
    print(f"Carregando PDFs da pasta: {PDF_PATH}...")
    if not PDF_PATH.exists() or not any(PDF_PATH.glob("*.pdf")):
        print(f"Erro: Nenhum arquivo .pdf encontrado em '{PDF_PATH}'.")
        return
        
    loader = PyPDFDirectoryLoader(str(PDF_PATH))
    documents = loader.load()
    print(f"Carregados {len(documents)} documentos (páginas).")

    # 2. Quebrar os documentos em chunks
    print("Quebrando documentos em chunks...")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000, 
        chunk_overlap=150
    )
    docs_chunks = text_splitter.split_documents(documents)
    
    if not docs_chunks:
        print("Erro: Nenhum texto foi extraído dos PDFs.")
        return
        
    print(f"Total de chunks criados: {len(docs_chunks)}")

    # 3. Inicializar o modelo de Embeddings LOCAL
    print("Inicializando modelo de embeddings local (Hugging Face)...")
    # Usaremos um modelo multilíngue popular e leve
    # Ele será baixado automaticamente na primeira vez (pode levar um momento)
    model_name = "sentence-transformers/all-MiniLM-L6-v2"
    model_kwargs = {'device': 'cpu'} # Força o uso da CPU
    embeddings = HuggingFaceEmbeddings(
        model_name=model_name,
        model_kwargs=model_kwargs
    )
    print("Modelo de embeddings local carregado.")


    # 4. Criar o Vector Store (FAISS)
    # Não precisamos mais de lotes ou 'time.sleep()', pois é tudo local
    print("Criando o índice FAISS com os embeddings (isso pode levar alguns minutos)...")
    try:
        vector_store = FAISS.from_documents(docs_chunks, embeddings)
    except Exception as e:
        print(f"Erro ao criar índice local: {e}")
        return

    # 5. Salvar o índice localmente
    if not VECTOR_STORE_PATH.exists():
        VECTOR_STORE_PATH.mkdir()
        
    vector_store.save_local(str(VECTOR_STORE_PATH))
    print("---")
    print(f"✅ Sucesso! O índice foi criado e salvo em: {VECTOR_STORE_PATH}")
    print("---")


if __name__ == "__main__":
    create_index()