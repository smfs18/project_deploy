import React from 'react';
import MedicalRecommendations from '../MedicalRecommendations';
import PatientInfo from '../PatientInfo';
import { PacienteOut } from '../../services/api';
import {
  PatientDetailsContainer,
  Layout,
  InfoColumn,
  RecommendationsColumn
} from './styles';

interface PatientDetailsProps {
  patient: PacienteOut;
}

const PatientDetails: React.FC<PatientDetailsProps> = ({ patient }) => {
  const personalData = {
    dataNascimento: new Date(patient.data_nascimento).toLocaleDateString("pt-BR"),
    endereco: patient.endereco || "N/A",
    escolaridade: patient.escolaridade || "N/A",
    rendaFamiliar: `${patient.renda_familiar_sm || "N/A"} SM`,
    suporteSocial: patient.suporte_social || "N/A"
  };

  const healthIndicators = {
    imc: patient.imc?.toFixed(1) || "N/A",
    pressaoArterial: `${patient.pressao_sistolica_mmHg || 'N/A'}/${patient.pressao_diastolica_mmHg || 'N/A'} mmHg`,
    glicemiaJejum: `${patient.glicemia_jejum_mg_dl || "N/A"} mg/dL`,
    colesterolTotal: `${patient.colesterol_total_mg_dl || "N/A"} mg/dL`,
    hdl: `${patient.hdl_mg_dl || "N/A"} mg/dL`,
    triglicerideos: `${patient.triglicerides_mg_dl || "N/A"} mg/dL`
  };

  return (
    <PatientDetailsContainer>
      <Layout>
        <InfoColumn>
          <PatientInfo 
            personalData={personalData}
            healthIndicators={healthIndicators}
          />
        </InfoColumn>
        <RecommendationsColumn>
          <MedicalRecommendations 
            recommendations={patient.acoes_geradas_llm || ''}
            patientStatus={patient.risco_diabetes}
            patientData={{
              idade: patient.data_nascimento ? (new Date().getFullYear() - new Date(patient.data_nascimento).getFullYear()).toString() : "N/A",
              sexo: patient.sexo || "N/A",
              imc: patient.imc?.toFixed(1) || "N/A",
              pressaoArterial: `${patient.pressao_sistolica_mmHg || 'N/A'}/${patient.pressao_diastolica_mmHg || 'N/A'} mmHg`,
              glicemia: `${patient.glicemia_jejum_mg_dl || "N/A"} mg/dL`,
              atividadeFisica: patient.atividade_fisica || "N/A",
              consumoAlcool: patient.consumo_alcool || "N/A",
              tabagismo: patient.tabagismo_atual?.toString() || "N/A",
              qualidadeDieta: patient.qualidade_dieta || "N/A",
              qualidadeSono: patient.qualidade_sono || "N/A",
              nivelEstresse: patient.nivel_estresse || "N/A",
              historicoDC: patient.historico_familiar_dc?.toString() || "N/A",
              acessoServico: patient.acesso_servico_saude || "N/A",
              aderenciaMedicamentos: patient.aderencia_medicamento || "N/A",
              consultasUltimoAno: patient.consultas_ultimo_ano || 0
            }}
          />
        </RecommendationsColumn>
      </Layout>
    </PatientDetailsContainer>
  );
};

export default PatientDetails;
