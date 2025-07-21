import NextAuth from "next-auth";

/**
 * Types personnalisés pour NextAuth.js
 * 
 * Ce fichier étend les types par défaut de NextAuth.js pour inclure
 * nos propriétés personnalisées comme le rôle utilisateur.
 */

declare module "next-auth" {
  /**
   * Étend le type Session pour inclure nos propriétés personnalisées
   */
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: "user" | "moderator" | "admin";
    };
  }

  /**
   * Étend le type User pour inclure nos propriétés personnalisées
   */
  interface User {
    id: string;
    role: "user" | "moderator" | "admin";
  }
}

declare module "next-auth/jwt" {
  /**
   * Étend le type JWT pour inclure nos propriétés personnalisées
   */
  interface JWT {
    role: "user" | "moderator" | "admin";
  }
} 