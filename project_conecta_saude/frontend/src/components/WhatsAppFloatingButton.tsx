// src/components/WhatsAppFloatingButton.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaWhatsapp } from 'react-icons/fa';
import styled from 'styled-components';

const FloatingButton = styled.button`
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(37, 211, 102, 0.4);
  transition: all 0.3s ease;
  z-index: 999;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(37, 211, 102, 0.6);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    color: white;
    font-size: 32px;
  }
`;

const Tooltip = styled.div`
  position: absolute;
  bottom: 70px;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;

  ${FloatingButton}:hover & {
    opacity: 1;
  }

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    right: 20px;
    border: 6px solid transparent;
    border-top-color: rgba(0, 0, 0, 0.8);
  }
`;

const WhatsAppFloatingButton: React.FC = () => {
  const navigate = useNavigate();

  return (
    <FloatingButton
      onClick={() => navigate('/whatsapp-simulator')}
      title="Testar Agente WhatsApp"
      aria-label="Abrir simulador do WhatsApp"
    >
      <Tooltip>Testar Agente LIA</Tooltip>
      <FaWhatsapp />
    </FloatingButton>
  );
};

export default WhatsAppFloatingButton;
