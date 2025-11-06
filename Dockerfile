FROM node:22-alpine

# Installer pnpm globalement
RUN npm install -g pnpm

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers package.json et pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Installer les dépendances avec un fichier de verrouillage gelé
RUN pnpm install

# Copier tout le reste des fichiers
COPY . .

# Construire l'application (mode production)
RUN pnpm run build

# Exposer le port de l'application
EXPOSE 3000

# Commande pour démarrer l'application en mode preview
CMD ["pnpm", "run", "serve", "--port", "3000", "--host"]