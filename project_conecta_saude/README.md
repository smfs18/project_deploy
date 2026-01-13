# 🏥 Conecta+Saúde

Sistema de apoio à Secretaria de Saúde para acompanhamento de pacientes com diabetes e/ou hipertensão, utilizando IA para classificação de pacientes e geração de planos de cuidados.

## 📚 Estrutura do Projeto

O projeto está dividido em três componentes principais:

```
project_conecta_saude/
├── frontend/         # Interface web em React
├── backend/          # API FastAPI
└── model-LLM/        # Serviço de IA
```

## 🚀 Como Executar o Projeto

### Pré-requisitos

- Docker e Docker Compose
- Node.js (v18+)
- Python 3.11+

### 1. Configuração do Backend

```bash
cd backend

# Copiar arquivo de configuração
cp .env.example .env

# Editar .env com suas configurações
# DATABASE_URL=postgresql://conecta_saude:strong_password_here@db:5432/conecta_saude_db
# JWT_SECRET=your_jwt_secret_key_here

# Iniciar os serviços com Docker
docker-compose up -d
```

O backend estará disponível em:
- API: http://localhost:8082
- Documentação: http://localhost:8082/docs

### 2. Configuração do Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Iniciar em modo desenvolvimento
npm run dev
```

O frontend estará disponível em:
- http://localhost:5173

### 3. Serviço de IA (model-LLM)

O serviço de IA é iniciado automaticamente com o docker-compose do backend.

## 📝 Uso Inicial

1. Acesse http://localhost:5173
2. Faça login com as credenciais:
   - Email: admin@conectsaude.com
   - Senha: admin123
3. Ou registre um novo usuário através da interface

## 🛠️ Desenvolvimento

### Estrutura de Branches

- `main`: Versão estável
- `development`: Branch de desenvolvimento
- Features: `feature/nome-da-feature`

### Workflow de Desenvolvimento

1. Clone o repositório
2. Crie uma branch para sua feature
3. Faça suas alterações
4. Teste localmente
5. Envie um Pull Request

### Comandos Úteis

```bash
# Parar todos os serviços
docker-compose down

# Reconstruir serviços
docker-compose up --build -d

# Logs dos containers
docker-compose logs -f

# Limpar volumes e containers
docker-compose down -v
```

## 🔧 Troubleshooting

### Problemas Comuns

1. **Erro de conexão com o banco:**
   - Verifique se o PostgreSQL está rodando
   - Confirme as credenciais no .env

2. **Erro no frontend:**
   - Verifique se o backend está acessível
   - Confirme a URL da API no frontend

3. **Problemas com Docker:**
   - Pare todos os containers: `docker-compose down`
   - Remova volumes: `docker-compose down -v`
   - Reconstrua: `docker-compose up --build -d`

## 📚 Documentação Adicional

- [README do Backend](backend/README.md)
- [README do Frontend](frontend/README.md)
- [README do Modelo IA](model-LLM/README.md)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
