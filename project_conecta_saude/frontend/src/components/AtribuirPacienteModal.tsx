import React, { useState } from 'react';
import styled from 'styled-components';
import { MdClose } from 'react-icons/md';
import { AtribuicaoPacienteFormData, Paciente } from './../services/api';

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
  max-width: 650px;
  width: calc(100% - 32px);
  max-height: 90vh;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 32px;
  position: relative;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 10px;
    
    &:hover {
      background: #999;
    }
  }
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
    min-height: 120px;
  }
`;

const PacienteSelect = styled.div`
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
  margin-bottom: 16px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 10px;
    
    &:hover {
      background: #999;
    }
  }
`;

const PacienteOption = styled.div<{ selected?: boolean }>`
  padding: 14px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  background-color: ${props => props.selected ? 'linear-gradient(135deg, #e3f2fd 0%, #f0f7ff 100%)' : 'white'};
  transition: all 0.3s;
  border-left: 4px solid ${props => props.selected ? '#2563eb' : 'transparent'};
  display: flex;
  align-items: flex-start;
  gap: 12px;

  &:hover {
    background-color: ${props => props.selected ? 'linear-gradient(135deg, #e3f2fd 0%, #f0f7ff 100%)' : '#f9fafb'};
  }

  &:last-child {
    border-bottom: none;
  }

  input[type="radio"] {
    margin-top: 4px;
    margin-right: 4px;
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    cursor: pointer;
  }

  strong {
    color: #1f2937;
    margin-bottom: 6px;
    font-size: 15px;
    display: block;
    line-height: 1.4;
  }

  small {
    color: #6b7280;
    display: block;
    font-size: 12px;
    margin-bottom: 2px;
    line-height: 1.3;
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
      background-color: #27ae60;
      color: white;

      &:hover {
        background-color: #229954;
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

const InfoClinicaBox = styled.div`
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 2px solid #86efac;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 20px;
  
  .titulo {
    font-weight: 700;
    color: #166534;
    margin-bottom: 12px;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .grid-clinica {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;

    @media (max-width: 480px) {
      grid-template-columns: 1fr;
    }
  }

  .item-clinico {
    background: white;
    padding: 12px;
    border-radius: 8px;
    border-left: 4px solid #10b981;

    .label {
      font-size: 11px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      margin-bottom: 4px;
    }

    .valor {
      font-size: 16px;
      font-weight: 700;
      color: #059669;
    }

    .unidade {
      font-size: 12px;
      color: #6b7280;
      margin-top: 2px;
    }
  }
`;

interface AtribuirPacienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  pacientes: Paciente[];
  onSubmit: (data: AtribuicaoPacienteFormData) => Promise<void>;
}

const AtribuirPacienteModal: React.FC<AtribuirPacienteModalProps> = ({
  isOpen,
  onClose,
  pacientes,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<AtribuicaoPacienteFormData>({
    paciente_id: 0,
    nome_paciente: '',
    localizacao: '',
    informacoes_clinicas: {},
    notas_gestor: '',
    data_visita_planejada: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);

  const handlePacienteSelect = (paciente: Paciente) => {
    setSelectedPaciente(paciente);
    setFormData(prev => ({
      ...prev,
      paciente_id: paciente.id,
      nome_paciente: paciente.nome,
      localizacao: paciente.endereco || '',
      informacoes_clinicas: {
        glicemia: paciente.glicemia_jejum_mg_dl,
        pressao: `${paciente.pressao_sistolica_mmHg}/${paciente.pressao_diastolica_mmHg}`,
        imc: paciente.imc
      },
    }));
    setError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'data_visita_planejada' ? value : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.paciente_id) {
      setError('Selecione um paciente');
      return;
    }

    if (!formData.data_visita_planejada) {
      setError('Selecione uma data para a visita');
      return;
    }

    try {
      setLoading(true);
      const dataFormatada = new Date(formData.data_visita_planejada).toISOString();
      const payload = {
        ...formData,
        data_visita_planejada: dataFormatada,
      };
      await onSubmit(payload);
      setSuccess('Paciente atribuído com sucesso!');
      setTimeout(() => {
        onClose();
        setFormData({
          paciente_id: 0,
          nome_paciente: '',
          localizacao: '',
          informacoes_clinicas: {},
          notas_gestor: '',
          data_visita_planejada: '',
        });
        setSelectedPaciente(null);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Erro ao atribuir paciente');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <h2>Atribuir Paciente</h2>
          <CloseButton onClick={onClose}>
            <MdClose />
          </CloseButton>
        </ModalHeader>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        <form onSubmit={handleSubmit}>
          <FormGroup>
            <label>Selecione o Paciente *</label>
            {pacientes.length > 0 ? (
              <PacienteSelect>
                {pacientes.map(paciente => (
                  <PacienteOption
                    key={paciente.id}
                    selected={selectedPaciente?.id === paciente.id}
                    onClick={() => handlePacienteSelect(paciente)}
                  >
                    <input
                      type="radio"
                      name="paciente"
                      checked={selectedPaciente?.id === paciente.id}
                      onChange={() => handlePacienteSelect(paciente)}
                    />
                    <div style={{ flex: 1 }}>
                      <strong>{paciente.nome}</strong>
                      <small>📧 {paciente.email}</small>
                    </div>
                    {(paciente.glicemia_jejum_mg_dl || paciente.pressao_sistolica_mmHg) && (
                      <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
                        {paciente.glicemia_jejum_mg_dl && (
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ color: '#999', fontSize: '10px', display: 'block' }}>Glicemia</span>
                            <span style={{ color: '#059669', fontWeight: 700 }}>{paciente.glicemia_jejum_mg_dl}</span>
                          </div>
                        )}
                        {paciente.pressao_sistolica_mmHg && (
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ color: '#999', fontSize: '10px', display: 'block' }}>Pressão</span>
                            <span style={{ color: '#059669', fontWeight: 700 }}>
                              {paciente.pressao_sistolica_mmHg}/{paciente.pressao_diastolica_mmHg}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </PacienteOption>
                ))}
              </PacienteSelect>
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                Nenhum paciente disponível
              </div>
            )}
          </FormGroup>

          {selectedPaciente && (
            <>
              {/* Informações Clínicas do Paciente */}
              {(selectedPaciente.glicemia_jejum_mg_dl || selectedPaciente.pressao_sistolica_mmHg) && (
                <InfoClinicaBox>
                  {selectedPaciente.glicemia_jejum_mg_dl && (
                    <div>
                      <span style={{ color: '#666', fontSize: '11px', fontWeight: 600 }}>Glicemia</span>
                      <div style={{ color: '#059669', fontWeight: 700, fontSize: '18px', marginTop: '4px' }}>
                        {selectedPaciente.glicemia_jejum_mg_dl} <span style={{ fontSize: '12px' }}>mg/dL</span>
                      </div>
                    </div>
                  )}
                  {selectedPaciente.pressao_sistolica_mmHg && (
                    <div>
                      <span style={{ color: '#666', fontSize: '11px', fontWeight: 600 }}>Pressão</span>
                      <div style={{ color: '#059669', fontWeight: 700, fontSize: '18px', marginTop: '4px' }}>
                        {selectedPaciente.pressao_sistolica_mmHg}/{selectedPaciente.pressao_diastolica_mmHg} <span style={{ fontSize: '12px' }}>mmHg</span>
                      </div>
                    </div>
                  )}
                </InfoClinicaBox>
              )}

              <FormGroup>
                <label htmlFor="data_visita_planejada">Data da Visita *</label>
                <input
                  id="data_visita_planejada"
                  type="datetime-local"
                  name="data_visita_planejada"
                  value={formData.data_visita_planejada}
                  onChange={handleChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <label htmlFor="localizacao">Localização/Endereço para Atendimento</label>
                <input
                  id="localizacao"
                  type="text"
                  name="localizacao"
                  value={formData.localizacao}
                  onChange={handleChange}
                  placeholder="Ex: Rua Principal, 123 - Apto 45"
                />
              </FormGroup>

              <FormGroup>
                <label htmlFor="notas_gestor">Notas para o Agente</label>
                <textarea
                  id="notas_gestor"
                  name="notas_gestor"
                  value={formData.notas_gestor}
                  onChange={handleChange}
                  placeholder="Ex: Paciente com hipertensão, necessita acompanhamento especial..."
                />
              </FormGroup>
            </>
          )}

          <FormActions>
            <Button variant="secondary" type="button" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !formData.paciente_id}>
              {loading ? 'Atribuindo...' : 'Atribuir'}
            </Button>
          </FormActions>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default AtribuirPacienteModal;
