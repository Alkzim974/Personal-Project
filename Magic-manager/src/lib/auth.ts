import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

/**
 * Configuration NextAuth.js
 * 
 * Ce fichier définit comment l'authentification fonctionne dans notre application.
 * Nous utilisons plusieurs "providers" (méthodes de connexion) :
 * 
 * 1. Google Provider : Connexion avec compte Google
 * 2. GitHub Provider : Connexion avec compte GitHub  
 * 3. Credentials Provider : Connexion avec email/mot de passe
 * 
 * L'adaptateur Prisma permet de stocker les données utilisateur dans notre base de données.
 */

export const authOptions: NextAuthOptions = {
  // Adaptateur pour la base de données
  adapter: PrismaAdapter(prisma),
  
  // Providers = méthodes de connexion disponibles
  providers: [
    // 1. Connexion avec Google
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    
    // 2. Connexion avec GitHub
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    
    // 3. Connexion avec email/mot de passe
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" }
      },
      
      // Fonction qui vérifie les identifiants
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Ici nous vérifierons l'utilisateur dans la base de données
        // Pour l'instant, retournons null (sera implémenté plus tard)
        return null;
      }
    })
  ],
  
  // Configuration des sessions
  session: {
    strategy: "jwt", // Utilise des JWT (JSON Web Tokens) pour les sessions
  },
  
  // Pages personnalisées
  pages: {
    signIn: "/auth/signin", // Page de connexion personnalisée
    error: "/auth/error",   // Page d'erreur personnalisée
  },
  
  // Callbacks = fonctions appelées à différents moments
  callbacks: {
    // Appelé quand une session est créée
    async session({ session, token }) {
      // Ajout d'informations personnalisées à la session
      if (token && session.user) {
        session.user.id = token.sub!;
        session.user.role = (token.role as "user" | "moderator" | "admin") || "user";
      }
      return session;
    },
    
    // Appelé quand un JWT est créé
    async jwt({ token, user }) {
      // Ajout d'informations personnalisées au token
      if (user) {
        token.role = user.role;
      }
      return token;
    },
  },
  
  // Configuration de sécurité
  secret: process.env.NEXTAUTH_SECRET,
  
  // Debug en mode développement
  debug: process.env.NODE_ENV === "development",
}; 