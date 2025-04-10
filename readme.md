# Moviie Booker


## Présentation du projet

MovieBooker est une application de réservation de billets de cinéma développée dans le cadre d'un projet scolaire à l'EFREI. Cette application comprend un frontend et un backend, et permet aux utilisateurs de parcourir les films disponibles et de réserver des billets.

L'application est déployée sur Render et accessible aux adresses suivantes :
- **Frontend** : https://moviie-booker-frontend.onrender.com
- **API Backend** : https://moviie-booker-glep.onrender.com/

## Configuration des variables d'environnement

### Backend (.env)

Créez un fichier `.env` à la racine du projet backend avec les variables suivantes :

```
# Configuration du serveur
PORT=3000

# Configuration de la base de données
DATABASE_HOST=votre_host
DATABASE_PORT=5432
DATABASE_USERNAME=votre_username
DATABASE_PASSWORD=votre_password
DATABASE_NAME=votre_database_name

# Configuration JWT
JWT_SECRET=votre_secret_jwt
JWT_EXPIRATION=24h
REFRESH_TOKEN_EXPIRATION=604800

# Configuration de l'API TMDB

TMDB_API_KEY= API_KEY
TMDB_API_URL=https://api.themoviedb.org/3
```

### Frontend (.env)

Créez un fichier `.env` à la racine du projet frontend avec les variables suivantes :

```
VITE_API_URL=http://localhost:3000 # URL de l'API
VITE_JWT_COOKIE_NAME=auth_token
```

En production, cette variable pointera vers l'URL de votre API déployée.

## Installation et démarrage du projet

### Backend (NestJS)

1. Clonez le dépôt et accédez au dossier du projet backend
```shell script
git clone https://github.com/FaresSofiane/moviie-booker.git
cd moviie-booker/backend

```
2. Installez les dépendances :
```shell script
npm install
```
3. Configurez votre fichier `.env` comme indiqué ci-dessus
4. Lancez le serveur en mode développement :
```shell script
npm run start:dev
```
5. Pour la production :
```shell script
npm run build
   npm run start:prod
```

### Frontend

1. Clonez le dépôt et accédez au dossier du projet frontend
```shell script
git clone https://github.com/FaresSofiane/moviie-booker.git
cd moviie-booker/backend 

# ou si déjà dans le dossier backend

cd ../frontend

```

2. Installez les dépendances :
```shell script
npm install
```
3. Configurez votre fichier `.env` comme indiqué ci-dessus
4. Lancez l'application en mode développement :
```shell script
npm start
```
5. Pour créer une version de production :
```shell script
npm run build
```

## Base de données

Le projet utilise PostgreSQL. Assurez-vous d'avoir créé une base de données et configuré les accès correctement dans le fichier `.env` du backend.

## Tests

### Backend
```shell script
# Tests unitaires
npm run test

```

## Déploiement

Les deux parties de l'application sont déployées sur Render :
- Frontend : https://moviie-booker-frontend.onrender.com
- API Backend : https://moviie-booker-glep.onrender.com/
-- Swagger : https://moviie-booker-glep.onrender.com/api/

## Technologies utilisées

- **Backend** : NestJS, PostgreSQL
- **Frontend** : React, Tailwindcss, Shadcn
- **Déploiement** : Render

