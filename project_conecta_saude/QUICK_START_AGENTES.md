# 🚀 QUICK START - Gerenciamento de Agentes

Guia rápido para começar a usar a nova funcionalidade de agentes de saúde.

## ⚡ 5 Minutos para Começar

### 1️⃣ Backend - Criar as Tabelas

```bash
# Entre na pasta do backend
cd back/backend

# Ative o ambiente virtual (se não estiver ativado)
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

# Execute a migração para criar as tabelas
python -c "from app.db.base import Base; from app.db.session import engine; from app.models.agente_models import AgenteHealthcare, AtribuicaoPaciente; Base.metadata.create_all(bind=engine); print('✅ Tabelas criadas com sucesso!')"
```

### 2️⃣ Verificar se Backend Está Rodando

```bash
# Acesse http://localhost:8082 no navegador
# Você deve ver a resposta da API
curl http://localhost:8082
```

### 3️⃣ Verificar se Frontend Está Rodando

```bash
# Em outra aba do terminal
cd frontend

# Se não instalou dependências ainda
npm install

# Rodar o frontend
npm run dev

# Acesse http://localhost:5173
```

### 4️⃣ Login na Plataforma

1. Vá para http://localhost:5173/login
2. Faça login com suas credenciais
3. Você será redirecionado para o Dashboard

### 5️⃣ Acessar Agentes

1. Na barra de navegação/menu, procure por "Agentes" ou acesse diretamente:
   http://localhost:5173/agentes
2. Clique em "Novo Agente"
3. Preencha os dados e salve

## 📋 Primeiro Teste Rápido

### Criar um Agente

```json
{
  "nome": "Maria da Silva",
  "email": "maria@ubs.com",
  "cpf": "12345678901",
  "tipo_profissional": "ACS",
  "telefone": "(11) 98765-4321",
  "ubs_nome": "UBS Centro"
}
```

### Atribuir um Paciente

1. Com agente criado, clique para expandir a linha
2. Clique em "Atribuir Paciente"
3. Selecione qualquer paciente existente
4. Opcionalmente adicione notas
5. Clique "Atribuir"

### Enviar para App

1. Com o paciente atribuído, clique "Enviar App"
2. Você verá a resposta JSON com os dados preparados

## 🛠️ Troubleshooting Rápido

### "Erro de conexão com backend"
```bash
# Verificar se backend está rodando
curl http://localhost:8082

# Se não estiver, entre na pasta e rode:
cd back/backend
python -m uvicorn app.main:app --reload --port 8082
```

### "Tabelas não encontradas"
```bash
# Rodar a criação de tabelas novamente
cd back/backend
python -c "from app.db.base import Base; from app.db.session import engine; from app.models.agente_models import AgenteHealthcare, AtribuicaoPaciente; Base.metadata.create_all(bind=engine)"
```

### "Token inválido"
```bash
# Fazer login novamente em /login
# O token será armazenado automaticamente
```

### "Não consigo atribuir paciente"
```bash
# Verificar se existem pacientes cadastrados
# Acessar /dashboard e criar alguns pacientes primeiro
```

## 📚 Recursos Disponíveis

| Arquivo | Descrição |
|---------|-----------|
| `SUMARIO_AGENTES.md` | Resumo da implementação |
| `IMPLEMENTACAO_AGENTES.md` | Documentação completa |
| `GUIA_AGENTES_APP.md` | Integração com App |
| `TESTE_API_AGENTES.sh` | Testes da API |
| `CHECKLIST_AGENTES.md` | Checklist de implementação |

## 🔌 Testar API Diretamente

### Com cURL

```bash
# Obter token
TOKEN=$(curl -s -X POST http://localhost:8082/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"seu@email.com","password":"senha"}' | jq -r '.access_token')

# Criar agente
curl -X POST http://localhost:8082/api/v1/agentes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Teste",
    "email": "teste@ubs.com",
    "cpf": "12345678901",
    "tipo_profissional": "ACS"
  }'

# Listar agentes
curl -X GET http://localhost:8082/api/v1/agentes \
  -H "Authorization: Bearer $TOKEN"
```

### Com Postman/Insomnia

1. Criar coleção "Agentes"
2. Importar os endpoints em `TESTE_API_AGENTES.sh`
3. Configurar token no header
4. Fazer requisições

## 🎓 Fluxo Completo para Aprender

1. **Leia** o `SUMARIO_AGENTES.md` (2 min)
2. **Execute** as 5 primeiras etapas acima (2 min)
3. **Crie** um agente via interface (1 min)
4. **Atribua** um paciente (1 min)
5. **Leia** a documentação completa `IMPLEMENTACAO_AGENTES.md` (5 min)

## ⚙️ Configurações Importantes

### URL da API
```typescript
// frontend/src/services/api.ts
const API_BASE = "http://localhost:8082";
```

### CORS (Backend)
```python
# back/backend/app/main.py
origins = [
    "http://localhost:3000",
    "http://localhost:5173",  # Vite
]
```

### Porta do Backend
```bash
# Por padrão roda em 8082
# Para mudar:
python -m uvicorn app.main:app --port 8000
```

## 🚨 Verificação de Status

```bash
# Backend funcionando?
curl http://localhost:8082

# Frontend funcionando?
curl http://localhost:5173

# Banco de dados conectado?
# Verificar em back/backend/app/db/session.py

# Tabelas criadas?
# Acessar /agentes no frontend deve mostrar a página
```

## 📞 Próximos Passos

1. ✅ Tabelas criadas
2. ✅ Backend rodando
3. ✅ Frontend rodando
4. ✅ Primeiro agente criado
5. → Agora explore:
   - Criar mais agentes
   - Atribuir vários pacientes
   - Editar e deletar
   - Testar API via script
   - Ler documentação completa

## 🎉 Sucesso!

Se conseguiu chegar aqui, tudo está funcionando! 🎊

Próximos passos:
- Ler `IMPLEMENTACAO_AGENTES.md` para entender melhor
- Rodar `TESTE_API_AGENTES.sh` para testar todos os endpoints
- Preparar integração com o App (ver `GUIA_AGENTES_APP.md`)

---

**Dúvidas?** Consulte a documentação completa em `IMPLEMENTACAO_AGENTES.md`

**Quer testar a API?** Execute `bash TESTE_API_AGENTES.sh` com token válido

**Pronto para produção?** Consulte `CHECKLIST_AGENTES.md`
