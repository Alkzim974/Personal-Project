# Magic Manager

Une application web inspirée de Moxfield pour la gestion de cartes Magic: The Gathering.

## Fonctionnalités

- **Authentification** : Connexion avec Google, GitHub ou email/mot de passe
- **Gestion de collection** : Ajout et gestion de cartes Magic
- **Création de decks** : Création et analyse de decks
- **Interface moderne** : Design inspiré de Shadcn/ui
- **API Scryfall** : Intégration avec l'API officielle Magic: The Gathering

## Technologies utilisées

- **Frontend** : Next.js 14, React, TypeScript
- **Styling** : Tailwind CSS, Shadcn/ui
- **Base de données** : SQLite avec Prisma ORM
- **Authentification** : NextAuth.js
- **API** : Scryfall API

## Installation

1. Cloner le repository
2. Installer les dépendances : `npm install`
3. Configurer les variables d'environnement (voir `.env.example`)
4. Générer le client Prisma : `npx prisma generate`
5. Pousser le schéma de base de données : `npx prisma db push`
6. Lancer le serveur de développement : `npm run dev`

## Structure du projet

```
Magic-manager/
├── src/
│   ├── app/                 # Pages et API routes Next.js
│   ├── components/          # Composants React
│   ├── lib/                 # Services et utilitaires
│   └── types/               # Types TypeScript
├── prisma/                  # Schéma de base de données
├── public/                  # Fichiers statiques
└── package.json
```

## Variables d'environnement

Copier `.env.example` vers `.env.local` et configurer :

```env
# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_ID=your-github-id
GITHUB_SECRET=your-github-secret

# Base de données
DATABASE_URL="file:./dev.db"

# Application
NEXT_PUBLIC_APP_NAME="Magic Manager"
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Développement

- `npm run dev` : Serveur de développement
- `npm run build` : Build de production
- `npm run start` : Serveur de production
- `npm run lint` : Vérification du code

## Contribution

1. Fork le projet
2. Créer une branche feature
3. Commiter les changements
4. Pousser vers la branche
5. Créer une Pull Request
