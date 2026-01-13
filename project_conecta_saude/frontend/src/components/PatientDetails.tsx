import React from 'react';
import { FaHeartbeat, FaHospital } from 'react-icons/fa';
import styled from 'styled-components';
import MedicalRecommendations from './MedicalRecommendations';
import { PacienteOut } from '../services/api';

const DetailsContainer = styled.div`
  padding: 32px;
  background: linear-gradient(135deg, #f8fffe 0%, #f9fafe 100%);
  min-height: 600px;
  border-radius: 0 0 20px 20px;
`;

const DetailsGrid = styled.div`
  display: flex;
  gap: 32px;
`;

const LeftColumn = styled.div`
  width: 420px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: rgba(255, 255, 255, 0.95);
  padding: 28px;
  border-radius: 20px;
  border: 2px solid rgba(45, 227, 211, 0.15);
  box-shadow: 
    0 10px 30px rgba(62, 42, 235, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 
      0 20px 50px rgba(62, 42, 235, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.9);
    border-color: rgba(45, 227, 211, 0.25);
  }
`;

const Section = styled.div`
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  background: linear-gradient(135deg, #3e2aeb 0%, #2de3d3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: "Poppins", sans-serif;
  letter-spacing: -0.01em;
  
  svg {
    color: #2de3d3;
  }
`;

const SectionContent = styled.div`
  display: grid;
  gap: 14px;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(45, 227, 211, 0.1);
  transition: all 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    padding-left: 8px;
    background: linear-gradient(90deg, rgba(45, 227, 211, 0.05) 0%, transparent 100%);
    border-radius: 8px;
  }

  strong {
    color: #1f2937;
    min-width: 200px;
    font-weight: 600;
    font-size: 14px;
  }
  
  span {
    color: #4b5563;
    font-weight: 500;
  }
`;

const RightColumn = styled.div`
  flex: 1;
  min-width: 0;
`;

interface PatientDetailsProps {
  patient: PacienteOut;
}

const PatientDetails: React.FC<PatientDetailsProps> = ({ patient: p }) => {
  const patientData = {
    idade: String(new Date().getFullYear() - new Date(p.data_nascimento).getFullYear()),
    sexo: p.sexo || 'N/A',
    imc: p.imc?.toFixed(1) || 'N/A',
    pressaoArterial: `${p.pressao_sistolica_mmHg || 'N/A'}/${p.pressao_diastolica_mmHg || 'N/A'} mmHg`,
    glicemia: `${p.glicemia_jejum_mg_dl || 'N/A'} mg/dL`,
    atividadeFisica: p.atividade_fisica || 'N/A',
    consumoAlcool: p.consumo_alcool || 'N/A',
    tabagismo: p.tabagismo_atual ? 'Sim' : 'Não',
    qualidadeDieta: p.qualidade_dieta || 'N/A',
    qualidadeSono: p.qualidade_sono || 'N/A',
    nivelEstresse: p.nivel_estresse || 'N/A',
    historicoDC: p.historico_familiar_dc ? 'Sim' : 'Não',
    acessoServico: p.acesso_servico_saude || 'N/A',
    aderenciaMedicamentos: p.aderencia_medicamento || 'N/A',
    consultasUltimoAno: p.consultas_ultimo_ano
  };

  return (
    <DetailsContainer>
      <DetailsGrid>
        <LeftColumn>
          <Section>
            <SectionTitle>
              <FaHeartbeat size={18} />
              Estilo de Vida
            </SectionTitle>
            <SectionContent>
              <DetailItem>
                <strong>Atividade Física:</strong> <span>{p.atividade_fisica || "N/A"}</span>
              </DetailItem>
              <DetailItem>
                <strong>Consumo de Álcool:</strong> <span>{p.consumo_alcool || "N/A"}</span>
              </DetailItem>
              <DetailItem>
                <strong>Tabagismo:</strong> <span>{p.tabagismo_atual ? "Sim" : "Não"}</span>
              </DetailItem>
              <DetailItem>
                <strong>Qualidade da Dieta:</strong> <span>{p.qualidade_dieta || "N/A"}</span>
              </DetailItem>
              <DetailItem>
                <strong>Qualidade do Sono:</strong> <span>{p.qualidade_sono || "N/A"}</span>
              </DetailItem>
              <DetailItem>
                <strong>Nível de Estresse:</strong> <span>{p.nivel_estresse || "N/A"}</span>
              </DetailItem>
            </SectionContent>
          </Section>

          <Section>
            <SectionTitle>
              <FaHospital size={18} />
              Histórico e Acompanhamento Médico
            </SectionTitle>
            <SectionContent>
              <DetailItem>
                <strong>Histórico Familiar DC:</strong>{" "}
                <span>{p.historico_familiar_dc ? "Sim" : "Não"}</span>
              </DetailItem>
              <DetailItem>
                <strong>Acesso ao Serviço de Saúde:</strong>{" "}
                <span>{p.acesso_servico_saude || "N/A"}</span>
              </DetailItem>
              <DetailItem>
                <strong>Aderência aos Medicamentos:</strong>{" "}
                <span>{p.aderencia_medicamento || "N/A"}</span>
              </DetailItem>
              <DetailItem>
                <strong>Consultas no Último Ano:</strong>{" "}
                <span>{p.consultas_ultimo_ano || 0}</span>
              </DetailItem>
            </SectionContent>
          </Section>
        </LeftColumn>

        <RightColumn>
          <MedicalRecommendations 
            recommendations={p.acoes_geradas_llm || ''}
            patientStatus={p.risco_diabetes}
            patientData={patientData}
          />
        </RightColumn>
      </DetailsGrid>
    </DetailsContainer>
  );
};

export default PatientDetails;
