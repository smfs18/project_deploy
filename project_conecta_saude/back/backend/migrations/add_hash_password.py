import sys
import os

# --- SOLUÇÃO PARA O ERRO DE IMPORTAÇÃO ---
# Adiciona o diretório atual (raiz do backend) ao path do Python
sys.path.append(os.getcwd())

from sqlalchemy import text
from app.db.session import engine, SessionLocal

def upgrade_agentes_table():
    """
    Adiciona a coluna hashed_password na tabela agentes.
    """
    print("--- INICIANDO MIGRAÇÃO DE COLUNA ---")
    
    # SQL compatível com PostgreSQL e SQLite
    sql = text("ALTER TABLE agentes ADD COLUMN hashed_password VARCHAR;")
    
    db = SessionLocal()
    try:
        print("Executando: ALTER TABLE agentes ADD COLUMN hashed_password...")
        db.execute(sql)
        db.commit()
        print("✅ Coluna 'hashed_password' adicionada com sucesso!")
    except Exception as e:
        db.rollback()
        # Se a coluna já existir, ele avisa mas não trava
        if "already exists" in str(e).lower() or "duplicate column" in str(e).lower():
            print("ℹ️ A coluna 'hashed_password' já existe no banco.")
        else:
            print(f"❌ Erro ao executar migração: {e}")
    finally:
        db.close()
        print("--- PROCESSO CONCLUÍDO ---")

if __name__ == "__main__":
    upgrade_agentes_table()