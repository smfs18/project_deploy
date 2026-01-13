// src/components/PatientFormModal.styles.ts
import styled from "styled-components";

export const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
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

export const ModalContent = styled.div`
  background: rgba(255, 255, 255, 0.98);
  border-radius: 24px;
  box-shadow: 
    0 20px 60px rgba(62, 42, 235, 0.2),
    0 0 0 1px rgba(45, 227, 211, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  width: 100%;
  max-width: 960px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  border: 2px solid rgba(45, 227, 211, 0.2);
  backdrop-filter: blur(20px);
  animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 2px solid rgba(45, 227, 211, 0.15);
  background: linear-gradient(135deg, #f8fffe 0%, #f9fafe 100%);
  border-radius: 24px 24px 0 0;

  h2 {
    margin: 0;
    font-size: 28px;
    font-weight: 800;
    font-family: "Poppins", sans-serif;
    background: linear-gradient(135deg, #3e2aeb 0%, #2de3d3 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.02em;
  }
`;

export const ModalCloseButton = styled.button`
  background: rgba(239, 68, 68, 0.1);
  border: 2px solid rgba(239, 68, 68, 0.2);
  width: 40px;
  height: 40px;
  border-radius: 12px;
  font-size: 20px;
  cursor: pointer;
  color: #dc2626;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 700;
  
  &:hover {
    background: rgba(239, 68, 68, 0.2);
    border-color: rgba(239, 68, 68, 0.4);
    transform: rotate(90deg);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
  }
`;

export const ModalBody = styled.form`
  overflow-y: auto;
  padding: 32px;
  
  &::-webkit-scrollbar {
    width: 10px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(45, 227, 211, 0.05);
    border-radius: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #3e2aeb 0%, #2de3d3 100%);
    border-radius: 5px;
  }
`;

export const StyledFieldset = styled.fieldset`
  border: 2px solid rgba(45, 227, 211, 0.2);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  background: linear-gradient(135deg, rgba(248, 255, 254, 0.5) 0%, rgba(249, 250, 254, 0.5) 100%);
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(45, 227, 211, 0.35);
    box-shadow: 0 4px 16px rgba(62, 42, 235, 0.08);
  }
`;

export const StyledLegend = styled.legend`
  padding: 0 12px;
  font-weight: 700;
  font-size: 16px;
  background: linear-gradient(135deg, #3e2aeb 0%, #2de3d3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-family: "Poppins", sans-serif;
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
`;

export const FormGridSmall = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 20px;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-weight: 600;
    font-size: 14px;
    color: #1f2937;
    letter-spacing: 0.01em;
  }

  input[type="text"],
  input[type="email"],
  input[type="password"],
  input[type="date"],
  input[type="number"],
  select {
    width: 100%;
    padding: 14px 16px;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 500;
    background: #f9fafb;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  input:hover,
  select:hover {
    border-color: #2de3d3;
    background: #fff;
  }

  input:focus,
  select:focus {
    outline: none;
    border-color: #3e2aeb;
    box-shadow: 0 0 0 4px rgba(62, 42, 235, 0.12);
    background: #fff;
    transform: translateY(-1px);
  }
`;

export const CheckboxGroup = styled(FormGroup)`
  flex-direction: row;
  align-items: center;
  gap: 10px;
  padding-top: 24px;

  label {
    cursor: pointer;
    font-weight: 600;
  }

  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
    accent-color: #3e2aeb;
  }
`;

export const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px 32px;
  border-top: 2px solid rgba(45, 227, 211, 0.15);
  background: linear-gradient(135deg, #f8fffe 0%, #f9fafe 100%);
  border-radius: 0 0 24px 24px;
`;

const BaseButton = styled.button`
  border: none;
  padding: 14px 24px;
  border-radius: 14px;
  font-weight: 700;
  cursor: pointer;
  font-size: 15px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

export const PrimaryButton = styled(BaseButton)`
  background: linear-gradient(135deg, #3e2aeb 0%, #2de3d3 100%);
  color: #fff;
  box-shadow: 0 8px 20px rgba(62, 42, 235, 0.25);
  position: relative;
  overflow: hidden;

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
    box-shadow: 0 12px 28px rgba(62, 42, 235, 0.35);
    
    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(0);
  }
`;

export const SecondaryButton = styled(BaseButton)`
  background: #ffffff;
  color: #374151;
  border: 2px solid #e5e7eb;
  
  &:hover {
    background: #f9fafb;
    border-color: #3e2aeb;
    color: #3e2aeb;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(62, 42, 235, 0.15);
  }
`;

export const ErrorMessage = styled.div`
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  color: #991b1b;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 20px;
  font-size: 14px;
  font-weight: 600;
  border: 2px solid #f87171;
  box-shadow: 0 4px 12px rgba(248, 113, 113, 0.15);
`;
