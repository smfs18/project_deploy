// src/components/PatientFormModal.tsx
import React, { useEffect, useState } from "react";
import * as S from "./PatientFormModal.styles";
// Importar a API e as interfaces
import { createPaciente, updatePaciente, Paciente, PacienteFormData, getAddressFromCep } from "../services/api";

interface PatientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: (paciente: Paciente) => void;
  paciente?: Paciente; // Opcional - se fornecido, modo edição
}

const initialState: PacienteFormData = {
  nome: "",
  endereco: "",
  cep: "",
  email: "",
  data_nascimento: "",
  
  // Dados demográficos (NOVOS CAMPOS)
  sexo: "Masculino",
  raca_cor: "Branca",
  situacao_conjugal: "Solteiro(a)",
  situacao_ocupacional: "Empregado",
  zona_moradia: "Urbana",
  
  // Situação socioeconômica (NOVOS CAMPOS)
  seguranca_alimentar: "Segurança alimentar",
  escolaridade: "Ensino médio completo",
  renda_familiar_sm: "1 a 2",
  plano_saude: "Não possui",
  arranjo_domiciliar: "Mora com família",
  
  // Hábitos de vida
  atividade_fisica: "Sedentário",
  consumo_alcool: "Não consome",
  tabagismo_atual: false,
  qualidade_dieta: "Regular",
  qualidade_sono: "Regular",
  
  // Fatores psicossociais
  nivel_estresse: "Moderado",
  suporte_social: "Moderado",
  
  // Histórico e acesso
  historico_familiar_dc: false,
  acesso_servico_saude: "UBS Próxima",
  aderencia_medicamento: "Regular",
  consultas_ultimo_ano: 0,
  
  // Medições clínicas
  imc: 0,
  pressao_sistolica_mmHg: 0,
  pressao_diastolica_mmHg: 0,
  glicemia_jejum_mg_dl: 0,
  colesterol_total_mg_dl: 0,
  hdl_mg_dl: 0,
  triglicerides_mg_dl: 0,
};

const PatientFormModal: React.FC<PatientFormModalProps> = ({
  isOpen,
  onClose,
  onSubmitSuccess,
  paciente
}) => {
  const [formData, setFormData] = useState<PacienteFormData>(initialState);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);

  // Quando o modal abrir com um paciente, preencher o formulário
  useEffect(() => {
    if (paciente) {
      setFormData({
        ...paciente,
        // Garantir que todos os campos numéricos sejam números
        imc: Number(paciente.imc),
        pressao_sistolica_mmHg: Number(paciente.pressao_sistolica_mmHg),
        pressao_diastolica_mmHg: Number(paciente.pressao_diastolica_mmHg),
        glicemia_jejum_mg_dl: Number(paciente.glicemia_jejum_mg_dl),
        colesterol_total_mg_dl: Number(paciente.colesterol_total_mg_dl),
        hdl_mg_dl: Number(paciente.hdl_mg_dl),
        triglicerides_mg_dl: Number(paciente.triglicerides_mg_dl),
        consultas_ultimo_ano: Number(paciente.consultas_ultimo_ano)
      });
    } else {
      setFormData(initialState);
    }
  }, [paciente, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (type === "number") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? "" : parseFloat(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCepBlur = async () => {
    const cep = formData.cep?.trim();
    if (!cep || cep.length < 8) return;

    setCepLoading(true);
    try {
      const data = await getAddressFromCep(cep);
      setFormData((prev) => ({
        ...prev,
        endereco: data.endereco,
      }));
    } catch (err) {
      console.error("Erro ao buscar CEP:", err);
      // Não exibe erro, apenas não preenche o endereço
    } finally {
      setCepLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.nome || !formData.data_nascimento) {
      setError("Email, Nome e Data de Nascimento são obrigatórios.");
      return;
    }

    // Validação para garantir que todos os campos obrigatórios estão preenchidos
    const requiredFields: (keyof PacienteFormData)[] = [];

    for (const field of requiredFields) {
      if (!formData[field]) {
        setError(`O campo ${field} é obrigatório.`);
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(true);

    console.log("Dados enviados ao backend:", formData);

    try {
      let result;
      if (paciente) {
        // Modo edição
        result = await updatePaciente(paciente.id, formData);
      } else {
        // Modo criação
        result = await createPaciente(formData);
      }
      onSubmitSuccess(result);
      setFormData(initialState);
      onClose();
    } catch (err: any) {
      console.error("Erro ao salvar:", err);
      setError(err.message || "Erro ao salvar paciente. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("isLoading atualizado:", isLoading);
  }, [isLoading]);

  if (!isOpen) {
    return null;
  }

  return (
    <S.ModalBackdrop onClick={onClose}>
      <S.ModalContent onClick={(e) => e.stopPropagation()}>
        <S.ModalHeader>
          <h2>{paciente ? "Editar Paciente" : "Adicionar Novo Paciente"}</h2>
          <S.ModalCloseButton onClick={onClose}>&times;</S.ModalCloseButton>
        </S.ModalHeader>

        <S.ModalBody onSubmit={handleSubmit}>
          {error && <S.ErrorMessage>{error}</S.ErrorMessage>}

          <S.StyledFieldset disabled={isLoading}>
            <S.StyledLegend>Dados Pessoais</S.StyledLegend>
            <S.FormGrid>
              <S.FormGroup>
                <label htmlFor="nome">Nome Completo</label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                />
              </S.FormGroup>
              <S.FormGroup>
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </S.FormGroup>
              <S.FormGroup>
                <label htmlFor="data_nascimento">Data de Nascimento</label>
                <input
                  type="date"
                  id="data_nascimento"
                  name="data_nascimento"
                  value={formData.data_nascimento}
                  onChange={handleChange}
                  required
                />
              </S.FormGroup>
              <S.FormGroup>
                <label htmlFor="sexo">Sexo</label>
                <select
                  id="sexo"
                  name="sexo"
                  value={formData.sexo || ""}
                  onChange={handleChange}
                >
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Outro">Outro</option>
                </select>
              </S.FormGroup>
              <S.FormGroup>
                <label htmlFor="raca_cor">Raça/Cor</label>
                <select
                  id="raca_cor"
                  name="raca_cor"
                  value={formData.raca_cor || "Branca"}
                  onChange={handleChange}
                >
                  <option value="">Selecione uma opção</option>
                  <option value="Branca">Branca</option>
                  <option value="Preta">Preta</option>
                  <option value="Parda">Parda</option>
                  <option value="Amarela">Amarela</option>
                  <option value="Indígena">Indígena</option>
                  <option value="Não informado">Não informado</option>
                </select>
              </S.FormGroup>
              <S.FormGroup>
                <label htmlFor="situacao_conjugal">Situação Conjugal</label>
                <select
                  id="situacao_conjugal"
                  name="situacao_conjugal"
                  value={formData.situacao_conjugal || ""}
                  onChange={handleChange}
                >
                  <option value="Solteiro(a)">Solteiro(a)</option>
                  <option value="Casado(a)">Casado(a)</option>
                  <option value="União estável">União estável</option>
                  <option value="Divorciado(a)">Divorciado(a)</option>
                  <option value="Viúvo(a)">Viúvo(a)</option>
                </select>
              </S.FormGroup>
              <S.FormGroup>
                <label htmlFor="situacao_ocupacional">Situação Ocupacional</label>
                <select
                  id="situacao_ocupacional"
                  name="situacao_ocupacional"
                  value={formData.situacao_ocupacional || ""}
                  onChange={handleChange}
                >
                  <option value="Empregado">Empregado</option>
                  <option value="Desempregado">Desempregado</option>
                  <option value="Autônomo">Autônomo</option>
                  <option value="Aposentado">Aposentado</option>
                  <option value="Estudante">Estudante</option>
                  <option value="Do lar">Do lar</option>
                </select>
              </S.FormGroup>
              <S.FormGroup>
                <label htmlFor="zona_moradia">Zona de Moradia</label>
                <select
                  id="zona_moradia"
                  name="zona_moradia"
                  value={formData.zona_moradia || ""}
                  onChange={handleChange}
                >
                  <option value="Urbana">Urbana</option>
                  <option value="Rural">Rural</option>
                </select>
              </S.FormGroup>
              <S.FormGroup>
                <label htmlFor="endereco">Endereço</label>
                <input
                  type="text"
                  id="endereco"
                  name="endereco"
                  value={formData.endereco || ""}
                  onChange={handleChange}
                  disabled={cepLoading}
                />
              </S.FormGroup>
              <S.FormGroup>
                <label htmlFor="cep">CEP</label>
                <input
                  type="text"
                  id="cep"
                  name="cep"
                  value={formData.cep || ""}
                  onChange={handleChange}
                  onBlur={handleCepBlur}
                  placeholder="00000-000"
                  maxLength={9}
                />
                {cepLoading && <small>Buscando endereço...</small>}
              </S.FormGroup>
            </S.FormGrid>
          </S.StyledFieldset>

          <S.StyledFieldset disabled={isLoading}>
            <S.StyledLegend>Situação Socioeconômica</S.StyledLegend>
            <S.FormGrid>
              <S.FormGroup>
                <label htmlFor="seguranca_alimentar">Segurança Alimentar</label>
                <select
                  id="seguranca_alimentar"
                  name="seguranca_alimentar"
                  value={formData.seguranca_alimentar || ""}
                  onChange={handleChange}
                >
                  <option value="Segurança alimentar">Segurança alimentar</option>
                  <option value="Insegurança leve">Insegurança leve</option>
                  <option value="Insegurança moderada">Insegurança moderada</option>
                  <option value="Insegurança grave">Insegurança grave</option>
                </select>
              </S.FormGroup>
              <S.FormGroup>
                <label htmlFor="escolaridade">Escolaridade</label>
                <select
                  id="escolaridade"
                  name="escolaridade"
                  value={formData.escolaridade || ""}
                  onChange={handleChange}
                >
                  <option value="Ensino fundamental incompleto">
                    Ensino fundamental incompleto
                  </option>
                  <option value="Ensino fundamental completo">
                    Ensino fundamental completo
                  </option>
                  <option value="Ensino médio incompleto">
                    Ensino médio incompleto
                  </option>
                  <option value="Ensino médio completo">
                    Ensino médio completo
                  </option>
                  <option value="Superior incompleto">
                    Superior incompleto
                  </option>
                  <option value="Superior completo">Superior completo</option>
                  <option value="Pós-graduação">Pós-graduação</option>
                </select>
              </S.FormGroup>
              <S.FormGroup>
                <label htmlFor="renda_familiar_sm">Renda (Sal. Mínimos)</label>
                <select
                  id="renda_familiar_sm"
                  name="renda_familiar_sm"
                  value={formData.renda_familiar_sm || ""}
                  onChange={handleChange}
                >
                  <option value="Até 1">Até 1</option>
                  <option value="1 a 2">1 a 2</option>
                  <option value="2 a 3">2 a 3</option>
                  <option value="3 a 4">3 a 4</option>
                  <option value="4 a 5">4 a 5</option>
                  <option value="Acima de 5">Acima de 5</option>
                </select>
              </S.FormGroup>
              <S.FormGroup>
                <label htmlFor="plano_saude">Plano de Saúde</label>
                <select
                  id="plano_saude"
                  name="plano_saude"
                  value={formData.plano_saude || ""}
                  onChange={handleChange}
                >
                  <option value="Não possui">Não possui</option>
                  <option value="Plano básico">Plano básico</option>
                  <option value="Plano intermediário">Plano intermediário</option>
                  <option value="Plano premium">Plano premium</option>
                </select>
              </S.FormGroup>
              <S.FormGroup>
                <label htmlFor="arranjo_domiciliar">Arranjo Domiciliar</label>
                <select
                  id="arranjo_domiciliar"
                  name="arranjo_domiciliar"
                  value={formData.arranjo_domiciliar || ""}
                  onChange={handleChange}
                >
                  <option value="Mora sozinho">Mora sozinho</option>
                  <option value="Mora com família">Mora com família</option>
                  <option value="Mora com cônjuge">Mora com cônjuge</option>
                  <option value="Mora em instituição">Mora em instituição</option>
                </select>
              </S.FormGroup>
            </S.FormGrid>
          </S.StyledFieldset>

          <S.StyledFieldset disabled={isLoading}>
            <S.StyledLegend>Estilo de Vida</S.StyledLegend>
            <S.FormGrid>
              <S.FormGroup>
                <label htmlFor="atividade_fisica">Atividade Física</label>
                <select
                  id="atividade_fisica"
                  name="atividade_fisica"
                  value={formData.atividade_fisica || ""}
                  onChange={handleChange}
                >
                  <option value="Sedentário">Sedentário</option>
                  <option value="Leve">Leve</option>
                  <option value="Moderado">Moderado</option>
                  <option value="Ativa">Ativa</option>
                </select>
              </S.FormGroup>
              <S.FormGroup>
                <label htmlFor="consumo_alcool">Consumo de Álcool</label>
                <select
                  id="consumo_alcool"
                  name="consumo_alcool"
                  value={formData.consumo_alcool || ""}
                  onChange={handleChange}
                >
                  <option value="Não consome">Não consome</option>
                  <option value="Raro">Raro</option>
                  <option value="Social">Social</option>
                  <option value="Moderado">Moderado</option>
                  <option value="Frequente">Frequente</option>
                </select>
              </S.FormGroup>
              <S.FormGroup>
                <label htmlFor="qualidade_dieta">Qualidade da Dieta</label>
                <select
                  id="qualidade_dieta"
                  name="qualidade_dieta"
                  value={formData.qualidade_dieta || ""}
                  onChange={handleChange}
                >
                  <option value="Ruim">Ruim</option>
                  <option value="Regular">Regular</option>
                  <option value="Boa">Boa</option>
                  <option value="Excelente">Excelente</option>
                </select>
              </S.FormGroup>
              <S.FormGroup>
                <label htmlFor="qualidade_sono">Qualidade do Sono</label>
                <select
                  id="qualidade_sono"
                  name="qualidade_sono"
                  value={formData.qualidade_sono || ""}
                  onChange={handleChange}
                >
                  <option value="Ruim">Ruim</option>
                  <option value="Regular">Regular</option>
                  <option value="Boa">Boa</option>
                </select>
              </S.FormGroup>
              <S.FormGroup>
                <label htmlFor="nivel_estresse">Nível de Estresse</label>
                <select
                  id="nivel_estresse"
                  name="nivel_estresse"
                  value={formData.nivel_estresse || ""}
                  onChange={handleChange}
                >
                  <option value="Baixo">Baixo</option>
                  <option value="Moderado">Moderado</option>
                  <option value="Alto">Alto</option>
                </select>
              </S.FormGroup>
              <S.CheckboxGroup>
                <label htmlFor="tabagismo_atual">
                  <input
                    type="checkbox"
                    id="tabagismo_atual"
                    name="tabagismo_atual"
                    checked={formData.tabagismo_atual}
                    onChange={handleChange}
                  />
                  Tabagismo Atual?
                </label>
              </S.CheckboxGroup>
            </S.FormGrid>
          </S.StyledFieldset>

          <S.StyledFieldset disabled={isLoading}>
            <S.StyledLegend>Indicadores de Saúde</S.StyledLegend>
            <S.FormGridSmall>
              <S.FormGroup>
                <label htmlFor="imc">IMC</label>
                <input
                  type="number"
                  step="0.1"
                  id="imc"
                  name="imc"
                  value={formData.imc}
                  onChange={handleChange}
                />
              </S.FormGroup>
              <S.FormGroup>
                <label htmlFor="pressao_sistolica_mmHg">
                  PA Sistólica (mmHg)
                </label>
                <input
                  type="number"
                  id="pressao_sistolica_mmHg"
                  name="pressao_sistolica_mmHg"
                  value={formData.pressao_sistolica_mmHg}
                  onChange={handleChange}
                />
              </S.FormGroup>
              <S.FormGroup>
                <label htmlFor="pressao_diastolica_mmHg">
                  PA Diastólica (mmHg)
                </label>
                <input
                  type="number"
                  id="pressao_diastolica_mmHg"
                  name="pressao_diastolica_mmHg"
                  value={formData.pressao_diastolica_mmHg}
                  onChange={handleChange}
                />
              </S.FormGroup>
              <S.FormGroup>
                <label htmlFor="glicemia_jejum_mg_dl">
                  Glicemia Jejum (mg/dL)
                </label>
                <input
                  type="number"
                  id="glicemia_jejum_mg_dl"
                  name="glicemia_jejum_mg_dl"
                  value={formData.glicemia_jejum_mg_dl}
                  onChange={handleChange}
                />
              </S.FormGroup>
              <S.FormGroup>
                <label htmlFor="colesterol_total_mg_dl">
                  Colesterol Total (mg/dL)
                </label>
                <input
                  type="number"
                  id="colesterol_total_mg_dl"
                  name="colesterol_total_mg_dl"
                  value={formData.colesterol_total_mg_dl}
                  onChange={handleChange}
                />
              </S.FormGroup>
              <S.FormGroup>
                <label htmlFor="hdl_mg_dl">HDL (mg/dL)</label>
                <input
                  type="number"
                  id="hdl_mg_dl"
                  name="hdl_mg_dl"
                  value={formData.hdl_mg_dl}
                  onChange={handleChange}
                />
              </S.FormGroup>
              <S.FormGroup>
                <label htmlFor="triglicerides_mg_dl">
                  Triglicerídeos (mg/dL)
                </label>
                <input
                  type="number"
                  id="triglicerides_mg_dl"
                  name="triglicerides_mg_dl"
                  value={formData.triglicerides_mg_dl}
                  onChange={handleChange}
                />
              </S.FormGroup>
            </S.FormGridSmall>
          </S.StyledFieldset>

          <S.StyledFieldset disabled={isLoading}>
            <S.StyledLegend>Acompanhamento Médico</S.StyledLegend>
            <S.FormGrid>
              <S.FormGroup>
                <label htmlFor="suporte_social">Suporte Social</label>
                <select
                  id="suporte_social"
                  name="suporte_social"
                  value={formData.suporte_social || ""}
                  onChange={handleChange}
                >
                  <option value="Baixo">Baixo</option>
                  <option value="Moderado">Moderado</option>
                  <option value="Bom">Bom</option>
                  <option value="Forte">Forte</option>
                </select>
              </S.FormGroup>
              <S.FormGroup>
                <label htmlFor="acesso_servico_saude">Acesso Saúde</label>
                <select
                  id="acesso_servico_saude"
                  name="acesso_servico_saude"
                  value={formData.acesso_servico_saude || ""}
                  onChange={handleChange}
                >
                  <option value="Difícil">Difícil</option>
                  <option value="UBS Próxima">UBS Próxima</option>
                  <option value="Particular">Particular</option>
                </select>
              </S.FormGroup>
              <S.FormGroup>
                <label htmlFor="aderencia_medicamento">
                  Aderência Medicação
                </label>
                <select
                  id="aderencia_medicamento"
                  name="aderencia_medicamento"
                  value={formData.aderencia_medicamento || ""}
                  onChange={handleChange}
                >
                  <option value="Baixa">Baixa</option>
                  <option value="Regular">Regular</option>
                  <option value="Boa">Boa</option>
                  <option value="Excelente">Excelente</option>
                </select>
              </S.FormGroup>
              <S.FormGroup>
                <label htmlFor="consultas_ultimo_ano">
                  Consultas (Último Ano)
                </label>
                <input
                  type="number"
                  id="consultas_ultimo_ano"
                  name="consultas_ultimo_ano"
                  value={formData.consultas_ultimo_ano}
                  onChange={handleChange}
                />
              </S.FormGroup>
              <S.CheckboxGroup>
                <label htmlFor="historico_familiar_dc">
                  <input
                    type="checkbox"
                    id="historico_familiar_dc"
                    name="historico_familiar_dc"
                    checked={formData.historico_familiar_dc}
                    onChange={handleChange}
                  />
                  Histórico Familiar de DC?
                </label>
              </S.CheckboxGroup>
            </S.FormGrid>
          </S.StyledFieldset>

          <S.ModalFooter>
            <S.SecondaryButton 
              type="button" 
              onClick={onClose} 
              disabled={isLoading}
            >
              Cancelar
            </S.SecondaryButton>
            <S.PrimaryButton 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? "Salvando e Analisando..." : (paciente ? "Atualizar Paciente" : "Salvar Paciente")}
            </S.PrimaryButton>
          </S.ModalFooter>
        </S.ModalBody>
      </S.ModalContent>
    </S.ModalBackdrop>
  );
};

export default PatientFormModal;
