import styled from 'styled-components';

export const PatientDetailsContainer = styled.div`
  padding: 20px;
  background-color: #f8fafc;
  min-height: 600px;
`;

export const Layout = styled.div`
  display: flex;
  gap: 24px;
`;

export const InfoColumn = styled.div`
  width: 380px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const RecommendationsColumn = styled.div`
  flex: 1;
  min-width: 0;
`;
