"""
Configuração do banco de dados
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy.pool import NullPool
from app.config import settings

# Base para modelos ORM
Base = declarative_base()

# Engine para operações async
engine = create_async_engine(
    settings.database_url.replace("postgresql://", "postgresql+asyncpg://"),
    echo=settings.database_echo,
    poolclass=NullPool,
)

# Session factory
async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

async def get_db() -> AsyncSession:
    """Dependency para obter sessão do banco."""
    async with async_session() as session:
        yield session

async def init_db():
    """Inicializa o banco de dados."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
