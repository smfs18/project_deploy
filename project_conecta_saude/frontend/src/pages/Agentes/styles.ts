import styled, { css } from 'styled-components';

export const AgentesContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f0fffe 0%, #f3f4ff 50%, #fafbff 100%);
  position: relative;
  overflow: hidden;
`;

export const Content = styled.div`
  position: relative;
  z-index: 1;
  padding: 40px 30px;
  max-width: 100%;
  margin: 0 auto;
`;

export const Header = styled.div`
  background: white;
  border-radius: 12px;
  padding: 50px 50px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 800px;
  align-items: center;
  border: 1px solid rgba(224, 242, 254, 0.5);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 20px 24px;
  }
`;

export const Title = styled.h1`
  font-size: 50px;
  font-weight: 700;
  background: linear-gradient(135deg, #3e2aeb 0%, #2de3d3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  position: relative;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

export const Actions = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    width: 100%;
    flex-direction: column;
  }
`;

export const AddButton = styled.button`
  appearance: none;
  border: none;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
  letter-spacing: 0.02em;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const LogoutButton = styled.button`
  appearance: none;
  border: none;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
  letter-spacing: 0.02em;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const ManageButton = styled.button`
  appearance: none;
  border: none;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
  letter-spacing: 0.02em;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const SearchContainer = styled.div`
  margin-bottom: 24px;
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #1f2937;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    outline: none;
    border-color: #3e2aeb;
    background: white;
    box-shadow: 0 0 0 3px rgba(62, 42, 235, 0.1);
  }
`;

export const TableWrapper = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  overflow: auto;
  width: 100%;

  &::-webkit-scrollbar {
    height: 10px;
    width: 10px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 5px;
    border: 2px solid transparent;
    background-clip: padding-box;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
    background-clip: padding-box;
  }
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 880px;
`;

export const Tr = styled.tr<{ isExpandedContent?: boolean }>`
  transition: all 0.2s ease;
  
  ${(props) =>
    !props.isExpandedContent &&
    `
    &:hover td {
      background: linear-gradient(135deg, #f8fffe 0%, #f9fafe 100%);
    }
  `}
`;

export const Th = styled.th<{
  sortable?: boolean;
  sortDirection?: "asc" | "desc" | null;
}>`
  text-align: left;
  font-size: 12px;
  text-transform: uppercase;
  color: #6b7280;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
  padding: 14px 18px;
  position: relative;
  cursor: ${(props) => (props.sortable ? "pointer" : "default")};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 600;

  ${(props) =>
    props.sortable &&
    `
    &:hover {
      color: #3e2aeb;
      background: #f3f4ff;
    }

    &::after {
      content: '';
      display: inline-block;
      width: 0;
      height: 0;
      margin-left: 10px;
      vertical-align: middle;
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      transition: all 0.3s ease;
      ${
        props.sortDirection === "asc"
          ? `
        border-bottom: 5px solid #3e2aeb;
        border-top: none;
      `
          : props.sortDirection === "desc"
          ? `
        border-top: 5px solid #3e2aeb;
        border-bottom: none;
      `
          : `
        border-bottom: 5px solid #94a3b8;
        opacity: 0.4;
      `
      }
    }
  `}
`;

export const Td = styled.td`
  padding: 14px 18px;
  border-bottom: 1px solid #e5e7eb;
  vertical-align: middle;
  font-size: 14px;
  color: #1f2937;
  background: #fff;
  transition: all 0.2s ease;
  font-weight: 500;
`;

export const Badge = styled.span<{
  tone?: "success" | "warning" | "danger" | "neutral";
}>`
  display: inline-flex;
  align-items: center;
  height: 32px;
  padding: 0 16px;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 700;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.02em;
  text-transform: uppercase;
  ${({ tone }) => {
    switch (tone) {
      case "success":
        return css`
          background: linear-gradient(135deg, rgba(45, 227, 211, 0.2) 0%, rgba(45, 227, 211, 0.15) 100%);
          color: #0d9488;
          border: 2px solid rgba(45, 227, 211, 0.4);
          box-shadow: 0 2px 8px rgba(45, 227, 211, 0.15);
        `;
      case "warning":
        return css`
          background: linear-gradient(135deg, rgba(250, 204, 21, 0.2) 0%, rgba(250, 204, 21, 0.15) 100%);
          color: #b45309;
          border: 2px solid rgba(250, 204, 21, 0.4);
          box-shadow: 0 2px 8px rgba(250, 204, 21, 0.15);
        `;
      case "danger":
        return css`
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.15) 100%);
          color: #dc2626;
          border: 2px solid rgba(239, 68, 68, 0.4);
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.15);
        `;
      default:
        return css`
          background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
          color: #374151;
          border: 2px solid #9ca3af;
        `;
    }
  }}
  
  &:hover {
    transform: translateY(-1px);
    ${({ tone }) => {
      switch (tone) {
        case "success":
          return css`box-shadow: 0 4px 12px rgba(45, 227, 211, 0.25);`;
        case "warning":
          return css`box-shadow: 0 4px 12px rgba(250, 204, 21, 0.25);`;
        case "danger":
          return css`box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);`;
        default:
          return css`box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);`;
      }
    }}
  }
`;

export const ActionIcon = styled.button`
  appearance: none;
  border: none;
  background: transparent;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 8px;
  color: #9ca3af;
  margin-right: 4px;
  line-height: 1;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    background: #f3f4ff;
    color: #3e2aeb;
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(62, 42, 235, 0.1);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

export const EmptyState = styled.div`
  text-align: center;
  color: #64748b;
  padding: 48px 24px;
  font-size: 16px;
  font-weight: 500;
`;

export const ExpandCell = styled.span<{ isOpen?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  svg {
    width: 20px;
    height: 20px;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform: rotate(${(props) => (props.isOpen ? "180deg" : "0deg")});
  }

  &:hover {
    color: #3e2aeb;
    background: #f3f4ff;
    box-shadow: 0 1px 3px rgba(62, 42, 235, 0.1);
  }
`;

export const ExpandContent = styled.div<{ isOpen: boolean }>`
  max-height: ${(props) => (props.isOpen ? '1500px' : '0px')};
  overflow: hidden;
  transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  background: #fafbfc;
`;

export const ExpandedDetails = styled.div`
  padding: 20px 24px;
  border-top: 1px solid #e2e8f0;
`;

export const DetailRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

export const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Label = styled.label`
  font-weight: 700;
  color: #64748b;
  margin-bottom: 8px;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

export const Value = styled.span`
  color: #1f2937;
  font-size: 16px;
  font-weight: 600;
`;

export const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);

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
  background: white;
  border-radius: 16px;
  padding: 32px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(62, 42, 235, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.8);
  animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

export const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 24px;
  background: linear-gradient(135deg, #3e2aeb 0%, #2de3d3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

export const FormGroup = styled.div`
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
`;

export const FormLabel = styled.label`
  font-weight: 600;
  margin-bottom: 8px;
  color: #1f2937;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
`;

export const FormInput = styled.input`
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  color: #1f2937;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(255, 255, 255, 0.95);

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    outline: none;
    border-color: #3e2aeb;
    background: white;
    box-shadow: 0 0 0 3px rgba(62, 42, 235, 0.1);
  }
`;

export const FormSelect = styled.select`
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  color: #1f2937;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #3e2aeb;
    box-shadow: 0 0 0 3px rgba(62, 42, 235, 0.1);
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

export const PrimaryButton = styled.button`
  appearance: none;
  border: none;
  background: linear-gradient(135deg, #3e2aeb 0%, #2de3d3 100%);
  color: white;
  padding: 12px 24px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(62, 42, 235, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.02em;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(62, 42, 235, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

export const SecondaryButton = styled.button`
  appearance: none;
  border: 2px solid #e5e7eb;
  background: white;
  color: #1f2937;
  padding: 12px 24px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-transform: uppercase;
  letter-spacing: 0.02em;

  &:hover {
    border-color: #3e2aeb;
    color: #3e2aeb;
    background: linear-gradient(135deg, #f0fffe 0%, #f3f4ff 100%);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const DangerButton = styled.button`
  appearance: none;
  border: none;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const EditButton = styled.button`
  appearance: none;
  border: none;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const AssignButton = styled.button`
  appearance: none;
  border: none;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  letter-spacing: 0.02em;
  text-transform: capitalize;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 12px 16px;
  }
`;

export const PacientesSection = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
`;

export const PacienteCard = styled.div`
  padding: 16px;
  border-radius: 8px;
  background: white;
  border: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: #fafbfc;
    border-color: #d1d5db;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    transform: translateY(-1px);
  }
`;

export const NoAgentsMessage = styled.div`
  text-align: center;
  padding: 48px;
  color: #64748b;
  font-size: 18px;
  font-weight: 500;
`;

// ============== RELATÓRIOS E VISITAS ==============

export const RelatorioSection = styled.div`
  margin-top: 24px;
  padding: 16px;
  background: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
`;

export const RelatorioTitle = styled.h4`
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 700;
  color: #1e40af;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const RelatorioCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

export const RelatorioHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;

  .paciente-info {
    flex: 1;

    .nome {
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 4px;
    }

    .data {
      font-size: 12px;
      color: #6b7280;
    }
  }

  .status-badge {
    padding: 4px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    background: #d1fae5;
    color: #065f46;
  }
`;

export const RelatorioBody = styled.div`
  border-top: 1px solid #f3f4f6;
  padding-top: 12px;

  .relatorio-item {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }

    .item-label {
      font-size: 12px;
      font-weight: 700;
      color: #6b7280;
      text-transform: uppercase;
      margin-bottom: 4px;
    }

    .item-value {
      font-size: 13px;
      color: #374151;
      line-height: 1.5;
      padding: 8px;
      background: #f9fafb;
      border-radius: 4px;
      border-left: 3px solid #3b82f6;
    }
  }
`;

export const ViewRelatButton = styled.button`
  appearance: none;
  border: none;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const NoRelatorioMessage = styled.div`
  text-align: center;
  padding: 24px;
  color: #9ca3af;
  font-size: 14px;
  font-style: italic;
`;

// Modal para visualização de relatório completo
export const RelatorioModal = styled.div`
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
`;

export const RelatorioModalContent = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  padding: 32px;

  h3 {
    margin: 0 0 16px 0;
    color: #1f2937;
    font-size: 20px;
  }

  .modal-section {
    margin-bottom: 24px;

    .section-title {
      font-weight: 700;
      color: #374151;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e5e7eb;
    }

    .section-content {
      font-size: 14px;
      color: #4b5563;
      line-height: 1.6;
      white-space: pre-wrap;
      word-break: break-word;
    }
  }
`;

export const CloseModalButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #9ca3af;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s;

  &:hover {
    color: #374151;
  }
`;
