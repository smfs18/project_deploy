import React from 'react';
import styled from 'styled-components';
import { MdWarning } from 'react-icons/md';

const DialogBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const DialogContainer = styled.div`
  background: rgba(255, 255, 255, 0.98);
  padding: 32px;
  border-radius: 24px;
  max-width: 480px;
  width: 100%;
  margin: 20px;
  box-shadow: 
    0 20px 60px rgba(239, 68, 68, 0.25),
    0 0 0 1px rgba(239, 68, 68, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(239, 68, 68, 0.2);
  backdrop-filter: blur(20px);
  animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px) scale(0.9);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

const DialogIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  border: 3px solid rgba(239, 68, 68, 0.3);
  animation: pulse 2s ease-in-out infinite;

  svg {
    color: #dc2626;
    font-size: 32px;
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
    }
    50% {
      transform: scale(1.05);
      box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
    }
  }
`;

const DialogTitle = styled.h3`
  margin: 0 0 16px;
  font-size: 24px;
  font-weight: 800;
  color: #dc2626;
  text-align: center;
  font-family: "Poppins", sans-serif;
  letter-spacing: -0.02em;
`;

const DialogMessage = styled.p`
  margin: 0 0 32px;
  color: #4b5563;
  text-align: center;
  line-height: 1.6;
  font-size: 15px;
  font-weight: 500;

  strong {
    color: #1f2937;
    font-weight: 700;
  }
`;

const DialogActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`;

const BaseButton = styled.button`
  padding: 14px 28px;
  border: none;
  border-radius: 14px;
  font-weight: 700;
  cursor: pointer;
  font-size: 15px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
`;

const CancelButton = styled(BaseButton)`
  background: #ffffff;
  color: #374151;
  border: 2px solid #e5e7eb;

  &:hover {
    background: #f9fafb;
    border-color: #9ca3af;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const ConfirmButton = styled(BaseButton)`
  background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
  color: white;
  box-shadow: 0 8px 20px rgba(220, 38, 38, 0.3);

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    transition: 0.6s;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 28px rgba(220, 38, 38, 0.4);

    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(0);
  }
`;

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
}) => {
  if (!isOpen) return null;

  return (
    <DialogBackdrop onClick={onCancel}>
      <DialogContainer onClick={(e) => e.stopPropagation()}>
        <DialogIcon>
          <MdWarning />
        </DialogIcon>
        <DialogTitle>{title}</DialogTitle>
        <DialogMessage dangerouslySetInnerHTML={{ __html: message }} />
        <DialogActions>
          <CancelButton onClick={onCancel}>
            {cancelText}
          </CancelButton>
          <ConfirmButton onClick={onConfirm}>
            {confirmText}
          </ConfirmButton>
        </DialogActions>
      </DialogContainer>
    </DialogBackdrop>
  );
};

export default ConfirmDialog;
