Serviço de Classificação (ML) - Conecta+Saúde
Sobre o Projeto
Este repositório contém o microsserviço de Machine Learning do projeto Conecta+Saúde. Sua única responsabilidade é classificar os dados de um paciente e retornar se ele é considerado um caso atípico (outlier) ou não.

Desenvolvido em Python com o framework FastAPI, este serviço:

Carrega um modelo de classificação pré-treinado (arquivo .pkl).

Expõe um endpoint POST /classify que recebe os dados de um paciente em formato JSON.

Retorna uma resposta simples indicando se o paciente é um outlier ("is_outlier": true/false).

🛠️ Tecnologias Utilizadas
Python: Linguagem de programação principal.

FastAPI: Micro-framework web de alta performance para criar APIs.

Scikit-learn: Para carregar e utilizar o modelo de ML.

Pydantic: Para validação de dados.

Docker: Para containerização da aplicação.

🚀 Como Executar
Este serviço é projetado para ser executado em conjunto com o backend através do Docker Compose na raiz do projeto. Para instruções detalhadas de como rodar o ambiente completo, consulte o arquivo BUILD.md.

🤝 Contribuição
Contribuições são muito bem-vindas! Por favor, leia nosso GUIA DE CONTRIBUIÇÃO para saber como participar.