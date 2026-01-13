# 📋 Implementação: Gerenciamento de Agentes com Atribuição de Pacientes e Visualização de Relatórios

## 📝 Resumo Executivo

Foram implementadas novas funcionalidades na tela de gerenciamento de agentes para permitir:

1. **Atribuição de Pacientes por Data** - Gestor pode atribuir pacientes aos agentes de saúde com uma data específica de visita planejada
2. **Visualização de Relatórios de Visitas** - Gestor pode visualizar os relatórios das visitas realizadas, incluindo dados do agente de sumarização

---

## 🔄 Alterações Realizadas

### Backend (`/back/backend`)

#### 1. **Modelo: `app/models/agente_models.py`**

Expandido a classe `AtribuicaoPaciente` com novos campos:

```python
# Data planejada para a visita
data_visita_planejada = Column(DateTime(timezone=True), nullable=True)

# Dados da visita realizada
data_visita_realizada = Column(DateTime(timezone=True), nullable=True)
anotacoes_visita = Column(Text, nullable=True)  # Anotações do agente
relatorio_visita = Column(JSON, nullable=True)  # Relatório do agente de sumarização
```

#### 2. **Schema: `app/schemas/agente_schema.py`**

Atualizado os schemas de atribuição:

- **AtribuicaoPacienteBase**: Adicionado `data_visita_planejada`
- **AtribuicaoPacienteCreate**: Adicionado `data_visita_planejada`
- **AtribuicaoPacienteUpdate**: Adicionado `data_visita_planejada`, `anotacoes_visita`, `relatorio_visita`
- **AtribuicaoPaciente**: Adicionado todos os campos novos

---

### Frontend (`/frontend/src`)

#### 1. **API Service: `services/api.ts`**

Atualizado as interfaces:

```typescript
export interface AtribuicaoPacienteFormData {
  // ... campos existentes
  data_visita_planejada?: string; // ISO string da data planejada
}

export interface AtribuicaoPaciente {
  // ... campos existentes
  data_visita_realizada?: string;     // Data em que a visita foi realizada
  anotacoes_visita?: string;          // Anotações do agente
  relatorio_visita?: Record<string, any>; // Relatório estruturado
}
```

#### 2. **Componente: `components/AtribuirPacienteModal.tsx`**

Melhorias implementadas:

- ✅ Campo de data/hora planejada para a visita (`datetime-local`)
- ✅ Validação obrigatória da data da visita
- ✅ Mantem todos os campos anteriores (localização, notas do gestor)

**Exemplo de uso:**
```
Selecione o Paciente → Escolha Data da Visita → Defina Localização e Notas → Atribua
```

#### 3. **Página: `pages/Agentes/Agentes.tsx`**

Novas funcionalidades:

- ✅ Estado para gerenciar modal de relatório completo
- ✅ Funções para visualizar relatórios individuais
- ✅ Formatação de datas em português

**Novos handlers:**
```typescript
const handleVerRelatorio = (atribuicao: AtribuicaoPaciente) => {
  // Abre modal com relatório completo
}

const formatarData = (data: string | undefined) => {
  // Formata data para padrão pt-BR com hora
}
```

**Seção de Relatórios na View Expandida:**
- Mostra apenas atribuições que possuem `relatorio_visita`
- Exibe resumo rápido (data, paciente, status)
- Botão "Ver Relatório Completo" abre modal detalhado

#### 4. **Estilos: `pages/Agentes/styles.ts`**

Novos estilos componentes:

```typescript
// Seção de Relatórios
RelatorioSection      - Container da seção
RelatorioTitle        - Título com ícone
RelatorioCard         - Card individual de relatório
RelatorioHeader       - Cabeçalho com info do paciente
RelatorioBody         - Corpo com detalhes
ViewRelatButton       - Botão para ver detalhes completos
NoRelatorioMessage    - Mensagem quando vazio

// Modal de Relatório
RelatorioModal        - Overlay do modal
RelatorioModalContent - Container do conteúdo
CloseModalButton      - Botão de fechamento
```

---

## 🎯 Fluxo de Uso

### Para o Gestor Atribuir Paciente:

1. Na página "Agentes", clique em "Novo Agente" ou expanda um agente existente
2. No modal "Atribuir Paciente":
   - Selecione o paciente na lista
   - **Escolha a data e hora da visita planejada** (novo!)
   - Defina o endereço/localização
   - Adicione notas para o agente
   - Clique em "Atribuir"

### Para o Gestor Visualizar Relatório da Visita:

1. Na página "Agentes", expanda o agente clicando em seu nome
2. Role até a seção **"📋 Relatórios de Visitas"**
3. Visualize resumo das visitas realizadas com relatórios
4. Clique em **"Ver Relatório Completo →"** para ver detalhes:
   - Paciente atendido
   - Data planejada vs. data realizada
   - Localização
   - Anotações da visita
   - Relatório detalhado (do agente de sumarização)
   - Notas do gestor

---

## 📊 Estrutura de Dados

### Campo `relatorio_visita` (JSON)

Esperado receber do agente de sumarização:

```json
{
  "resumo": "Visita realizada com sucesso...",
  "observacoes": "Paciente apresentava...",
  "recomendacoes": "Recomenda-se...",
  "proximos_passos": "Agendar retorno em...",
  "dados_clinicos": {
    "pressao": "120/80",
    "peso": "75kg",
    ...
  }
}
```

---

## 🔗 Integração com Agentes de IA

### Agente de Sumarização

Deverá:
1. Receber dados da visita do aplicativo do agente
2. Processar e gerar relatório estruturado
3. Atualizar o campo `relatorio_visita` via API
4. Opcionalmente atualizar `data_visita_realizada` e `anotacoes_visita`

**Endpoint esperado (a ser criado):**
```
POST /api/v1/agentes/{agente_id}/atribuicoes/{atribuicao_id}/relatorio
Body: {
  "relatorio_visita": { ... },
  "anotacoes_visita": "...",
  "data_visita_realizada": "2024-01-15T14:30:00"
}
```

---

## 🔍 Checklist de Implementação

- [x] Expandir modelo de dados no backend
- [x] Atualizar schemas do backend
- [x] Atualizar tipos do frontend
- [x] Adicionar campo de data na modal de atribuição
- [x] Validar data da visita como obrigatória
- [x] Criar seção de visualização de relatórios
- [x] Implementar modal de relatório completo
- [x] Estilizar componentes de relatório
- [ ] Criar endpoint de atualização de relatório (backend)
- [ ] Integrar agente de sumarização para enviar relatórios
- [ ] Testar fluxo completo ponta a ponta

---

## 🚀 Próximas Etapas

1. **Backend**: Criar endpoint `PUT /api/v1/agentes/{agente_id}/atribuicoes/{atribuicao_id}` para receber relatórios

2. **Agente de Sumarização**: Integrar com o agente que processará as visitas e enviará relatórios

3. **Notificações**: Adicionar notificação ao gestor quando relatório estiver disponível

4. **Exportação**: Permitir exportar relatórios em PDF

5. **Filtros**: Adicionar filtros por data/status para visualizar apenas relatórios de um período

---

## 📝 Notas Técnicas

- Datas são armazenadas em UTC no banco
- Frontend formata datas para timezone local do usuário
- Modal de relatório é renderizado condicionalmente apenas quando existe `relatorio_visita`
- Validação de data obrigatória é feita no frontend e deve ser replicada no backend
