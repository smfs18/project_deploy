#!/usr/bin/env python3
"""
Script para executar migration SQL manualmente
Execute com: python migrations/run_migration.py
"""

import sys
from pathlib import Path

# Adicionar o diretório do projeto ao path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.db.session import engine
from sqlalchemy import text

def run_migration():
    """Executa as mudanças no banco de dados"""
    
    migration_sql = """
    -- Adicionar coluna: data_visita_planejada
    ALTER TABLE atribuicoes_pacientes
    ADD COLUMN IF NOT EXISTS data_visita_planejada TIMESTAMP WITH TIME ZONE NULL;

    -- Adicionar coluna: data_visita_realizada
    ALTER TABLE atribuicoes_pacientes
    ADD COLUMN IF NOT EXISTS data_visita_realizada TIMESTAMP WITH TIME ZONE NULL;

    -- Adicionar coluna: anotacoes_visita
    ALTER TABLE atribuicoes_pacientes
    ADD COLUMN IF NOT EXISTS anotacoes_visita TEXT NULL;

    -- Adicionar coluna: relatorio_visita (JSON)
    ALTER TABLE atribuicoes_pacientes
    ADD COLUMN IF NOT EXISTS relatorio_visita JSONB NULL;

    -- Criar índices para melhor performance
    CREATE INDEX IF NOT EXISTS idx_atribuicoes_data_visita_planejada 
    ON atribuicoes_pacientes(data_visita_planejada);

    CREATE INDEX IF NOT EXISTS idx_atribuicoes_data_visita_realizada 
    ON atribuicoes_pacientes(data_visita_realizada);
    """
    
    try:
        with engine.connect() as connection:
            # Executar cada comando SQL
            for statement in migration_sql.split(';'):
                statement = statement.strip()
                if statement:
                    print(f"Executando: {statement[:60]}...")
                    connection.execute(text(statement))
            
            connection.commit()
            print("✅ Migration executada com sucesso!")
            
            # Verificar se as colunas foram criadas
            print("\n📋 Verificando colunas criadas...")
            result = connection.execute(text("""
                SELECT column_name, data_type, is_nullable 
                FROM information_schema.columns 
                WHERE table_name = 'atribuicoes_pacientes' 
                AND column_name IN ('data_visita_planejada', 'data_visita_realizada', 'anotacoes_visita', 'relatorio_visita')
                ORDER BY ordinal_position
            """))
            
            print("\n✅ Colunas criadas:")
            for row in result:
                print(f"   - {row[0]}: {row[1]} (nullable: {row[2]})")
            
            return True
            
    except Exception as e:
        print(f"❌ Erro ao executar migration: {e}")
        return False

if __name__ == "__main__":
    success = run_migration()
    sys.exit(0 if success else 1)
