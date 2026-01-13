# Funcionalidade: Gerenciamento de Agentes de Saúde

## 📋 Resumo

Implementação completa de um sistema para que gestores da UBS possam:
- **Cadastrar, editar e deletar agentes de saúde**
- **Atribuir pacientes aos agentes para atendimento no dia**
- **Visualizar informações clínicas importantes dos pacientes**
- **Enviar dados para o app Conecta+Saúde**

## 🏗️ Arquitetura

### Backend (FastAPI)

#### Modelos
- `AgenteHealthcare`: Entidade para representar agentes
- `AtribuicaoPaciente`: Entidade para associar pacientes aos agentes com informações do dia
- `agente_paciente_association`: Tabela de associação many-to-many

**Arquivo:** `app/models/agente_models.py`

#### Schemas (Validação)
- `AgenteCreate`, `AgenteUpdate`, `Agente`
- `AtribuicaoPacienteCreate`, `AtribuicaoPacienteUpdate`, `AtribuicaoPaciente`
- `AgenteListResponse`

**Arquivo:** `app/schemas/agente_schema.py`

#### CRUD
Operações de banco de dados para agentes e atribuições

**Arquivo:** `app/crud/crud_agente.py`

#### Serviços
Lógica de negócio e orquestração

**Arquivo:** `app/services/agente_service.py`

#### API
Endpoints REST com autenticação

**Arquivo:** `app/api/api_v1/endpoints/agentes_api.py`

### Frontend (React + TypeScript)

#### Serviços
Cliente HTTP para comunicação com API

**Arquivo:** `src/services/api.ts`
- `createAgente()`, `fetchAgentes()`, `updateAgente()`, `deleteAgente()`
- `atribuirPacienteAoAgente()`, `fetchAtribuicoesPorAgente()`
- `enviarAtribuicaoParaApp()`

#### Componentes
1. **AgenteFormModal** - Modal para criar/editar agentes
2. **AtribuirPacienteModal** - Modal para atribuir pacientes
3. **ConfirmDialog** - Diálogo de confirmação (já existente)

#### Página
**Agentes.tsx** - Página completa com:
- Tabela de agentes
- Busca e filtros
- Expansão para ver detalhes
- Lista de pacientes atribuídos
- Ações (editar, deletar, atribuir, enviar para app)

**Arquivo:** `src/pages/Agentes/Agentes.tsx`

**Estilos:** `src/pages/Agentes/styles.ts`

## 🔌 Endpoints da API

### Agentes

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/v1/agentes` | Criar novo agente |
| GET | `/api/v1/agentes` | Listar agentes com paginação |
| GET | `/api/v1/agentes/{id}` | Obter agente por ID |
| PUT | `/api/v1/agentes/{id}` | Atualizar agente |
| DELETE | `/api/v1/agentes/{id}` | Deletar agente |
| PATCH | `/api/v1/agentes/{id}/desativar` | Desativar agente (soft delete) |

### Atribuições

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/v1/agentes/{agente_id}/atribuicoes` | Atribuir paciente a agente |
| GET | `/api/v1/agentes/{agente_id}/atribuicoes` | Listar pacientes atribuídos |
| GET | `/api/v1/agentes/{agente_id}/atribuicoes/{id}` | Obter atribuição específica |
| PUT | `/api/v1/agentes/{agente_id}/atribuicoes/{id}` | Atualizar atribuição |
| DELETE | `/api/v1/agentes/{agente_id}/atribuicoes/{id}` | Remover atribuição |
| PATCH | `/api/v1/agentes/{agente_id}/atribuicoes/{id}/concluir` | Marcar como concluído |
| POST | `/api/v1/agentes/{agente_id}/atribuicoes/{id}/enviar-app` | Enviar para app |

## 🚀 Como Usar

### Acesso
1. Fazer login na plataforma (`/login`)
2. Ir para Dashboard (`/dashboard`)
3. Navegar para "Agentes de Saúde" (`/agentes`)

### Criar Novo Agente
1. Clicar em "Novo Agente"
2. Preencher formulário:
   - Nome *
   - Email *
   - CPF *
   - Tipo de Profissional *
   - Telefone
   - Número de Registro (CRM, COREN, etc)
   - UBS
   - Endereço
3. Clicar em "Salvar"

### Editar Agente
1. Clicar no ícone ✏️ na linha do agente
2. Modificar informações desejadas
3. Clicar em "Salvar"

### Deletar Agente
1. Clicar no ícone 🗑️ na linha do agente
2. Confirmar deleção (também deleta todas as atribuições)

### Atribuir Paciente
1. Clicar no agente para expandir detalhes
2. Na seção "Pacientes Atribuídos", clicar em "Atribuir Paciente"
3. Selecionar paciente da lista
4. Preencher (opcional):
   - Localização específica para atendimento
   - Notas para o agente
5. Clicar em "Atribuir"

### Enviar para App
1. Com agente expandido, visualizar pacientes atribuídos
2. Clicar em "Enviar App" no paciente desejado
3. Dados serão preparados e enviados para o app Conecta+Saúde
4. (Futuro) Agente receberá notificação no app

### Remover Atribuição
1. Com agente expandido, clicar em "Remover" no paciente
2. Confirmar remoção

## 📊 Estrutura de Dados

### Tabela: agentes
```sql
- id (PK)
- nome
- email (UNIQUE)
- telefone
- cpf (UNIQUE)
- tipo_profissional
- numero_registro
- ativo
- ubs_id
- ubs_nome
- endereco
- created_at
- updated_at
```

### Tabela: atribuicoes_pacientes
```sql
- id (PK)
- agente_id (FK)
- paciente_id (FK)
- data_atribuicao
- nome_paciente
- localizacao
- informacoes_clinicas (JSON)
- notas_gestor
- ativo
- data_conclusao
- created_at
- updated_at
```

### Tabela: agente_paciente (associação)
```sql
- agente_id (FK)
- paciente_id (FK)
```

## 🔐 Autenticação

Todos os endpoints requerem:
- Header: `Authorization: Bearer {token}`
- Token obtido no `/api/v1/auth/login`

## 📱 Integração com App (Futuro)

Ver arquivo: `GUIA_AGENTES_APP.md`

Resumo:
- App receberá dados via WebSocket ou polling
- Agente verá lista de pacientes com informações clínicas
- Poderá marcar como visitado/concluído
- Sincronização automática com backend

## ✅ Checklist de Testes

Backend:
- [ ] Criar agente com validação de email/CPF únicos
- [ ] Listar agentes com paginação
- [ ] Buscar agente por ID
- [ ] Atualizar dados do agente
- [ ] Deletar agente e cascata de atribuições
- [ ] Atribuir paciente a agente
- [ ] Listar atribuições do agente
- [ ] Enviar para app (retorna payload correto)

Frontend:
- [ ] Modal de novo agente funciona
- [ ] Modal de editar agente funciona
- [ ] Tabela mostra agentes corretamente
- [ ] Busca filtra agentes
- [ ] Expansão mostra detalhes
- [ ] Modal de atribuição mostra pacientes
- [ ] Atribuição salva e aparece na lista
- [ ] Botão "Enviar App" funciona
- [ ] Confirmação de deleção funciona
- [ ] Validações de formulário funcionam

## 🛠️ Tecnologias

**Backend:**
- FastAPI
- SQLAlchemy
- PostgreSQL (recomendado)
- Pydantic

**Frontend:**
- React 18
- TypeScript
- Styled Components
- React Router

## 📚 Próximas Implementações

1. **WebSocket para Real-time**
   - Backend envia notificações quando atribuição é criada
   - App recebe em tempo real

2. **Sistema de Notificações Push**
   - Integração com Expo Notifications
   - Alerta quando novo paciente é atribuído

3. **Mapa Inteligente**
   - Mostrar rotas otimizadas para agente
   - Calcular tempo estimado

4. **Relatório de Desempenho**
   - Quantos pacientes visitados
   - Taxa de conclusão
   - Feedback do paciente

5. **Backup de Dados Offline**
   - App funciona sem internet
   - Sincroniza quando conectar

6. **Sistema de Permissões**
   - Admin vs Gestor vs Agente
   - Restrições de acesso

## 📞 Suporte

Para dúvidas ou problemas, consulte:
- `GUIA_AGENTES_APP.md` - Integração com App
- Logs do backend em `backend/app.log`
- Console do navegador (DevTools)

## 📝 Notas

- Atribuições são diárias - design permite atribuir vários pacientes ao mesmo agente
- Dados clínicos podem ser em JSON para flexibilidade
- Sistema soft-deletes por padrão (pode ser configurado)
- Todas as operações são auditadas (created_at, updated_at)
