from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user_models import User # Necessário para a dependência
from app.schemas import paciente_schema
from app.services import paciente_service
from app.services.geocoding_service import GeocodingService
from app.crud import crud_paciente as crud

router = APIRouter()

@router.post(
    "/", 
    response_model=paciente_schema.Paciente,
    status_code=status.HTTP_201_CREATED
)
async def create_paciente_endpoint(
    *,
    db: Session = Depends(get_db),
    paciente_in: paciente_schema.PacienteCreate, # O JSON do frontend
    current_user: User = Depends(get_current_user) # Rota protegida
):
    """
    Cria um novo paciente e dispara o fluxo de orquestração (ML/LLM).
    Corresponde ao 'createPaciente' do api.ts.
    """
    db_paciente = await paciente_service.create_paciente_with_orchestration(
        db, paciente_in=paciente_in
    )
    return db_paciente


@router.get(
    "/",
    response_model=paciente_schema.PacienteListResponse
)
def list_pacientes_endpoint(
    *,
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1), 
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user) # Rota protegida
):
    """
    Lista pacientes com paginação e busca.
    Corresponde ao 'fetchPacientes' do api.ts.
    """
    return paciente_service.get_pacientes_paginados(
        db, page=page, page_size=page_size, search=search
    )


@router.get("/{id}", response_model=paciente_schema.Paciente)
def get_paciente_by_id_endpoint(
    *,
    db: Session = Depends(get_db),
    id: int,
    current_user: User = Depends(get_current_user) # Rota protegida
):
    """
    Busca um único paciente pelo ID.
    Corresponde ao 'getPacienteById' do api.ts.
    """
    paciente = crud.get_by_id(db, id=id)
    if not paciente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paciente não encontrado",
        )
    return paciente


@router.put("/{id}", response_model=paciente_schema.Paciente)
async def update_paciente_endpoint(
    *,
    db: Session = Depends(get_db),
    id: int,
    paciente_in: paciente_schema.PacienteCreate,
    current_user: User = Depends(get_current_user)
):
    """
    Atualiza um paciente e re-executa o fluxo de orquestração (ML/LLM).
    Corresponde ao 'updatePaciente' do api.ts.
    """
    paciente = await paciente_service.update_paciente_with_orchestration(
        db, id=id, paciente_in=paciente_in
    )
    if not paciente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paciente não encontrado",
        )
    return paciente


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_paciente_endpoint(
    *,
    db: Session = Depends(get_db),
    id: int,
    current_user: User = Depends(get_current_user)
):
    """
    Remove um paciente.
    Corresponde ao 'deletePaciente' do api.ts.
    """
    paciente = crud.get_by_id(db, id=id)
    if not paciente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paciente não encontrado",
        )
    crud.remove(db, id=id)


@router.post("/{id}/confirm", response_model=paciente_schema.Paciente)
def confirm_patient_classification_endpoint(
    *,
    db: Session = Depends(get_db),
    id: int,
    is_outlier_confirmed: bool,
    professional_notes: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """
    Registra a confirmação do profissional sobre a classificação do paciente.
    Este endpoint é usado quando o modelo tem baixa confiança e solicita confirmação.
    Os dados são armazenados para retreinamento futuro do modelo.
    """
    confirmation = paciente_schema.ProfessionalConfirmation(
        paciente_id=id,
        is_outlier_confirmed=is_outlier_confirmed,
        professional_notes=professional_notes
    )
    
    try:
        paciente = paciente_service.confirm_patient_classification(
            db, confirmation=confirmation
        )
        return paciente
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.get("/retraining/stats", response_model=Dict[str, Any])
def get_retraining_stats_endpoint(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retorna estatísticas sobre dados disponíveis para retreinamento do modelo.
    Útil para monitorar quando o modelo precisa ser retreinado.
    """
    return paciente_service.get_retraining_stats(db)


@router.get("/cep/{cep}", response_model=Dict[str, Any])
async def get_address_from_cep(
    *,
    cep: str,
    current_user: User = Depends(get_current_user)
):
    """
    Busca endereço e coordenadas a partir de um CEP usando BrasilAPI.
    """
    result = await GeocodingService.get_coordinates_from_cep(cep)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CEP não encontrado ou inválido",
        )
    
    latitude, longitude, endereco = result
    return {
        "cep": cep,
        "endereco": endereco,
        "latitude": latitude,
        "longitude": longitude
    }


@router.get("/mapa/pacientes", response_model=List[Dict[str, Any]])
def get_pacientes_mapa(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retorna lista de pacientes com coordenadas para visualização no mapa.
    """
    pacientes = crud.get_all_with_coordinates(db)
    
    return [
        {
            "id": p.id,
            "nome": p.nome,
            "latitude": p.latitude,
            "longitude": p.longitude,
            "status_saude": "Crítico" if p.is_outlier else "Estável",
            "is_outlier": p.is_outlier
        }
        for p in pacientes
        if p.latitude is not None and p.longitude is not None
    ]