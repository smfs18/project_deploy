// src/utils/kmeans.ts
// Implementação do algoritmo K-means para agrupamento de coordenadas geográficas

export interface Point {
  latitude: number;
  longitude: number;
  id: number;
}

export interface Cluster {
  id: number;
  centroid: { latitude: number; longitude: number };
  points: Point[];
  color: string;
}

// Cores para diferentes clusters
const CLUSTER_COLORS = [
  '#FF6B6B', // Vermelho
  '#4ECDC4', // Turquesa
  '#45B7D1', // Azul claro
  '#FFA07A', // Laranja claro
  '#98D8C8', // Verde menta
  '#F7DC6F', // Amarelo
  '#BB8FCE', // Roxo claro
  '#85C1E2', // Azul céu
  '#F8B739', // Dourado
  '#52B788', // Verde
];

/**
 * Calcula a distância euclidiana entre dois pontos
 */
function calculateDistance(
  point1: { latitude: number; longitude: number },
  point2: { latitude: number; longitude: number }
): number {
  const latDiff = point1.latitude - point2.latitude;
  const lngDiff = point1.longitude - point2.longitude;
  return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
}

/**
 * Inicializa os centroides usando o método K-means++
 * Este método escolhe centroides iniciais que estão mais distantes entre si
 */
function initializeCentroids(
  points: Point[],
  k: number
): { latitude: number; longitude: number }[] {
  if (points.length === 0) return [];
  
  const centroids: { latitude: number; longitude: number }[] = [];
  
  // Primeiro centroide: escolhido aleatoriamente
  const firstPoint = points[Math.floor(Math.random() * points.length)];
  centroids.push({
    latitude: firstPoint.latitude,
    longitude: firstPoint.longitude,
  });

  // Escolher os demais centroides usando K-means++
  for (let i = 1; i < k; i++) {
    const distances = points.map((point) => {
      // Encontra a distância mínima deste ponto para os centroides existentes
      const minDist = Math.min(
        ...centroids.map((centroid) => calculateDistance(point, centroid))
      );
      return minDist * minDist; // Distância ao quadrado
    });

    // Escolher próximo centroide com probabilidade proporcional à distância
    const sum = distances.reduce((a, b) => a + b, 0);
    let random = Math.random() * sum;
    
    for (let j = 0; j < points.length; j++) {
      random -= distances[j];
      if (random <= 0) {
        centroids.push({
          latitude: points[j].latitude,
          longitude: points[j].longitude,
        });
        break;
      }
    }
  }

  return centroids;
}

/**
 * Atribui cada ponto ao cluster mais próximo
 */
function assignPointsToClusters(
  points: Point[],
  centroids: { latitude: number; longitude: number }[]
): number[] {
  return points.map((point) => {
    let minDistance = Infinity;
    let closestCluster = 0;

    centroids.forEach((centroid, index) => {
      const distance = calculateDistance(point, centroid);
      if (distance < minDistance) {
        minDistance = distance;
        closestCluster = index;
      }
    });

    return closestCluster;
  });
}

/**
 * Recalcula os centroides baseado nos pontos atribuídos
 */
function updateCentroids(
  points: Point[],
  assignments: number[],
  k: number
): { latitude: number; longitude: number }[] {
  const centroids: { latitude: number; longitude: number }[] = [];

  for (let i = 0; i < k; i++) {
    const clusterPoints = points.filter((_, index) => assignments[index] === i);

    if (clusterPoints.length === 0) {
      // Se não há pontos neste cluster, mantenha o centroide anterior ou escolha aleatoriamente
      const randomPoint = points[Math.floor(Math.random() * points.length)];
      centroids.push({
        latitude: randomPoint.latitude,
        longitude: randomPoint.longitude,
      });
    } else {
      const avgLat =
        clusterPoints.reduce((sum, p) => sum + p.latitude, 0) / clusterPoints.length;
      const avgLng =
        clusterPoints.reduce((sum, p) => sum + p.longitude, 0) / clusterPoints.length;
      centroids.push({ latitude: avgLat, longitude: avgLng });
    }
  }

  return centroids;
}

/**
 * Verifica se os centroides convergiram (não mudaram significativamente)
 */
function hasConverged(
  oldCentroids: { latitude: number; longitude: number }[],
  newCentroids: { latitude: number; longitude: number }[],
  threshold: number = 0.0001
): boolean {
  return oldCentroids.every((oldCentroid, index) => {
    const newCentroid = newCentroids[index];
    const distance = calculateDistance(oldCentroid, newCentroid);
    return distance < threshold;
  });
}

/**
 * Algoritmo K-means principal
 * @param points - Array de pontos com coordenadas
 * @param k - Número de clusters desejados
 * @param maxIterations - Número máximo de iterações
 * @returns Array de clusters com seus pontos e centroides
 */
export function kMeans(
  points: Point[],
  k: number,
  maxIterations: number = 100
): Cluster[] {
  if (points.length === 0) return [];
  
  // Ajustar k se for maior que o número de pontos
  const effectiveK = Math.min(k, points.length);

  // Inicializar centroides
  let centroids = initializeCentroids(points, effectiveK);
  let assignments: number[] = [];

  // Iterar até convergência ou máximo de iterações
  for (let iteration = 0; iteration < maxIterations; iteration++) {
    // Atribuir pontos aos clusters
    assignments = assignPointsToClusters(points, centroids);

    // Calcular novos centroides
    const newCentroids = updateCentroids(points, assignments, effectiveK);

    // Verificar convergência
    if (hasConverged(centroids, newCentroids)) {
      centroids = newCentroids;
      break;
    }

    centroids = newCentroids;
  }

  // Construir os clusters finais
  const clusters: Cluster[] = [];
  for (let i = 0; i < effectiveK; i++) {
    const clusterPoints = points.filter((_, index) => assignments[index] === i);
    clusters.push({
      id: i,
      centroid: centroids[i],
      points: clusterPoints,
      color: CLUSTER_COLORS[i % CLUSTER_COLORS.length],
    });
  }

  return clusters;
}

/**
 * Calcula o raio do cluster baseado na dispersão dos pontos
 * Retorna o raio em graus (para uso com Leaflet)
 */
export function calculateClusterRadius(cluster: Cluster): number {
  if (cluster.points.length === 0) return 0.001; // Raio mínimo

  const distances = cluster.points.map((point) =>
    calculateDistance(point, cluster.centroid)
  );

  // Usar a média das distâncias ou o desvio padrão
  const avgDistance =
    distances.reduce((sum, d) => sum + d, 0) / distances.length;
  
  // Multiplicar por um fator para visualização (pode ajustar)
  return avgDistance * 1.5;
}

/**
 * Método do cotovelo (Elbow Method) para sugerir o número ideal de clusters
 * Retorna a soma das distâncias quadradas intra-cluster (WCSS)
 */
export function calculateWCSS(points: Point[], k: number): number {
  const clusters = kMeans(points, k);
  
  let wcss = 0;
  clusters.forEach((cluster) => {
    cluster.points.forEach((point) => {
      const distance = calculateDistance(point, cluster.centroid);
      wcss += distance * distance;
    });
  });

  return wcss;
}

/**
 * Sugere o número ideal de clusters usando o método do cotovelo
 */
export function suggestOptimalK(points: Point[], maxK: number = 10): number {
  if (points.length <= 3) return Math.max(1, points.length);

  const wcssValues: number[] = [];
  const testK = Math.min(maxK, Math.floor(points.length / 2));

  for (let k = 1; k <= testK; k++) {
    wcssValues.push(calculateWCSS(points, k));
  }

  // Encontrar o "cotovelo" - maior variação na segunda derivada
  let optimalK = 3; // Valor padrão
  let maxDiff = 0;

  for (let i = 1; i < wcssValues.length - 1; i++) {
    const diff = wcssValues[i - 1] - 2 * wcssValues[i] + wcssValues[i + 1];
    if (diff > maxDiff) {
      maxDiff = diff;
      optimalK = i + 1;
    }
  }

  return optimalK;
}
