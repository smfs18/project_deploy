# Sistema de Retreinamento do Modelo - Conecta+Saúde

## 📋 Visão Geral

Este documento descreve o novo sistema de retreinamento automático do modelo de detecção de outliers, implementado para melhorar continuamente a precisão do modelo com base no feedback dos profissionais de saúde.

## 🎯 Objetivos

1. **Limiar de Confiança**: O modelo agora retorna um grau de confiança (0.0 a 1.0) para cada predição
2. **Confirmação Profissional**: Quando a confiança é baixa (< 70%), o sistema solicita confirmação do profissional
3. **Retreinamento Automático**: Os dados confirmados são usados para retreinar o modelo automaticamente

## 🏗️ Arquitetura

### Novas Features do Modelo (28 no total)

O modelo foi retreinado com as seguintes features:

**Demográficas (6):**
- idade, sexo, raca_cor, situacao_conjugal, situacao_ocupacional, zona_moradia

**Socioeconômicas (5):**
- seguranca_alimentar, escolaridade, renda_familiar_sm, plano_saude, arranjo_domiciliar

**Hábitos de Vida (5):**
- atividade_fisica, consumo_alcool, tabagismo_atual, qualidade_dieta, qualidade_sono

**Psicossociais (2):**
- nivel_estresse, suporte_social

**Histórico e Acesso (4):**
- historico_familiar_dc, acesso_servico_saude, aderencia_medicamento, consultas_ultimo_ano

**Medições Clínicas (6):**
- imc, pressao_sistolica_mmHg, pressao_diastolica_mmHg, glicemia_jejum_mg_dl, colesterol_total_mg_dl, hdl_mg_dl, triglicerides_mg_dl

## 🔄 Fluxo de Funcionamento

### 1. Classificação com Confiança

```python
# Resposta do modelo (model-LLM/classify)
{
  "is_outlier": true,
  "confidence": 0.65,  # 65% de confiança
  "needs_confirmation": true  # Abaixo do limiar de 70%
}
```

### 2. Interface do Frontend

Quando `needs_confirmation = true`, o frontend deve exibir:

```typescript
// Exemplo de implementação
if (patient.needs_confirmation) {
  showConfirmationDialog({
    message: `O modelo classificou este paciente como ${patient.is_outlier ? 'OUTLIER' : 'NORMAL'} 
              com ${patient.confidence * 100}% de confiança. 
              Por favor, confirme a classificação.`,
    confidence: patient.confidence,
    onConfirm: (isOutlier: boolean, notes?: string) => {
      confirmClassification(patient.id, isOutlier, notes);
    }
  });
}
```

### 3. Endpoint de Confirmação

```bash
POST /api/v1/pacientes/{id}/confirm
Content-Type: application/json

{
  "is_outlier_confirmed": true,  # Confirmação do profissional
  "professional_notes": "Paciente apresenta sintomas adicionais..."
}
```

### 4. Armazenamento para Retreinamento

Os dados confirmados são armazenados na tabela `retraining_data`:

```sql
SELECT * FROM retraining_data WHERE used_for_retraining = FALSE;
```

## 🤖 Retreinamento Automático

### Condições de Retreinamento

O modelo é retreinado automaticamente quando:
- ✅ **50 ou mais** pacientes confirmados estão pendentes
- ✅ **Semanalmente** (todo domingo às 02:00), independente da quantidade

### Métodos de Retreinamento

#### 1. Manual

```bash
cd model-LLM
python retrain_model.py --db-url "postgresql://user:pass@localhost:5432/conecta_saude"
```

#### 2. Scheduler Automático (Recomendado)

```bash
cd model-LLM
python scheduler_retrain.py --db-url "postgresql://user:pass@localhost:5432/conecta_saude"
```

O scheduler executa:
- Verificação a cada 6 horas se há 50+ confirmações
- Retreinamento semanal forçado (domingo 02:00)

#### 3. Via Cron (Produção)

```bash
# Adicionar ao crontab
0 */6 * * * cd /path/to/model-LLM && python retrain_model.py --db-url "$DB_URL"
0 2 * * 0 cd /path/to/model-LLM && python retrain_model.py --db-url "$DB_URL" --force
```

## 📊 Monitoramento

### Endpoint de Estatísticas

```bash
GET /api/v1/pacientes/retraining/stats

Response:
{
  "pending_confirmations": 35,
  "used_for_retraining": 150,
  "ready_for_retraining": false  # true quando >= 50
}
```

### Logs do Modelo

O retreinamento gera logs detalhados:

```
=== Resultados no Conjunto de Teste ===
              precision    recall  f1-score   support

       Normal       0.92      0.95      0.93       150
      Outlier       0.88      0.82      0.85        50

     accuracy                           0.91       200
```

## 🔧 Configuração

### 1. Migração do Banco de Dados

```bash
cd back/backend
psql -U user -d conecta_saude -f migrations/add_retraining_features.sql
```

### 2. Atualizar Variáveis de Ambiente

```bash
# .env do backend
DATABASE_URL=postgresql://user:pass@localhost:5432/conecta_saude

# .env do model-LLM
CONFIDENCE_THRESHOLD=0.7  # Limiar de confiança (padrão: 70%)
MODEL_PATH=/app/models/modelo_outliers_v1.pkl
```

### 3. Instalar Dependências

```bash
# model-LLM
cd model-LLM
pip install -r requirements.txt

# Adicionar ao requirements.txt:
# schedule==1.1.0
# sqlalchemy==2.0.0
# scikit-learn==1.3.0
```

## 📁 Estrutura de Arquivos

```
model-LLM/
├── app/
│   ├── main.py              # API FastAPI atualizada
│   ├── model.py             # Modelo com confiança
│   └── schemas.py           # Schemas atualizados
├── models/
│   ├── modelo_outliers_v1.pkl   # Modelo atual
│   └── backups/                 # Backups automáticos
│       └── modelo_outliers_backup_20250120_140500.pkl
├── retrain_model.py         # Script de retreinamento
└── scheduler_retrain.py     # Scheduler automático

back/backend/
├── app/
│   ├── models/
│   │   └── paciente_models.py   # Novos campos + RetrainingData
│   ├── schemas/
│   │   └── paciente_schema.py   # ProfessionalConfirmation
│   ├── services/
│   │   └── paciente_service.py  # Lógica de confirmação
│   └── api/
│       └── endpoints/
│           └── pacientes_api.py # Novos endpoints
└── migrations/
    └── add_retraining_features.sql
```

## 🚀 Passo a Passo para Deploy

### 1. Backend

```bash
# Aplicar migração
psql -U user -d conecta_saude -f migrations/add_retraining_features.sql

# Reiniciar backend
docker-compose restart backend
```

### 2. Modelo ML

```bash
# Reiniciar serviço do modelo
docker-compose restart model-llm
```

### 3. Scheduler (Opcional mas Recomendado)

```bash
# Iniciar scheduler em background
cd model-LLM
nohup python scheduler_retrain.py --db-url "$DATABASE_URL" > retrain.log 2>&1 &
```

Ou via Docker:

```yaml
# docker-compose.yml
retraining-scheduler:
  build: ./model-LLM
  command: python scheduler_retrain.py --db-url "postgresql://user:pass@db:5432/conecta_saude"
  depends_on:
    - db
  restart: unless-stopped
```

## 📈 Métricas e KPIs

### Métricas de Modelo

- **Precision**: Proporção de predições corretas entre todas as predições positivas
- **Recall**: Proporção de outliers reais que foram identificados
- **F1-Score**: Média harmônica entre precision e recall
- **Confidence**: Grau de certeza do modelo (0.0 a 1.0)

### KPIs de Retreinamento

- Taxa de confirmação: `confirmações / predições_com_baixa_confiança`
- Taxa de concordância: `confirmações_corretas / total_confirmações`
- Frequência de retreinamento: Ideal semanalmente
- Melhoria de performance: Comparar métricas antes/depois

## ⚠️ Avisos Importantes

1. **Backup Automático**: Cada retreinamento cria backup do modelo anterior
2. **Validação**: Sempre valide o novo modelo antes de usar em produção
3. **Monitoramento**: Acompanhe as métricas após cada retreinamento
4. **Dados Sensíveis**: Os dados de retreinamento contêm informações de saúde - garanta segurança

## 🐛 Troubleshooting

### Modelo não carrega confiança

Verifique se o modelo foi retreinado com a versão nova:

```python
from joblib import load
model_data = load('models/modelo_outliers_v1.pkl')
print(model_data.get('version'))  # Deve ser '2.0'
```

### Retreinamento falha

Verifique logs e confirme que há dados suficientes:

```sql
SELECT COUNT(*) FROM retraining_data WHERE used_for_retraining = FALSE;
```

### Confirmações não aparecem no frontend

Verifique se o campo `needs_confirmation` está sendo retornado:

```bash
curl -X GET http://localhost:8000/api/v1/pacientes/1 \
  -H "Authorization: Bearer $TOKEN"
```

## 📞 Suporte

Para dúvidas ou problemas, consulte:
- Documentação técnica em `/docs`
- Issues no GitHub
- Equipe de desenvolvimento

---

**Versão**: 2.0  
**Data**: 28/11/2025  
**Autor**: Equipe Conecta+Saúde
