// src/pages/Dashboard/Dashboard.tsx
// Versão com PatientDetails componentizado

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdKeyboardArrowDown, MdEdit, MdDelete, MdMap } from "react-icons/md";
import PatientDetails from "../../components/PatientDetails";
import PatientMap from "../../components/PatientMap";
import ConfirmDialog from "../../components/ConfirmDialog";
import WhatsAppFloatingButton from "../../components/WhatsAppFloatingButton";
import NotificationBell from "../../components/NotificationBell";
import ProfessionalConfirmationDialog from "../../components/ProfessionalConfirmationDialog";
import {
  DashboardContainer,
  Header,
  Title,
  Content,
  Actions,
  SearchInput,
  AddButton,
  LogoutButton,
  TableWrapper,
  Table,
  Th,
  Td,
  Tr,
  Badge,
  ActionIcon,
  EmptyState,
  ExpandCell,
  MapButton,
} from "./styles";

import PatientFormModal from "../../components/PatientFormModal";
// Importar o serviço de API e as interfaces
import { 
  fetchPacientes, 
  deletePaciente,
  updatePaciente,
  confirmPatientClassification,
  PacienteFormData,
  Paciente
} from "../../services/api";

const calcularIdade = (dataISO: string) => {
  if (!dataISO) return 0;
  const hoje = new Date();
  const [y, m, d] = dataISO.split("-").map(Number);
  const nasc = new Date(y, (m || 1) - 1, d || 1);
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const mes = hoje.getMonth() - nasc.getMonth();
  if (mes < 0 || (mes === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
};

// ✅ CORREÇÃO 2: Ler 'risco' ("Crítico" / "Estável") em vez de 'classificacao'
const getBadgeTone = (risco: string) => {
  if (!risco || risco === "Não Calculado") return "neutral";
  return risco.toLowerCase() === "crítico" ? "danger" : "success";
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [busca, setBusca] = useState("");
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Paciente | "idade";
    direction: "asc" | "desc" | null;
  }>({ key: "nome", direction: null });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPaciente, setEditingPaciente] = useState<Paciente | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [deletingPaciente, setDeletingPaciente] = useState<Paciente | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [patientNeedingConfirmation, setPatientNeedingConfirmation] = useState<Paciente | null>(null);
  const [notificationRefreshTrigger, setNotificationRefreshTrigger] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const loadPacientes = async () => {
      try {
        setLoading(true);
        const data = await fetchPacientes(1, 10, busca);
        setPacientes(data.items);
      } catch (error: any) {
        console.error("Erro ao buscar pacientes:", error);
        if (error.message.includes("Token")) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    loadPacientes();
  }, [navigate, busca]);

  const handleSort = (key: keyof Paciente | "idade") => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key
          ? current.direction === null
            ? "asc"
            : current.direction === "asc"
            ? "desc"
            : null
          : "asc",
    }));
  };

  const filtrados = useMemo(() => {
    let filtered = pacientes;

    if (sortConfig.direction) {
      filtered = [...filtered].sort((a, b) => {
        if (sortConfig.key === "idade") {
          const aAge = calcularIdade(a.data_nascimento);
          const bAge = calcularIdade(b.data_nascimento);
          return sortConfig.direction === "asc" ? aAge - bAge : bAge - aAge;
        }
        
        // Correção para ordenar pelo campo de risco correto
        if (sortConfig.key === "risco_diabetes") {
           const aValue = String(a.risco_diabetes || "");
           const bValue = String(b.risco_diabetes || "");
           return sortConfig.direction === "asc" 
             ? aValue.localeCompare(bValue) 
             : bValue.localeCompare(aValue);
        }

        // @ts-ignore
        const aValue = String(a[sortConfig.key] || "");
        // @ts-ignore
        const bValue = String(b[sortConfig.key] || "");

        if (sortConfig.direction === "asc") {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      });
    }

    return filtered;
  }, [pacientes, sortConfig]);

  const handleDeletePaciente = async () => {
    if (!deletingPaciente) return;

    try {
      await deletePaciente(deletingPaciente.id);
      setPacientes((prev) => prev.filter((p) => p.id !== deletingPaciente.id));
      setDeletingPaciente(null);
      setIsConfirmDeleteOpen(false);
    } catch (error: any) {
      console.error("Erro ao excluir paciente:", error);
      alert("Erro ao excluir paciente: " + error.message);
    }
  };

  const handleUpdatePaciente = async (data: PacienteFormData) => {
    if (!editingPaciente) return;

    try {
      const updatedPaciente = await updatePaciente(editingPaciente.id, data);
      setPacientes((prev) =>
        prev.map((p) => (p.id === editingPaciente.id ? updatedPaciente : p))
      );
      setEditingPaciente(null);
    } catch (error: any) {
      console.error("Erro ao atualizar paciente:", error);
      throw error;
    }
  };

  const handlePatientNotificationClick = (patient: Paciente) => {
    setPatientNeedingConfirmation(patient);
    setConfirmationDialogOpen(true);
    // Expande a linha do paciente para mostrar detalhes
    setExpandedRow(patient.id);
  };

  const handleProfessionalConfirmation = async (isOutlier: boolean, notes: string) => {
    if (!patientNeedingConfirmation) return;

    try {
      const updatedPatient = await confirmPatientClassification(
        patientNeedingConfirmation.id,
        {
          is_outlier_confirmed: isOutlier,
          professional_notes: notes
        }
      );

      // Atualiza o paciente na lista
      setPacientes((prev) =>
        prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p))
      );

      // Força atualização das notificações
      setNotificationRefreshTrigger(prev => prev + 1);

      setConfirmationDialogOpen(false);
      setPatientNeedingConfirmation(null);

      alert('Confirmação registrada com sucesso!');
    } catch (error: any) {
      console.error("Erro ao confirmar classificação:", error);
      alert("Erro ao confirmar classificação: " + error.message);
    }
  };

  return (
    <DashboardContainer>
      <Header>
        <Title>Gerenciamento de Pacientes</Title>
        <Actions>
          <SearchInput
            placeholder="Buscar paciente..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            aria-label="Buscar paciente"
          />

          <MapButton
            type="button"
            onClick={() => setShowMap(!showMap)}
          >
            <MdMap size={20} />
            {showMap ? "Ocultar Mapa" : "Ver Mapa"}
          </MapButton>

          <AddButton type="button" onClick={() => {
            setEditingPaciente(null);
            setIsModalOpen(true);
          }}>
            + Adicionar Paciente
          </AddButton>

          <AddButton 
            type="button" 
            onClick={() => navigate("/agentes")}
            style={{
              backgroundColor: '#3b82f6',
            }}
          >
            👥 Agentes de Saúde
          </AddButton>

          <NotificationBell 
            onPatientClick={handlePatientNotificationClick}
            refreshTrigger={notificationRefreshTrigger}
          />

          <LogoutButton
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}
          >
            Sair
          </LogoutButton>
        </Actions>
      </Header>

      <Content>
        {showMap && (
          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ 
              marginBottom: "1rem", 
              marginLeft: "2rem",
              color: "#333",
              fontSize: "1.5rem",
              fontWeight: "600"
            }}>
              Mapa de Pacientes
            </h3>
            <PatientMap onPatientClick={(id) => {
              setExpandedRow(id);
              setShowMap(false);
            }} />
          </div>
        )}

        <TableWrapper>
          <Table>
            <thead>
              <Tr>
                <Th
                  style={{ minWidth: 240 }}
                  sortable
                  sortDirection={
                    sortConfig.key === "nome" ? sortConfig.direction : null
                  }
                  onClick={() => handleSort("nome")}
                >
                  Nome
                </Th>
                <Th
                  sortable
                  sortDirection={
                    sortConfig.key === "idade" ? sortConfig.direction : null
                  }
                  onClick={() => handleSort("idade")}
                >
                  Idade
                </Th>
                <Th
                  sortable
                  sortDirection={
                    sortConfig.key === "sexo" ? sortConfig.direction : null
                  }
                  onClick={() => handleSort("sexo")}
                >
                  Sexo
                </Th>
                <Th
                  sortable
                  sortDirection={
                    sortConfig.key === "imc" ? sortConfig.direction : null
                  }
                  onClick={() => handleSort("imc")}
                >
                  IMC
                </Th>
                <Th>Pressão</Th>
                <Th
                  sortable
                  sortDirection={
                    sortConfig.key === "glicemia_jejum_mg_dl"
                      ? sortConfig.direction
                      : null
                  }
                  onClick={() => handleSort("glicemia_jejum_mg_dl")}
                >
                  Glicemia
                </Th>
                {/* ✅ CORREÇÃO 3: Ordenar pelo campo correto */}
                <Th
                  sortable
                  sortDirection={
                    sortConfig.key === "risco_diabetes"
                      ? sortConfig.direction
                      : null
                  }
                  onClick={() => handleSort("risco_diabetes")}
                >
                  Classificação
                </Th>
                <Th style={{ width: 120 }}>Ações</Th>
              </Tr>
            </thead>
            <tbody>
              {loading && (
                <Tr>
                  <Td colSpan={8}>
                    <EmptyState>Carregando pacientes...</EmptyState>
                  </Td>
                </Tr>
              )}

              {!loading && filtrados.length === 0 && (
                <Tr>
                  <Td colSpan={8}>
                    <EmptyState>Nenhum paciente encontrado.</EmptyState>
                  </Td>
                </Tr>
              )}

              {!loading && filtrados.map((p, i) => {
                const aberto = expandedRow === i;
                const pressao = `${p.pressao_sistolica_mmHg || 'N/A'}/${p.pressao_diastolica_mmHg || 'N/A'} mmHg`;

                return (
                  <React.Fragment key={p.id || i}>
                    <Tr
                      style={{ cursor: "pointer" }}
                      onClick={() => setExpandedRow(aberto ? null : i)}
                    >
                      <Td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <strong style={{ flex: 1 }}>{p.nome}</strong>
                        </div>
                      </Td>
                      <Td>{calcularIdade(p.data_nascimento)} anos</Td>
                      <Td>{p.sexo || "N/A"}</Td>
                      <Td>{p.imc?.toFixed(1) || "N/A"}</Td>
                      <Td>{pressao}</Td>
                      <Td>{p.glicemia_jejum_mg_dl || "N/A"} mg/dL</Td>
                      
                      {/* ✅ CORREÇÃO 4: Renderizar o campo correto */}
                      <Td>
                        <Badge tone={getBadgeTone(p.risco_diabetes)}>
                          {p.risco_diabetes || "N/A"}
                        </Badge>
                      </Td>
                      <Td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <ActionIcon
                            title="Editar"
                            aria-label="Editar"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingPaciente(p);
                              setIsModalOpen(true);
                            }}
                          >
                            <MdEdit size={18} />
                          </ActionIcon>
                          <ActionIcon
                            title="Excluir"
                            aria-label="Excluir"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingPaciente(p);
                              setIsConfirmDeleteOpen(true);
                            }}
                          >
                            <MdDelete size={18} />
                          </ActionIcon>
                          <ExpandCell
                            isOpen={aberto}
                            title={
                              aberto ? "Recolher detalhes" : "Expandir detalhes"
                            }
                            aria-label={
                              aberto ? "Recolher detalhes" : "Expandir detalhes"
                            }
                          >
                            <MdKeyboardArrowDown />
                          </ExpandCell>
                        </div>
                      </Td>
                    </Tr>

                    {aberto && (
                      <Tr isExpandedContent>
                        <Td colSpan={8}>
                          <PatientDetails patient={p} />
                        </Td>
                      </Tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </Table>
        </TableWrapper>
      </Content>

      <PatientFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPaciente(null);
        }}
        paciente={editingPaciente || undefined}
        onSubmitSuccess={(patient) => {
          if (editingPaciente) {
            setPacientes((prev) =>
              prev.map((p) => (p.id === patient.id ? patient : p))
            );
          } else {
            setPacientes((prev) => [patient, ...prev]);
          }
          setIsModalOpen(false);
          setEditingPaciente(null);
        }}
      />

      {/* Modal de Confirmação de Exclusão */}
      {isConfirmDeleteOpen && deletingPaciente && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              maxWidth: '400px',
              width: '100%',
            }}
          >
            <h3 style={{ marginTop: 0, color: '#dc2626' }}>Confirmar Exclusão</h3>
            <p>
              Tem certeza que deseja excluir o paciente <strong>{deletingPaciente.nome}</strong>?
              Esta ação não pode ser desfeita.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button
                onClick={() => setIsConfirmDeleteOpen(false)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleDeletePaciente}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Botão flutuante do WhatsApp */}
      <WhatsAppFloatingButton />

      {/* Diálogo de Confirmação Profissional */}
      {patientNeedingConfirmation && (
        <ProfessionalConfirmationDialog
          open={confirmationDialogOpen}
          onClose={() => {
            setConfirmationDialogOpen(false);
            setPatientNeedingConfirmation(null);
          }}
          onConfirm={handleProfessionalConfirmation}
          patientName={patientNeedingConfirmation.nome}
          predictedOutlier={patientNeedingConfirmation.is_outlier || false}
          confidence={patientNeedingConfirmation.confidence || 0}
        />
      )}
    </DashboardContainer>
  );
};

export default Dashboard;