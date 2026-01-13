from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core import security
from app.db.session import get_db
from app import crud
from app.models.user_models import User
from app.models.agente_models import AgenteHealthcare # Importe o modelo de Agentes

# Altere o tokenUrl para o caminho base da sua API se necessário
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
):
    """
    Dependência para obter o usuário logado (Gestor ou Agente) a partir do token JWT.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possível validar as credenciais",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # 1. Decodifica o token
    payload = security.decode_access_token(token)
    if payload is None:
        raise credentials_exception
        
    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception
    
    # 2. Busca o usuário no banco (Tenta primeiro nos Gestores)
    user = crud.get_by_email(db, email=email)
    
    # 3. SE não achar na tabela de Gestores, busca na tabela de Agentes
    if user is None:
        user = db.query(AgenteHealthcare).filter(AgenteHealthcare.email == email).first()
        
    if user is None:
        raise credentials_exception
        
    return user