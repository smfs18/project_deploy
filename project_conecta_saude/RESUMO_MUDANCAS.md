# 📝 Resumo das Implementações - Sistema de Retreinamento

## ✅ Mudanças Implementadas

### 1. **Model-LLM (Serviço de ML)**

#### 📄 Arquivos Modificados:
- ✅ `model-LLM/app/schemas.py` - Atualizado com 28 features
- ✅ `model-LLM/app/model.py` - Adicionado retorno de confiança
- ✅ `model-LLM/app/main.py` - Endpoint retorna confidence e needs_confirmation

#### 🆕 Arquivos Criados:
- ✅ `model-LLM/retrain_model.py` - Script de retreinamento
- ✅ `model-LLM/scheduler_retrain.py` - Scheduler automático

#### 📊 Novas Features:
```python
{
  "is_outlier": bool,
  "confidence": float,  # 0.0 a 1.0
  "needs_confirmation": bool  # true quando confidence < 0.7
}
```

---

### 2. **Backend (FastAPI)**

#### 📄 Arquivos Modificados:
- ✅ `back/backend/app/models/paciente_models.py`
  - Adicionados novos campos demográficos e socioeconômicos
  - Criado modelo `RetrainingData` para armazenar confirmações
  
- ✅ `back/backend/app/schemas/paciente_schema.py`
  - Atualizado `PacienteBase` com 28 campos
  - Criado `ProfessionalConfirmation` schema
  
- ✅ `back/backend/app/services/paciente_service.py`
  - Função `_prepare_ml_features()` com todas as 28 features
  - Função `confirm_patient_classification()` para registrar confirmações
  - Função `get_retraining_stats()` para estatísticas
  
- ✅ `back/backend/app/api/api_v1/endpoints/pacientes_api.py`
  - Novo endpoint `POST /pacientes/{id}/confirm`
  - Novo endpoint `GET /pacientes/retraining/stats`

#### 🆕 Arquivos Criados:
- ✅ `back/backend/migrations/add_retraining_features.sql` - Migration SQL

---

### 3. **Frontend (React/TypeScript)**

#### 🆕 Arquivos Criados:
- ✅ `frontend/src/components/ProfessionalConfirmationDialog.tsx`
  - Diálogo para confirmação profissional
  - Mostra confiança do modelo
  - Permite observações do profissional

---

### 4. **Documentação**

#### 🆕 Arquivos Criados:
- ✅ `SISTEMA_RETREINAMENTO.md` - Documentação completa do sistema

---

## 🔧 Próximos Passos para Implementação

### 1. **Atualizar Frontend (NECESSÁRIO)**

Você precisa integrar o diálogo de confirmação nos seguintes lugares:

#### a) No `PatientDetails.tsx`:
```typescript
import ProfessionalConfirmationDialog from './ProfessionalConfirmationDialog';

// Adicionar estado
const [showConfirmation, setShowConfirmation] = useState(false);

// Verificar se precisa confirmação ao carregar paciente
useEffect(() => {
  if (patient?.needs_confirmation && !patient?.professional_confirmed) {
    setShowConfirmation(true);
  }
}, [patient]);

// Adicionar componente
<ProfessionalConfirmationDialog
  open={showConfirmation}
  onClose={() => setShowConfirmation(false)}
  onConfirm={(isOutlier, notes) => confirmClassification(patient.id, isOutlier, notes)}
  patientName={patient.nome}
  predictedOutlier={patient.is_outlier}
  confidence={patient.confidence}
/>
```

#### b) Criar função de confirmação no `api.ts`:
```typescript
export const confirmPatientClassification = async (
  patientId: number,
  isOutlierConfirmed: boolean,
  professionalNotes?: string
): Promise<Paciente> => {
  const response = await api.post(
    `/pacientes/${patientId}/confirm?is_outlier_confirmed=${isOutlierConfirmed}` +
    (professionalNotes ? `&professional_notes=${encodeURIComponent(professionalNotes)}` : '')
  );
  return response.data;
};
```

#### c) Atualizar interface `Paciente` no frontend:
```typescript
interface Paciente {
  // ... campos existentes
  confidence?: number;
  needs_confirmation?: boolean;
  professional_confirmed?: boolean;
  professional_notes?: string;
}
```

### 2. **Executar Migração do Banco (OBRIGATÓRIO)**

```bash
cd back/backend
psql -U seu_usuario -d conecta_saude -f migrations/add_retraining_features.sql
```

Ou via Docker:
```bash
docker exec -i postgres_container psql -U usuario -d conecta_saude < migrations/add_retraining_features.sql
```

### 3. **Atualizar Requirements do Model-LLM**

Adicionar ao `model-LLM/requirements.txt`:
```
schedule==1.1.0
sqlalchemy==2.0.0
psycopg2-binary==2.9.9
scikit-learn==1.3.0
```

### 4. **Configurar Scheduler (RECOMENDADO)**

#### Opção A - Rodar manualmente:
```bash
cd model-LLM
python scheduler_retrain.py --db-url "postgresql://user:pass@localhost:5432/conecta_saude"
```

#### Opção B - Via Docker Compose:
Adicionar ao `docker-compose.yml`:
```yaml
retraining-scheduler:
  build: ./model-LLM
  command: python scheduler_retrain.py --db-url "${DATABASE_URL}"
  environment:
    - DATABASE_URL=${DATABASE_URL}
  depends_on:
    - db
  restart: unless-stopped
```

#### Opção C - Via Crontab:
```bash
# Adicionar ao crontab
crontab -e

# Verificar a cada 6 horas
0 */6 * * * cd /path/to/model-LLM && python retrain_model.py --db-url "$DB_URL"

# Retreinamento semanal (domingo 2h)
0 2 * * 0 cd /path/to/model-LLM && python retrain_model.py --db-url "$DB_URL" --force
```

### 5. **Reiniciar Serviços**

```bash
# Reiniciar backend
docker-compose restart backend

# Reiniciar modelo ML
docker-compose restart model-llm
```

---

## 🎯 Fluxo Completo de Uso

### Cenário 1: Alta Confiança (≥ 70%)
1. Paciente é cadastrado
2. Modelo classifica com 85% de confiança
3. `needs_confirmation = false`
4. Resultado é aceito automaticamente
5. Frontend mostra resultado normalmente

### Cenário 2: Baixa Confiança (< 70%)
1. Paciente é cadastrado
2. Modelo classifica com 65% de confiança
3. `needs_confirmation = true`
4. Frontend exibe diálogo de confirmação
5. Profissional confirma a classificação
6. Dados são salvos em `retraining_data`
7. Quando atingir 50 confirmações OU 1 semana:
   - Modelo é retreinado automaticamente
   - Backup do modelo antigo é criado
   - Novo modelo substitui o anterior

---

## 📊 Monitoramento

### Ver estatísticas de retreinamento:
```bash
curl -X GET http://localhost:8000/api/v1/pacientes/retraining/stats \
  -H "Authorization: Bearer $TOKEN"
```

Resposta:
```json
{
  "pending_confirmations": 35,
  "used_for_retraining": 150,
  "ready_for_retraining": false
}
```

### Verificar modelo carregado:
```bash
curl http://localhost:8001/
```

---

## 🐛 Testes

### 1. Testar Classificação com Confiança:
```bash
curl -X POST http://localhost:8001/classify \
  -H "Content-Type: application/json" \
  -d '{
    "idade": 45,
    "sexo": "Masculino",
    "raca_cor": "Parda",
    ... (todas as 28 features)
  }'
```

### 2. Testar Confirmação:
```bash
curl -X POST http://localhost:8000/api/v1/pacientes/1/confirm \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "is_outlier_confirmed": true,
    "professional_notes": "Paciente apresenta sintomas adicionais"
  }'
```

### 3. Testar Retreinamento Manual:
```bash
cd model-LLM
python retrain_model.py --db-url "postgresql://user:pass@localhost:5432/conecta_saude" --force
```

---

## ⚠️ Avisos Importantes

1. **Backup Automático**: Todo retreinamento cria backup em `models/backups/`
2. **Dados Sensíveis**: `features_json` contém dados de saúde - proteja adequadamente
3. **Validação**: Após retreinamento, valide o modelo antes de usar em produção
4. **Monitoramento**: Acompanhe métricas de performance após cada retreinamento

---

## 📞 Checklist de Implementação

- [ ] Executar migração SQL no banco de dados
- [ ] Atualizar requirements do model-LLM
- [ ] Reiniciar serviço model-LLM
- [ ] Reiniciar backend
- [ ] Integrar `ProfessionalConfirmationDialog` no frontend
- [ ] Atualizar interface `Paciente` no frontend
- [ ] Adicionar função `confirmPatientClassification` na API
- [ ] Configurar scheduler de retreinamento
- [ ] Testar fluxo completo (cadastro → classificação → confirmação)
- [ ] Testar retreinamento manual
- [ ] Configurar monitoramento de métricas
- [ ] Documentar procedimentos para equipe

---

## 📚 Referências

- **Documentação Completa**: `SISTEMA_RETREINAMENTO.md`
- **Migração SQL**: `back/backend/migrations/add_retraining_features.sql`
- **Script de Retreinamento**: `model-LLM/retrain_model.py`
- **Scheduler**: `model-LLM/scheduler_retrain.py`
- **Componente Frontend**: `frontend/src/components/ProfessionalConfirmationDialog.tsx`

---

**Data**: 28/11/2025  
**Versão**: 2.0  
**Status**: ✅ Implementado (Pendente integração frontend)
