# 🏥 Conecta+Saúde - Backend

Backend principal do sistema Conecta+Saúde, uma API REST desenvolvida com FastAPI para gerenciamento de pacientes e orquestração de serviços de Machine Learning e LLM.

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e Configuração](#-instalação-e-configuração)
- [Uso](#-uso)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [API Endpoints](#-api-endpoints)
- [Docker](#-docker)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Logging](#-logging)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)

## 🎯 Sobre o Projeto

O backend do Conecta+Saúde é responsável por:

- **Gerenciamento de Pacientes**: CRUD completo com paginação e busca
- **Autenticação e Autorização**: Sistema JWT com segurança robusta
- **Orquestração de Serviços**: Integração com serviços de ML e LLM
- **Persistência de Dados**: PostgreSQL com SQLAlchemy ORM
- **Logs Estruturados**: Sistema de logging completo para monitoramento
- **Documentação Interativa**: Swagger UI e ReDoc

## 🚀 Tecnologias

### Core
- **[FastAPI](https://fastapi.tiangolo.com/)** - Framework web moderno e rápido
- **[Python 3.11](https://www.python.org/)** - Linguagem de programação
- **[Uvicorn](https://www.uvicorn.org/)** - Servidor ASGI de alto desempenho

### Banco de Dados
- **[PostgreSQL](https://www.postgresql.org/)** - Banco de dados relacional
- **[SQLAlchemy](https://www.sqlalchemy.org/)** - ORM Python
- **[Psycopg2](https://www.psycopg.org/)** - Adaptador PostgreSQL

### Segurança
- **[Python-JOSE](https://python-jose.readthedocs.io/)** - Tokens JWT
- **[Passlib](https://passlib.readthedocs.io/)** - Hashing de senhas
- **[Bcrypt](https://github.com/pyca/bcrypt/)** - Criptografia

### Comunicação
- **[HTTPX](https://www.python-httpx.org/)** - Cliente HTTP assíncrono

### Validação
- **[Pydantic](https://docs.pydantic.dev/)** - Validação de dados e configurações

### Containerização
- **[Docker](https://www.docker.com/)** - Containerização
- **[Docker Compose](https://docs.docker.com/compose/)** - Orquestração de containers

## 🏗️ Arquitetura

O projeto segue uma arquitetura em camadas com separação de responsabilidades:

```
┌─────────────────────────────────────────┐
│           API Layer (FastAPI)           │
│  - Rotas e Endpoints                    │
│  - Middlewares                          │
│  - Exception Handlers                   │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Service Layer                   │
│  - Lógica de Negócio                    │
│  - Orquestração de Serviços Externos    │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│          CRUD Layer                     │
│  - Operações de Banco de Dados          │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      Database Layer (SQLAlchemy)        │
│  - Models e ORM                         │
│  - PostgreSQL                           │
└─────────────────────────────────────────┘
```

## 📦 Pré-requisitos

- **Python 3.11+**
- **PostgreSQL 13+** (ou Docker)
- **Git**

## ⚙️ Instalação e Configuração

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/conecta-saude-backend.git
cd conecta-saude-backend/backend
```

### 2. Crie um Ambiente Virtual

```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### 3. Instale as Dependências

```bash
pip install -r requirements.txt
```

### 4. Configure as Variáveis de Ambiente

Crie um arquivo `.env` na raiz do diretório `backend`:

```env
# Banco de Dados
DATABASE_URL=postgresql://conectsaude:admin@localhost:5432/conectasaude_db

# Segurança JWT
SECRET_KEY=sua-chave-secreta-super-segura-aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# URLs dos Microserviços
ML_SERVICE_URL=http://localhost:8083
LLM_SERVICE_URL=http://localhost:8084
```

### 5. Configure o Banco de Dados

Certifique-se de que o PostgreSQL está rodando e crie o banco de dados:

```sql
CREATE DATABASE conectasaude_db;
CREATE USER conectsaude WITH PASSWORD 'admin';
GRANT ALL PRIVILEGES ON DATABASE conectasaude_db TO conectsaude;
```

## 🎮 Uso

### Modo Desenvolvimento

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8082
```

### Modo Produção

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8082 --workers 4
```

### Acessar a Documentação

- **Swagger UI**: http://localhost:8082/docs
- **ReDoc**: http://localhost:8082/redoc
- **Health Check**: http://localhost:8082/

## 📁 Estrutura do Projeto

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                    # Aplicação principal FastAPI
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py                # Dependências (autenticação)
│   │   └── api_v1/
│   │       ├── __init__.py
│   │       ├── api.py             # Agregador de rotas
│   │       └── endpoints/
│   │           ├── __init__.py
│   │           ├── auth_api.py    # Endpoints de autenticação
│   │           └── pacientes_api.py # Endpoints de pacientes
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py              # Configurações da aplicação
│   │   ├── security.py            # Funções de segurança (JWT, hash)
│   │   ├── logging.py             # Configuração de logs
│   │   └── exception_handlers.py # Tratamento de exceções
│   ├── crud/
│   │   ├── __init__.py
│   │   ├── crud_paciente.py       # Operações CRUD de pacientes
│   │   └── crud_user.py           # Operações CRUD de usuários
│   ├── db/
│   │   ├── __init__.py
│   │   ├── base.py                # Base para models
│   │   └── session.py             # Sessão do banco de dados
│   ├── models/
│   │   ├── __init__.py
│   │   ├── paciente_models.py     # Model SQLAlchemy de paciente
│   │   └── user_models.py         # Model SQLAlchemy de usuário
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── paciente_schema.py     # Schemas Pydantic de paciente
│   │   ├── token_schema.py        # Schemas de token JWT
│   │   └── user_schema.py         # Schemas Pydantic de usuário
│   └── services/
│       ├── __init__.py
│       ├── http_client.py         # Cliente HTTP reutilizável
│       └── paciente_service.py    # Lógica de negócio e orquestração
├── logs/                          # Diretório de logs
├── docker-compose.yml             # Orquestração de containers
├── Dockerfile                     # Imagem Docker do backend
├── requirements.txt               # Dependências Python
├── DOCKER_README.md              # Documentação Docker
└── test_detection.py             # Script de teste
```

## 🔌 API Endpoints

### Autenticação

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| `POST` | `/api/v1/auth/register` | Registrar novo usuário | ❌ |
| `POST` | `/api/v1/auth/login` | Login (retorna JWT) | ❌ |
| `GET` | `/api/v1/auth/me` | Dados do usuário logado | ✅ |

### Pacientes

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| `POST` | `/api/v1/pacientes/` | Criar novo paciente | ✅ |
| `GET` | `/api/v1/pacientes/` | Listar pacientes (paginado) | ✅ |
| `GET` | `/api/v1/pacientes/{id}` | Buscar paciente por ID | ✅ |
| `PUT` | `/api/v1/pacientes/{id}` | Atualizar paciente | ✅ |
| `DELETE` | `/api/v1/pacientes/{id}` | Deletar paciente | ✅ |

### Parâmetros de Query (Listagem)

- `page`: Número da página (padrão: 1)
- `page_size`: Itens por página (padrão: 10, máx: 100)
- `search`: Busca por nome, CPF ou sintomas

### Health Check

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/` | Status da API |

## 🐳 Docker

### Docker Compose - Serviços Disponíveis

```bash
# Backend + PostgreSQL (mínimo necessário)
docker-compose up -d

# Backend + PostgreSQL + ML
docker-compose --profile ml up -d

# Backend + PostgreSQL + LLM
docker-compose --profile llm up -d

# Backend + PostgreSQL + Frontend
docker-compose --profile frontend up -d

# Todos os serviços
docker-compose --profile ml --profile llm --profile frontend up -d
```

### Gerenciamento de Containers

O projeto inclui um gerenciador Python para facilitar operações:

```bash
# Ver status dos containers
python docker_manager.py status

# Iniciar serviços
python docker_manager.py start

# Parar serviços
python docker_manager.py stop

# Ver logs
python docker_manager.py logs backend

# Rebuild
python docker_manager.py rebuild backend
```

### Portas dos Serviços

- **Backend**: 8082
- **PostgreSQL**: 5432
- **ML Service**: 8083
- **LLM Service**: 8084
- **Frontend**: 3000

## 🔐 Variáveis de Ambiente

### Configuração Local (`.env`)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# External Services
ML_SERVICE_URL=http://localhost:8083
LLM_SERVICE_URL=http://localhost:8084
```

### Configuração Docker (`.env.docker`)

```env
# Database (usar nome do serviço Docker)
DATABASE_URL=postgresql://conectsaude:admin@postgres:5432/conectasaude_db

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# External Services (usar nomes dos serviços Docker)
ML_SERVICE_URL=http://model-ml:8083
LLM_SERVICE_URL=http://service-llm:8084
```

## 📊 Logging

O sistema possui logging estruturado em múltiplos níveis:

- **api.log**: Logs gerais da aplicação
- **error.log**: Apenas erros e exceções
- **Console**: Output colorido para desenvolvimento

### Localização dos Logs

```
backend/logs/
├── api.log      # Todos os logs (INFO+)
└── error.log    # Apenas erros (ERROR+)
```

### Configuração de Log

Edite `app/core/logging.py` para personalizar:
- Níveis de log
- Formato de mensagens
- Rotação de arquivos
- Destinos de log

## 🧪 Testes

```bash
# Executar testes
pytest

# Com coverage
pytest --cov=app --cov-report=html

# Teste específico
pytest tests/test_pacientes.py
```

## 🔧 Desenvolvimento

### Convenções de Código

- **PEP 8**: Estilo de código Python
- **Type Hints**: Usar tipagem sempre que possível
- **Docstrings**: Documentar funções públicas
- **Async/Await**: Para operações I/O

### Boas Práticas

1. **Sempre use dependências injetadas** (`Depends`)
2. **Valide entrada com Pydantic schemas**
3. **Trate exceções de forma específica**
4. **Log operações importantes**
5. **Use transações de banco quando necessário**

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Checklist de PR

- [ ] Código segue PEP 8
- [ ] Testes foram adicionados/atualizados
- [ ] Documentação foi atualizada
- [ ] Logs apropriados foram adicionados
- [ ] Sem credenciais hardcoded

## 📝 Licença

Este projeto está sob a licença especificada no arquivo [LICENSE](../LICENSE).

## 👥 Equipe

Desenvolvido por Conect-SAUDE-CIN-UFPE

---

## 📚 Recursos Adicionais

- [Documentação do FastAPI](https://fastapi.tiangolo.com/)
- [SQLAlchemy Docs](https://docs.sqlalchemy.org/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [Docker Documentation](https://docs.docker.com/)

## 🆘 Suporte

Para reportar bugs ou solicitar features, abra uma [issue](https://github.com/seu-usuario/conecta-saude-backend/issues).

---

**Feito com ❤️ pela equipe Conecta+Saúde**
