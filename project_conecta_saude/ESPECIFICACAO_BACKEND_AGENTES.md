# 📊 Modelos de Dados - Backend (FastAPI)

## 📋 Pré-requisitos

Este documento define os modelos que o backend deve implementar para suportar o sistema de agentes de saúde.

---

## 1️⃣ Modelos de Autenticação

### AgenteLoginRequest
```python
from pydantic import BaseModel, EmailStr

class AgenteLoginRequest(BaseModel):
    """Requisição de login do agente"""
    email: EmailStr
    senha: str

    class Config:
        example = {
            "email": "agente@example.com",
            "senha": "senha123"
        }
```

### AgenteLoginResponse
```python
class AgenteLoginResponse(BaseModel):
    """Resposta de login bem-sucedido"""
    access_token: str
    token_type: str = "bearer"
    agente_id: int
    agente_nome: str
    email: str

    class Config:
        example = {
            "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "token_type": "bearer",
            "agente_id": 1,
            "agente_nome": "João da Silva",
            "email": "agente@example.com"
        }
```

---

## 2️⃣ Modelos de Agente

### Agente (Database Model)
```python
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime

class Agente:
    """Modelo de banco de dados para agente"""
    id: int = Column(Integer, primary_key=True)
    nome: str = Column(String(255), nullable=False)
    email: str = Column(String(255), unique=True, nullable=False)
    telefone: str = Column(String(20), nullable=True)
    cpf: str = Column(String(20), unique=True, nullable=False)
    tipo_profissional: str = Column(String(100), nullable=False)
    numero_registro: str = Column(String(100), nullable=True)
    ubs_nome: str = Column(String(255), nullable=True)
    endereco: str = Column(String(255), nullable=True)
    senha_hash: str = Column(String(255), nullable=False)  # Hash bcrypt
    ativo: bool = Column(Boolean, default=True)
    created_at: datetime = Column(DateTime, default=datetime.utcnow)
    updated_at: datetime = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

### AgenteResponse (Pydantic)
```python
from datetime import datetime

class AgenteResponse(BaseModel):
    """Resposta com dados do agente"""
    id: int
    nome: str
    email: str
    telefone: Optional[str] = None
    cpf: str
    tipo_profissional: str
    numero_registro: Optional[str] = None
    ubs_nome: Optional[str] = None
    endereco: Optional[str] = None
    ativo: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
```

---

## 3️⃣ Modelos de Pacientes Atribuídos

### AtribuicaoPaciente (Database Model)
```python
from sqlalchemy import Column, Integer, ForeignKey, Boolean, DateTime, JSON, String

class AtribuicaoPaciente:
    """Modelo de atribuição de paciente a agente"""
    id: int = Column(Integer, primary_key=True)
    agente_id: int = Column(Integer, ForeignKey("agente.id"), nullable=False)
    paciente_id: int = Column(Integer, ForeignKey("paciente.id"), nullable=False)
    nome_paciente: str = Column(String(255), nullable=False)  # Cache do nome
    endereco: str = Column(String(255), nullable=True)
    pressao_sistolica: int = Column(Integer, nullable=True)
    pressao_diastolica: int = Column(Integer, nullable=True)
    glicemia: int = Column(Integer, nullable=True)
    informacoes_adicionais: str = Column(String(1000), nullable=True)
    notas_gestor: str = Column(String(1000), nullable=True)
    ativo: bool = Column(Boolean, default=True)
    data_atribuicao: datetime = Column(DateTime, default=datetime.utcnow)
    data_conclusao: Optional[datetime] = Column(DateTime, nullable=True)
    created_at: datetime = Column(DateTime, default=datetime.utcnow)
    updated_at: datetime = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

### PacienteAtribuidoResponse
```python
class PacienteAtribuidoResponse(BaseModel):
    """Resposta com dados do paciente atribuído"""
    id: int
    nome: str
    endereco: Optional[str] = None
    pressao_sistolica: Optional[int] = None
    pressao_diastolica: Optional[int] = None
    glicemia: Optional[int] = None
    informacoes_adicionais: Optional[str] = None

    class Config:
        from_attributes = True
```

---

## 4️⃣ Modelos de Áudio e Visitas

### VisitaAudio (Database Model)
```python
from sqlalchemy import Column, Integer, String, DateTime, Text

class VisitaAudio:
    """Modelo de áudio de visita"""
    id: int = Column(Integer, primary_key=True)
    agente_id: int = Column(Integer, ForeignKey("agente.id"), nullable=False)
    atribuicao_paciente_id: int = Column(Integer, ForeignKey("atribuicao_paciente.id"), nullable=False)
    paciente_id: int = Column(Integer, ForeignKey("paciente.id"), nullable=False)
    
    # Caminho do arquivo de áudio
    audio_url: str = Column(String(500), nullable=False)
    audio_duracao_segundos: int = Column(Integer, nullable=True)
    
    # Transcrição (processada pela IA)
    transcricao: Optional[str] = Column(Text, nullable=True)
    
    # Sumarização (processada pela IA)
    resumo: Optional[str] = Column(Text, nullable=True)
    observacoes_ia: Optional[str] = Column(Text, nullable=True)
    
    # Status
    status: str = Column(String(50), default="pendente")  # pendente, processando, concluido, erro
    erro_processamento: Optional[str] = Column(String(500), nullable=True)
    
    # Metadata
    created_at: datetime = Column(DateTime, default=datetime.utcnow)
    updated_at: datetime = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    processado_em: Optional[datetime] = Column(DateTime, nullable=True)
```

### VisitaAudioResponse
```python
class VisitaAudioResponse(BaseModel):
    """Resposta com dados da visita/áudio"""
    id: int
    agente_id: int
    paciente_id: int
    audio_url: str
    transcricao: Optional[str] = None
    resumo: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
```

### AudioUploadRequest
```python
class AudioUploadRequest(BaseModel):
    """Requisição de upload de áudio"""
    paciente_id: int

    # Nota: O arquivo virá como multipart/form-data
    # arquivo: UploadFile
```

---

## 5️⃣ Endpoints Necessários

### Autenticação

#### POST `/api/v1/auth/agente/login`
```python
@router.post("/auth/agente/login", response_model=AgenteLoginResponse)
async def login_agente(request: AgenteLoginRequest, db: Session = Depends(get_db)):
    """
    Autentica um agente de saúde com email e senha
    
    Validações:
    - Email deve existir na base
    - Senha deve corresponder ao hash
    - Agente deve estar ativo
    
    Retorna:
    - access_token: JWT token válido por 24h
    - agente_id e informações básicas
    """
    pass
```

---

### Informações do Agente

#### GET `/api/v1/agentes/me`
```python
@router.get("/agentes/me", response_model=AgenteResponse)
async def get_agente_info(
    current_agente: Agente = Depends(get_current_agente),
    db: Session = Depends(get_db)
):
    """
    Retorna informações do agente autenticado
    
    Headers:
    - Authorization: Bearer <token>
    """
    pass
```

---

### Pacientes Atribuídos

#### GET `/api/v1/agentes/pacientes-atribuidos`
```python
@router.get("/agentes/pacientes-atribuidos", response_model=List[PacienteAtribuidoResponse])
async def get_pacientes_atribuidos(
    current_agente: Agente = Depends(get_current_agente),
    db: Session = Depends(get_db)
):
    """
    Retorna lista de pacientes atribuídos ao agente
    
    Filtros:
    - Apenas atribuições ativas (ativo=True)
    - Apenas pacientes não conclusos
    
    Retorna:
    - Lista de PacienteAtribuidoResponse
    """
    pass
```

---

### Upload de Áudio

#### POST `/api/v1/agentes/upload-audio-visita`
```python
@router.post("/agentes/upload-audio-visita", response_model=VisitaAudioResponse)
async def upload_audio_visita(
    paciente_id: int = Form(...),
    audio: UploadFile = File(...),
    current_agente: Agente = Depends(get_current_agente),
    db: Session = Depends(get_db)
):
    """
    Recebe upload de áudio de visita
    
    Validações:
    - Arquivo deve ser .m4a ou .mp3
    - Paciente deve estar atribuído ao agente
    - Tamanho máximo: 50MB
    
    Processo:
    1. Salvar arquivo em storage
    2. Criar registro VisitaAudio com status "pendente"
    3. Enfileirar para processamento de áudio
    4. Retornar resposta com status
    
    Headers:
    - Authorization: Bearer <token>
    - Content-Type: multipart/form-data
    """
    pass
```

---

### Histórico de Visitas

#### GET `/api/v1/agentes/historico-visitas`
```python
@router.get("/agentes/historico-visitas", response_model=List[VisitaAudioResponse])
async def get_historico_visitas(
    skip: int = Query(0),
    limit: int = Query(20),
    current_agente: Agente = Depends(get_current_agente),
    db: Session = Depends(get_db)
):
    """
    Retorna histórico de visitas/áudios do agente
    
    Query Parameters:
    - skip: Número de registros para pular (paginação)
    - limit: Número máximo de registros a retornar
    
    Retorna:
    - Lista ordenada por data (mais recentes primeiro)
    - Com status de processamento
    """
    pass
```

---

## 6️⃣ Fluxo de Processamento de Áudio

```
1. Agente faz upload do áudio
   ↓
2. Backend salva arquivo
   ↓
3. Backend cria registro VisitaAudio com status "pendente"
   ↓
4. Áudio é enfileirado para processamento (Celery/RQ)
   ↓
5. Serviço de transcrição (Speech-to-Text)
   → Áudio → Transcrição
   ↓
6. Serviço de sumarização (LLM)
   → Transcrição → Resumo
   ↓
7. Registro é atualizado:
   - status = "concluido"
   - transcricao = [resultado]
   - resumo = [resultado]
   - processado_em = [timestamp]
   ↓
8. Notificação enviada para gestor
   ↓
9. Gestor pode visualizar resumo
```

---

## 7️⃣ Segurança

### Senha
```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_senha(senha: str) -> str:
    """Hash seguro com bcrypt + salt"""
    return pwd_context.hash(senha)

def verify_senha(senha: str, senha_hash: str) -> bool:
    """Verifica se a senha corresponde ao hash"""
    return pwd_context.verify(senha, senha_hash)
```

### JWT Token
```python
from jose import JWTError, jwt
from datetime import datetime, timedelta

SECRET_KEY = "sua-chave-secreta-muito-segura"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

def create_access_token(agente_id: int) -> str:
    """Cria JWT token com expiração de 24h"""
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    payload = {
        "sub": str(agente_id),
        "exp": expire,
        "type": "agente"
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_agente(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Agente:
    """Valida token JWT e retorna agente"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        agente_id = int(payload.get("sub"))
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")
    
    agente = db.query(Agente).filter(Agente.id == agente_id).first()
    if not agente:
        raise HTTPException(status_code=401, detail="Agente não encontrado")
    
    return agente
```

---

## 8️⃣ Validações

### Email
- Deve ser um email válido
- Deve ser único na base de dados
- Sensível a maiúsculas/minúsculas (case-insensitive)

### CPF
- Deve ter 11 dígitos
- Deve ser único na base de dados
- Pode incluir ou não formatação (123.456.789-00 ou 12345678900)

### Senha
- Mínimo 6 caracteres
- Hash com bcrypt + salt (não armazenar em texto plano!)

### Arquivo de Áudio
- Formatos aceitos: .m4a, .mp3, .wav
- Tamanho máximo: 50MB
- Duração máxima: 10 minutos

---

## 9️⃣ Exemplo de Chamada de API

### JavaScript/TypeScript (Frontend)
```javascript
// Login
const loginResponse = await fetch('http://localhost:8082/api/v1/auth/agente/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'agente@example.com',
    senha: 'senha123'
  })
});

const { access_token, agente_id } = await loginResponse.json();
localStorage.setItem('agente_token', access_token);

// Buscar pacientes
const pacientesResponse = await fetch('http://localhost:8082/api/v1/agentes/pacientes-atribuidos', {
  headers: {
    'Authorization': `Bearer ${access_token}`
  }
});

const pacientes = await pacientesResponse.json();
```

### Python (Backend Test)
```python
import requests

BASE_URL = "http://localhost:8082"

# Login
response = requests.post(f"{BASE_URL}/api/v1/auth/agente/login", json={
    "email": "agente@example.com",
    "senha": "senha123"
})

token = response.json()["access_token"]

# Buscar pacientes
response = requests.get(
    f"{BASE_URL}/api/v1/agentes/pacientes-atribuidos",
    headers={"Authorization": f"Bearer {token}"}
)

pacientes = response.json()
```

---

## 🔟 Checklist de Implementação

- [ ] Model `Agente` com campos completos
- [ ] Model `AtribuicaoPaciente` com relacionamentos
- [ ] Model `VisitaAudio` para armazenar áudios
- [ ] Hash seguro de senha com bcrypt
- [ ] JWT token generation e validation
- [ ] Endpoint de login com validações
- [ ] Endpoint GET /me com autenticação
- [ ] Endpoint de pacientes atribuídos
- [ ] Endpoint de upload de áudio
- [ ] Endpoint de histórico de visitas
- [ ] Migrations de banco de dados
- [ ] Testes unitários
- [ ] Tratamento de erros completo
- [ ] Documentação OpenAPI/Swagger

---

**Documento Base:** 4 de janeiro de 2026  
**Status:** Pendente de implementação no backend  
**Próxima Ação:** Implementar modelos e endpoints conforme descrito
