import React, { useState } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faCheckCircle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (isOutlier: boolean, notes: string) => void;
  patientName: string;
  predictedOutlier: boolean;
  confidence: number;
}

/**
 * Diálogo para confirmação profissional quando o modelo tem baixa confiança.
 * 
 * Este componente é exibido quando:
 * - needs_confirmation = true
 * - confidence < 0.7 (70%)
 */
export const ProfessionalConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  patientName,
  predictedOutlier,
  confidence,
}) => {
  const [notes, setNotes] = useState('');
  const [selectedOption, setSelectedOption] = useState<boolean | null>(null);

  const handleConfirm = () => {
    if (selectedOption === null) {
      alert('Por favor, selecione uma opção antes de confirmar.');
      return;
    }
    onConfirm(selectedOption, notes);
    setNotes('');
    setSelectedOption(null);
  };

  const handleCancel = () => {
    setNotes('');
    setSelectedOption(null);
    onClose();
  };

  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.7) return '#10b981';
    if (conf >= 0.5) return '#f59e0b';
    return '#ef4444';
  };

  const getConfidenceLabel = (conf: number) => {
    if (conf >= 0.7) return 'Alta';
    if (conf >= 0.5) return 'Média';
    return 'Baixa';
  };

  if (!open) return null;

  return (
    <Overlay onClick={handleCancel}>
      <DialogContainer onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <FontAwesomeIcon icon={faExclamationTriangle} style={{ color: '#f59e0b', marginRight: '12px' }} />
          <h2>Confirmação Profissional Necessária</h2>
        </DialogHeader>

        <DialogContent>
          <InfoAlert>
            <FontAwesomeIcon icon={faInfoCircle} style={{ marginRight: '8px' }} />
            O modelo de IA precisa da sua confirmação para este paciente devido à baixa confiança na predição.
          </InfoAlert>

          <Section>
            <SectionTitle>Paciente:</SectionTitle>
            <PatientName>{patientName}</PatientName>
          </Section>

          <Section>
            <SectionTitle>Predição do Modelo:</SectionTitle>
            <PredictionBadge isOutlier={predictedOutlier}>
              <FontAwesomeIcon 
                icon={predictedOutlier ? faExclamationTriangle : faCheckCircle} 
                style={{ marginRight: '8px' }} 
              />
              {predictedOutlier ? 'OUTLIER (Risco Crítico)' : 'NORMAL (Estável)'}
            </PredictionBadge>
          </Section>

          <Section>
            <SectionTitle>Confiança do Modelo:</SectionTitle>
            <ConfidenceContainer>
              <ConfidenceBadge color={getConfidenceColor(confidence)}>
                {(confidence * 100).toFixed(1)}%
              </ConfidenceBadge>
              <ConfidenceLabel color={getConfidenceColor(confidence)}>
                {getConfidenceLabel(confidence)}
              </ConfidenceLabel>
            </ConfidenceContainer>
          </Section>

          <Section>
            <SectionTitle>Sua Avaliação:</SectionTitle>
            <SectionSubtitle>
              Com base na sua análise clínica, como você classificaria este paciente?
            </SectionSubtitle>
            <ButtonContainer>
              <ClassificationButton
                selected={selectedOption === true}
                type="outlier"
                onClick={() => setSelectedOption(true)}
              >
                <FontAwesomeIcon icon={faExclamationTriangle} size="lg" />
                <ButtonLabel>OUTLIER</ButtonLabel>
                <ButtonSubLabel>Risco Crítico</ButtonSubLabel>
              </ClassificationButton>
              <ClassificationButton
                selected={selectedOption === false}
                type="normal"
                onClick={() => setSelectedOption(false)}
              >
                <FontAwesomeIcon icon={faCheckCircle} size="lg" />
                <ButtonLabel>NORMAL</ButtonLabel>
                <ButtonSubLabel>Estável</ButtonSubLabel>
              </ClassificationButton>
            </ButtonContainer>
          </Section>

          <Section>
            <SectionTitle>Observações (Opcional):</SectionTitle>
            <TextArea
              placeholder="Descreva os motivos da sua classificação, sintomas adicionais, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
            <HelperText>Suas observações ajudarão a melhorar o modelo de IA</HelperText>
          </Section>

          <RetrainingInfo>
            <FontAwesomeIcon icon={faInfoCircle} style={{ marginRight: '8px' }} />
            <div>
              <strong>ℹ️ Sobre o Retreinamento:</strong>
              <br />
              Sua confirmação será usada para retreinar e melhorar o modelo de IA.
              Quando houver 50 confirmações ou após 1 semana, o modelo será automaticamente retreinado.
            </div>
          </RetrainingInfo>
        </DialogContent>

        <DialogActions>
          <CancelButton onClick={handleCancel}>
            Cancelar
          </CancelButton>
          <ConfirmButton
            onClick={handleConfirm}
            disabled={selectedOption === null}
          >
            Confirmar Classificação
          </ConfirmButton>
        </DialogActions>
      </DialogContainer>
    </Overlay>
  );
};

// Styled Components
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.2s ease-in;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const DialogContainer = styled.div`
  background: white;
  border-radius: 12px;
  max-width: 650px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from {
      transform: translateY(50px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const DialogHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;

  h2 {
    margin: 0;
    font-size: 1.5rem;
    color: #111827;
  }
`;

const DialogContent = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const InfoAlert = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 12px 16px;
  background-color: #dbeafe;
  border: 1px solid #93c5fd;
  border-radius: 6px;
  color: #1e40af;
  font-size: 0.9rem;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SectionTitle = styled.div`
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
`;

const SectionSubtitle = styled.div`
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 8px;
`;

const PatientName = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: #2563eb;
`;

const PredictionBadge = styled.div<{ isOutlier: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  background-color: ${props => props.isOutlier ? '#fee2e2' : '#d1fae5'};
  color: ${props => props.isOutlier ? '#dc2626' : '#059669'};
  border: 1px solid ${props => props.isOutlier ? '#fecaca' : '#a7f3d0'};
`;

const ConfidenceContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const ConfidenceBadge = styled.div<{ color: string }>`
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 600;
  border: 2px solid ${props => props.color};
  color: ${props => props.color};
  background-color: white;
`;

const ConfidenceLabel = styled.div<{ color: string }>`
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
  background-color: ${props => props.color}20;
  color: ${props => props.color};
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 8px;
`;

const ClassificationButton = styled.button<{ selected: boolean; type: 'outlier' | 'normal' }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => {
    if (props.type === 'outlier') {
      return props.selected
        ? `
          background-color: #dc2626;
          border: 2px solid #dc2626;
          color: white;
        `
        : `
          background-color: white;
          border: 2px solid #fca5a5;
          color: #dc2626;
          &:hover {
            background-color: #fef2f2;
          }
        `;
    } else {
      return props.selected
        ? `
          background-color: #10b981;
          border: 2px solid #10b981;
          color: white;
        `
        : `
          background-color: white;
          border: 2px solid #86efac;
          color: #10b981;
          &:hover {
            background-color: #f0fdf4;
          }
        `;
    }
  }}
`;

const ButtonLabel = styled.div`
  font-weight: 700;
  font-size: 1.1rem;
`;

const ButtonSubLabel = styled.div`
  font-size: 0.85rem;
  opacity: 0.9;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.9rem;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`;

const HelperText = styled.div`
  font-size: 0.8rem;
  color: #6b7280;
`;

const RetrainingInfo = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 12px 16px;
  background-color: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  color: #1e40af;
  font-size: 0.875rem;
`;

const DialogActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
`;

const CancelButton = styled.button`
  padding: 10px 20px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background-color: white;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #f3f4f6;
  }
`;

const ConfirmButton = styled.button<{ disabled?: boolean }>`
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  background-color: #2563eb;
  color: white;
  font-weight: 500;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  transition: all 0.2s;

  &:hover {
    background-color: ${props => props.disabled ? '#2563eb' : '#1d4ed8'};
  }
`;

export default ProfessionalConfirmationDialog;
