import styled from 'styled-components';

// Container principal com tema WhatsApp
export const Container = styled.div`
  min-height: 100vh;
  height: 100vh;
  width: 100%;
  background: #e5ddd5;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23e5ddd5" width="100" height="100"/><path fill="%23d9d1c9" opacity="0.1" d="M0 0h50v50H0zm50 50h50v50H50z"/></svg>');
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    background: #0d141a;
  }
`;

// Header estilo WhatsApp
export const Header = styled.header`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: #075e54;
  position: relative;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;

  @media (max-width: 768px) {
    padding: 12px 16px;
  }
`;

export const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #fff;
  font-size: 20px;
  transition: opacity 0.2s ease;
  border-radius: 50%;

  &:hover {
    opacity: 0.8;
    background: rgba(255, 255, 255, 0.1);
  }
`;

export const HeaderInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

export const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  flex-shrink: 0;
`;

export const InfoText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const BotName = styled.h2`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
`;

export const StatusText = styled.span`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
`;

// Container de mensagens estilo WhatsApp
export const MessagesContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px;
  overflow-y: auto;
  background: #e5ddd5;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23e5ddd5" width="100" height="100"/><path fill="%23d9d1c9" opacity="0.1" d="M0 0h50v50H0zm50 50h50v50H50z"/></svg>');

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

// Bolha de mensagem
interface MessageBubbleProps {
  sender: 'user' | 'bot';
  isEmergency?: boolean;
}

export const MessageBubble = styled.div<MessageBubbleProps>`
  max-width: 65%;
  padding: 8px 12px;
  border-radius: 8px;
  margin-bottom: 4px;
  position: relative;
  word-wrap: break-word;
  align-self: ${props => props.sender === 'user' ? 'flex-end' : 'flex-start'};
  background: ${props => {
    if (props.isEmergency) return '#ff4444';
    return props.sender === 'user' ? '#dcf8c6' : '#ffffff';
  }};
  color: ${props => props.isEmergency ? '#ffffff' : '#000000'};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &::before {
    content: '';
    position: absolute;
    ${props => props.sender === 'user' ? 'right: -8px;' : 'left: -8px;'}
    top: 0;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: ${props => props.sender === 'user' ? '0 0 10px 10px' : '0 10px 10px 0'};
    border-color: transparent transparent ${props => {
      if (props.isEmergency) return '#ff4444';
      return props.sender === 'user' ? '#dcf8c6' : '#ffffff';
    }} transparent;
  }

  @media (max-width: 768px) {
    max-width: 80%;
  }
`;

export const MessageText = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
`;

export const MessageTime = styled.span`
  display: block;
  font-size: 11px;
  color: rgba(0, 0, 0, 0.45);
  text-align: right;
  margin-top: 4px;
`;

// Input container estilo WhatsApp
export const InputContainer = styled.div`
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: #f0f0f0;
  border-top: 1px solid #d1d7db;
  align-items: center;
`;

export const Input = styled.input`
  flex: 1;
  padding: 10px 12px;
  border: none;
  border-radius: 20px;
  font-size: 15px;
  font-family: inherit;
  background: #ffffff;
  transition: all 0.2s ease;
  color: #000;

  &::placeholder {
    color: #999;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(7, 94, 84, 0.2);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const SendButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: #25d366;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: white;
  transition: all 0.2s ease;
  font-size: 18px;
  flex-shrink: 0;

  &:hover:not(:disabled) {
    background: #20ba5a;
    transform: scale(1.05);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #ccc;
  }
`;

// Indicador de digitação
export const TypingIndicator = styled.div`
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  align-items: center;
`;

export const Dot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #999;
  animation: bounce 1.4s infinite ease-in-out;

  @keyframes bounce {
    0%, 80%, 100% {
      transform: scale(0);
      opacity: 0.5;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

// Banner de emergência
export const EmergencyBanner = styled.div`
  background: #ff4444;
  color: white;
  padding: 12px 20px;
  text-align: center;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  animation: pulse 2s infinite;

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.9;
    }
  }
`;

// Mensagem de boas-vindas
export const WelcomeMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px;
  color: #075e54;
  opacity: 0.7;

  h3 {
    margin: 0 0 8px 0;
    font-size: 20px;
    font-weight: 600;
  }

  p {
    margin: 0;
    font-size: 14px;
    line-height: 1.5;
    color: #666;
  }
`;

// Modal de Email
export const EmailModal = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

export const EmailModalContent = styled.div`
  background: white;
  padding: 32px;
  border-radius: 12px;
  max-width: 450px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);

  h2 {
    margin: 0 0 8px 0;
    color: #075e54;
    font-size: 24px;
  }

  p {
    margin: 0 0 24px 0;
    color: #666;
    font-size: 14px;
    line-height: 1.5;
  }
`;

export const EmailInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  margin-bottom: 16px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #075e54;
  }

  &::placeholder {
    color: #999;
  }
`;

export const EmailButton = styled.button`
  width: 100%;
  padding: 12px 16px;
  background: linear-gradient(135deg, #128c7e 0%, #075e54 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(7, 94, 84, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const SkipButton = styled.button`
  width: 100%;
  padding: 12px 16px;
  background: transparent;
  color: #666;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  margin-top: 8px;
  transition: all 0.2s ease;

  &:hover {
    color: #075e54;
    background: #f5f5f5;
  }
`;
