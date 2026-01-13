import json 
from datetime import datetime, date
from typing import List, TypedDict, Annotated, Optional, Dict, Any 

from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage

from langgraph.graph import StateGraph, END

from app.services.llm_client import llm_client 
from app.services.backend_client import backend_client
from app.db.database import get_database
from app.utils.emergency import check_for_emergency, EMERGENCY_RESPONSE



SYSTEM_PROMPT = """
**Você é a LIA, uma assistente virtual de acompanhamento de saúde do Sistema Único de Saúde**

**--- SUA PERSONA E MISSÃO ---**
- Você é acolhedora, empática e profissional. Seu objetivo é conversar com o paciente de forma calma e natural.
- Você tem acesso aos dados cadastrais do paciente e precisa:
  1. Verificar e atualizar informações pessoais (nome, endereço, etc.)
  2. Coletar dados clínicos atualizados (pressão arterial, glicemia, etc.)
  3. Perguntar sobre hábitos de vida (dieta, sono, atividade física, etc.)
  4. Identificar emergências médicas

**--- FLUXO DA CONVERSA ---**
1. Cumprimente o paciente pelo nome (se disponível)
2. Confirme as informações pessoais atuais:
   - Nome completo
   - Endereço atual
   - Data de nascimento
3. Pergunte sobre medições recentes:
   - Pressão arterial (sistólica/diastólica)
   - Glicemia em jejum
   - Colesterol (total, HDL)
   - Triglicerídeos
4. Questione sobre hábitos atuais:
   - Qualidade da dieta
   - Qualidade do sono
   - Atividade física
   - Consumo de álcool
   - Tabagismo
   - Nível de estresse
5. Pergunte se há alguma nova informação ou preocupação de saúde

**--- REGRAS CRÍTICAS ---**
- Faça UMA pergunta por vez para não sobrecarregar o paciente
- Seja natural e conversacional, não use formulários
- **NÃO FAÇA DIAGNÓSTICOS**
- **NÃO SUGIRA TRATAMENTOS**
- Se o paciente não souber alguma informação, está tudo bem, pule para a próxima
- Ao finalizar, agradeça e informe que os dados foram atualizados no sistema

**--- PROTOCOLO DE EMERGÊNCIA ---**
- O sistema verifica automaticamente situações de emergência
- Se identificar emergência, o paciente será orientado a procurar atendimento imediato
"""

EXTRACTION_PROMPT = """
**Você é um assistente de extração de dados médicos.** 
Analise a conversa e extraia as informações que o paciente forneceu.
Responda APENAS com um objeto JSON válido, sem texto adicional.

**Campos para Extrair (use null se não mencionado):**

Informações Pessoais:
- nome: string
- endereco: string
- data_nascimento: string (formato YYYY-MM-DD)

Medições Clínicas (valores numéricos):
- pressao_sistolica_mmHg: int
- pressao_diastolica_mmHg: int
- glicemia_jejum_mg_dl: int
- colesterol_total_mg_dl: int
- hdl_mg_dl: int
- triglicerides_mg_dl: int
- imc: float

Hábitos de Vida:
- qualidade_dieta: string (valores: "Excelente", "Boa", "Regular", "Ruim")
- qualidade_sono: string (valores: "Excelente", "Boa", "Regular", "Ruim")
- atividade_fisica: string (valores: "Alta", "Moderada", "Baixa", "Sedentário")
- consumo_alcool: string (valores: "Não Consome", "Social", "Moderado", "Alto")
- tabagismo_atual: bool
- nivel_estresse: string (valores: "Baixo", "Moderado", "Alto", "Muito Alto")

Outros:
- consultas_ultimo_ano: int
- aderencia_medicamento: string (valores: "Alta", "Moderada", "Baixa", "Não Toma")
- observacoes_adicionais: string (qualquer informação importante que o paciente mencionou)

**Importante:** Extraia APENAS o que foi explicitamente mencionado na conversa.
"""


ROUTER_PROMPT = """
**Você é um roteador de conversa médica.** 
Analise a conversa e determine se a coleta de informações está completa.

A conversa está completa quando:
1. O paciente confirmou ou atualizou suas informações pessoais
2. Forneceu dados clínicos recentes OU informou que não tem dados novos
3. Respondeu sobre hábitos de vida OU informou que não mudou nada
4. Não há mais informações importantes a coletar

Responda APENAS com:
- "completa" - se a coleta terminou
- "incompleta" - se ainda faltam informações importantes

Conversa a ser analisada:
{conversation_history}
"""




class AgentState(TypedDict):
    """Estado do agente durante a conversa."""
    messages: Annotated[List[BaseMessage], lambda x, y: x + y]
    is_emergency: bool
    conversation_status: str  # "collecting", "complete"
    collected_data: Optional[Dict[str, Any]]
    patient_data: Optional[Dict[str, Any]]  # Dados do paciente do backend
    patient_email: Optional[str]  # Email do paciente para buscar no backend
    auth_token: Optional[str]  # Token de autenticação para o backend


class WhatsAppAgent:
    """
    Agente de WhatsApp remodelado para:
    1. Verificar/atualizar informações pessoais
    2. Coletar dados clínicos atualizados
    3. Identificar emergências
    4. Atualizar banco de dados através do backend
    """
    def __init__(self):
        self.db = get_database()
        self.llm_client = llm_client
        self.backend_client = backend_client
        self.graph = self._build_graph()

    def _build_graph(self):
        """Constrói o grafo de estados do agente."""
        workflow = StateGraph(AgentState)
        
        # Nós do grafo
        workflow.add_node("emergency_check", self.emergency_check_node)
        workflow.add_node("load_patient_data", self.load_patient_data_node)
        workflow.add_node("conversation_agent", self.conversation_agent_node)
        workflow.add_node("conversation_router", self.conversation_router_node)
        workflow.add_node("extract_and_update", self.extract_and_update_node)

        # Define o ponto de entrada
        workflow.set_entry_point("emergency_check")

        # Fluxo: verificação de emergência
        workflow.add_conditional_edges(
            "emergency_check",
            self.should_continue_after_emergency,
            {"continue": "load_patient_data", "end": END}
        )
        
        # Fluxo: carregar dados do paciente
        workflow.add_edge("load_patient_data", "conversation_agent")
        
        # Fluxo: agente conversacional
        workflow.add_edge("conversation_agent", "conversation_router")
        
        # Fluxo: roteador de conversa
        workflow.add_conditional_edges(
            "conversation_router",
            self.should_finalize,
            {
                "continue": END,
                "finalize": "extract_and_update"
            }
        )
        
        # Fluxo: extração e atualização
        workflow.add_edge("extract_and_update", END)
        
        return workflow.compile()

    def emergency_check_node(self, state: AgentState):
        """Verifica se a mensagem contém indicadores de emergência."""
        last_message = state['messages'][-1].content
        is_emergency = check_for_emergency(last_message)
        
        if is_emergency:
            emergency_message = AIMessage(content=EMERGENCY_RESPONSE)
            return {
                "is_emergency": True, 
                "messages": [emergency_message],
                "conversation_status": "emergency"
            }
        
        return {"is_emergency": False}

    async def load_patient_data_node(self, state: AgentState):
        """Carrega os dados do paciente do backend, se disponível."""
        patient_email = state.get('patient_email')
        auth_token = state.get('auth_token')
        
        if patient_email and auth_token:
            try:
                patient_data = await self.backend_client.get_patient_by_email(
                    patient_email, 
                    auth_token
                )
                if patient_data:
                    print(f"✅ Dados do paciente carregados: {patient_data.get('nome')}")
                    return {"patient_data": patient_data}
                else:
                    print(f"⚠️ Paciente não encontrado: {patient_email}")
            except Exception as e:
                print(f"❌ Erro ao carregar dados do paciente: {e}")
        
        return {"patient_data": None}

    def conversation_agent_node(self, state: AgentState):
        """Nó principal de conversa com o paciente."""
        # Prepara o contexto com dados do paciente, se disponível
        context_info = ""
        if state.get('patient_data'):
            patient = state['patient_data']
            context_info = f"""
**Informações Atuais do Paciente:**
- Nome: {patient.get('nome', 'Não informado')}
- Email: {patient.get('email', 'Não informado')}
- Endereço: {patient.get('endereco', 'Não informado')}
- Data de Nascimento: {patient.get('data_nascimento', 'Não informado')}
- Última Pressão: {patient.get('pressao_sistolica_mmHg', 'N/A')}/{patient.get('pressao_diastolica_mmHg', 'N/A')} mmHg
- Última Glicemia: {patient.get('glicemia_jejum_mg_dl', 'N/A')} mg/dL
- IMC: {patient.get('imc', 'N/A')}

Use essas informações para contextualizar a conversa e confirmar com o paciente.
"""
        
        system_message = SystemMessage(content=SYSTEM_PROMPT + context_info)
        messages = [system_message] + state['messages']
        
        response = self.llm_client.invoke(messages)
        return {"messages": [response]}
        
    def conversation_router_node(self, state: AgentState):
        """Determina se a conversa está completa."""
        conversation_history = ""
        for msg in state['messages']:
            role = "Paciente" if isinstance(msg, HumanMessage) else "LIA"
            conversation_history += f"{role}: {msg.content}\n"

        prompt = ROUTER_PROMPT.format(conversation_history=conversation_history)
        response = self.llm_client.invoke([HumanMessage(content=prompt)])
        decision = response.content.strip().lower()
        
        print(f"🔍 Decisão do Roteador: {decision}")
        return {"conversation_status": decision}

    async def extract_and_update_node(self, state: AgentState):
        """Extrai dados da conversa e atualiza o backend."""
        # Extrai dados da conversa
        full_conversation = ""
        for msg in state['messages']:
            role = "Paciente" if isinstance(msg, HumanMessage) else "LIA"
            full_conversation += f"{role}: {msg.content}\n"
            
        extraction_prompt = f"{EXTRACTION_PROMPT}\n\nConversa:\n{full_conversation}"
        
        try:
            raw_response = self.llm_client.invoke([HumanMessage(content=extraction_prompt)])
            cleaned_json = raw_response.content.strip().replace("```json", "").replace("```", "")
            extracted_data = json.loads(cleaned_json)
            
            print(f"📊 Dados extraídos: {extracted_data}")
            
            # Atualiza no backend se houver dados do paciente
            if state.get('patient_data') and state.get('auth_token'):
                await self._update_patient_in_backend(
                    state['patient_data'], 
                    extracted_data, 
                    state['auth_token']
                )
            
            return {"collected_data": extracted_data}
            
        except Exception as e:
            print(f"❌ Erro na extração/atualização: {e}")
            return {"collected_data": {"erro": str(e)}}

    async def _update_patient_in_backend(self, current_data: Dict, updates: Dict, token: str):
        """Atualiza os dados do paciente no backend."""
        # Mescla dados atuais com atualizações
        updated_data = current_data.copy()
        
        # Remove campos que não devem ser atualizados via API
        fields_to_remove = ['id', 'created_at', 'is_outlier', 'acoes_geradas_llm', 
                           'risco_diabetes', 'risco_hipertensao', 'recomendacao_geral',
                           'probabilidade_diabetes', 'probabilidade_hipertensao']
        for field in fields_to_remove:
            updated_data.pop(field, None)
        
        # Atualiza apenas campos que foram coletados
        for key, value in updates.items():
            if value is not None and key != 'observacoes_adicionais':
                # Converte data_nascimento para string se necessário
                if key == 'data_nascimento' and isinstance(value, date):
                    value = value.isoformat()
                updated_data[key] = value
        
        # Salva observações adicionais em um campo de texto
        if updates.get('observacoes_adicionais'):
            obs_atual = updated_data.get('acoes_geradas_llm', '')
            nova_obs = f"\n[{datetime.now().strftime('%Y-%m-%d %H:%M')}] {updates['observacoes_adicionais']}"
            updated_data['acoes_geradas_llm'] = obs_atual + nova_obs
        
        try:
            patient_id = current_data['id']
            result = await self.backend_client.update_patient(patient_id, updated_data, token)
            
            if result:
                print(f"✅ Paciente atualizado com sucesso: ID {patient_id}")
            else:
                print(f"❌ Falha ao atualizar paciente: ID {patient_id}")
                
        except Exception as e:
            print(f"❌ Erro ao atualizar paciente no backend: {e}")

    def should_continue_after_emergency(self, state: AgentState) -> str:
        """Decide se deve continuar após verificação de emergência."""
        if state['is_emergency']:
            return "end"
        return "continue"

    def should_finalize(self, state: AgentState) -> str:
        """Decide se deve finalizar e extrair dados."""
        if state.get("conversation_status") == "completa":
            return "finalize"
        return "continue"

    async def handle_message(self, session_id: str, user_message: str, 
                            patient_email: Optional[str] = None,
                            auth_token: Optional[str] = None) -> str:
        """
        Processa uma mensagem do usuário.
        
        Args:
            session_id: ID da sessão do WhatsApp
            user_message: Mensagem enviada pelo paciente
            patient_email: Email do paciente para buscar dados no backend
            auth_token: Token de autenticação para o backend
        """
        # Carrega sessão do MongoDB
        session = self.db.find_one({"session_id": session_id})
        
        # Se já foi identificada uma emergência, retorna resposta de emergência
        if session and session.get('is_emergency', False):
            return EMERGENCY_RESPONSE

        # Reconstrói histórico de mensagens
        messages_from_db = []
        if session and session.get('messages'):
            messages_from_db = [
                HumanMessage(content=msg['content']) if msg['role'] == 'user' 
                else AIMessage(content=msg['content']) 
                for msg in session['messages']
            ]
        
        # Estado inicial
        initial_state: AgentState = {
            "messages": messages_from_db + [HumanMessage(content=user_message)],
            "is_emergency": session.get('is_emergency', False) if session else False,
            "conversation_status": session.get('conversation_status', 'collecting') if session else 'collecting',
            "collected_data": session.get('collected_data') if session else None,
            "patient_data": session.get('patient_data') if session else None,
            "patient_email": patient_email or (session.get('patient_email') if session else None),
            "auth_token": auth_token or (session.get('auth_token') if session else None)
        }
        
        # Executa o grafo
        final_state = await self.graph.ainvoke(initial_state)
        
        # Salva estado no MongoDB
        await self._save_state_to_db(session_id, final_state)
        
        return final_state['messages'][-1].content

    async def _save_state_to_db(self, session_id: str, state: AgentState):
        """Salva o estado da conversa no MongoDB."""
        messages_to_save = []
        for msg in state['messages']:
            role = 'user' if isinstance(msg, HumanMessage) else 'assistant'
            messages_to_save.append({
                "role": role, 
                "content": msg.content, 
                "timestamp": datetime.utcnow()
            })

        update_fields = {
            "session_id": session_id,
            "messages": messages_to_save,
            "is_emergency": state.get('is_emergency', False),
            "conversation_status": state.get('conversation_status', 'collecting'),
            "updated_at": datetime.utcnow()
        }
        
        # Salva dados coletados
        if state.get('collected_data') is not None:
            update_fields["collected_data"] = state['collected_data']
        
        # Salva referências do paciente
        if state.get('patient_data') is not None:
            update_fields["patient_data"] = state['patient_data']
        if state.get('patient_email') is not None:
            update_fields["patient_email"] = state['patient_email']
        if state.get('auth_token') is not None:
            update_fields["auth_token"] = state['auth_token']

        self.db.update_one(
            {"session_id": session_id},
            {"$set": update_fields},
            upsert=True
        )


# Instância global do agente
whatsapp_agent = WhatsAppAgent()
