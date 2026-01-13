import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faHeartPulse,
} from '@fortawesome/free-solid-svg-icons';

interface PatientInfoProps {
  personalData: {
    dataNascimento: string;
    endereco: string;
    escolaridade: string;
    rendaFamiliar: string;
    suporteSocial: string;
  };
  healthIndicators: {
    imc: string;
    pressaoArterial: string;
    glicemiaJejum: string;
    colesterolTotal: string;
    hdl: string;
    triglicerideos: string;
  };
}

const Card = styled.div`
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const CardHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
`;

const CardBody = styled.div`
  padding: 16px;
`;

const InfoGroup = styled.div`
  margin-bottom: 16px;
  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.div`
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 4px;
`;

const InfoValue = styled.div`
  font-size: 1rem;
  color: #333;
  font-weight: 500;
`;

const PatientInfo: React.FC<PatientInfoProps> = ({ personalData, healthIndicators }) => {
  return (
    <>
      <Card>
        <CardHeader>
          <FontAwesomeIcon icon={faUser} style={{ marginRight: '8px' }} />
          Dados Pessoais
        </CardHeader>
        <CardBody>
          <InfoGroup>
            <InfoLabel>Data de Nascimento</InfoLabel>
            <InfoValue>{personalData.dataNascimento}</InfoValue>
          </InfoGroup>
          <InfoGroup>
            <InfoLabel>Endereço</InfoLabel>
            <InfoValue>{personalData.endereco}</InfoValue>
          </InfoGroup>
          <InfoGroup>
            <InfoLabel>Escolaridade</InfoLabel>
            <InfoValue>{personalData.escolaridade}</InfoValue>
          </InfoGroup>
          <InfoGroup>
            <InfoLabel>Renda Familiar</InfoLabel>
            <InfoValue>{personalData.rendaFamiliar}</InfoValue>
          </InfoGroup>
          <InfoGroup>
            <InfoLabel>Suporte Social</InfoLabel>
            <InfoValue>{personalData.suporteSocial}</InfoValue>
          </InfoGroup>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <FontAwesomeIcon icon={faHeartPulse} style={{ marginRight: '8px' }} />
          Indicadores de Saúde
        </CardHeader>
        <CardBody>
          <InfoGroup>
            <InfoLabel>IMC</InfoLabel>
            <InfoValue>{healthIndicators.imc}</InfoValue>
          </InfoGroup>
          <InfoGroup>
            <InfoLabel>Pressão Arterial</InfoLabel>
            <InfoValue>{healthIndicators.pressaoArterial} mmHg</InfoValue>
          </InfoGroup>
          <InfoGroup>
            <InfoLabel>Glicemia em Jejum</InfoLabel>
            <InfoValue>{healthIndicators.glicemiaJejum} mg/dL</InfoValue>
          </InfoGroup>
          <InfoGroup>
            <InfoLabel>Colesterol Total</InfoLabel>
            <InfoValue>{healthIndicators.colesterolTotal} mg/dL</InfoValue>
          </InfoGroup>
          <InfoGroup>
            <InfoLabel>HDL</InfoLabel>
            <InfoValue>{healthIndicators.hdl} mg/dL</InfoValue>
          </InfoGroup>
          <InfoGroup>
            <InfoLabel>Triglicerídeos</InfoLabel>
            <InfoValue>{healthIndicators.triglicerideos} mg/dL</InfoValue>
          </InfoGroup>
        </CardBody>
      </Card>
    </>
  );
};

export default PatientInfo;
