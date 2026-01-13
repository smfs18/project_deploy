# Sistema de Gerenciamento de Agentes de Saúde - Documentação de Implementação

## 📋 Visão Geral

Sistema completo de gerenciamento de agentes de saúde que permite ao gestor cadastrar, atribuir pacientes e receber relatórios de visitas através de áudio.

## 🎯 Funcionalidades Implementadas

### 1. **Frontend (Gestor) - Dashboard**

#### ✅ Botão de Gerenciamento de Agentes
- Localização: Página de Pacientes (Dashboard)
- Um novo botão **"👥 Agentes de Saúde"** foi adicionado ao lado do botão "Adicionar Paciente"
- Ao clicar, redireciona para `/agentes`

#### ✅ Página de Gerenciamento de Agentes (`/agentes`)
A página já existia e possui as seguintes funcionalidades:

- **CRUD de Agentes:**
  - Adicionar novo agente (com campos de Nome, Email, CPF, Telefone, Profissão, etc.)
  - Editar informações do agente
  - Deletar agente

- **Gerenciamento de Atribuições:**
  - Atribuir pacientes aos agentes
  - Enviar dados de pacientes para o app do agente
  - Remover atribuições de pacientes

#### ✅ Campo de Senha para Agentes
- **Novo campo adicionado:** `senha` no formulário de criação/edição de agentes
- Validações:
  - Para novo agente: senha é obrigatória
  - Para edição: senha é opcional (deixar em branco mantém a senha anterior)
  - Mínimo 6 caracteres quando fornecida

### 2. **App do Agente (Mobile)**

#### ✅ Sistema de Autenticação
- Novo modo de login: **"👥 Login Agente de Saúde"** na tela de login
- Login com Email + Senha
- Token salvo em AsyncStorage para sessão persistente
- Logout automático com `logoutAgente()`

#### ✅ Tela de Pacientes Atribuídos
- Nova aba **"Pacientes"** na barra de navegação
- Exibição da lista de pacientes atribuídos ao agente
- Informações mostradas por paciente:
  - Nome
  - Endereço
  - Pressão Arterial (Sistólica/Diastólica)
  - Glicemia
  - Informações adicionais do gestor

#### ✅ Estrutura de Dados para Atribuição
Os dados enviados do gestor para o agente incluem:
```typescript
{
  id: number;
  nome: string;
  endereco: string;
  pressao_sistolica: number;
  pressao_diastolica: number;
  glicemia: number;
  informacoes_adicionais?: string;
}
```

### 3. **API/Backend (Endpoints Necessários)**

Os seguintes endpoints devem ser implementados no backend:

#### Autenticação de Agente
```
POST /api/v1/auth/agente/login
Body: { email: string, senha: string }
Response: { access_token: string, agente_id: number, ... }
```

#### Informações do Agente
```
GET /api/v1/agentes/me
Headers: Authorization: Bearer <token>
Response: { id, nome, email, ... }
```

#### Pacientes Atribuídos
```
GET /api/v1/agentes/pacientes-atribuidos
Headers: Authorization: Bearer <token>
Response: PacienteAtribuido[]
```

#### Upload de Áudio de Visita
```
POST /api/v1/agentes/upload-audio-visita
Headers: Authorization: Bearer <token>, Content-Type: multipart/form-data
Body: { audio: File, paciente_id: number }
Response: { resumo: string, transcricao: string, ... }
```

#### Histórico de Visitas
```
GET /api/v1/agentes/historico-visitas
Headers: Authorization: Bearer <token>
Response: { visitas: [...] }
```

## 📁 Arquivos Modificados/Criados

### Frontend (React + TypeScript)
- ✅ `/frontend/src/App.tsx` - Adicionado rota `/agentes`
- ✅ `/frontend/src/pages/Dashboard/Dashboard.tsx` - Adicionado botão "Agentes"
- ✅ `/frontend/src/services/api.ts` - Adicionado campo `senha` em `AgenteFormData`
- ✅ `/frontend/src/components/AgenteFormModal.tsx` - Adicionado campo de senha no formulário

### App Agente (React Native + Expo)
- ✅ `/appconecta/app/login.tsx` - Novo modo de login para agentes
- ✅ `/appconecta/app/(tabs)/_layout.tsx` - Adicionado aba "Pacientes"
- ✅ `/appconecta/app/(tabs)/pacientes.tsx` - Nova tela de pacientes atribuídos (CRIADO)
- ✅ `/appconecta/src/services/api.ts` - Adicionadas funções de autenticação e API do agente

## 🔐 Fluxo de Autenticação do Agente

1. **Agente acessa o app**
2. **Clica em "👥 Login Agente de Saúde"**
3. **Insere email e senha** (fornecidos pelo gestor)
4. **Sistema faz login** e obtém access_token
5. **Token é salvo** em AsyncStorage
6. **Agente é redirecionado** para as abas do app
7. **Agente visualiza pacientes** atribuídos pelo gestor

## 🎯 Fluxo de Atribuição de Paciente

1. **Gestor abre página de Agentes**
2. **Expande um agente** e clica em "Atribuir Novo Paciente"
3. **Seleciona paciente** e preenche informações clínicas
4. **Clica em "📱 Enviar"** para enviar dados para o app
5. **Agente recebe notificação** ou vê paciente na lista de "Pacientes"
6. **Agente clica em "Registrar Visita"** para gravar áudio

## 📝 Próximos Passos (Não Implementados)

Para completar o sistema, você precisa implementar:

1. **Backend - Endpoints de Agente**
   - Autenticação de agente com hash de senha
   - API de pacientes atribuídos
   - Upload e processamento de áudios
   - Transcrição e sumarização com IA

2. **App - Funcionalidade de Áudio**
   - Tela de gravação de áudio (já tem `record.tsx`)
   - Upload do áudio ao backend
   - Exibição do resumo da visita
   - Histórico de visitas com áudios

3. **Frontend - Visualização de Resultados**
   - Exibição de resumos de visitas
   - Histórico de visitas por agente
   - Relatórios de atividades

## 🛠 Como Testar

### No Frontend (Gestor)
```bash
cd frontend
npm install
npm run dev
```

1. Faça login
2. Vá para Dashboard
3. Clique em "👥 Agentes de Saúde"
4. Clique em "Novo Agente"
5. Preencha o formulário (incluindo senha)
6. Salve e teste a edição

### No App (Agente)
```bash
cd appconecta
npm install
npm start
```

1. Na tela de login, clique em "👥 Login Agente de Saúde"
2. Insira as credenciais do agente (email e senha)
3. Após login bem-sucedido, você verá as abas do app
4. Clique em "Pacientes" para ver a lista (quando houver pacientes atribuídos)

## 📞 Suporte

Para dúvidas sobre a implementação ou próximas etapas, consulte a documentação do projeto ou entre em contato com o time de desenvolvimento.
