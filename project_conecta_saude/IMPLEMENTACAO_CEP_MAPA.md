# Implementação de CEP e Mapa de Pacientes

## Resumo da Implementação

Esta implementação adiciona funcionalidade completa de CEP com geocodificação e visualização de pacientes em mapa interativo.

## Arquitetura

```
User(Usuário) -->|Digita CEP| React[Front: React Form]
React -->|JSON| API[Back: Python API]
API -->|GET CEP| BrasilAPI[BrasilAPI V2]
BrasilAPI -->|Endereço| API
API -->|Geocode| Nominatim[Nominatim OSM]
Nominatim -->|Lat/Long| API
API -->|Dados Clínicos| ML[Modelo ML .pkl]
ML -->|Crítico/Estável| API
API -->|INSERT| DB[(Banco SQL)]

User -->|Vê Mapa| ReactMap[Front: React Map]
ReactMap -->|GET /mapa| API
API -->|SELECT| DB
DB -->|Lista Pacientes| API
API -->|JSON com Coords| ReactMap
```

## Mudanças Implementadas

### 1. Backend (Python/FastAPI)

#### Modelo de Dados (`back/backend/app/models/paciente_models.py`)
- ✅ Adicionado campo `cep` (String)
- ✅ Adicionado campo `latitude` (Float)
- ✅ Adicionado campo `longitude` (Float)

#### Schema Pydantic (`back/backend/app/schemas/paciente_schema.py`)
- ✅ Adicionado `cep` em `PacienteBase`
- ✅ Adicionado `latitude` e `longitude` em `Paciente`

#### Serviço de Geocodificação (`back/backend/app/services/geocoding_service.py`)
- ✅ **Novo arquivo** com classe `GeocodingService`
- ✅ Integração com BrasilAPI v2 para buscar endereço por CEP
- ✅ Fallback para Nominatim (OpenStreetMap) para obter coordenadas
- ✅ Tratamento de erros e timeouts

#### Serviço de Pacientes (`back/backend/app/services/paciente_service.py`)
- ✅ Integração com `GeocodingService` em `create_paciente_with_orchestration`
- ✅ Geocodificação automática ao criar paciente
- ✅ Atualização de coordenadas ao editar paciente

#### CRUD (`back/backend/app/crud/crud_paciente.py`)
- ✅ Nova função `get_all_with_coordinates()` para buscar pacientes com localização

#### API Endpoints (`back/backend/app/api/api_v1/endpoints/pacientes_api.py`)
- ✅ **Nova rota** `GET /api/v1/pacientes/cep/{cep}` - Busca endereço por CEP
- ✅ **Nova rota** `GET /api/v1/pacientes/mapa/pacientes` - Lista pacientes para mapa
- ✅ Retorna coordenadas e status de saúde

#### Migração de Banco de Dados
- ✅ Script SQL criado em `back/backend/migrations/add_cep_coordinates.sql`
- ✅ Adicionadas colunas `cep`, `latitude`, `longitude` na tabela `pacientes`

### 2. Frontend (React/TypeScript)

#### API Service (`frontend/src/services/api.ts`)
- ✅ Adicionado `cep` em `PacienteFormData`
- ✅ Adicionado `cep`, `latitude`, `longitude` em `PacienteOut`
- ✅ Nova função `getAddressFromCep()` - Busca CEP
- ✅ Nova interface `CepData`
- ✅ Nova interface `PacienteMapa`
- ✅ Nova função `getPacientesMapa()` - Lista pacientes para mapa

#### Formulário de Paciente (`frontend/src/components/PatientFormModal.tsx`)
- ✅ Adicionado campo de CEP com máscara
- ✅ Busca automática de endereço ao sair do campo (onBlur)
- ✅ Loading indicator durante busca
- ✅ Preenchimento automático do endereço

#### Componente de Mapa (`frontend/src/components/PatientMap.tsx`)
- ✅ **Novo arquivo** com mapa interativo usando Leaflet
- ✅ Marcadores personalizados (vermelho para crítico, verde para estável)
- ✅ Popup com informações do paciente
- ✅ Click no marcador para ver detalhes
- ✅ Centralização automática baseada nas coordenadas

#### Dashboard (`frontend/src/pages/Dashboard/Dashboard.tsx`)
- ✅ Importado componente `PatientMap`
- ✅ Adicionado botão "Ver Mapa" na toolbar
- ✅ Toggle para mostrar/ocultar mapa
- ✅ Integração do mapa acima da tabela

#### Estilos (`frontend/src/pages/Dashboard/styles.ts`)
- ✅ Novo estilo `MapButton` com gradiente verde
- ✅ Icone de mapa (MdMap)

#### Dependências
- ✅ Instalado `leaflet` ^1.9.4
- ✅ Instalado `react-leaflet` ^4.2.1
- ✅ Instalado `@types/leaflet`

## Fluxo de Dados

### Cadastro de Paciente com CEP

1. Usuário preenche o formulário e digita o CEP
2. Ao sair do campo CEP (`onBlur`):
   - Frontend chama `GET /api/v1/pacientes/cep/{cep}`
   - Backend chama BrasilAPI v2
   - Endereço é preenchido automaticamente
3. Usuário clica em "Salvar"
4. Frontend envia POST com todos os dados incluindo CEP
5. Backend:
   - Chama `GeocodingService.get_coordinates_from_cep()`
   - BrasilAPI retorna endereço
   - Nominatim geocodifica e retorna lat/long
   - Salva paciente no banco com coordenadas
   - Executa modelo ML para classificação
   - Executa LLM se crítico
   - Retorna paciente completo

### Visualização do Mapa

1. Usuário clica no botão "Ver Mapa"
2. Frontend chama `GET /api/v1/pacientes/mapa/pacientes`
3. Backend:
   - Busca pacientes com `latitude IS NOT NULL` e `longitude IS NOT NULL`
   - Retorna lista com id, nome, lat, long, status_saude
4. Frontend renderiza mapa com Leaflet:
   - Cria marcador vermelho para pacientes críticos
   - Cria marcador verde para pacientes estáveis
   - Centraliza mapa na média das coordenadas
5. Usuário pode clicar nos marcadores para ver detalhes

## APIs Utilizadas

### BrasilAPI v2
- **URL**: `https://brasilapi.com.br/api/cep/v2/{cep}`
- **Função**: Buscar endereço completo por CEP
- **Resposta**:
  ```json
  {
    "cep": "01310100",
    "state": "SP",
    "city": "São Paulo",
    "neighborhood": "Bela Vista",
    "street": "Avenida Paulista"
  }
  ```

### Nominatim (OpenStreetMap)
- **URL**: `https://nominatim.openstreetmap.org/search`
- **Função**: Geocodificar endereço para lat/long (fallback)
- **Resposta**:
  ```json
  [{
    "lat": "-23.5614",
    "lon": "-46.6558"
  }]
  ```

## Testes

### Testar Geocodificação
```bash
# Testar BrasilAPI
curl "https://brasilapi.com.br/api/cep/v2/01310100"

# Testar endpoint do backend
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8082/api/v1/pacientes/cep/01310100"
```

### Testar Mapa
```bash
# Listar pacientes com coordenadas
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8082/api/v1/pacientes/mapa/pacientes"
```

## Próximos Passos (Opcional)

1. **Adicionar filtros no mapa**:
   - Filtrar por status (crítico/estável)
   - Filtrar por região

2. **Melhorar visualização**:
   - Clustering de marcadores próximos
   - Heatmap de criticidade

3. **Adicionar análise geográfica**:
   - Identificar regiões com mais pacientes críticos
   - Otimização de rotas para visitas

4. **Exportar dados**:
   - Exportar lista de pacientes com coordenadas
   - Gerar relatórios geográficos

## Observações Importantes

- ✅ Todas as migrações de banco foram aplicadas
- ✅ CEP é opcional - sistema funciona sem ele
- ✅ Coordenadas são calculadas automaticamente quando CEP é fornecido
- ✅ Mapa só mostra pacientes que possuem coordenadas
- ✅ Fallback para Nominatim garante geocodificação mesmo se BrasilAPI falhar
- ✅ Frontend já está configurado e testado
- ⚠️ Nominatim tem rate limit - considerar cache em produção
