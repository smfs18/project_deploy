"""
Migration: Criar tabelas para Agentes de Saúde

Adiciona as tabelas:
- agentes: Armazena dados dos agentes de saúde
- atribuicoes_pacientes: Armazena atribuições de pacientes aos agentes
- agente_paciente: Tabela de associação many-to-many

Para rodar:
python -m alembic upgrade head
"""

# Se estiver usando Alembic (recomendado)
# Criar arquivo em: back/backend/migrations/versions/XXXX_add_agentes_tables.py

# Se estiver usando SQLAlchemy direto (sem Alembic):
# Este arquivo pode ser rodado diretamente ou usar create_all

from sqlalchemy import create_engine
from app.db.base import Base
from app.models.agente_models import AgenteHealthcare, AtribuicaoPaciente, agente_paciente_association

# Importar também as outras models para que a associação funcione
from app.models.paciente_models import Paciente
from app.models.user_models import User

def create_tables():
    """
    Cria todas as tabelas necessárias.
    Pode ser chamado ao iniciar a aplicação.
    """
    from app.db.session import engine
    Base.metadata.create_all(bind=engine)
    print("✅ Tabelas criadas com sucesso!")

if __name__ == "__main__":
    create_tables()
