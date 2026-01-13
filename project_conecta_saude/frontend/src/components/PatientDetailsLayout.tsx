import styled from 'styled-components';

export const DetailsContainer = styled.div`
  padding: 24px;
  background-color: white;
  border-radius: 8px;
  margin: 8px 16px;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
  min-height: 600px;
`;

export const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 32px;
`;

export const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const Section = styled.div`
  margin-bottom: 24px;
`;

export const SectionTitle = styled.h3`
  color: #1e40af;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const SectionContent = styled.div`
  display: grid;
  gap: 12px;
`;

export const DetailItem = styled.div`
  strong {
    color: #1f2937;
  }
`;

export const RightColumn = styled.div`
  flex: 1;
`;
