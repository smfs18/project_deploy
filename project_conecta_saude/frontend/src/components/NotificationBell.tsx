import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { getPatientsNeedingConfirmation, PacienteOut } from '../services/api';

interface NotificationBellProps {
  onPatientClick: (patient: PacienteOut) => void;
  refreshTrigger?: number; // Prop para forçar atualização
}

/**
 * Componente de sino de notificação que mostra pacientes que precisam de confirmação.
 * Atualiza automaticamente a cada 30 segundos.
 */
export const NotificationBell: React.FC<NotificationBellProps> = ({ onPatientClick, refreshTrigger = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [patientsNeedingConfirmation, setPatientsNeedingConfirmation] = useState<PacienteOut[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const patients = await getPatientsNeedingConfirmation();
      setPatientsNeedingConfirmation(patients);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Busca inicial
    fetchNotifications();

    // Atualiza a cada 30 segundos
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, [refreshTrigger]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePatientClick = (patient: PacienteOut) => {
    setIsOpen(false);
    onPatientClick(patient);
  };

  const count = patientsNeedingConfirmation.length;

  return (
    <NotificationContainer ref={dropdownRef}>
      <BellButton onClick={() => setIsOpen(!isOpen)}>
        <FontAwesomeIcon icon={faBell} size="lg" />
        {count > 0 && <Badge>{count}</Badge>}
      </BellButton>

      {isOpen && (
        <DropdownMenu>
          <DropdownHeader>
            <h3>Confirmações Pendentes</h3>
            <p>{count} paciente(s) aguardando análise</p>
          </DropdownHeader>

          <DropdownContent>
            {loading ? (
              <EmptyState>Carregando...</EmptyState>
            ) : count === 0 ? (
              <EmptyState>Nenhuma confirmação pendente</EmptyState>
            ) : (
              patientsNeedingConfirmation.map((patient) => (
                <PatientItem key={patient.id} onClick={() => handlePatientClick(patient)}>
                  <PatientName>{patient.nome}</PatientName>
                  <PatientInfo>
                    <span>Predição: <strong>{patient.is_outlier ? 'Outlier' : 'Normal'}</strong></span>
                    <span>Confiança: <strong>{((patient.confidence || 0) * 100).toFixed(1)}%</strong></span>
                  </PatientInfo>
                </PatientItem>
              ))
            )}
          </DropdownContent>

          {count > 0 && (
            <DropdownFooter>
              <RefreshButton onClick={(e) => {
                e.stopPropagation();
                fetchNotifications();
              }}>
                Atualizar Lista
              </RefreshButton>
            </DropdownFooter>
          )}
        </DropdownMenu>
      )}
    </NotificationContainer>
  );
};

const NotificationContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const BellButton = styled.button`
  position: relative;
  background: none;
  border: none;
  color: #3e2aeb;
  cursor: pointer;
  padding: 10px;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    color: #2de3d3;
    transform: scale(1.05);
  }
`;

const Badge = styled.span`
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: #dc3545;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 0.7rem;
  font-weight: bold;
  min-width: 18px;
  text-align: center;
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 10px;
  width: 350px;
  max-height: 500px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const DropdownHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;

  h3 {
    margin: 0 0 4px 0;
    font-size: 1.1rem;
    color: #333;
  }

  p {
    margin: 0;
    font-size: 0.85rem;
    color: #666;
  }
`;

const DropdownContent = styled.div`
  flex: 1;
  overflow-y: auto;
  max-height: 350px;
`;

const EmptyState = styled.div`
  padding: 32px 16px;
  text-align: center;
  color: #999;
  font-size: 0.9rem;
`;

const PatientItem = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f5f5f5;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const PatientName = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  font-size: 0.95rem;
`;

const PatientInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 0.85rem;
  color: #666;

  strong {
    color: #333;
  }
`;

const DropdownFooter = styled.div`
  padding: 12px 16px;
  border-top: 1px solid #e0e0e0;
  background: #f8f9fa;
`;

const RefreshButton = styled.button`
  width: 100%;
  padding: 8px 16px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  color: #495057;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e9ecef;
    border-color: #adb5bd;
  }
`;

export default NotificationBell;
