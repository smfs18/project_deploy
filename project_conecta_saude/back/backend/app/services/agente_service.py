from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from app.crud import crud_agente
from app.schemas import agente_schema
from fastapi import HTTPException, status
from app.core import security
from app.db.session import SessionLocal
from datetime import datetime

class AgenteService:
    """Serviço para operações relacionadas a agentes de saúde"""
    
    @staticmethod
    def criar_agente(db: Session, agente_in: agente_schema.AgenteCreate) -> agente_schema.Agente:
        # 1. Verificações de duplicidade
        if crud_agente.get_agente_by_email(db, agente_in.email):
            raise HTTPException(status_code=400, detail="Email já cadastrado")
        
        if crud_agente.get_agente_by_cpf(db, agente_in.cpf):
            raise HTTPException(status_code=400, detail="CPF já cadastrado")
        
        # 2. Criptografia da senha
        # Transforma "senha123" em "$2b$12$..."
        hashed_pw = security.get_password_hash(agente_in.senha)
        
        # 3. Chamada ao CRUD passando o hash
        db_agente = crud_agente.create_agente(db, agente_in, hashed_password=hashed_pw)
        return agente_schema.Agente.from_orm(db_agente)
    
    
    @staticmethod
    def buscar_agente(db: Session, agente_id: int) -> agente_schema.Agente:
        """Busca um agente pelo ID"""
        db_agente = crud_agente.get_agente_by_id(db, agente_id)
        if not db_agente:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Agente não encontrado"
            )
        return agente_schema.Agente.from_orm(db_agente)
    
    
    @staticmethod
    def listar_agentes(
        db: Session,
        page: int = 1,
        page_size: int = 10,
        search: Optional[str] = None
    ) -> agente_schema.AgenteListResponse:
        """
        Lista agentes com paginação e busca.
        
        Args:
            db: Sessão do banco
            page: Página (1-indexed)
            page_size: Quantidade de itens por página
            search: Termo de busca
        """
        skip = (page - 1) * page_size
        agentes, total = crud_agente.get_agentes(db, skip=skip, limit=page_size, search=search)
        
        total_pages = (total + page_size - 1) // page_size
        
        return agente_schema.AgenteListResponse(
            items=[agente_schema.Agente.from_orm(a) for a in agentes],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )
    
    
    @staticmethod
    def atualizar_agente(
        db: Session,
        agente_id: int,
        agente_in: agente_schema.AgenteUpdate
    ) -> agente_schema.Agente:
        """Atualiza um agente de saúde"""
        db_agente = crud_agente.get_agente_by_id(db, agente_id)
        if not db_agente:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Agente não encontrado"
            )
        
        # Verificar se novo email já existe (se foi alterado)
        if agente_in.email and agente_in.email != db_agente.email:
            if crud_agente.get_agente_by_email(db, agente_in.email):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email já cadastrado"
                )
        
        db_agente = crud_agente.update_agente(db, agente_id, agente_in)
        return agente_schema.Agente.from_orm(db_agente)
    
    
    @staticmethod
    def deletar_agente(db: Session, agente_id: int) -> None:
        """Deleta um agente de saúde"""
        if not crud_agente.delete_agente(db, agente_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Agente não encontrado"
            )
    
    
    @staticmethod
    def desativar_agente(db: Session, agente_id: int) -> agente_schema.Agente:
        """Desativa um agente (soft delete)"""
        db_agente = crud_agente.desativar_agente(db, agente_id)
        if not db_agente:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Agente não encontrado"
            )
        return agente_schema.Agente.from_orm(db_agente)


class AtribuicaoPacienteService:
    """Serviço para operações de atribuição de pacientes a agentes"""
    
    @staticmethod
    def atribuir_paciente(db: Session, atribuicao_in: agente_schema.AtribuicaoPacienteCreate) -> agente_schema.AtribuicaoPaciente:
        # 1. Buscar o paciente para extrair os dados reais
        from app.crud import crud_paciente
        paciente = crud_paciente.get_by_id(db, id=atribuicao_in.paciente_id)
        
        if not paciente:
            raise HTTPException(status_code=404, detail="Paciente não encontrado")
        
        # 2. SE o frontend não enviou dados clínicos, pegamos do cadastro
        if not atribuicao_in.informacoes_clinicas:
            atribuicao_in.informacoes_clinicas = {
                "pressao": f"{paciente.pressao_sistolica_mmHg}/{paciente.pressao_diastolica_mmHg}",
                "glicemia": paciente.glicemia_jejum_mg_dl
            }
        
        # 3. Data padrão para teste
        if not atribuicao_in.data_visita_planejada:
            atribuicao_in.data_visita_planejada = datetime.now()

        db_atribuicao = crud_agente.create_atribuicao_paciente(db, atribuicao_in)
        return agente_schema.AtribuicaoPaciente.from_orm(db_atribuicao)
        
    @staticmethod
    def listar_atribuicoes_agente(
        db: Session,
        agente_id: int
    ) -> List[agente_schema.AtribuicaoPaciente]:
        """Lista todas as atribuições ativas de um agente"""
        # Verificar se agente existe
        if not crud_agente.get_agente_by_id(db, agente_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Agente não encontrado"
            )
        
        atribuicoes = crud_agente.get_atribuicoes_por_agente(db, agente_id)
        return [agente_schema.AtribuicaoPaciente.from_orm(a) for a in atribuicoes]
    
    
    @staticmethod
    def buscar_atribuicao(db: Session, atribuicao_id: int) -> agente_schema.AtribuicaoPaciente:
        """Busca uma atribuição pelo ID"""
        db_atribuicao = crud_agente.get_atribuicao_by_id(db, atribuicao_id)
        if not db_atribuicao:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Atribuição não encontrada"
            )
        return agente_schema.AtribuicaoPaciente.from_orm(db_atribuicao)
    
    
    @staticmethod
    def atualizar_atribuicao(
        db: Session,
        atribuicao_id: int,
        atribuicao_in: agente_schema.AtribuicaoPacienteUpdate
    ) -> agente_schema.AtribuicaoPaciente:
        """Atualiza uma atribuição de paciente"""
        db_atribuicao = crud_agente.update_atribuicao_paciente(db, atribuicao_id, atribuicao_in)
        if not db_atribuicao:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Atribuição não encontrada"
            )
        return agente_schema.AtribuicaoPaciente.from_orm(db_atribuicao)
    
    
    @staticmethod
    def deletar_atribuicao(db: Session, atribuicao_id: int) -> None:
        """Deleta uma atribuição de paciente"""
        if not crud_agente.delete_atribuicao_paciente(db, atribuicao_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Atribuição não encontrada"
            )
    
    
    @staticmethod
    def concluir_atribuicao(db: Session, atribuicao_id: int) -> agente_schema.AtribuicaoPaciente:
        """Marca uma atribuição como concluída"""
        db_atribuicao = crud_agente.desativar_atribuicao_paciente(db, atribuicao_id)
        if not db_atribuicao:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Atribuição não encontrada"
            )
        return agente_schema.AtribuicaoPaciente.from_orm(db_atribuicao)
    
    
    @staticmethod
    def enviar_para_app(db: Session, agente_id: int, atribuicao_id: int) -> Dict[str, Any]:
        """Prepara dados completos incluindo os novos campos da IA para o app."""
        atribuicao = crud_agente.get_atribuicao_by_id(db, atribuicao_id)
        
        if not atribuicao or atribuicao.agente_id != agente_id:
            raise HTTPException(status_code=404, detail="Atribuição não encontrada")
        
        agente = crud_agente.get_agente_by_id(db, agente_id)
        from app.crud import crud_paciente
        paciente = crud_paciente.get_by_id(db, id=atribuicao.paciente_id)
        
        return {
            "tipo": "atribuicao_paciente",
            "timestamp": atribuicao.data_atribuicao.isoformat(),
            "agente": {
                "id": agente.id,
                "nome": agente.nome,
                "tipo_profissional": agente.tipo_profissional,
            },
            "paciente": {
                "id": paciente.id,
                "nome": paciente.nome,
                "localizacao": atribuicao.localizacao,
            },
            "informacoes_clinicas": atribuicao.informacoes_clinicas,
            # Campos da Migration
            "relatorio_ia": atribuicao.relatorio_visita, 
            "anotacoes_visita": atribuicao.anotacoes_visita,
            "status": "concluida" if atribuicao.data_visita_realizada else "pendente",
            "data_realizada": atribuicao.data_visita_realizada.isoformat() if atribuicao.data_visita_realizada else None
        }
        
        return payload
    @staticmethod
    def obter_detalhes_visita_app(db: Session, atribuicao_id: int) -> Dict[str, Any]:
        """Busca rápida para o polling de resultados da IA no App."""
        atribuicao = crud_agente.get_atribuicao_by_id(db, atribuicao_id)
        
        if not atribuicao:
            raise HTTPException(status_code=404, detail="Visita não encontrada")
    
        return {
            "id": atribuicao.id,
            "status": "concluida" if atribuicao.data_visita_realizada else "pendente",
            "data_realizada": atribuicao.data_visita_realizada.isoformat() if atribuicao.data_visita_realizada else None,
            "transcricao_bruta": atribuicao.anotacoes_visita, # Coluna da Migration
            "relatorio_ia": atribuicao.relatorio_visita,     # JSONB da Migration
            "paciente_id": atribuicao.paciente_id
        }
