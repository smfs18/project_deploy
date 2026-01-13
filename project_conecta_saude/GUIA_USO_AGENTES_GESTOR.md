# Guia de Uso - Sistema de Gerenciamento de Agentes de Saúde

## 👋 Bem-vindo ao Sistema Conecta Saúde

Este guia irá ajudar você a gerenciar agentes de saúde e atribuir pacientes para visitas domiciliares.

---

## 🎯 Começando

### 1. Acessar o Sistema de Agentes

1. Faça login no portal do gestor com suas credenciais
2. Você será redirecionado para a **Dashboard de Pacientes**
3. Procure pelo botão **"👥 Agentes de Saúde"** na barra superior

```
┌─────────────────────────────────────────────┐
│  🔍 Buscar paciente...  📍 Ver Mapa  + Paciente  👥 AGENTES  🔔  Sair |
└─────────────────────────────────────────────┘
```

4. Clique no botão para acessar a página de gerenciamento

---

## 👥 Gerenciando Agentes

### ✅ Adicionar um Novo Agente

1. Na página de Agentes, clique em **"+ Novo Agente"**
2. Preencha os seguintes campos obrigatórios:
   - **Nome Completo** - Ex: João da Silva
   - **Email** - Ex: joao@email.com (este será o login do agente)
   - **CPF** - Ex: 123.456.789-00
   - **Tipo de Profissional** - Selecione na lista (ACS, Enfermeiro, etc.)
   - **Senha** - Crie uma senha com pelo menos 6 caracteres

3. Você pode preencher campos opcionais:
   - Telefone
   - Número de Registro (CRM, COREN, etc.)
   - UBS (Unidade de Saúde)
   - Endereço

4. Clique em **"Salvar"**

**Importante:** Guarde a senha do agente para compartilhá-la com ele para fazer login no app!

### ✏️ Editar um Agente

1. Localizar o agente na tabela
2. Clique no ícone **✏️ (lápis)** nas ações
3. Altere os dados necessários
4. Se quiser alterar a senha, preencha o campo de senha
5. Se não quiser alterar a senha, deixe o campo vazio
6. Clique em **"Salvar"**

### 🗑️ Deletar um Agente

1. Localizar o agente na tabela
2. Clique no ícone **🗑️ (lixo)** nas ações
3. Confirme a exclusão
4. **Atenção:** Todas as atribuições do agente também serão deletadas!

---

## 📍 Atribuindo Pacientes a Agentes

### 1️⃣ Expandir Agente

1. Clique na **seta** ⬇️ ao lado do nome do agente na tabela
2. Os detalhes do agente serão expandidos, mostrando:
   - Telefone
   - CPF
   - UBS
   - Data de cadastro
   - **Lista de Pacientes Atribuídos**

### 2️⃣ Atribuir Novo Paciente

1. Na seção de pacientes atribuídos, clique em **"+ Atribuir Novo Paciente"**
2. Uma modal de atribuição aparecerá
3. **Selecione um paciente** da lista de pacientes cadastrados
4. O sistema mostrará automaticamente:
   - Nome do paciente
   - Endereço
   - Pressão Arterial (última medição)
   - Glicemia (última medição)

5. Você pode adicionar:
   - **Notas do Gestor** - Instruções específicas para o agente
   - **Informações Clínicas** - Detalhes relevantes

6. Clique em **"Atribuir"** para confirmar

### 3️⃣ Enviar Dados para o App do Agente

1. Após atribuir, o paciente aparecerá na lista de pacientes do agente
2. Clique em **"📱 Enviar"** para enviar os dados para o app
3. Uma notificação será enviada ao agente informando que há novo paciente

```
┌──────────────────────────────────────┐
│  Paciente: Maria Silva               │
│  Endereço: Rua Principal, 123        │
│  Pressão: 140/90 mmHg               │
│  Glicemia: 120 mg/dL                │
│                                      │
│  [📱 Enviar] [✕ Remover]           │
└──────────────────────────────────────┘
```

### 4️⃣ Remover Atribuição

Se precisar remover um paciente de um agente:

1. Na lista de pacientes atribuídos, clique em **"✕ Remover"**
2. Confirme a remoção
3. O agente não verá mais este paciente na lista

---

## 📱 O que o Agente Vê no App

Após receber a atribuição, o agente:

1. **Faz Login** com email e senha que você criou
2. **Acessa a aba "Pacientes"** e vê:
   - Nome do paciente
   - Endereço completo
   - Pressão arterial
   - Glicemia
   - Notas do gestor

3. **Clica em "Registrar Visita"** para:
   - Abrir o mapa/navegação
   - Gravar um áudio explicando o resultado da visita
   - Enviar o áudio para processamento

---

## 🎙️ Recebendo Relatórios de Visitas

Após o agente registrar uma visita:

1. O áudio é processado por um **agente de transcrição**
2. Um **agente de sumarização** cria um resumo automático
3. Você recebe uma notificação com o resumo da visita

O resumo incluirá:
- O que foi observado
- Ações tomadas
- Recomendações dadas ao paciente
- Próximos passos

---

## 🔍 Buscando Agentes

Use a barra de busca no topo para encontrar agentes por:
- Nome
- Email
- CPF

```
🔍 Buscar por nome, email ou CPF...
```

---

## 📊 Visualizando Informações do Agente

Clique na **seta** ⬇️ para expandir e ver:

```
Nome: João da Silva
Email: joao@email.com
Profissional: Agente Comunitário de Saúde (ACS)
Pacientes Atribuídos: 5

Telefone: (11) 99999-9999
CPF: 123.456.789-00
UBS: UBS Centro
Data de Cadastro: 12/01/2025
```

---

## ⚠️ Dicas Importantes

1. **Senhas Seguras:** Use senhas com números, letras maiúsculas e caracteres especiais
2. **Compartilhamento:** Compartilhe a senha com o agente de forma segura
3. **Múltiplos Pacientes:** Um agente pode ter vários pacientes atribuídos
4. **Edição de Dados:** Ao editar um agente, deixe a senha em branco para mantê-la
5. **Monitoramento:** Você pode ver quantos pacientes cada agente tem atribuído

---

## 🆘 Solução de Problemas

### Problema: Agente não consegue fazer login

**Solução:**
- Verifique se o email está correto
- Verifique se a senha foi compartilhada corretamente
- Resete a senha editando o agente e inserindo uma nova

### Problema: Paciente não aparece no app do agente

**Solução:**
- Confirme que clicou em **"📱 Enviar"**
- Peça ao agente para fazer refresh (puxar para baixo) na tela de pacientes
- Verifique se o agente tem internet ativa

### Problema: Não consigo deletar um agente

**Solução:**
- Remova todos os pacientes atribuídos primeiro
- Confirme a exclusão quando solicitado

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique este guia
2. Contate o administrador do sistema
3. Consulte a documentação técnica

---

**Última atualização:** 4 de janeiro de 2026  
**Versão:** 1.0
