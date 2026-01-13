Guia de Build - Serviço de ML Conecta+Saúde
Este documento descreve como construir e executar o serviço de Machine Learning localmente para fins de desenvolvimento e teste.

🐳 Método 1: Execução com Docker (Recomendado)
A forma mais simples de rodar o projeto é usar o arquivo docker-compose.yml que está na pasta raiz do projeto (Conecta-Saude-Projeto).

Navegue até a pasta raiz do projeto.

Execute o Docker Compose:

docker-compose up --build

O serviço de ML estará acessível em http://localhost:8000.

👨‍💻 Método 2: Execução Manual (Desenvolvimento Local)
Use este método para rodar o serviço de forma isolada.

Pré-requisitos:

Python (v3.10 ou superior)

Pip (gerenciador de pacotes Python)

Passos:

Navegue até a pasta model-LLM:

cd model-LLM

Crie e Ative um Ambiente Virtual (Recomendado):

# Cria o ambiente virtual
python -m venv venv

# Ativa o ambiente no Windows
.\venv\Scripts\activate

# Ativa o ambiente no Linux/macOS
source venv/bin/activate

Instale as dependências:

pip install -r requirements.txt

Execute o servidor FastAPI com Uvicorn:

uvicorn app.main:app --reload

O servidor iniciará e ficará observando alterações nos arquivos.