# Magic Manager

Application de gestion de decks Magic: The Gathering avec authentification et recherche de cartes.

## 🚀 Installation

1. **Cloner le repository**
```bash
git clone <votre-repo>
cd Magic-manager
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration de la base de données**
```bash
npx prisma generate
npx prisma db push
```

4. **Variables d'environnement**
Créez un fichier `.env` basé sur `.env.example` :
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="votre-secret-ici"
NEXTAUTH_URL="http://localhost:3000"
```

5. **Données de cartes Magic (Optionnel)**
Pour une recherche ultra-rapide, téléchargez le fichier de cartes :

- Allez sur [Scryfall Bulk Data](https://scryfall.com/docs/api/bulk-data)
- Téléchargez `default-cards-english-mtg.json`
- Placez-le dans le dossier `data/`
- Le fichier fait ~507MB

**Note :** Sans ce fichier, l'application utilise l'API Scryfall en direct.

6. **Lancer l'application**
```bash
npm run dev
```

## 📁 Structure des fichiers

```
Magic-manager/
├── data/                          # Données de cartes (optionnel)
│   └── default-cards-english-mtg.json
├── src/
│   ├── app/                       # Pages Next.js
│   ├── components/                # Composants React
│   ├── lib/                       # Services et utilitaires
│   └── types/                     # Types TypeScript
├── prisma/                        # Schéma de base de données
└── public/                        # Assets statiques
```

## 🎯 Fonctionnalités

- ✅ **Authentification** avec NextAuth.js
- ✅ **Gestion de decks** (création, édition, suppression)
- ✅ **Recherche de cartes** via API Scryfall
- ✅ **Filtrage Commander** automatique
- ✅ **Suggestions de cartes populaires**
- ✅ **Interface drag & drop** pour réorganiser les cartes
- ✅ **Validation des règles** Commander

## 🔧 Technologies

- **Frontend** : Next.js 14, React, TypeScript
- **Styling** : Tailwind CSS, shadcn/ui
- **Base de données** : SQLite avec Prisma
- **Authentification** : NextAuth.js
- **API Cartes** : Scryfall API
- **Drag & Drop** : @dnd-kit

## 📝 Notes importantes

- Le fichier `default-cards-english-mtg.json` n'est **PAS** inclus dans le repo
- Il fait ~507MB et est mis à jour régulièrement par Scryfall
- L'application fonctionne parfaitement sans ce fichier
- Ajouté au `.gitignore` pour éviter les problèmes de taille

## 🚀 Déploiement

L'application est prête pour le déploiement sur Vercel, Netlify, ou tout autre plateforme supportant Next.js.

## 📄 Licence

MIT
