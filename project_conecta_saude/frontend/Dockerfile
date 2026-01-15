# ============================================================================
# FRONTEND - React/Vite otimizado para produção com multi-stage build
# ============================================================================

# STAGE 1: Builder (Build do React)
FROM node:18-alpine as builder

WORKDIR /app
ARG VITE_API_URL
ARG VITE_WHATSAPP_AGENT_URL
ARG VITE_AUDIO_AGENT_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WHATSAPP_AGENT_URL=$VITE_WHATSAPP_AGENT_URL
ENV VITE_AUDIO_AGENT_URL=$VITE_AUDIO_AGENT_URL
# Copiar package files
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./

# Instalar dependências
RUN npm ci --prefer-offline --no-audit

# Copiar código-fonte
COPY src ./src
#COPY public ./public
COPY index.html ./

# Build da aplicação
RUN npm run build

# STAGE 2: Runtime (servir com Nginx)
FROM nginx:alpine

# Remover config padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiar configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar build do stage anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
