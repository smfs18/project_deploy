import os
import httpx
from typing import Optional, Dict, Any
from dotenv import load_dotenv

load_dotenv()


class BackendClient:
    """
    Cliente para comunicação com o backend (FastAPI) para operações CRUD de pacientes.
    """
    def __init__(self):
        self.base_url = os.getenv("BACKEND_URL", "http://backend:8000/api/v1")
        self.timeout = 30.0
    
    async def get_patient_by_email(self, email: str, token: str) -> Optional[Dict[str, Any]]:
        """
        Busca um paciente pelo email.
        Retorna os dados do paciente ou None se não encontrado.
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/pacientes/",
                    params={"search": email, "page": 1, "page_size": 1},
                    headers={"Authorization": f"Bearer {token}"}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    items = data.get("items", [])
                    if items:
                        # Retorna o primeiro paciente encontrado com o email
                        for patient in items:
                            if patient.get("email") == email:
                                return patient
                return None
        except Exception as e:
            print(f"❌ Erro ao buscar paciente por email: {e}")
            return None
    
    async def update_patient(self, patient_id: int, data: Dict[str, Any], token: str) -> Optional[Dict[str, Any]]:
        """
        Atualiza os dados de um paciente.
        Retorna os dados atualizados ou None se houver erro.
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.put(
                    f"{self.base_url}/pacientes/{patient_id}",
                    json=data,
                    headers={"Authorization": f"Bearer {token}"}
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    print(f"❌ Erro ao atualizar paciente: {response.status_code} - {response.text}")
                    return None
        except Exception as e:
            print(f"❌ Erro ao atualizar paciente: {e}")
            return None


backend_client = BackendClient()
