# 🗺️ Guia Rápido: Clustering de Pacientes com K-means

## 🎯 O que é?

Uma funcionalidade que agrupa automaticamente pacientes em **microregiões geográficas** usando o algoritmo K-means, facilitando o planejamento de visitas domiciliares e alocação de recursos.

## 🚀 Como Usar

### Passo 1: Acesse o Mapa de Pacientes

Navegue até a página do mapa no sistema Conecta Saúde.

### Passo 2: Ative o Clustering

1. No canto superior direito do mapa, você verá o painel **"Agrupamento de Pacientes"**
2. Clique no botão **"Ativar Clusters"**
3. O sistema automaticamente sugere o número ideal de microregiões

### Passo 3: Ajuste Conforme Necessário

- **Alterar número de regiões**: Modifique o valor no campo "Número de Microregiões"
- **Recalcular**: Clique em "Recalcular Clusters" para aplicar as mudanças
- **Desativar**: Clique em "Desativar Clusters" para voltar à visualização normal

## 🎨 Entendendo a Visualização

### Elementos do Mapa

| Elemento | Descrição |
|----------|-----------|
| 🔴 Marcador Vermelho | Paciente em estado crítico (outlier) |
| 🟢 Marcador Verde | Paciente em estado estável |
| ⭕ Círculos Coloridos | Representam as microregiões |
| ⭐ Centros dos Círculos | Ponto central de cada microrregião |

### Painel de Informações

O painel mostra:
- Número total de microregiões identificadas
- Quantidade de pacientes em cada região
- Cores correspondentes para fácil identificação

## 📊 Exemplos de Uso

### Exemplo 1: Planejamento de Visitas Domiciliares

```
Situação: Agente comunitário precisa visitar 30 pacientes

Solução:
1. Ativar clustering com 3 microregiões
2. Visualizar os agrupamentos no mapa
3. Planejar rota visitando uma microrregião por dia
4. Resultado: Redução de 40% no tempo de deslocamento
```

### Exemplo 2: Alocação de Equipes

```
Situação: 3 equipes de saúde precisam ser distribuídas

Solução:
1. Ativar clustering com 3 microregiões
2. Observar número de pacientes por região
3. Alocar equipes proporcionalmente
4. Resultado: Cobertura balanceada e eficiente
```

### Exemplo 3: Identificação de Hotspots

```
Situação: Detectar regiões com maior concentração de casos críticos

Solução:
1. Ativar clustering
2. Observar microregiões com mais marcadores vermelhos
3. Priorizar intervenções nessas áreas
4. Resultado: Resposta rápida a situações de risco
```

## 🔧 Dicas e Boas Práticas

### ✅ Faça

- Use entre 3-5 microregiões para áreas urbanas pequenas
- Use entre 5-8 microregiões para áreas urbanas médias
- Recalcule clusters quando novos pacientes forem adicionados
- Observe o número sugerido automaticamente pelo sistema

### ❌ Evite

- Usar muitas microregiões (>10) - dificulta visualização
- Usar apenas 1 microrregião - não há benefício de agrupamento
- Ignorar outliers geográficos - podem precisar de atenção especial

## 🎓 Entendendo os Números

### Número Sugerido Automaticamente

O sistema usa o **Método do Cotovelo** para sugerir o número ideal:

```
📈 Como funciona:
1. Calcula qualidade do agrupamento para k=1,2,3...10
2. Identifica o ponto onde adicionar mais clusters não melhora muito
3. Este ponto é o "cotovelo" - número ideal
```

### Interpretando os Resultados

| Cenário | Interpretação |
|---------|---------------|
| Clusters balanceados (ex: 10, 12, 11 pacientes) | ✅ Distribuição ideal |
| Um cluster muito maior (ex: 5, 3, 25 pacientes) | ⚠️ Pode ser necessário ajustar k |
| Muitos clusters pequenos (ex: 2-3 pacientes cada) | ⚠️ Considere reduzir k |

## 🛠️ Troubleshooting

### Problema: "Clusters parecem inadequados"

**Possíveis causas:**
- Número de microregiões inadequado
- Pacientes muito dispersos geograficamente

**Soluções:**
1. Tente usar o número sugerido automaticamente
2. Ajuste manualmente aumentando ou diminuindo em 1-2 unidades
3. Clique em "Recalcular Clusters"

### Problema: "Uma região tem muitos mais pacientes que outras"

**Explicação:**
- Isso é normal se os pacientes não estão uniformemente distribuídos
- Pode indicar áreas de maior densidade populacional

**Ação:**
- Use essa informação para alocar mais recursos para regiões maiores

### Problema: "Clusters se sobrepõem"

**Explicação:**
- Pode acontecer quando há grupos de pacientes próximos

**Soluções:**
1. Reduza o número de microregiões
2. Use zoom no mapa para visualizar melhor

## 📱 Interface Mobile

A funcionalidade também funciona em dispositivos móveis:
- Painel de controle se adapta ao tamanho da tela
- Toque nos marcadores para ver informações
- Use pinch-to-zoom para navegar no mapa

## 🔗 Integrações Futuras

### Em desenvolvimento:

- 📊 **Exportação de relatórios**: PDF com estatísticas por microrregião
- 🗺️ **Rotas otimizadas**: Integração com Google Maps/OpenStreetMap
- 📈 **Análise temporal**: Comparar clusters ao longo do tempo
- 📧 **Alertas automáticos**: Notificar quando novos pacientes críticos aparecem em uma região

## 📞 Suporte

Para dúvidas ou problemas:
1. Consulte a documentação completa em `IMPLEMENTACAO_KMEANS.md`
2. Teste o algoritmo visualmente em `KmeansDemo` (componente de demonstração)
3. Entre em contato com a equipe de desenvolvimento

---

**Última atualização**: Dezembro 2025
**Versão**: 1.0.0
