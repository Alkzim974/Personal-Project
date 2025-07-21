# Magic Manager - Gestionnaire de Collection Magic: The Gathering

Un gestionnaire de collection et de decks Magic: The Gathering inspiré de Moxfield, développé avec Next.js 14, TypeScript et Prisma.

## 🎯 Fonctionnalités

### ✅ Implémentées
- **🔐 Authentification** : Connexion avec Google et GitHub via NextAuth.js
- **🃏 Gestion de collection** : Ajout, modification et suppression de cartes
- **🔍 Recherche de cartes** : Intégration avec l'API Scryfall
- **📊 Statistiques** : Analyse détaillée de la collection
- **🔧 Filtres avancés** : Par couleur, rareté, format et prix
- **💾 Base de données** : SQLite avec Prisma ORM

### 🚧 En développement
- **🎴 Éditeur de deck** avec drag & drop
- **👥 Fonctionnalités sociales** (partage, commentaires)
- **📤 Import/Export** de collections
- **📱 Interface mobile** optimisée

## 🛠️ Technologies utilisées

- **Frontend** : Next.js 14, React 18, TypeScript
- **UI** : Shadcn/ui, Tailwind CSS, Lucide Icons
- **Backend** : Next.js API Routes
- **Base de données** : SQLite avec Prisma ORM
- **Authentification** : NextAuth.js
- **API externe** : Scryfall API

## 🚀 Installation

### Prérequis
- Node.js 18+ 
- npm ou yarn

### Étapes d'installation

1. **Cloner le repository**
```bash
git clone <votre-repo-url>
cd moxfield-clone
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration des variables d'environnement**
```bash
cp .env.example .env.local
```

Remplir le fichier `.env.local` avec vos clés :
```env
# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=votre-secret-ici

# OAuth Providers
GOOGLE_CLIENT_ID=votre-google-client-id
GOOGLE_CLIENT_SECRET=votre-google-client-secret
GITHUB_ID=votre-github-client-id
GITHUB_SECRET=votre-github-client-secret

# Base de données
DATABASE_URL="file:./dev.db"

# Configuration de l'app
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Configuration de l'authentification**

**Google OAuth :**
- Allez sur [Google Cloud Console](https://console.cloud.google.com/)
- Créez un projet et activez l'API Google+ 
- Créez des identifiants OAuth 2.0
- Ajoutez `http://localhost:3000/api/auth/callback/google` aux URIs de redirection

**GitHub OAuth :**
- Allez sur [GitHub Developer Settings](https://github.com/settings/developers)
- Créez une nouvelle OAuth App
- Ajoutez `http://localhost:3000/api/auth/callback/github` comme callback URL

5. **Initialiser la base de données**
```bash
npx prisma db push
npx prisma generate
```

6. **Lancer le serveur de développement**
```bash
npm run dev
```

L'application sera disponible sur [http://localhost:3000](http://localhost:3000)

## 📁 Structure du projet

```
src/
├── app/                    # App Router Next.js 14
│   ├── api/               # Routes API
│   │   ├── auth/          # Authentification NextAuth
│   │   └── collection/    # API Collection
│   ├── auth/              # Pages d'authentification
│   ├── collection/        # Page de collection
│   └── page.tsx           # Page d'accueil
├── components/            # Composants React
│   ├── ui/               # Composants Shadcn/ui
│   ├── CardSearch.tsx    # Recherche de cartes
│   ├── CollectionCard.tsx # Affichage carte collection
│   └── Navigation.tsx    # Navigation principale
├── lib/                  # Services et utilitaires
│   ├── auth.ts           # Configuration NextAuth
│   ├── prisma.ts         # Client Prisma
│   ├── scryfall.ts       # Service API Scryfall
│   ├── cardService.ts    # Service gestion cartes
│   └── collectionService.ts # Service collection
└── types/                # Types TypeScript
    ├── index.ts          # Types principaux
    └── next-auth.d.ts    # Types NextAuth étendus
```

## 🗄️ Base de données

Le projet utilise Prisma avec SQLite. Les modèles principaux :

- **User** : Utilisateurs (NextAuth)
- **Card** : Cartes Magic (synchronisées avec Scryfall)
- **CollectionCard** : Cartes dans les collections utilisateurs
- **Deck** : Decks des utilisateurs
- **Comment** : Commentaires sur les decks
- **Like** : Likes sur les decks

## 🔧 Scripts disponibles

```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run start        # Serveur de production
npm run lint         # Linting ESLint
npm run type-check   # Vérification TypeScript
```

## 🚀 Déploiement

### Vercel (Recommandé)
1. Connectez votre repository GitHub à Vercel
2. Configurez les variables d'environnement
3. Déployez automatiquement

### Autres plateformes
Le projet peut être déployé sur :
- Netlify
- Railway
- Heroku
- AWS

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- [Scryfall](https://scryfall.com/) pour l'API des cartes Magic
- [NextAuth.js](https://next-auth.js.org/) pour l'authentification
- [Shadcn/ui](https://ui.shadcn.com/) pour les composants UI
- [Prisma](https://www.prisma.io/) pour l'ORM

## 📞 Support

Pour toute question ou problème :
- Ouvrez une issue sur GitHub
- Contactez l'équipe de développement

---

**Développé avec ❤️ pour la communauté Magic: The Gathering**
