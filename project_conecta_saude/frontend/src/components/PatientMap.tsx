// src/components/PatientMap.tsx
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getPacientesMapa, PacienteMapa } from "../services/api";
import styled from "styled-components";
import { kMeans, calculateClusterRadius, suggestOptimalK, Cluster } from "../utils/kmeans";

// Fix para os ícones do Leaflet não aparecerem
const markerIconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const markerShadowUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";
const markerIconRetinaUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";

let DefaultIcon = L.icon({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerIconRetinaUrl,
  shadowUrl: markerShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Ícones personalizados para status
const criticalIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: markerShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const stableIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: markerShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const MapWrapper = styled.div`
  width: 100%;
  height: 600px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .leaflet-container {
    height: 100%;
    width: 100%;
  }
`;

const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 600px;
  font-size: 1.2rem;
  color: #666;
`;

const ErrorMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 600px;
  font-size: 1.2rem;
  color: #d32f2f;
`;

const ControlPanel = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  min-width: 250px;
`;

const ControlTitle = styled.h3`
  margin: 0 0 10px 0;
  font-size: 1rem;
  color: #333;
`;

const ControlRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
`;

const Label = styled.label`
  font-size: 0.9rem;
  color: #666;
  flex: 1;
`;

const Input = styled.input`
  width: 60px;
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
`;

const Button = styled.button`
  width: 100%;
  padding: 8px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s;

  &:hover {
    background-color: #1565c0;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const ToggleButton = styled(Button)`
  background-color: ${props => props.disabled ? '#4caf50' : '#f44336'};
  margin-top: 10px;

  &:hover {
    background-color: ${props => props.disabled ? '#45a049' : '#da190b'};
  }
`;

const ClusterInfo = styled.div`
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #ddd;
  font-size: 0.85rem;
  color: #666;
`;

const ClusterLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 5px 0;
`;

const ColorBox = styled.div<{ color: string }>`
  width: 20px;
  height: 20px;
  background-color: ${props => props.color};
  border-radius: 3px;
  border: 1px solid #999;
`;


interface PatientMapProps {
  onPatientClick?: (patientId: number) => void;
}

const PatientMap: React.FC<PatientMapProps> = ({ onPatientClick }) => {
  const [patients, setPatients] = useState<PacienteMapa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [showClusters, setShowClusters] = useState(false);
  const [numClusters, setNumClusters] = useState(3);

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    if (patients.length > 0 && showClusters) {
      performClustering();
    }
  }, [patients, numClusters, showClusters]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await getPacientesMapa();
      setPatients(data);
      setError("");
      
      // Sugerir número ideal de clusters
      if (data.length > 0) {
        const points = data.map(p => ({
          id: p.id,
          latitude: p.latitude,
          longitude: p.longitude,
        }));
        const suggested = suggestOptimalK(points, 10);
        setNumClusters(suggested);
      }
    } catch (err: any) {
      console.error("Erro ao carregar pacientes do mapa:", err);
      setError(err.message || "Erro ao carregar pacientes");
    } finally {
      setLoading(false);
    }
  };

  const performClustering = () => {
    const points = patients.map(p => ({
      id: p.id,
      latitude: p.latitude,
      longitude: p.longitude,
    }));

    const result = kMeans(points, numClusters);
    setClusters(result);
  };

  const getPatientClusterColor = (patientId: number): string | null => {
    if (!showClusters) return null;
    
    const cluster = clusters.find(c => 
      c.points.some(p => p.id === patientId)
    );
    return cluster ? cluster.color : null;
  };

  const createClusterIcon = (isOutlier: boolean, clusterColor: string | null) => {
    if (!showClusters || !clusterColor) {
      return isOutlier ? criticalIcon : stableIcon;
    }

    // Criar ícone personalizado com cor do cluster
    return new L.Icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${
        isOutlier ? 'red' : 'green'
      }.png`,
      shadowUrl: markerShadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  };

  const toggleClustering = () => {
    setShowClusters(!showClusters);
    if (!showClusters) {
      performClustering();
    } else {
      setClusters([]);
    }
  };


  if (loading) {
    return <LoadingMessage>Carregando mapa...</LoadingMessage>;
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  if (patients.length === 0) {
    return (
      <LoadingMessage>
        Nenhum paciente com localização cadastrada ainda.
      </LoadingMessage>
    );
  }

  // Calcular o centro do mapa baseado na média das coordenadas
  const centerLat =
    patients.reduce((sum, p) => sum + p.latitude, 0) / patients.length;
  const centerLng =
    patients.reduce((sum, p) => sum + p.longitude, 0) / patients.length;

  return (
    <MapWrapper>
      <ControlPanel>
        <ControlTitle>Agrupamento de Pacientes</ControlTitle>
        <ControlRow>
          <Label>Número de Microregiões:</Label>
          <Input
            type="number"
            min="1"
            max="10"
            value={numClusters}
            onChange={(e) => setNumClusters(Math.max(1, parseInt(e.target.value) || 1))}
            disabled={!showClusters}
          />
        </ControlRow>
        <Button onClick={performClustering} disabled={!showClusters || patients.length === 0}>
          Recalcular Clusters
        </Button>
        <ToggleButton onClick={toggleClustering} disabled={patients.length === 0}>
          {showClusters ? 'Desativar Clusters' : 'Ativar Clusters'}
        </ToggleButton>
        
        {showClusters && clusters.length > 0 && (
          <ClusterInfo>
            <strong>Microregiões Identificadas:</strong>
            {clusters.map((cluster) => (
              <ClusterLabel key={cluster.id}>
                <ColorBox color={cluster.color} />
                <span>
                  Região {cluster.id + 1}: {cluster.points.length} pacientes
                </span>
              </ClusterLabel>
            ))}
          </ClusterInfo>
        )}
      </ControlPanel>

      <MapContainer
        center={[centerLat, centerLng]}
        zoom={15}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Desenhar círculos para representar as microregiões */}
        {showClusters && clusters.map((cluster) => (
          <Circle
            key={`cluster-${cluster.id}`}
            center={[cluster.centroid.latitude, cluster.centroid.longitude]}
            radius={calculateClusterRadius(cluster) * 111000} // Converter graus para metros
            pathOptions={{
              color: cluster.color,
              fillColor: cluster.color,
              fillOpacity: 0.15,
              weight: 2,
            }}
          >
            <Popup>
              <div>
                <strong>Microrregião {cluster.id + 1}</strong>
                <br />
                <span>Pacientes: {cluster.points.length}</span>
                <br />
                <span style={{ fontSize: '0.85rem', color: '#666' }}>
                  Centro: {cluster.centroid.latitude.toFixed(6)}, {cluster.centroid.longitude.toFixed(6)}
                </span>
              </div>
            </Popup>
          </Circle>
        ))}

        {/* Marcadores dos pacientes */}
        {patients.map((patient) => {
          const clusterColor = getPatientClusterColor(patient.id);
          return (
            <Marker
              key={patient.id}
              position={[patient.latitude, patient.longitude]}
              icon={createClusterIcon(patient.is_outlier, clusterColor)}
              eventHandlers={{
                click: () => {
                  if (onPatientClick) {
                    onPatientClick(patient.id);
                  }
                },
              }}
            >
              <Popup>
                <div>
                  <strong>{patient.nome}</strong>
                  <br />
                  <span
                    style={{
                      color: patient.is_outlier ? "#d32f2f" : "#4caf50",
                      fontWeight: "bold",
                    }}
                  >
                    Status: {patient.status_saude}
                  </span>
                  {showClusters && clusterColor && (
                    <>
                      <br />
                      <span style={{ fontSize: '0.85rem', color: '#666' }}>
                        Microrregião: {clusters.findIndex(c => c.color === clusterColor) + 1}
                      </span>
                    </>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </MapWrapper>
  );
};

export default PatientMap;
