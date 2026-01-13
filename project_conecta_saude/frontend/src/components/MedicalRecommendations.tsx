import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faHeartPulse,
  faExclamationTriangle,
  faExclamationCircle,
  faCircleCheck,
  faListCheck,
  faBriefcaseMedical,
  faWalking,
  faGlassWaterDroplet,
  faSmoking,
  faUtensils,
  faBed,
  faBrain,
  faHospital,
  faPills,
  faCalendarCheck
} from '@fortawesome/free-solid-svg-icons';

interface PatientData {
  idade: string;
  sexo: string;
  imc: string;
  pressaoArterial: string;
  glicemia: string;
  atividadeFisica: string;
  consumoAlcool: string;
  tabagismo: string;
  qualidadeDieta: string;
  qualidadeSono: string;
  nivelEstresse: string;
  historicoDC: string;
  acessoServico: string;
  aderenciaMedicamentos: string;
  consultasUltimoAno: number;
}

interface MedicalRecommendationsProps {
  recommendations: string;
  patientStatus: string;
  patientData: PatientData;
}

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  height: 100%;
  padding: 20px;
`;

const Card = styled.div`
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 100%;
  border: 1px solid #e2e8f0;
`;

const CardHeader = styled.div<{ $isUrgent?: boolean }>`
  background-color: ${props => props.$isUrgent ? '#dc2626' : '#1e40af'};
  color: white;
  padding: 12px 16px;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CardBody = styled.div`
  padding: 16px;
`;

const Section = styled.div<{ $isUrgent?: boolean }>`
  background-color: ${props => props.$isUrgent ? '#fee2e2' : '#f8fafc'};
  padding: 16px;
  
  &:hover {
    background-color: ${props => props.$isUrgent ? '#fecaca' : '#f1f5f9'};
  }
`;

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const ListItem = styled.li`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  color: #1f2937;
  font-size: 0.9rem;

  &:not(:last-child) {
    border-bottom: 1px solid #e2e8f0;
  }

  svg {
    color: #1e40af;
    min-width: 16px;
  }

  &[data-urgent='true'] svg {
    color: #dc2626;
  }
`;

const DataValue = styled.span`
  font-weight: 500;
`;

const MedicalRecommendations: React.FC<MedicalRecommendationsProps> = ({ recommendations, patientStatus, patientData }) => {
  const isCritical = patientStatus === 'Crítico';
  const isStable = patientStatus === 'Estável';

  const cleanText = (text: string): string => {
    return text
      .replace(/\*\*/g, '') // Remove asteriscos duplos
      .replace(/\s*[A-Za-z()]+\(a\):\s*/g, '') // Remove padrões como "Médico(a):" ou "Nutricionista:"
      .replace(/^\s*[•\-*]\s*/, '') // Remove bullets no início das linhas
      .trim();
  };

  const processRecommendations = (text: string): Array<{ title: string; items: string[]; isUrgent?: boolean; }> => {
    if (!text || text.trim().length === 0) return [];

    return text
      .split(/[0-9]+\.\s*\*\*/)
      .filter(Boolean)
      .map(section => {
        const lines = section
          .split('\n')
          .map(line => cleanText(line))
          .filter(line => line.length > 0);

        const title = lines[0];
        const items = lines
          .slice(1)
          .map(item => cleanText(item))
          .filter(item => item.length > 0);

        return {
          title,
          items,
          isUrgent: title.toLowerCase().includes('urgente')
        };
      });
  };

  const llmRecommendations = processRecommendations(recommendations);

  return (
    <Container>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Indicadores de Saúde */}
        <Card>
          <CardHeader>
            <FontAwesomeIcon icon={faHeartPulse} />
            Indicadores de Saúde
          </CardHeader>
          <CardBody>
            <Section>
              <List>
                <ListItem>
                  <FontAwesomeIcon icon={faUser} />
                  IMC: <DataValue>{patientData.imc}</DataValue>
                </ListItem>
                <ListItem>
                  <FontAwesomeIcon icon={faHeartPulse} />
                  Pressão Arterial: <DataValue>{patientData.pressaoArterial}</DataValue>
                </ListItem>
                <ListItem>
                  <FontAwesomeIcon icon={faBriefcaseMedical} />
                  Glicemia: <DataValue>{patientData.glicemia}</DataValue>
                </ListItem>
              </List>
            </Section>
          </CardBody>
        </Card>

        {/* Estilo de Vida */}
        <Card>
          <CardHeader>
            <FontAwesomeIcon icon={faListCheck} />
            Estilo de Vida
          </CardHeader>
          <CardBody>
            <Section>
              <List>
                <ListItem>
                  <FontAwesomeIcon icon={faWalking} />
                  Atividade Física: <DataValue>{patientData.atividadeFisica}</DataValue>
                </ListItem>
                <ListItem>
                  <FontAwesomeIcon icon={faGlassWaterDroplet} />
                  Consumo de Álcool: <DataValue>{patientData.consumoAlcool}</DataValue>
                </ListItem>
                <ListItem>
                  <FontAwesomeIcon icon={faSmoking} />
                  Tabagismo: <DataValue>{patientData.tabagismo}</DataValue>
                </ListItem>
                <ListItem>
                  <FontAwesomeIcon icon={faUtensils} />
                  Qualidade da Dieta: <DataValue>{patientData.qualidadeDieta}</DataValue>
                </ListItem>
                <ListItem>
                  <FontAwesomeIcon icon={faBed} />
                  Qualidade do Sono: <DataValue>{patientData.qualidadeSono}</DataValue>
                </ListItem>
                <ListItem>
                  <FontAwesomeIcon icon={faBrain} />
                  Nível de Estresse: <DataValue>{patientData.nivelEstresse}</DataValue>
                </ListItem>
              </List>
            </Section>
          </CardBody>
        </Card>

        {/* Acompanhamento Médico */}
        <Card>
          <CardHeader>
            <FontAwesomeIcon icon={faBriefcaseMedical} />
            Acompanhamento Médico
          </CardHeader>
          <CardBody>
            <Section>
              <List>
                <ListItem>
                  <FontAwesomeIcon icon={faHospital} />
                  Histórico DC: <DataValue>{patientData.historicoDC}</DataValue>
                </ListItem>
                <ListItem>
                  <FontAwesomeIcon icon={faPills} />
                  Aderência aos Medicamentos: <DataValue>{patientData.aderenciaMedicamentos}</DataValue>
                </ListItem>
                <ListItem>
                  <FontAwesomeIcon icon={faCalendarCheck} />
                  Consultas no Último Ano: <DataValue>{patientData.consultasUltimoAno}</DataValue>
                </ListItem>
              </List>
            </Section>
          </CardBody>
        </Card>

        {/* Status do Paciente */}
        <Card>
          <CardHeader $isUrgent={isCritical}>
            <FontAwesomeIcon icon={isCritical ? faExclamationTriangle : faCircleCheck} />
            Status do Paciente
          </CardHeader>
          <CardBody>
            <Section $isUrgent={isCritical}>
              <List>
                <ListItem data-urgent={isCritical}>
                  <FontAwesomeIcon icon={isCritical ? faExclamationCircle : faCircleCheck} />
                  Classificação: <DataValue>{patientStatus}</DataValue>
                </ListItem>
                {isCritical && (
                  <>
                    <ListItem data-urgent={true}>
                      <FontAwesomeIcon icon={faExclamationCircle} />
                      Requer avaliação médica imediata
                    </ListItem>
                    <ListItem data-urgent={true}>
                      <FontAwesomeIcon icon={faExclamationCircle} />
                      Monitoramento intensivo necessário
                    </ListItem>
                  </>
                )}
                {isStable && (
                  <>
                    <ListItem>
                      <FontAwesomeIcon icon={faCircleCheck} />
                      Manter acompanhamento de rotina
                    </ListItem>
                    <ListItem>
                      <FontAwesomeIcon icon={faCircleCheck} />
                      Continuar com as medidas preventivas
                    </ListItem>
                  </>
                )}
              </List>
            </Section>
          </CardBody>
        </Card>
      </div>

      {/* Recomendações do LLM */}
      {llmRecommendations.length > 0 && llmRecommendations.map((section, index) => (
        <Card key={index}>
          <CardHeader $isUrgent={section.isUrgent}>
            <FontAwesomeIcon icon={section.isUrgent ? faExclamationTriangle : faListCheck} />
            {section.title}
          </CardHeader>
          <CardBody>
            <Section $isUrgent={section.isUrgent}>
              <List>
                {section.items.map((item, itemIndex) => (
                  <ListItem key={itemIndex} data-urgent={section.isUrgent}>
                    <FontAwesomeIcon icon={section.isUrgent ? faExclamationCircle : faCircleCheck} />
                    {item}
                  </ListItem>
                ))}
              </List>
            </Section>
          </CardBody>
        </Card>
      ))}

      {/* Medidas específicas baseadas no status do paciente */}
      {isCritical && (
        <Card>
          <CardHeader $isUrgent>
            <FontAwesomeIcon icon={faExclamationTriangle} />
            Medidas Urgentes
          </CardHeader>
          <CardBody>
            <Section $isUrgent>
              <List>
                <ListItem data-urgent={true}>
                  <FontAwesomeIcon icon={faExclamationCircle} />
                  Avaliação médica imediata
                </ListItem>
                <ListItem data-urgent={true}>
                  <FontAwesomeIcon icon={faExclamationCircle} />
                  Controle de pressão arterial e glicemia
                </ListItem>
                <ListItem data-urgent={true}>
                  <FontAwesomeIcon icon={faExclamationCircle} />
                  Monitoramento de sinais vitais
                </ListItem>
              </List>
            </Section>
          </CardBody>
        </Card>
      )}
      
      {isStable && (
        <Card>
          <CardHeader>
            <FontAwesomeIcon icon={faCircleCheck} />
            Manutenção da Saúde
          </CardHeader>
          <CardBody>
            <Section>
              <List>
                <ListItem>
                  <FontAwesomeIcon icon={faCalendarCheck} />
                  Manter consultas de rotina
                </ListItem>
                <ListItem>
                  <FontAwesomeIcon icon={faHeartPulse} />
                  Continuar monitoramento regular
                </ListItem>
                <ListItem>
                  <FontAwesomeIcon icon={faListCheck} />
                  Manter hábitos saudáveis
                </ListItem>
              </List>
            </Section>
          </CardBody>
        </Card>
      )}
    </Container>
  );
};

export default MedicalRecommendations;


