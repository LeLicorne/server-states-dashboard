# Base stage - Common dependencies and setup
FROM node:22-alpine AS base

# Installer pnpm globalement
RUN npm install -g pnpm

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers package.json et pnpm-lock.yaml
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Installer les dépendances avec un fichier de verrouillage gelé
RUN pnpm install --frozen-lockfile

# Déclarer les build args (valeurs injectées au build, requis par Vite)
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ARG VITE_FIREBASE_MEASUREMENT_ID
ARG VITE_ZABBIX_API_URL
ARG VITE_ZABBIX_API_TOKEN
ARG VITE_ZABBIX_CPU_ITEM_ID
ARG VITE_ZABBIX_MEMORY_ITEM_ID

# Les rendre disponibles comme variables d'env pour le build Vite
ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY \
    VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN \
    VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID \
    VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET \
    VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID \
    VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID \
    VITE_FIREBASE_MEASUREMENT_ID=$VITE_FIREBASE_MEASUREMENT_ID \
    VITE_ZABBIX_API_URL=$VITE_ZABBIX_API_URL \
    VITE_ZABBIX_API_TOKEN=$VITE_ZABBIX_API_TOKEN \
    VITE_ZABBIX_CPU_ITEM_ID=$VITE_ZABBIX_CPU_ITEM_ID \
    VITE_ZABBIX_MEMORY_ITEM_ID=$VITE_ZABBIX_MEMORY_ITEM_ID

# Development stage
COPY . .
RUN pnpm run build

EXPOSE 3000
CMD ["pnpm", "run", "serve", "--port", "3000", "--host"]