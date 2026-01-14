// src/services/api.ts
// (NENHUMA ALTERAÇÃO NECESSÁRIA)
import axios from 'axios';
const API_BASE = import.meta.env.VITE_API_URL || "http://165.227.186.94:8082";

export const api = axios.create({
  baseURL: API_BASE,
});
console.log("🔥 VITE_API_URL =", import.meta.env.VITE_API_URL);
// Função para headers com autenticação
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Função para tratar respostas
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: "Erro ao processar requisição",
    }));
    throw new Error(error.detail || `Erro ${response.status}`);
  }
  return response.json();
};

// ========================================
// AUTENTICAÇÃO
// ========================================

export const login = async (email: string, password: string) => {
  console.log(" Login URL:", `${API_BASE}/api/v1/auth/login`);

  const response = await fetch(`${API_BASE}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  return handleResponse(response);
};

export const register = async (email: string, password: string) => {
  console.log(" Registro URL:", `${API_BASE}/api/v1/auth/register`);

  const response = await fetch(`${API_BASE}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  return handleResponse(response);
};

export const forgotPassword = async (email: string) => {
  const response = await fetch(`${API_BASE}/api/v1/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  return handleResponse(response);
};

export const resetPassword = async (token: string, newPassword: string) => {
  const response = await fetch(`${API_BASE}/api/v1/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, new_password: newPassword }),
  });

  return handleResponse(response);
};

// ========================================
// PACIENTES
// ========================================

export type Paciente = PacienteOut;

export interface PacienteFormData {
  email: string;
  nome: string;
  endereco: string | null;
  cep: string | null;
  data_nascimento: string;
  
  // Dados demográficos (NOVOS CAMPOS)
  sexo: string;
  raca_cor: string;
  situacao_conjugal: string;
  situacao_ocupacional: string;
  zona_moradia: string;
  
  // Situação socioeconômica (NOVOS CAMPOS)
  seguranca_alimentar: string;
  escolaridade: string;
  renda_familiar_sm: string;
  plano_saude: string;
  arranjo_domiciliar: string;
  
  // Hábitos de vida
  atividade_fisica: string;
  consumo_alcool: string;
  tabagismo_atual: boolean;
  qualidade_dieta: string;
  qualidade_sono: string;
  
  // Fatores psicossociais
  nivel_estresse: string;
  suporte_social: string;
  
  // Histórico e acesso
  historico_familiar_dc: boolean;
  acesso_servico_saude: string;
  aderencia_medicamento: string;
  consultas_ultimo_ano: number;
  
  // Medições clínicas
  imc: number;
  pressao_sistolica_mmHg: number;
  pressao_diastolica_mmHg: number;
  glicemia_jejum_mg_dl: number;
  colesterol_total_mg_dl: number;
  hdl_mg_dl: number;
  triglicerides_mg_dl: number;
}

export interface PacienteOut {
  id: number;
  email: string;
  nome: string;
  data_nascimento: string;
  
  // Dados demográficos
  sexo: string;
  raca_cor: string;
  situacao_conjugal: string;
  situacao_ocupacional: string;
  zona_moradia: string;
  
  // Campos de risco (calculados)
  risco_diabetes: string;
  risco_hipertensao: string;
  probabilidade_diabetes: number;
  probabilidade_hipertensao: number;
  recomendacao_geral: string;
  acoes_geradas_llm: string;
  created_at: string;
  
  // Campos de confirmação do modelo
  is_outlier?: boolean;
  confidence?: number;  // Grau de confiança (0.0 a 1.0)
  needs_confirmation?: boolean;  // Se precisa confirmação do profissional
  professional_confirmed?: boolean;  // Se o profissional já confirmou
  professional_notes?: string;  // Observações do profissional
  confirmed_at?: string;  // Quando foi confirmado
  
  // Endereço e localização
  endereco: string | null;
  cep: string | null;
  latitude: number | null;
  longitude: number | null;
  
  // Situação socioeconômica
  seguranca_alimentar: string;
  escolaridade: string;
  renda_familiar_sm: string;
  plano_saude: string;
  arranjo_domiciliar: string;
  
  // Hábitos de vida
  atividade_fisica: string;
  consumo_alcool: string;
  tabagismo_atual: boolean;
  qualidade_dieta: string;
  qualidade_sono: string;
  
  // Fatores psicossociais
  nivel_estresse: string;
  suporte_social: string;
  
  // Histórico e acesso
  historico_familiar_dc: boolean;
  acesso_servico_saude: string;
  aderencia_medicamento: string;
  consultas_ultimo_ano: number;
  
  // Medições clínicas
  imc: number;
  pressao_sistolica_mmHg: number;
  pressao_diastolica_mmHg: number;
  glicemia_jejum_mg_dl: number;
  colesterol_total_mg_dl: number;
  hdl_mg_dl: number;
  triglicerides_mg_dl: number;
}

export interface PacienteListResponse {
  items: PacienteOut[];
  meta: {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
}

export const fetchPacientes = async (
  page = 1,
  pageSize = 10,
  search = ""
): Promise<PacienteListResponse> => {
  const query = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
    ...(search && { search }),
  });

  const response = await fetch(`${API_BASE}/api/v1/pacientes?${query}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

export const createPaciente = async (
  formData: PacienteFormData
): Promise<PacienteOut> => {
  const response = await fetch(`${API_BASE}/api/v1/pacientes`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(formData),
  });

  return handleResponse(response);
};

export const getPacienteById = async (id: number): Promise<PacienteOut> => {
  const response = await fetch(`${API_BASE}/api/v1/pacientes/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

export const updatePaciente = async (id: number, data: PacienteFormData): Promise<PacienteOut> => {
  const response = await fetch(`${API_BASE}/api/v1/pacientes/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse(response);
};

export const deletePaciente = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE}/api/v1/pacientes/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: "Erro ao excluir paciente",
    }));
    throw new Error(error.detail || `Erro ${response.status}`);
  }
};

// ========================================
// CEP & GEOCODIFICAÇÃO
// ========================================

export interface CepData {
  cep: string;
  endereco: string;
  latitude: number;
  longitude: number;
}

export const getAddressFromCep = async (cep: string): Promise<CepData> => {
  const response = await fetch(`${API_BASE}/api/v1/pacientes/cep/${cep}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

// ========================================
// MAPA
// ========================================

export interface PacienteMapa {
  id: number;
  nome: string;
  latitude: number;
  longitude: number;
  status_saude: string;
  is_outlier: boolean;
}

export const getPacientesMapa = async (): Promise<PacienteMapa[]> => {
  const response = await fetch(`${API_BASE}/api/v1/pacientes/mapa/pacientes`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

// ========================================
// CONFIRMAÇÃO PROFISSIONAL
// ========================================

export interface ProfessionalConfirmationData {
  is_outlier_confirmed: boolean;
  professional_notes?: string;
}

/**
 * Confirma a classificação de um paciente pelo profissional.
 * Usado quando o modelo tem baixa confiança (needs_confirmation = true).
 */
export const confirmPatientClassification = async (
  patientId: number,
  confirmationData: ProfessionalConfirmationData
): Promise<PacienteOut> => {
  const queryParams = new URLSearchParams({
    is_outlier_confirmed: String(confirmationData.is_outlier_confirmed),
    ...(confirmationData.professional_notes && { 
      professional_notes: confirmationData.professional_notes 
    }),
  });

  const response = await fetch(
    `${API_BASE}/api/v1/pacientes/${patientId}/confirm?${queryParams}`,
    {
      method: "POST",
      headers: getAuthHeaders(),
    }
  );

  return handleResponse(response);
};

/**
 * Busca pacientes que precisam de confirmação profissional.
 */
export const getPatientsNeedingConfirmation = async (): Promise<PacienteOut[]> => {
  // Por enquanto, vamos buscar todos e filtrar no frontend
  // No futuro, podemos criar um endpoint específico no backend
  const response = await fetchPacientes(1, 100); // Busca os 100 primeiros
  
  return response.items.filter(p => p.needs_confirmation && !p.professional_confirmed);
};

/**
 * Obtém estatísticas de retreinamento.
 */
export const getRetrainingStats = async () => {
  const response = await fetch(`${API_BASE}/api/v1/pacientes/retraining/stats`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

// ========================================
// AGENTES DE SAÚDE
// ========================================

export interface AgenteFormData {
  nome: string;
  email: string;
  telefone?: string;
  cpf: string;
  tipo_profissional: string;
  numero_registro?: string;
  ubs_nome?: string;
  endereco?: string;
  ativo?: boolean;
  senha?: string;  // Adicionado para criar/atualizar senha
}

export interface Agente extends AgenteFormData {
  id: number;
  created_at: string;
  updated_at?: string;
}

export interface AgenteListResponse {
  items: Agente[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface AtribuicaoPacienteFormData {
  paciente_id: number;
  nome_paciente?: string;
  localizacao?: string;
  informacoes_clinicas?: Record<string, any>;
  notas_gestor?: string;
  data_visita_planejada?: string; // ISO string da data planejada
}

export interface AtribuicaoPaciente extends AtribuicaoPacienteFormData {
  id: number;
  agente_id: number;
  ativo: boolean;
  data_atribuicao: string;
  data_visita_realizada?: string; // Data em que a visita foi realizada
  anotacoes_visita?: string; // Anotações do agente
  relatorio_visita?: Record<string, any>; // Relatório estruturado da visita
  data_conclusao?: string;
  created_at: string;
  updated_at?: string;
}

// --- OPERAÇÕES CRUD DE AGENTES ---

export const createAgente = async (formData: AgenteFormData): Promise<Agente> => {
  const response = await fetch(`${API_BASE}/api/v1/agentes`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(formData),
  });

  return handleResponse(response);
};

export const fetchAgentes = async (
  page = 1,
  pageSize = 10,
  search = ""
): Promise<AgenteListResponse> => {
  const query = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
    ...(search && { search }),
  });

  const response = await fetch(`${API_BASE}/api/v1/agentes?${query}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

export const getAgenteById = async (id: number): Promise<Agente> => {
  const response = await fetch(`${API_BASE}/api/v1/agentes/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

export const updateAgente = async (id: number, data: Partial<AgenteFormData>): Promise<Agente> => {
  const response = await fetch(`${API_BASE}/api/v1/agentes/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse(response);
};

export const deleteAgente = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE}/api/v1/agentes/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: "Erro ao excluir agente",
    }));
    throw new Error(error.detail || `Erro ${response.status}`);
  }
};

export const desativarAgente = async (id: number): Promise<Agente> => {
  const response = await fetch(`${API_BASE}/api/v1/agentes/${id}/desativar`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

// --- OPERAÇÕES DE ATRIBUIÇÃO DE PACIENTES ---

export const atribuirPacienteAoAgente = async (
  agenteId: number,
  formData: AtribuicaoPacienteFormData
): Promise<AtribuicaoPaciente> => {
  // Garantimos que o agente_id exigido pelo Schema do backend seja enviado no corpo
  const payload = {
    ...formData,
    agente_id: agenteId
  };

  const response = await fetch(`${API_BASE}/api/v1/agentes/${agenteId}/atribuicoes`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload), // Enviamos o payload completo
  });

  return handleResponse(response);
};

export const fetchAtribuicoesPorAgente = async (agenteId: number): Promise<AtribuicaoPaciente[]> => {
  const response = await fetch(`${API_BASE}/api/v1/agentes/${agenteId}/atribuicoes`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

export const getAtribuicaoById = async (agenteId: number, atribuicaoId: number): Promise<AtribuicaoPaciente> => {
  const response = await fetch(`${API_BASE}/api/v1/agentes/${agenteId}/atribuicoes/${atribuicaoId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

export const updateAtribuicao = async (
  agenteId: number,
  atribuicaoId: number,
  data: Partial<AtribuicaoPacienteFormData>
): Promise<AtribuicaoPaciente> => {
  const response = await fetch(`${API_BASE}/api/v1/agentes/${agenteId}/atribuicoes/${atribuicaoId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse(response);
};

export const deleteAtribuicao = async (agenteId: number, atribuicaoId: number): Promise<void> => {
  const response = await fetch(`${API_BASE}/api/v1/agentes/${agenteId}/atribuicoes/${atribuicaoId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: "Erro ao excluir atribuição",
    }));
    throw new Error(error.detail || `Erro ${response.status}`);
  }
};

export const concluirAtribuicao = async (agenteId: number, atribuicaoId: number): Promise<AtribuicaoPaciente> => {
  const response = await fetch(`${API_BASE}/api/v1/agentes/${agenteId}/atribuicoes/${atribuicaoId}/concluir`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

export const enviarAtribuicaoParaApp = async (
  agenteId: number,
  atribuicaoId: number
): Promise<any> => {
  const response = await fetch(`${API_BASE}/api/v1/agentes/${agenteId}/atribuicoes/${atribuicaoId}/enviar-app`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};
