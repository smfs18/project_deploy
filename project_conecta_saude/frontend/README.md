## Conecta+Saúde 

Projeto desenvolvido para a disciplina **IF1006** inspirado no hackathon *Conecta Recife*, mas com foco em **IA aplicada a negócios**.  
Nosso objetivo é simular um sistema de apoio à Secretaria de Saúde para acompanhamento de pacientes com diabetes e/ou hipertensão.

---

## 🚀 Arquitetura

- **Frontend**: React + TypeScript + Vite + Tailwind + shadcn/ui  
- **Backend**:  
- **IA**:
  - Modelo de classificação (paciente `normal` ou `outlier`)  
  - Planejamento logístico gerado por LLM 

---

## 📂 Repositórios
/frontend → interface web
/backend → API 
/model-LLM → modelo IA


---

## 🔑 Fluxo principal

1. Secretaria cadastra paciente.  
2. Backend (ML simulado) classifica como **normal/outlier**.  
3. Backend chama módulo de IA (LLM simulado) para propor plano de cuidados para pacientes com necessidade.  
4. Secretaria revisa/edita/valida o plano.  
5. Sistema gera encaminhamentos (consultas, exames, farmácia).  

---

## 📦 Tecnologias principais

- Frontend: React, TypeScript, React Query, Zustand  
- Backend:
- Infra: Vercel (front)
- Qualidade: ESLint, Prettier, Jest  

---

## 🛠️ Como rodar

### Frontend
```bash
npm install
npm run dev
```

### Backend
