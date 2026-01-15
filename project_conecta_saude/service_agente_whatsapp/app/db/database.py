from pymongo import MongoClient
from pymongo.collection import Collection
import os
from dotenv import load_dotenv

load_dotenv()

class Database:
    """
    Gerenciador de conexão com MongoDB para armazenar sessões do WhatsApp.
    Armazena: conversas, dados coletados, status de emergência.
    """
    def __init__(self):
        mongo_uri = os.getenv("MONGO_URI", "mongodb://mongo:27017/")
        database_name = os.getenv("MONGO_DB_NAME", "whatsapp_agent_db")
        
        self.client = MongoClient(mongo_uri)
        self.db = self.client[database_name]
        self.sessions: Collection = self.db["sessions"]
        
        # Cria índices para otimização
        self.sessions.create_index("session_id", unique=True)
        self.sessions.create_index("patient_email")
    
    def find_one(self, query: dict):
        """Busca uma sessão."""
        return self.sessions.find_one(query)
    
    def update_one(self, query: dict, update: dict, upsert: bool = False):
        """Atualiza ou cria uma sessão."""
        return self.sessions.update_one(query, update, upsert=upsert)
    
    def delete_one(self, query: dict):
        """Remove uma sessão."""
        return self.sessions.delete_one(query)


_database_instance = None

def get_database() -> Database:
    """Retorna uma instância singleton do banco de dados."""
    global _database_instance
    if _database_instance is None:
        _database_instance = Database()
    return _database_instance
