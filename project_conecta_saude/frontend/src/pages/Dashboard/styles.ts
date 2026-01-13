import styled, { css } from "styled-components";

export const DashboardContainer = styled.div`
  padding: 32px 40px;
  background: linear-gradient(135deg, #f0fffe 0%, #f3f4ff 50%, #fafbff 100%);
  min-height: 100vh;
  color: #0f172a;
  width: 100%;
  max-width: 1920px;
  margin: 0 auto;
  position: relative;

  &::before {
    content: "";
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(
        circle at 10% 20%,
        rgba(45, 227, 211, 0.08) 0%,
        transparent 40%
      ),
      radial-gradient(
        circle at 90% 80%,
        rgba(62, 42, 235, 0.08) 0%,
        transparent 40%
      );
    pointer-events: none;
    z-index: 0;
  }

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

export const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  position: relative;
  z-index: 1;
  padding: 24px 32px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 2px solid rgba(45, 227, 211, 0.15);
  box-shadow: 
    0 10px 30px rgba(62, 42, 235, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
    padding: 20px;
  }
`;

export const Title = styled.h1`
  font-size: 32px;
  line-height: 1.2;
  letter-spacing: -0.02em;
  font-weight: 800;
  background: linear-gradient(135deg, #3e2aeb 0%, #2de3d3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-family: "Poppins", sans-serif;
  position: relative;
  
  &::after {
    content: "";
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 60px;
    height: 4px;
    background: linear-gradient(90deg, #3e2aeb, #2de3d3);
    border-radius: 2px;
  }

  @media (max-width: 768px) {
    font-size: 26px;
  }
`;

export const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

export const SearchInput = styled.input`
  width: 320px;
  height: 46px;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  padding: 0 20px;
  font-size: 15px;
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  font-weight: 500;

  &::placeholder {
    color: #9ca3af;
  }

  &:hover {
    border-color: #2de3d3;
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 0 0 4px rgba(45, 227, 211, 0.08);
  }

  &:focus {
    outline: none;
    border-color: #3e2aeb;
    box-shadow: 0 0 0 4px rgba(62, 42, 235, 0.12);
    background: #fff;
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const ButtonBase = styled.button`
  height: 46px;
  padding: 0 20px;
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
  cursor: pointer;
  font-weight: 700;
  font-size: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.02em;
  text-transform: uppercase;
  position: relative;

  &:active {
    transform: translateY(1px) scale(0.98);
  }
`;

export const MapButton = styled(ButtonBase)`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 
    0 8px 20px rgba(16, 185, 129, 0.25),
    0 0 0 0 rgba(5, 150, 105, 0);
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 12px 28px rgba(16, 185, 129, 0.35);
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
  }
`;

export const AddButton = styled(ButtonBase)`
  background: linear-gradient(135deg, #3e2aeb 0%, #2de3d3 100%);
  color: white;
  box-shadow: 
    0 8px 20px rgba(62, 42, 235, 0.25),
    0 0 0 0 rgba(45, 227, 211, 0);
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
    box-shadow: 
      0 12px 28px rgba(62, 42, 235, 0.35),
      0 0 0 4px rgba(45, 227, 211, 0.15);

    &::before {
      left: 100%;
    }
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

export const LogoutButton = styled(ButtonBase)`
  background: #ffffff;
  border: 2px solid #e5e7eb;
  color: #374151;
  font-weight: 700;

  &:hover {
    background: #f9fafb;
    border-color: #3e2aeb;
    color: #3e2aeb;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(62, 42, 235, 0.15);
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

export const Content = styled.section`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  box-shadow: 
    0 10px 40px rgba(62, 42, 235, 0.08),
    0 0 0 1px rgba(45, 227, 211, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid rgba(45, 227, 211, 0.15);
  backdrop-filter: blur(20px);
  position: relative;
  z-index: 1;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #3e2aeb 0%, #2de3d3 50%, #3e2aeb 100%);
    background-size: 200% 100%;
    animation: shimmer 3s linear infinite;
  }

  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }

  &:hover {
    box-shadow: 
      0 20px 60px rgba(62, 42, 235, 0.12),
      0 0 0 1px rgba(45, 227, 211, 0.25),
      inset 0 1px 0 rgba(255, 255, 255, 0.9);
    transform: translateY(-2px);
    border-color: rgba(45, 227, 211, 0.25);
  }
`;

export const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  border-radius: 24px;
  margin-top: 3px;

  &::-webkit-scrollbar {
    height: 10px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(45, 227, 211, 0.05);
    border-radius: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #3e2aeb 0%, #2de3d3 100%);
    border-radius: 5px;
    border: 2px solid transparent;
    background-clip: padding-box;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #2de3d3 0%, #3e2aeb 100%);
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
  font-size: 13px;
  text-transform: uppercase;
  color: #475569;
  letter-spacing: 0.05em;
  border-bottom: 2px solid #e2e8f0;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 18px 20px;
  position: relative;
  cursor: ${(props) => (props.sortable ? "pointer" : "default")};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 700;

  ${(props) =>
    props.sortable &&
    `
    &:hover {
      color: #3e2aeb;
      background: linear-gradient(135deg, #f0fffe 0%, #f3f4ff 100%);
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
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
  vertical-align: middle;
  font-size: 15px;
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
  color: #64748b;
  margin-right: 4px;
  line-height: 1;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    background: linear-gradient(135deg, #f0fffe 0%, #f3f4ff 100%);
    color: #3e2aeb;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(62, 42, 235, 0.15);
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

export const TableHeaderRight = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

export const TableToolbar = styled.div`
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const TableFooter = styled.div`
  padding: 12px 16px;
  display: flex;
  justify-content: flex-end;
  color: #64748b;
`;

export const ExpandCell = styled.span<{ isOpen?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  svg {
    width: 22px;
    height: 22px;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform: rotate(${(props) => (props.isOpen ? "180deg" : "0deg")});
  }

  &:hover {
    color: #3e2aeb;
    background: linear-gradient(135deg, #f0fffe 0%, #f3f4ff 100%);
    box-shadow: 0 2px 8px rgba(62, 42, 235, 0.1);
  }
`;
