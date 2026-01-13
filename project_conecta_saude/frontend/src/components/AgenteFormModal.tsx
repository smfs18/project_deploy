import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { MdClose } from 'react-icons/md';
import { Agente, AgenteFormData } from './../services/api';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 32px;
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  h2 {
    margin: 0;
    font-size: 24px;
    color: #333;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s;

  &:hover {
    color: #333;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;

  label {
    display: block;
    font-weight: 600;
    margin-bottom: 8px;
    color: #333;
    font-size: 14px;
  }

  input,
  select,
  textarea {
    width: 100%;
    padding: 12px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    transition: border-color 0.3s;

    &:focus {
      outline: none;
      border-color: #4a90e2;
    }
  }

  textarea {
    resize: vertical;
    min-height: 100px;
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 32px;
  justify-content: flex-end;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  ${props => {
    if (props.variant === 'secondary') {
      return `
        background-color: #f0f0f0;
        color: #333;

        &:hover {
          background-color: #e0e0e0;
        }
      `;
    }
    return `
      background-color: #4a90e2;
      color: white;

      &:hover {
        background-color: #3a7bc8;
      }

      &:disabled {
        background-color: #ccc;
        cursor: not-allowed;
      }
    `;
  }}
`;

const ErrorMessage = styled.div`
  background-color: #f8d7da;
  color: #721c24;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
`;

const SuccessMessage = styled.div`
  background-color: #d4edda;
  color: #155724;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
`;

interface AgenteFormModalProps {
  isOpen: boolean;
  agente?: Agente | null;
  onClose: () => void;
  onSubmit: (data: AgenteFormData) => Promise<void>;
}

const AgenteFormModal: React.FC<AgenteFormModalProps> = ({ isOpen, agente, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<AgenteFormData>({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    tipo_profissional: 'ACS',
    numero_registro: '',
    ubs_nome: '',
    endereco: '',
    senha: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (agente) {
      setFormData({
        nome: agente.nome,
        email: agente.email,
        telefone: agente.telefone || '',
        cpf: agente.cpf,
        tipo_profissional: agente.tipo_profissional,
        numero_registro: agente.numero_registro || '',
        ubs_nome: agente.ubs_nome || '',
        endereco: agente.endereco || '',
        senha: '',  // Não popular senha ao editar por segurança
      });
    } else {
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        cpf: '',
        tipo_profissional: 'ACS',
        numero_registro: '',
        ubs_nome: '',
        endereco: '',
        senha: '',
      });
    }
    setError(null);
    setSuccess(null);
  }, [agente, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validações básicas
    if (!formData.nome.trim()) {
      setError('Nome é obrigatório');
      return;
    }

    if (!formData.email.trim()) {
      setError('Email é obrigatório');
      return;
    }

    if (!formData.cpf.trim()) {
      setError('CPF é obrigatório');
      return;
    }

    if (!formData.tipo_profissional) {
      setError('Tipo de profissional é obrigatório');
      return;
    }

    // Se criando novo agente, senha é obrigatória
    if (!agente && !formData.senha?.trim()) {
      setError('Senha é obrigatória para novo agente');
      return;
    }

    // Se atualizando e fornecendo senha, valida o comprimento
    if (formData.senha && formData.senha.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
      setSuccess(agente ? 'Agente atualizado com sucesso!' : 'Agente criado com sucesso!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar agente');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <h2>{agente ? 'Editar Agente' : 'Novo Agente'}</h2>
          <CloseButton onClick={onClose}>
            <MdClose />
          </CloseButton>
        </ModalHeader>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        <form onSubmit={handleSubmit}>
          <FormRow>
            <FormGroup>
              <label htmlFor="nome">Nome Completo *</label>
              <input
                id="nome"
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Ex: João da Silva"
              />
            </FormGroup>

            <FormGroup>
              <label htmlFor="email">Email *</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Ex: joao@email.com"
              />
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <label htmlFor="cpf">CPF *</label>
              <input
                id="cpf"
                type="text"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                placeholder="Ex: 123.456.789-00"
              />
            </FormGroup>

            <FormGroup>
              <label htmlFor="telefone">Telefone</label>
              <input
                id="telefone"
                type="tel"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                placeholder="Ex: (11) 99999-9999"
              />
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <label htmlFor="tipo_profissional">Tipo de Profissional *</label>
              <select
                id="tipo_profissional"
                name="tipo_profissional"
                value={formData.tipo_profissional}
                onChange={handleChange}
              >
                <option value="ACS">Agente Comunitário de Saúde (ACS)</option>
                <option value="Enfermeiro">Enfermeiro</option>
                <option value="Médico">Médico</option>
                <option value="Dentista">Dentista</option>
                <option value="Psicólogo">Psicólogo</option>
                <option value="Nutricionista">Nutricionista</option>
                <option value="Outro">Outro</option>
              </select>
            </FormGroup>

            <FormGroup>
              <label htmlFor="numero_registro">Número de Registro</label>
              <input
                id="numero_registro"
                type="text"
                name="numero_registro"
                value={formData.numero_registro}
                onChange={handleChange}
                placeholder="Ex: CRM 123456"
              />
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <label htmlFor="ubs_nome">UBS</label>
              <input
                id="ubs_nome"
                type="text"
                name="ubs_nome"
                value={formData.ubs_nome}
                onChange={handleChange}
                placeholder="Ex: UBS Centro"
              />
            </FormGroup>

            <FormGroup>
              <label htmlFor="endereco">Endereço</label>
              <input
                id="endereco"
                type="text"
                name="endereco"
                value={formData.endereco}
                onChange={handleChange}
                placeholder="Ex: Rua Principal, 123"
              />
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <label htmlFor="senha">
                Senha {!agente ? '*' : '(deixe em branco para não alterar)'}
              </label>
              <input
                id="senha"
                type="password"
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                placeholder={agente ? "Deixe em branco para manter a senha atual" : "Ex: Senha123!"}
              />
            </FormGroup>
          </FormRow>

          <FormActions>
            <Button variant="secondary" type="button" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </FormActions>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default AgenteFormModal;
