# Configuração de Recebimento de Dados no App Conecta+Saúde

## Objetivo
Configurar o aplicativo Conecta+Saúde para receber as informações de pacientes atribuídos pelos agentes de saúde, incluindo:
- Informações do agente responsável
- Dados do paciente (nome, localização, dados clínicos)
- Notas do gestor
- Instruções de atendimento

## Fluxo de Dados

```
Dashboard (Gestor) 
    ↓
Atribui Paciente → API Backend
    ↓
Enviar para App → Endpoint específico no App
    ↓
App Conecta+Saúde recebe dados e mostra para o agente
```

## Implementação no Backend

### 1. Endpoint de Envio (Já Criado)

**POST** `/api/v1/agentes/{agente_id}/atribuicoes/{atribuicao_id}/enviar-app`

**Resposta:**
```json
{
  "status": "preparado",
  "mensagem": "Dados preparados para envio ao app",
  "payload": {
    "tipo": "atribuicao_paciente",
    "timestamp": "2024-01-02T10:30:00",
    "agente": {
      "id": 1,
      "nome": "João da Silva",
      "email": "joao@email.com",
      "telefone": "(11) 99999-9999",
      "tipo_profissional": "ACS"
    },
    "paciente": {
      "id": 5,
      "nome": "Maria Santos",
      "email": "maria@email.com",
      "endereco": "Rua das Flores, 123",
      "localizacao": "Rua das Flores, 123 - Apt 45"
    },
    "informacoes_clinicas": {
      "condicoes": ["Hipertensão", "Diabetes"],
      "medicamentos": ["Losartana 50mg", "Metformina 500mg"],
      "alergias": "Penicilina"
    },
    "notas_gestor": "Paciente com atraso nas consultas. Necesário acompanhamento especial."
  }
}
```

## Implementação no App (Conecta+Saúde)

### 1. Criar Serviço de Sincronização

**Arquivo:** `appconecta/src/services/agenteSyncService.ts`

```typescript
// Tipo para receber dados do agente
export interface AgentTaskData {
  tipo: string;
  timestamp: string;
  agente: {
    id: number;
    nome: string;
    email: string;
    telefone?: string;
    tipo_profissional: string;
  };
  paciente: {
    id: number;
    nome: string;
    email: string;
    endereco?: string;
    localizacao?: string;
  };
  informacoes_clinicas?: Record<string, any>;
  notas_gestor?: string;
}

// Armazenar as tarefas localmente
export const saveAgentTask = async (task: AgentTaskData) => {
  // Salvar em AsyncStorage para persistir entre sessões
  // Formato: tasks_agente_[agente_id] = array de tasks
}

// Recuperar tarefas do agente
export const getAgentTasks = async (agentId: number): Promise<AgentTaskData[]> => {
  // Buscar de AsyncStorage
}

// Marcar tarefa como concluída
export const completeAgentTask = async (taskId: string) => {
  // Atualizar status no AsyncStorage
}

// Sincronizar com o backend (quando há conexão)
export const syncAgentTasks = async () => {
  // Enviar tarefas concluídas de volta ao backend
}
```

### 2. Criar Tela de Tarefas do Agente

**Arquivo:** `appconecta/app/(tabs)/tasks.tsx`

Esta tela mostrará:
- Lista de pacientes atribuídos para o dia
- Informações clínicas importantes
- Localização do paciente
- Notas do gestor
- Botões para marcar como visitado/concluído

```tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { getAgentTasks, completeAgentTask } from '../src/services/agenteSyncService';

export default function TasksScreen() {
  const [tasks, setTasks] = useState<AgentTaskData[]>([]);
  
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    // Carregar tarefas do AsyncStorage
    // Atualizar quando chegar novo dado do backend
  };

  const handleCompleteTask = async (taskId: string) => {
    // Marcar como concluído
    // Sincronizar com backend
  };

  return (
    <ScrollView style={styles.container}>
      {tasks.map(task => (
        <View key={task.id} style={styles.taskCard}>
          <Text style={styles.pacienteName}>{task.paciente.nome}</Text>
          <Text style={styles.info}>📍 {task.paciente.localizacao}</Text>
          <Text style={styles.info}>👨‍⚕️ {task.agente.tipo_profissional}</Text>
          
          {task.informacoes_clinicas && (
            <View style={styles.clinicalInfo}>
              {/* Mostrar informações clínicas */}
            </View>
          )}
          
          {task.notas_gestor && (
            <Text style={styles.notes}>📝 {task.notas_gestor}</Text>
          )}
          
          <TouchableOpacity 
            style={styles.button}
            onPress={() => handleCompleteTask(task.id)}
          >
            <Text style={styles.buttonText}>Marcar como Visitado</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}
```

### 3. Sistema de Notificações Push

Para notificar o agente quando uma nova tarefa é atribuída:

```typescript
// Usar expo-notifications
import * as Notifications from 'expo-notifications';

export const setupNotifications = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    return;
  }

  // Configurar notificação quando receber novo paciente
  // Usar WebSocket ou polling
};

export const sendNotification = async (pacienteName: string) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Novo Paciente Atribuído",
      body: `${pacienteName} foi atribuído para você`,
      data: { paciente: pacienteName },
    },
    trigger: { seconds: 1 },
  });
};
```

### 4. Sincronização em Tempo Real (WebSocket)

Para receber dados em tempo real quando o gestor atribui um paciente:

```typescript
// appconecta/src/services/wsService.ts

export class WSService {
  private ws: WebSocket | null = null;
  
  connect(agentId: number) {
    this.ws = new WebSocket(`ws://localhost:8082/ws/agente/${agentId}`);
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.tipo === 'atribuicao_paciente') {
        // Nova atribuição recebida
        handleNewTask(data);
      }
    };
  }
  
  disconnect() {
    this.ws?.close();
  }
}
```

## Integração com Dashboard

### Link de Navegação para Agentes

No Dashboard, adicionar um link/botão para ir para a tela de Agentes:

```tsx
// frontend/src/pages/Dashboard/Dashboard.tsx

import { Link } from 'react-router-dom';

// Adicionar no menu/header:
<Link to="/agentes" style={{ textDecoration: 'none' }}>
  <button>Gerenciar Agentes</button>
</Link>
```

## Fluxo Completo de Uso

### Para o Gestor (Frontend):
1. Acessar `/agentes`
2. Criar novo agente (Nome, Email, CPF, Profissão)
3. Selecionar agente criado
4. Clicar em "Atribuir Paciente"
5. Selecionar paciente da lista
6. Adicionar localização e notas (opcional)
7. Confirmar atribuição
8. Clicar em "Enviar App" para notificar o agente

### Para o Agente (App):
1. Receber notificação de novo paciente atribuído
2. Abrir a aba de "Tarefas/Pacientes"
3. Ver lista de pacientes com informações clínicas
4. Visitar paciente no endereço indicado
5. Marcar como "Visitado" após atendimento
6. Sistema sincroniza com backend

## Próximas Etapas

- [ ] Implementar WebSocket no backend para real-time
- [ ] Criar tela de tarefas no App Expo
- [ ] Implementar sistema de sincronização local
- [ ] Adicionar notificações push
- [ ] Criar endpoint de confirmação de visita
- [ ] Implementar histórico de atendimentos
- [ ] Adicionar mapa com rotas otimizadas
- [ ] Integrar com sistema de feedback/avaliação

## Testes

### Teste Manual:
1. Criar agente via API ou Frontend
2. Atribuir paciente
3. Chamar endpoint de envio
4. Verificar payload retornado
5. Implementar recebimento no App

### Teste com cURL:
```bash
# Criar agente
curl -X POST http://localhost:8082/api/v1/agentes \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João da Silva",
    "email": "joao@email.com",
    "cpf": "12345678901",
    "tipo_profissional": "ACS"
  }'

# Atribuir paciente
curl -X POST http://localhost:8082/api/v1/agentes/1/atribuicoes \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "paciente_id": 5,
    "nome_paciente": "Maria Santos",
    "localizacao": "Rua das Flores, 123",
    "notas_gestor": "Acompanhamento especial"
  }'

# Enviar para App
curl -X POST http://localhost:8082/api/v1/agentes/1/atribuicoes/1/enviar-app \
  -H "Authorization: Bearer TOKEN"
```
