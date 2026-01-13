// src/components/KmeansDemo.tsx
// Componente de demonstração do algoritmo K-means

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { kMeans, suggestOptimalK, calculateWCSS, Cluster, Point } from '../utils/kmeans';

const DemoContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h2`
  color: #333;
  margin-bottom: 20px;
`;

const Section = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const ControlsRow = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  align-items: center;
`;

const Button = styled.button`
  padding: 10px 20px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    background-color: #1565c0;
  }
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  width: 80px;
`;

const Label = styled.label`
  font-size: 1rem;
  color: #666;
`;

const Canvas = styled.canvas`
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: crosshair;
`;

const InfoBox = styled.div`
  background: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  margin-top: 15px;
`;

const ClusterStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  margin-top: 15px;
`;

const StatCard = styled.div<{ color: string }>`
  background: white;
  padding: 10px;
  border-radius: 4px;
  border-left: 4px solid ${props => props.color};
`;

const KmeansDemo: React.FC = () => {
  const [points, setPoints] = useState<Point[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [k, setK] = useState(3);
  const [canvasSize] = useState({ width: 800, height: 600 });
  const [suggestedK, setSuggestedK] = useState<number | null>(null);
  const [wcssValues, setWcssValues] = useState<number[]>([]);

  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    drawCanvas();
  }, [points, clusters]);

  const generateRandomPoints = (count: number) => {
    const newPoints: Point[] = [];
    for (let i = 0; i < count; i++) {
      newPoints.push({
        id: i,
        latitude: Math.random() * canvasSize.height,
        longitude: Math.random() * canvasSize.width,
      });
    }
    setPoints(newPoints);
    setClusters([]);
  };

  const generateClusteredPoints = (numClusters: number, pointsPerCluster: number) => {
    const newPoints: Point[] = [];
    let id = 0;

    for (let i = 0; i < numClusters; i++) {
      const centerLat = Math.random() * (canvasSize.height - 200) + 100;
      const centerLng = Math.random() * (canvasSize.width - 200) + 100;

      for (let j = 0; j < pointsPerCluster; j++) {
        const angle = Math.random() * 2 * Math.PI;
        const radius = Math.random() * 50 + 20;
        
        newPoints.push({
          id: id++,
          latitude: centerLat + Math.cos(angle) * radius,
          longitude: centerLng + Math.sin(angle) * radius,
        });
      }
    }

    setPoints(newPoints);
    setClusters([]);
  };

  const runKmeans = () => {
    if (points.length === 0) {
      alert('Adicione pontos primeiro!');
      return;
    }

    const result = kMeans(points, Math.min(k, points.length));
    setClusters(result);

    // Calcular WCSS para diferentes valores de k
    const wcss: number[] = [];
    const maxK = Math.min(10, points.length);
    for (let i = 1; i <= maxK; i++) {
      wcss.push(calculateWCSS(points, i));
    }
    setWcssValues(wcss);

    // Sugerir k ideal
    const suggested = suggestOptimalK(points, maxK);
    setSuggestedK(suggested);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newPoint: Point = {
      id: points.length,
      latitude: y,
      longitude: x,
    };

    setPoints([...points, newPoint]);
  };

  const clearPoints = () => {
    setPoints([]);
    setClusters([]);
    setSuggestedK(null);
    setWcssValues([]);
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpar canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    // Desenhar círculos dos clusters
    if (clusters.length > 0) {
      clusters.forEach((cluster) => {
        // Calcular raio
        let maxDist = 0;
        cluster.points.forEach((point) => {
          const dist = Math.sqrt(
            Math.pow(point.latitude - cluster.centroid.latitude, 2) +
            Math.pow(point.longitude - cluster.centroid.longitude, 2)
          );
          if (dist > maxDist) maxDist = dist;
        });

        // Desenhar círculo
        ctx.beginPath();
        ctx.arc(
          cluster.centroid.longitude,
          cluster.centroid.latitude,
          maxDist * 1.2,
          0,
          2 * Math.PI
        );
        ctx.fillStyle = cluster.color + '20'; // 20 = alpha transparency
        ctx.fill();
        ctx.strokeStyle = cluster.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Desenhar centroide
        ctx.beginPath();
        ctx.arc(
          cluster.centroid.longitude,
          cluster.centroid.latitude,
          8,
          0,
          2 * Math.PI
        );
        ctx.fillStyle = cluster.color;
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label do cluster
        ctx.fillStyle = '#000';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(
          `C${cluster.id + 1}`,
          cluster.centroid.longitude + 12,
          cluster.centroid.latitude + 5
        );
      });
    }

    // Desenhar pontos
    points.forEach((point) => {
      const cluster = clusters.find(c => c.points.some(p => p.id === point.id));
      const color = cluster ? cluster.color : '#333';

      ctx.beginPath();
      ctx.arc(point.longitude, point.latitude, 5, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  };

  return (
    <DemoContainer>
      <Title>🎯 Demonstração do Algoritmo K-means</Title>

      <Section>
        <h3>Controles</h3>
        <ControlsRow>
          <Label>Número de Clusters (k):</Label>
          <Input
            type="number"
            min="1"
            max="10"
            value={k}
            onChange={(e) => setK(parseInt(e.target.value) || 1)}
          />
          <Button onClick={runKmeans}>Executar K-means</Button>
          <Button onClick={() => generateRandomPoints(50)}>
            Gerar Pontos Aleatórios
          </Button>
          <Button onClick={() => generateClusteredPoints(3, 20)}>
            Gerar Pontos Agrupados
          </Button>
          <Button onClick={clearPoints}>Limpar</Button>
        </ControlsRow>

        <Canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          onClick={handleCanvasClick}
        />

        <InfoBox>
          <p>
            <strong>Como usar:</strong> Clique no canvas para adicionar pontos manualmente,
            ou use os botões para gerar pontos automaticamente. Depois, clique em "Executar K-means"
            para visualizar o agrupamento.
          </p>
          <p>
            <strong>Total de pontos:</strong> {points.length} | 
            <strong> Clusters encontrados:</strong> {clusters.length}
            {suggestedK !== null && (
              <> | <strong style={{ color: '#1976d2' }}> k sugerido: {suggestedK}</strong></>
            )}
          </p>
        </InfoBox>
      </Section>

      {clusters.length > 0 && (
        <Section>
          <h3>Estatísticas dos Clusters</h3>
          <ClusterStats>
            {clusters.map((cluster) => (
              <StatCard key={cluster.id} color={cluster.color}>
                <strong>Cluster {cluster.id + 1}</strong>
                <br />
                <small>Pontos: {cluster.points.length}</small>
                <br />
                <small style={{ fontSize: '0.8rem' }}>
                  Centro: ({cluster.centroid.longitude.toFixed(1)}, {cluster.centroid.latitude.toFixed(1)})
                </small>
              </StatCard>
            ))}
          </ClusterStats>
        </Section>
      )}

      {wcssValues.length > 0 && (
        <Section>
          <h3>Método do Cotovelo (Elbow Method)</h3>
          <p>WCSS (Within-Cluster Sum of Squares) para diferentes valores de k:</p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            {wcssValues.map((wcss, index) => (
              <div
                key={index}
                style={{
                  padding: '10px',
                  background: index + 1 === suggestedK ? '#e3f2fd' : '#f5f5f5',
                  borderRadius: '4px',
                  border: index + 1 === suggestedK ? '2px solid #1976d2' : 'none',
                }}
              >
                <strong>k={index + 1}</strong>
                <br />
                <small>WCSS: {wcss.toFixed(2)}</small>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section>
        <h3>ℹ️ Sobre o K-means</h3>
        <p>
          O K-means é um algoritmo de aprendizado não supervisionado que agrupa pontos
          em k clusters baseado na distância entre eles. O algoritmo:
        </p>
        <ol>
          <li>Inicializa k centroides aleatoriamente (usando K-means++)</li>
          <li>Atribui cada ponto ao centroide mais próximo</li>
          <li>Recalcula os centroides como a média dos pontos em cada cluster</li>
          <li>Repete os passos 2-3 até convergir</li>
        </ol>
        <p>
          O <strong>Método do Cotovelo</strong> ajuda a identificar o número ideal de clusters
          observando onde a redução no WCSS diminui significativamente.
        </p>
      </Section>
    </DemoContainer>
  );
};

export default KmeansDemo;
