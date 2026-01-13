import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdEdit, MdDelete, MdArrowDropDown, MdAdd, MdClose } from 'react-icons/md';
import {
  AgentesContainer,
  Content,
  Header,
  Title,
  Actions,
  SearchContainer,
  SearchInput,
  AddButton,
  LogoutButton,
  ManageButton,
  TableWrapper,
  Table,
  Th,
  Td,
  Tr,
  Badge,
  ActionIcon,
  EmptyState,
  ExpandCell,
  ExpandContent,
  ExpandedDetails,
  DetailRow,
  DetailItem,
  Label,
  Value,
  DangerButton,
  AssignButton,
  RelatorioSection,
  RelatorioTitle,
  RelatorioCard,
  RelatorioHeader,
  RelatorioBody,
  ViewRelatButton,
  RelatorioModal,
  RelatorioModalContent,
  CloseModalButton,
} from './styles';

import AgenteFormModal from '../../components/AgenteFormModal';
import AtribuirPacienteModal from '../../components/AtribuirPacienteModal';
import ConfirmDialog from '../../components/ConfirmDialog';

import {
  fetchAgentes,
  createAgente,
  updateAgente,
  deleteAgente,
  AgenteFormData,
  Agente,
  atribuirPacienteAoAgente,
  fetchAtribuicoesPorAgente,
  deleteAtribuicao,
  enviarAtribuicaoParaApp,
  fetchPacientes,
  AtribuicaoPaciente,
  Paciente,
} from '../../services/api';

const Agentes: React.FC = () => {
  const navigate = useNavigate();
  
  const [agentes, setAgentes] = useState<Agente[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [atribuicoes, setAtribuicoes] = useState<Record<number, AtribuicaoPaciente[]>>({});
  const [loading, setLoading] = useState(true);
  
  const [expandedAgente, setExpandedAgente] = useState<number | null>(null);
  const [busca, setBusca] = useState('');
  const [page, setPage] = useState(1);
  
  const [isAgenteModalOpen, setIsAgenteModalOpen] = useState(false);
  const [isAtribuirModalOpen, setIsAtribuirModalOpen] = useState(false);
  const [editingAgente, setEditingAgente] = useState<Agente | null>(null);
  const [selectedAgenteForAtribuicao, setSelectedAgenteForAtribuicao] = useState<Agente | null>(null);
  
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [deletingAgente, setDeletingAgente] = useState<Agente | null>(null);
  const [isConfirmRemoveAtribuicaoOpen, setIsConfirmRemoveAtribuicaoOpen] = useState(false);
  const [removingAtribuicao, setRemovingAtribuicao] = useState<AtribuicaoPaciente | null>(null);
  const [removingAgenteId, setRemovingAgenteId] = useState<number | null>(null);
  
  const [relatorioSelecionado, setRelatorioSelecionado] = useState<AtribuicaoPaciente | null>(null);
  const [isRelatorioModalOpen, setIsRelatorioModalOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    loadAgentes();
    loadPacientes();
  }, [navigate, busca, page]);

  const loadAgentes = async () => {
    try {
      setLoading(true);
      const data = await fetchAgentes(page, 10, busca);
      setAgentes(data.items);
      
      for (const agente of data.items) {
        const atr = await fetchAtribuicoesPorAgente(agente.id);
        setAtribuicoes(prev => ({
          ...prev,
          [agente.id]: atr,
        }));
      }
    } catch (error: any) {
      console.error('Erro ao carregar agentes:', error);
      if (error.message.includes('Token')) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadPacientes = async () => {
    try {
      const data = await fetchPacientes(1, 100);
      setPacientes(data.items);
    } catch (error: any) {
      console.error('Erro ao carregar pacientes:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleNovoAgente = () => {
    setEditingAgente(null);
    setIsAgenteModalOpen(true);
  };

  const handleEditarAgente = (agente: Agente) => {
    setEditingAgente(agente);
    setIsAgenteModalOpen(true);
  };

  const handleSubmitAgente = async (data: AgenteFormData) => {
    try {
      if (editingAgente) {
        await updateAgente(editingAgente.id, data);
      } else {
        await createAgente(data);
      }
      setIsAgenteModalOpen(false);
      loadAgentes();
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const handleOpenDeleteConfirm = (agente: Agente) => {
    setDeletingAgente(agente);
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingAgente) {
      try {
        await deleteAgente(deletingAgente.id);
        setIsConfirmDeleteOpen(false);
        setDeletingAgente(null);
        loadAgentes();
      } catch (error: any) {
        console.error('Erro ao deletar agente:', error);
      }
    }
  };



  const handleSubmitAtribuicao = async (data: any) => {
    try {
      if (selectedAgenteForAtribuicao) {
        await atribuirPacienteAoAgente(selectedAgenteForAtribuicao.id, data);
        setIsAtribuirModalOpen(false);
        setSelectedAgenteForAtribuicao(null);
        loadAgentes();
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const handleConfirmRemoveAtribuicao = async () => {
    if (removingAtribuicao && removingAgenteId) {
      try {
        await deleteAtribuicao(removingAgenteId, removingAtribuicao.id);
        setIsConfirmRemoveAtribuicaoOpen(false);
        setRemovingAtribuicao(null);
        setRemovingAgenteId(null);
        loadAgentes();
      } catch (error: any) {
        console.error('Erro ao remover atribuição:', error);
      }
    }
  };

  const handleEnviarParaApp = async (agenteId: number, atribuicaoId: number) => {
    try {
      const result = await enviarAtribuicaoParaApp(agenteId, atribuicaoId);
      console.log('Enviado para app:', result);
      alert('✅ Dados enviados para o app com sucesso!');
    } catch (error: any) {
      console.error('Erro ao enviar para app:', error);
      alert('❌ Erro ao enviar para app');
    }
  };

  const handleVerRelatorio = (atribuicao: AtribuicaoPaciente) => {
    setRelatorioSelecionado(atribuicao);
    setIsRelatorioModalOpen(true);
  };

  const handleFecharRelatorioModal = () => {
    setIsRelatorioModalOpen(false);
    setRelatorioSelecionado(null);
  };

  const formatarData = (data: string | undefined) => {
    if (!data) return 'Não informado';
    const date = new Date(data);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const toggleExpandAgente = (agenteId: number) => {
    setExpandedAgente(expandedAgente === agenteId ? null : agenteId);
  };

  const agentesAtivos = useMemo(() => {
    return agentes.filter(a => a.ativo);
  }, [agentes]);

  if (loading) {
    return (
      <AgentesContainer>
        <Content>
          <Header>
            <Title>⏳ Carregando...</Title>
          </Header>
        </Content>
      </AgentesContainer>
    );
  }

  return (
    <AgentesContainer>
      <Content>
        <Header>
          <div>
            <Title>👥 Agentes de Saúde</Title>
            <p style={{ color: '#64748b', margin: '12px 0 0 0', fontSize: '14px', fontWeight: 500 }}>
              Gerencie seus agentes e equipe de saúde
            </p>
          </div>
          <Actions>
            <AddButton onClick={handleNovoAgente}>
              <MdAdd style={{ marginRight: '8px' }} />
              Novo Agente
            </AddButton>
            <ManageButton onClick={() => navigate("/dashboard")}>
              📋 Pacientes
            </ManageButton>
            <LogoutButton onClick={handleLogout}>Sair</LogoutButton>
          </Actions>
        </Header>

        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="🔍 Buscar por nome, email ou CPF..."
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              setPage(1);
            }}
          />
        </SearchContainer>

        {agentesAtivos.length === 0 ? (
          <EmptyState>
            <h3>📭 Nenhum agente cadastrado</h3>
            <p>Clique em "Novo Agente" para começar a gerenciar seus agentes de saúde</p>
          </EmptyState>
        ) : (
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th style={{ width: '25%' }}>Nome</Th>
                  <Th style={{ width: '25%' }}>Email</Th>
                  <Th style={{ width: '20%' }}>Profissional</Th>
                  <Th style={{ width: '15%' }}>Pacientes</Th>
                  <Th style={{ width: '15%' }}>Ações</Th>
                </tr>
              </thead>
              <tbody>
                {agentesAtivos.map(agente => (
                  <React.Fragment key={agente.id}>
                    <Tr>
                      <Td>
                        <ExpandCell
                          isOpen={expandedAgente === agente.id}
                          onClick={() => toggleExpandAgente(agente.id)}
                        >
                          <MdArrowDropDown />
                          {agente.nome}
                        </ExpandCell>
                      </Td>
                      <Td>{agente.email}</Td>
                      <Td>
                        <Badge tone="neutral">{agente.tipo_profissional}</Badge>
                      </Td>
                      <Td>
                        <Badge tone="success">
                          {atribuicoes[agente.id]?.filter(a => a.ativo).length || 0}
                        </Badge>
                      </Td>
                      <Td>
                        <ActionIcon
                          onClick={() => handleEditarAgente(agente)}
                          title="Editar"
                        >
                          <MdEdit size={18} />
                        </ActionIcon>
                        <ActionIcon
                          onClick={() => handleOpenDeleteConfirm(agente)}
                          title="Deletar"
                        >
                          <MdDelete size={18} />
                        </ActionIcon>
                      </Td>
                    </Tr>

                    {expandedAgente === agente.id && (
                      <Tr isExpandedContent>
                        <Td colSpan={5} style={{ padding: '0' }}>
                          <ExpandContent isOpen={true}>
                            <ExpandedDetails>
                              <DetailRow>
                                <DetailItem>
                                  <Label>Telefone</Label>
                                  <Value>{agente.telefone || 'Não informado'}</Value>
                                </DetailItem>
                                <DetailItem>
                                  <Label>CPF</Label>
                                  <Value>{agente.cpf || 'Não informado'}</Value>
                                </DetailItem>
                              </DetailRow>
                              <DetailRow>
                                <DetailItem>
                                  <Label>UBS</Label>
                                  <Value>{agente.ubs_nome || 'Não informado'}</Value>
                                </DetailItem>
                                <DetailItem>
                                  <Label>Data de Cadastro</Label>
                                  <Value>
                                    {agente.created_at
                                      ? new Date(agente.created_at).toLocaleDateString('pt-BR')
                                      : 'Não informado'}
                                  </Value>
                                </DetailItem>
                              </DetailRow>

                              {atribuicoes[agente.id] && (atribuicoes[agente.id].length > 0 || true) && (
                                <DetailRow style={{ marginTop: '24px' }}>
                                  <DetailItem style={{ gridColumn: '1 / -1' }}>
                                    <Label>👥 Pacientes Atribuídos para Hoje</Label>
                                    <div style={{ marginTop: '12px' }}>
                                      {atribuicoes[agente.id].length > 0 ? (
                                        <>
                                          {atribuicoes[agente.id]
                                            .filter(a => a.ativo)
                                            .map(atr => (
                                              <div
                                                key={atr.id}
                                                style={{
                                                  padding: '12px',
                                                  marginBottom: '8px',
                                                  borderRadius: '8px',
                                                  background: 'rgba(62, 42, 235, 0.05)',
                                                  border: '1px solid rgba(62, 42, 235, 0.15)',
                                                  display: 'flex',
                                                  justifyContent: 'space-between',
                                                  alignItems: 'center',
                                                }}
                                              >
                                                <div>
                                                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                                                    {atr.nome_paciente}
                                                  </div>
                                                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                                                    📅 {atr.data_visita_planejada 
                                                      ? new Date(atr.data_visita_planejada).toLocaleString('pt-BR') 
                                                      : 'Data não definida'}
                                                  </div>
                                                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                                                    {atr.informacoes_clinicas?.condicao || 'Sem informações clínicas'}
                                                  </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                  <AssignButton
                                                    onClick={() => handleEnviarParaApp(agente.id, atr.id)}
                                                  >
                                                    📱 Enviar
                                                  </AssignButton>
                                                  <DangerButton
                                                    onClick={() => {
                                                      setRemovingAtribuicao(atr);
                                                      setRemovingAgenteId(agente.id);
                                                      setIsConfirmRemoveAtribuicaoOpen(true);
                                                    }}
                                                  >
                                                    ✕ Remover
                                                  </DangerButton>
                                                </div>
                                              </div>
                                            ))}
                                        </>
                                      ) : (
                                        <div style={{
                                          padding: '20px',
                                          textAlign: 'center',
                                          color: '#9ca3af',
                                          fontSize: '14px',
                                          fontStyle: 'italic',
                                          background: 'rgba(229, 231, 235, 0.5)',
                                          borderRadius: '8px',
                                          marginBottom: '12px'
                                        }}>
                                          Nenhum paciente atribuído para hoje
                                        </div>
                                      )}
                                      <AssignButton
                                        onClick={() => {
                                          setSelectedAgenteForAtribuicao(agente);
                                          setIsAtribuirModalOpen(true);
                                        }}
                                        style={{ width: '100%', marginTop: '12px' }}
                                      >
                                        <MdAdd style={{ fontSize: '18px' }} />
                                        Adicionar Paciente
                                      </AssignButton>
                                    </div>
                                  </DetailItem>
                                </DetailRow>
                              )}

                              {atribuicoes[agente.id] && atribuicoes[agente.id].some(a => a.relatorio_visita) && (
                                <DetailRow style={{ marginTop: '24px' }}>
                                  <DetailItem style={{ gridColumn: '1 / -1' }}>
                                    <RelatorioSection>
                                      <RelatorioTitle>📋 Relatórios de Visitas</RelatorioTitle>
                                      {atribuicoes[agente.id]
                                        .filter(a => a.relatorio_visita)
                                        .map(atr => (
                                          <RelatorioCard key={atr.id}>
                                            <RelatorioHeader>
                                              <div className="paciente-info">
                                                <div className="nome">{atr.nome_paciente}</div>
                                                <div className="data">
                                                  Visita realizada em {formatarData(atr.data_visita_realizada)}
                                                </div>
                                              </div>
                                              <div className="status-badge">✓ Concluído</div>
                                            </RelatorioHeader>
                                            <RelatorioBody>
                                              <div className="relatorio-item">
                                                <div className="item-label">Data Planejada</div>
                                                <div className="item-value">
                                                  {formatarData(atr.data_visita_planejada)}
                                                </div>
                                              </div>
                                              {atr.anotacoes_visita && (
                                                <div className="relatorio-item">
                                                  <div className="item-label">Anotações da Visita</div>
                                                  <div className="item-value">
                                                    {atr.anotacoes_visita.substring(0, 100)}
                                                    {atr.anotacoes_visita.length > 100 ? '...' : ''}
                                                  </div>
                                                </div>
                                              )}
                                              <ViewRelatButton
                                                onClick={() => handleVerRelatorio(atr)}
                                              >
                                                Ver Relatório Completo →
                                              </ViewRelatButton>
                                            </RelatorioBody>
                                          </RelatorioCard>
                                        ))}
                                    </RelatorioSection>
                                  </DetailItem>
                                </DetailRow>
                              )}
                            </ExpandedDetails>
                          </ExpandContent>
                        </Td>
                      </Tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </Table>
          </TableWrapper>
        )}
      </Content>

      {/* Modal de Relatório Completo */}
      {isRelatorioModalOpen && relatorioSelecionado && (
        <RelatorioModal onClick={handleFecharRelatorioModal}>
          <RelatorioModalContent onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
            <CloseModalButton onClick={handleFecharRelatorioModal}>
              <MdClose />
            </CloseModalButton>

            <h3>📋 Relatório da Visita</h3>

            <div className="modal-section">
              <div className="section-title">Paciente</div>
              <div className="section-content">{relatorioSelecionado.nome_paciente}</div>
            </div>

            <div className="modal-section">
              <div className="section-title">Data Planejada</div>
              <div className="section-content">
                {formatarData(relatorioSelecionado.data_visita_planejada)}
              </div>
            </div>

            <div className="modal-section">
              <div className="section-title">Data da Visita Realizada</div>
              <div className="section-content">
                {formatarData(relatorioSelecionado.data_visita_realizada)}
              </div>
            </div>

            {relatorioSelecionado.localizacao && (
              <div className="modal-section">
                <div className="section-title">Localização</div>
                <div className="section-content">{relatorioSelecionado.localizacao}</div>
              </div>
            )}

            {relatorioSelecionado.anotacoes_visita && (
              <div className="modal-section">
                <div className="section-title">Anotações da Visita</div>
                <div className="section-content">{relatorioSelecionado.anotacoes_visita}</div>
              </div>
            )}

            {relatorioSelecionado.relatorio_visita && (
              <div className="modal-section">
                <div className="section-title">Relatório Detalhado</div>
                <div className="section-content">
                  {typeof relatorioSelecionado.relatorio_visita === 'string'
                    ? relatorioSelecionado.relatorio_visita
                    : JSON.stringify(relatorioSelecionado.relatorio_visita, null, 2)}
                </div>
              </div>
            )}

            {relatorioSelecionado.notas_gestor && (
              <div className="modal-section">
                <div className="section-title">Notas do Gestor</div>
                <div className="section-content">{relatorioSelecionado.notas_gestor}</div>
              </div>
            )}
          </RelatorioModalContent>
        </RelatorioModal>
      )}

      <AgenteFormModal
        isOpen={isAgenteModalOpen}
        agente={editingAgente}
        onClose={() => {
          setIsAgenteModalOpen(false);
          setEditingAgente(null);
        }}
        onSubmit={handleSubmitAgente}
      />

      <AtribuirPacienteModal
        isOpen={isAtribuirModalOpen}
        onClose={() => {
          setIsAtribuirModalOpen(false);
          setSelectedAgenteForAtribuicao(null);
        }}
        pacientes={pacientes}
        onSubmit={handleSubmitAtribuicao}
      />

      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        title="Deletar Agente"
        message={`Tem certeza que deseja deletar ${deletingAgente?.nome}? Todas as atribuições também serão deletadas.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsConfirmDeleteOpen(false);
          setDeletingAgente(null);
        }}
        confirmText="Deletar"
        cancelText="Cancelar"
      />

      <ConfirmDialog
        isOpen={isConfirmRemoveAtribuicaoOpen}
        title="Remover Atribuição"
        message={`Tem certeza que deseja remover ${removingAtribuicao?.nome_paciente} das atribuições?`}
        onConfirm={handleConfirmRemoveAtribuicao}
        onCancel={() => {
          setIsConfirmRemoveAtribuicaoOpen(false);
          setRemovingAtribuicao(null);
          setRemovingAgenteId(null);
        }}
        confirmText="Remover"
        cancelText="Cancelar"
      />
    </AgentesContainer>
  );
};

export default Agentes;
