// src/pages/WhatsAppSimulator/WhatsAppSimulator.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPaperPlane, FaRobot } from 'react-icons/fa';
import { MdMoreVert } from 'react-icons/md';
import {
  Container,
  Header,
  BackButton,
  HeaderInfo,
  Avatar,
  InfoText,
  BotName,
  StatusText,
  MessagesContainer,
  MessageBubble,
  MessageText,
  MessageTime,
  InputContainer,
  Input,
  SendButton,
  TypingIndicator,
  Dot,
  EmergencyBanner,
  WelcomeMessage,
  EmailModal,
  EmailModalContent,
  EmailInput,
  EmailButton,
  SkipButton,
} from './styles';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isEmergency?: boolean;
}

const WhatsAppSimulator: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hasEmergency, setHasEmergency] = useState(false);
  const [patientEmail, setPatientEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mensagem de boas-vindas
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      text: 'Olá! Eu sou a LIA, assistente virtual de saúde. Estou aqui para te ajudar a atualizar suas informações e acompanhar seus dados de saúde. Como posso ajudar você hoje?',
      sender: 'bot',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  const startConversation = () => {
    if (patientEmail.trim()) {
      setShowEmailInput(false);
    }
  };

  const handleEmailKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      startConversation();
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Pega o token do localStorage
      const token = localStorage.getItem('token');
      
      // Chamada para o serviço do agente
      const response = await fetch('http://localhost:8002/api/v1/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          message: inputValue,
          patient_email: patientEmail || undefined, // Email do paciente para buscar/atualizar dados
          auth_token: token || undefined, // Token de autenticação do backend
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao comunicar com o agente');
      }

      const data = await response.json();
      
      // Verifica se é uma emergência
      const isEmergency = data.response.toLowerCase().includes('emergência') || 
                         data.response.toLowerCase().includes('samu');
      
      if (isEmergency) {
        setHasEmergency(true);
      }

      const botMessage: Message = {
        id: `bot_${Date.now()}`,
        text: data.response,
        sender: 'bot',
        timestamp: new Date(),
        isEmergency,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        text: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, verifique se o serviço do agente está rodando (http://localhost:8002).',
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Container>
      {/* Modal de Email */}
      {showEmailInput && (
        <EmailModal>
          <EmailModalContent>
            <h2>🤖 Bem-vindo ao Chat LIA!</h2>
            <p>
              Para que eu possa buscar e atualizar seus dados de saúde, por favor, 
              informe o email cadastrado no sistema:
            </p>
            <EmailInput
              type="email"
              placeholder="seu.email@exemplo.com"
              value={patientEmail}
              onChange={(e) => setPatientEmail(e.target.value)}
              onKeyPress={handleEmailKeyPress}
              autoFocus
            />
            <EmailButton
              onClick={startConversation}
              disabled={!patientEmail.trim()}
            >
              Iniciar Conversa
            </EmailButton>
            <SkipButton onClick={() => setShowEmailInput(false)}>
              Pular (apenas teste, sem atualizar dados)
            </SkipButton>
          </EmailModalContent>
        </EmailModal>
      )}

      {hasEmergency && (
        <EmergencyBanner>
          ⚠️ ATENÇÃO: Situação de emergência detectada. Procure atendimento médico imediatamente!
        </EmergencyBanner>
      )}
      
      <Header>
        <BackButton onClick={() => navigate('/dashboard')} aria-label="Voltar">
          <FaArrowLeft />
        </BackButton>
        
        <HeaderInfo onClick={() => navigate('/dashboard')}>
          <Avatar>
            <FaRobot />
          </Avatar>
          <InfoText>
            <BotName>LIA - Assistente Virtual</BotName>
            <StatusText>Online</StatusText>
          </InfoText>
        </HeaderInfo>

        <button
          style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '24px',
            padding: '8px',
          }}
          aria-label="Mais opções"
        >
          <MdMoreVert />
        </button>
      </Header>

      <MessagesContainer>
        {messages.length === 1 && (
          <WelcomeMessage>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
            <h3>Bem-vindo ao Simulador LIA!</h3>
            <p>
              Este é um ambiente de teste do agente WhatsApp.<br />
              Experimente conversar como se fosse um paciente.
            </p>
          </WelcomeMessage>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} sender={msg.sender} isEmergency={msg.isEmergency}>
            <MessageText>{msg.text}</MessageText>
            <MessageTime>{formatTime(msg.timestamp)}</MessageTime>
          </MessageBubble>
        ))}

        {isTyping && (
          <MessageBubble sender="bot">
            <TypingIndicator>
              <Dot style={{ animationDelay: '0s' }} />
              <Dot style={{ animationDelay: '0.2s' }} />
              <Dot style={{ animationDelay: '0.4s' }} />
            </TypingIndicator>
          </MessageBubble>
        )}

        <div ref={messagesEndRef} />
      </MessagesContainer>

      <InputContainer>
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Digite uma mensagem..."
          disabled={isTyping}
          aria-label="Digite sua mensagem"
        />
        <SendButton
          onClick={sendMessage}
          disabled={!inputValue.trim() || isTyping}
          aria-label="Enviar mensagem"
        >
          <FaPaperPlane />
        </SendButton>
      </InputContainer>
    </Container>
  );
};

export default WhatsAppSimulator;
