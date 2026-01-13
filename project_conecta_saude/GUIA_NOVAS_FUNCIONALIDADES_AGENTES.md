# 🎯 Guia Rápido: Novas Funcionalidades de Agentes

## 📱 O que Mudou?

Duas novas funcionalidades foram adicionadas à tela de gerenciamento de agentes:

---

## 1️⃣ **Atribuir Pacientes com Data de Visita**

### Antes
- Gestor atribuía paciente, mas SEM data específica

### Agora ✨
- Gestor atribui paciente **COM data e hora planejada da visita**

### Como usar:

1. **Abra a página "👥 Agentes de Saúde"**

2. **Expanda um agente** clicando no nome dele (com a seta)
   
3. **Na seção "Pacientes Atribuídos"**, clique em **"+ Atribuir Novo Paciente"**

4. **Na modal que abre**, siga os passos:
   - 📍 Selecione o paciente na lista
   - 📅 **[NOVO!]** Escolha a DATA E HORA da visita
   - 📍 Defina o endereço
   - 📝 Adicione notas (opcional)
   - ✅ Clique em "Atribuir"

```
Exemplo:
Data da Visita: 15/01/2024 às 14:30
Paciente: João Silva
Endereço: Rua Principal, 123
Notas: Paciente com hipertensão, trazer monitor
```

---

## 2️⃣ **Visualizar Relatórios de Visitas Realizadas**

### Novo recurso!
Gestor pode agora **ver o resultado das visitas** que o agente realizou

### Fluxo:

1. **Abra a página "👥 Agentes de Saúde"**

2. **Expanda um agente** clicando no nome

3. **Role para baixo** e procure pela seção **"📋 Relatórios de Visitas"**

4. **Você verá:**
   - ✅ Resumo de cada visita realizada
   - 📅 Data planejada vs data real
   - 📝 Primeiras linhas das anotações
   - 🔗 Botão "Ver Relatório Completo"

5. **Para ver detalhes completos:**
   - Clique em **"Ver Relatório Completo →"**
   - Abre modal grande com:
     - 🧑 Nome do paciente
     - 📅 Datas (planejada e realizada)
     - 📍 Localização da visita
     - 📝 Anotações do agente
     - 📊 Relatório estruturado (do agente de IA)
     - 📌 Notas do gestor

### Exemplo de Relatório:

```
┌─────────────────────────────────────┐
│ 📋 Relatório da Visita              │
├─────────────────────────────────────┤
│                                     │
│ Paciente: Maria Silva               │
│ Data Planejada: 15/01/2024 14:30    │
│ Data Realizada: 15/01/2024 14:45    │
│ Localização: Avenida Central, 456   │
│                                     │
│ Anotações da Visita:                │
│ Paciente estava bem-disposto...     │
│                                     │
│ Relatório Detalhado:                │
│ - Pressão: 120/80                   │
│ - Peso: 75kg                        │
│ - Recomendações: Retornar em 30d    │
│                                     │
└─────────────────────────────────────┘
```

---

## 🔄 Fluxo Completo

```
┌─────────────────────────────────────────────────────────────┐
│                    DIA DO AGENTE                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ MANHÃ:                                                      │
│ Gestor atribui pacientes com data da visita                │
│ ├─ Paciente A: 14:00                                       │
│ ├─ Paciente B: 15:30                                       │
│ └─ Paciente C: 17:00                                       │
│                                                             │
│ TARDE:                                                      │
│ Agente recebe dados no app e realiza visitas               │
│ ├─ Anota observações durante visita                        │
│ └─ Envia dados ao final do atendimento                     │
│                                                             │
│ NOITE:                                                      │
│ Agente de Sumarização (IA) processa dados                  │
│ └─ Gera relatório estruturado                              │
│                                                             │
│ PRÓXIMO DIA:                                               │
│ Gestor visualiza resultados das visitas                    │
│ ├─ Vê quais pacientes foram atendidos                      │
│ ├─ Consulta anotações do agente                            │
│ └─ Lê relatório da IA com análise                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 💡 Benefícios

✅ **Melhor organização** - Gestor sabe exatamente quando cada paciente será visitado

✅ **Rastreabilidade** - Histórico completo de todas as visitas realizadas

✅ **Inteligência** - Agente de sumarização gera insights automáticos

✅ **Transparência** - Gestor tem visão do que foi feito em cada visita

✅ **Dados estruturados** - Relatórios padronizados facilitam análise

---

## ⚠️ Importante

### Para o relatório aparecer:

1. O agente deve **completar a visita** no app
2. O agente de sumarização deve **processar os dados**
3. Os dados devem ser **salvos no backend** com os campos:
   - `data_visita_realizada`
   - `anotacoes_visita`
   - `relatorio_visita` (JSON)

---

## 🛠️ Desenvolvimento

### Próximas melhorias planejadas:

- [ ] Exportar relatório em PDF
- [ ] Filtrar relatórios por data/status
- [ ] Gráficos de desempenho do agente
- [ ] Notificações quando relatório fica pronto
- [ ] Editar relatório após geração

---

## 📞 Suporte

Dúvidas ou problemas? Verifique:

1. Se a data da visita é obrigatória (sim!)
2. Se o agente completou a visita
3. Se o agente de sumarização processou os dados
4. Verifique o console do navegador para erros

