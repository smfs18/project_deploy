from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import Optional, List
from app.models.agente_models import AgenteHealthcare, AtribuicaoPaciente
from app.schemas import agente_schema


# ============================================
# CRUD - AGENTE HEALTHCARE
# ============================================

def create_agente(db: Session, agente_in: agente_schema.AgenteCreate, hashed_password: str) -> AgenteHealthcare:
    """Cria um novo agente de saúde"""
    db_agente = AgenteHealthcare(
        nome=agente_in.nome,
        email=agente_in.email,
        telefone=agente_in.telefone,
        cpf=agente_in.cpf,
        tipo_profissional=agente_in.tipo_profissional,
        numero_registro=agente_in.numero_registro,
        ubs_nome=agente_in.ubs_nome,
        endereco=agente_in.endereco,
        ativo=agente_in.ativo,
        hashed_password=hashed_password
    )
    db.add(db_agente)
    db.commit()
    db.refresh(db_agente)
    return db_agente


def get_agente_by_id(db: Session, agente_id: int) -> Optional[AgenteHealthcare]:
    """Busca agente por ID"""
    return db.query(AgenteHealthcare).filter(AgenteHealthcare.id == agente_id).first()


def get_agente_by_email(db: Session, email: str) -> Optional[AgenteHealthcare]:
    """Busca agente por email"""
    return db.query(AgenteHealthcare).filter(AgenteHealthcare.email == email).first()


def get_agente_by_cpf(db: Session, cpf: str) -> Optional[AgenteHealthcare]:
    """Busca agente por CPF"""
    return db.query(AgenteHealthcare).filter(AgenteHealthcare.cpf == cpf).first()


def get_agentes(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    ativo_apenas: bool = True
) -> tuple[List[AgenteHealthcare], int]:
    """
    Lista agentes com paginação e filtros.
    
    Args:
        db: Sessão do banco
        skip: Número de registros a pular
        limit: Limite de registros a retornar
        search: Termo de busca (nome, email, cpf)
        ativo_apenas: Se deve retornar apenas agentes ativos
    
    Returns:
        Tupla (lista de agentes, total de registros)
    """
    query = db.query(AgenteHealthcare)
    
    if ativo_apenas:
        query = query.filter(AgenteHealthcare.ativo == True)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (AgenteHealthcare.nome.ilike(search_term)) |
            (AgenteHealthcare.email.ilike(search_term)) |
            (AgenteHealthcare.cpf.ilike(search_term))
        )
    
    total = query.count()
    agentes = query.offset(skip).limit(limit).all()
    
    return agentes, total


def update_agente(
    db: Session,
    agente_id: int,
    agente_in: agente_schema.AgenteUpdate
) -> Optional[AgenteHealthcare]:
    """Atualiza um agente de saúde"""
    db_agente = get_agente_by_id(db, agente_id)
    if not db_agente:
        return None
    
    update_data = agente_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_agente, field, value)
    
    db.add(db_agente)
    db.commit()
    db.refresh(db_agente)
    return db_agente


def delete_agente(db: Session, agente_id: int) -> bool:
    """Deleta um agente de saúde"""
    db_agente = get_agente_by_id(db, agente_id)
    if not db_agente:
        return False
    
    db.delete(db_agente)
    db.commit()
    return True


def desativar_agente(db: Session, agente_id: int) -> Optional[AgenteHealthcare]:
    """Desativa um agente sem deletar (soft delete)"""
    db_agente = get_agente_by_id(db, agente_id)
    if not db_agente:
        return None
    
    db_agente.ativo = False
    db.add(db_agente)
    db.commit()
    db.refresh(db_agente)
    return db_agente


# ============================================
# CRUD - ATRIBUIÇÃO PACIENTE
# ============================================

def create_atribuicao_paciente(
    db: Session,
    atribuicao_in: agente_schema.AtribuicaoPacienteCreate
) -> AtribuicaoPaciente:
    """Cria uma nova atribuição de paciente a um agente"""
    db_atribuicao = AtribuicaoPaciente(
        agente_id=atribuicao_in.agente_id,
        paciente_id=atribuicao_in.paciente_id,
        nome_paciente=atribuicao_in.nome_paciente or "",
        localizacao=atribuicao_in.localizacao,
        informacoes_clinicas=atribuicao_in.informacoes_clinicas,
        notas_gestor=atribuicao_in.notas_gestor,
    )
    db.add(db_atribuicao)
    db.commit()
    db.refresh(db_atribuicao)
    return db_atribuicao


def get_atribuicao_by_id(db: Session, atribuicao_id: int) -> Optional[AtribuicaoPaciente]:
    """Busca atribuição por ID"""
    return db.query(AtribuicaoPaciente).filter(AtribuicaoPaciente.id == atribuicao_id).first()


def get_atribuicoes_por_agente(
    db: Session,
    agente_id: int,
    ativo_apenas: bool = True
) -> List[AtribuicaoPaciente]:
    """Busca todas as atribuições de um agente"""
    query = db.query(AtribuicaoPaciente).filter(AtribuicaoPaciente.agente_id == agente_id)
    
    if ativo_apenas:
        query = query.filter(AtribuicaoPaciente.ativo == True)
    
    return query.order_by(desc(AtribuicaoPaciente.data_atribuicao)).all()


def get_atribuicoes_por_paciente(
    db: Session,
    paciente_id: int,
    ativo_apenas: bool = True
) -> List[AtribuicaoPaciente]:
    """Busca todas as atribuições de um paciente"""
    query = db.query(AtribuicaoPaciente).filter(AtribuicaoPaciente.paciente_id == paciente_id)
    
    if ativo_apenas:
        query = query.filter(AtribuicaoPaciente.ativo == True)
    
    return query.all()


def update_atribuicao_paciente(
    db: Session,
    atribuicao_id: int,
    atribuicao_in: agente_schema.AtribuicaoPacienteUpdate
) -> Optional[AtribuicaoPaciente]:
    """Atualiza uma atribuição de paciente"""
    db_atribuicao = get_atribuicao_by_id(db, atribuicao_id)
    if not db_atribuicao:
        return None
    
    update_data = atribuicao_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_atribuicao, field, value)
    
    db.add(db_atribuicao)
    db.commit()
    db.refresh(db_atribuicao)
    return db_atribuicao


def delete_atribuicao_paciente(db: Session, atribuicao_id: int) -> bool:
    """Deleta uma atribuição de paciente"""
    db_atribuicao = get_atribuicao_by_id(db, atribuicao_id)
    if not db_atribuicao:
        return False
    
    db.delete(db_atribuicao)
    db.commit()
    return True


def desativar_atribuicao_paciente(db: Session, atribuicao_id: int) -> Optional[AtribuicaoPaciente]:
    """Desativa uma atribuição (marca como concluída)"""
    db_atribuicao = get_atribuicao_by_id(db, atribuicao_id)
    if not db_atribuicao:
        return None
    
    from datetime import datetime
    from sqlalchemy import func
    
    db_atribuicao.ativo = False
    db_atribuicao.data_conclusao = func.now()
    
    db.add(db_atribuicao)
    db.commit()
    db.refresh(db_atribuicao)
    return db_atribuicao
