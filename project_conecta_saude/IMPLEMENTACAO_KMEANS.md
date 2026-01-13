# Implementação de K-means para Agrupamento de Pacientes em Microregiões

## 📋 Visão Geral

Implementamos o algoritmo **K-means** para agrupar pacientes em microregiões geográficas no mapa do sistema Conecta Saúde. Esta funcionalidade permite aos profissionais de saúde visualizar clusters de pacientes e otimizar rotas de atendimento domiciliar.

## 🎯 Funcionalidades Implementadas

### 1. Algoritmo K-means (`/frontend/src/utils/kmeans.ts`)

#### Características Principais:
- **K-means++**: Inicialização inteligente de centroides para melhor convergência
- **Clustering Geográfico**: Agrupa pacientes baseado em coordenadas (latitude/longitude)
- **Método do Cotovelo**: Sugestão automática do número ideal de clusters
- **Visualização**: Cores distintas para cada microrregião

#### Funções Principais:

```typescript
// Executa o algoritmo K-means
kMeans(points: Point[], k: number, maxIterations?: number): Cluster[]

// Calcula o raio visual do cluster
calculateClusterRadius(cluster: Cluster): number

// Sugere o número ideal de clusters
suggestOptimalK(points: Point[], maxK?: number): number

// Calcula WCSS (Within-Cluster Sum of Squares)
calculateWCSS(points: Point[], k: number): number
```

### 2. Componente PatientMap Atualizado

#### Novos Recursos:
✅ **Painel de Controle** - Interface para gerenciar clustering
✅ **Visualização de Clusters** - Círculos coloridos representando microregiões
✅ **Informações Detalhadas** - Número de pacientes por região
✅ **Toggle On/Off** - Ativar/desativar visualização de clusters
✅ **Ajuste Dinâmico** - Alterar número de microregiões em tempo real

## 🎨 Interface do Usuário

### Painel de Controle
```
┌─────────────────────────────────┐
│ Agrupamento de Pacientes        │
├─────────────────────────────────┤
│ Número de Microregiões: [3]    │
│ [Recalcular Clusters]           │
│ [Ativar/Desativar Clusters]     │
├─────────────────────────────────┤
│ Microregiões Identificadas:     │
│ 🟥 Região 1: 15 pacientes      │
│ 🟦 Região 2: 12 pacientes      │
│ 🟩 Região 3: 8 pacientes       │
└─────────────────────────────────┘
```

### Visualização no Mapa
- **Círculos coloridos**: Representam as microregiões
- **Marcadores**: Pacientes críticos (vermelho) e estáveis (verde)
- **Popup do cluster**: Mostra informações do centro e número de pacientes
- **Popup do paciente**: Inclui qual microrregião pertence

## 🔧 Como Usar

### 1. Ativar Clustering
```typescript
// O componente já está pronto para uso
<PatientMap onPatientClick={(id) => console.log(`Paciente ${id} clicado`)} />
```

### 2. Controles Disponíveis

**Ativar Clusters:**
- Clique no botão "Ativar Clusters"
- O sistema sugere automaticamente o número ideal de microregiões

**Ajustar Número de Regiões:**
- Modifique o valor no campo "Número de Microregiões"
- Clique em "Recalcular Clusters"

**Desativar:**
- Clique em "Desativar Clusters" para voltar à visualização normal

## 📊 Como Funciona o K-means

### Algoritmo Passo a Passo:

1. **Inicialização (K-means++)**
   - Primeiro centroide: escolhido aleatoriamente
   - Próximos centroides: escolhidos com probabilidade proporcional à distância dos existentes
   - Isso garante que os centroides iniciais estejam bem distribuídos

2. **Atribuição**
   - Cada paciente é atribuído ao cluster cujo centroide está mais próximo
   - Usa distância euclidiana: √((lat₁-lat₂)² + (lng₁-lng₂)²)

3. **Atualização**
   - Recalcula o centroide de cada cluster como a média das coordenadas dos pacientes
   - Novo centroide = (média das latitudes, média das longitudes)

4. **Convergência**
   - Repete passos 2-3 até que os centroides não mudem significativamente
   - Máximo de 100 iterações para garantir término

### Método do Cotovelo

O sistema usa o **Elbow Method** para sugerir o número ideal de clusters:

```
WCSS (Erro Quadrático)
    │
  1000│●
    │  ╲
  800│   ●
    │    ╲
  600│     ●___
    │         ●───●───● ← "Cotovelo"
  400│
    └─────────────────────
      1  2  3  4  5  6  k
```

O "cotovelo" indica onde adicionar mais clusters não melhora significativamente o agrupamento.

## 🎨 Cores dos Clusters

Paleta de 10 cores distintas:
- 🔴 Vermelho (`#FF6B6B`)
- 🔵 Turquesa (`#4ECDC4`)
- 🔷 Azul claro (`#45B7D1`)
- 🟠 Laranja claro (`#FFA07A`)
- 🟢 Verde menta (`#98D8C8`)
- 🟡 Amarelo (`#F7DC6F`)
- 🟣 Roxo claro (`#BB8FCE`)
- 🔵 Azul céu (`#85C1E2`)
- 🟨 Dourado (`#F8B739`)
- 🟩 Verde (`#52B788`)

## 📈 Casos de Uso

### 1. Otimização de Rotas
```
Benefício: Agrupar pacientes em microregiões permite que agentes 
           comunitários planejem rotas mais eficientes para visitas
           domiciliares.
```

### 2. Alocação de Recursos
```
Benefício: Identificar regiões com maior concentração de pacientes
           críticos para direcionar recursos médicos.
```

### 3. Análise Epidemiológica
```
Benefício: Detectar padrões geográficos de condições de saúde e
           planejar intervenções preventivas por região.
```

### 4. Planejamento de Equipes
```
Benefício: Atribuir equipes de saúde para microregiões específicas,
           otimizando a cobertura e reduzindo deslocamentos.
```

## 🔄 Exemplo de Uso Completo

```typescript
// Dados de entrada
const patients = [
  { id: 1, latitude: -23.5505, longitude: -46.6333 },
  { id: 2, latitude: -23.5515, longitude: -46.6343 },
  { id: 3, latitude: -23.5525, longitude: -46.6353 },
  // ... mais pacientes
];

// 1. Sugerir número ideal de clusters
const optimalK = suggestOptimalK(patients, 10);
console.log(`Número ideal de clusters: ${optimalK}`);

// 2. Executar clustering
const clusters = kMeans(patients, optimalK);

// 3. Analisar resultados
clusters.forEach((cluster, index) => {
  console.log(`Microrregião ${index + 1}:`);
  console.log(`  - Pacientes: ${cluster.points.length}`);
  console.log(`  - Centro: ${cluster.centroid.latitude}, ${cluster.centroid.longitude}`);
  console.log(`  - Cor: ${cluster.color}`);
});
```

## 🚀 Melhorias Futuras

### Possíveis Extensões:

1. **DBSCAN**: Algoritmo alternativo que não requer definir k previamente
2. **Clustering Hierárquico**: Criar hierarquias de regiões (bairros → distritos → cidades)
3. **Clustering por Condição**: Agrupar pacientes com condições similares
4. **Análise Temporal**: Monitorar como clusters evoluem ao longo do tempo
5. **Exportação de Dados**: Exportar relatórios de clusters em PDF/Excel
6. **Integração com Rotas**: Calcular rotas otimizadas usando APIs de mapas

### Otimizações de Performance:

1. **Web Workers**: Executar K-means em thread separada para grandes datasets
2. **Cache**: Armazenar resultados de clustering para evitar recálculos
3. **Lazy Loading**: Carregar pacientes por região conforme zoom do mapa

## 📝 Notas Técnicas

### Complexidade
- **Tempo**: O(n × k × i) onde n=pacientes, k=clusters, i=iterações
- **Espaço**: O(n + k)

### Limitações
- K-means assume clusters esféricos (pode não funcionar bem com formas irregulares)
- Sensível a outliers (pacientes muito distantes podem afetar centroides)
- Requer número de clusters pré-definido

### Quando Usar
✅ Boa distribuição geográfica de pacientes
✅ Número moderado de pacientes (< 10.000)
✅ Necessidade de divisão em regiões específicas

### Quando Evitar
❌ Pacientes muito dispersos geograficamente
❌ Regiões com formas muito irregulares
❌ Necessidade de detecção automática de outliers espaciais

## 🐛 Troubleshooting

### Problema: Clusters parecem inadequados
**Solução**: Ajuste o número de microregiões ou use o valor sugerido automaticamente

### Problema: Performance lenta
**Solução**: Reduza o número máximo de iterações ou implemente Web Workers

### Problema: Clusters desequilibrados
**Solução**: Isso pode ser normal se os pacientes não estão uniformemente distribuídos

## 📚 Referências

- [K-means Clustering - Wikipedia](https://en.wikipedia.org/wiki/K-means_clustering)
- [K-means++ Algorithm](https://en.wikipedia.org/wiki/K-means%2B%2B)
- [Elbow Method](https://en.wikipedia.org/wiki/Elbow_method_(clustering))
- [Leaflet.js Documentation](https://leafletjs.com/)

---

**Desenvolvido para o Sistema Conecta Saúde** 🏥
*Versão: 1.0.0 | Data: Dezembro 2025*
