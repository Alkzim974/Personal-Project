import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * API Route NextAuth.js
 * 
 * Ce fichier crée l'endpoint API pour NextAuth.js.
 * Le pattern [...nextauth] signifie que cette route gère tous les chemins
 * commençant par /api/auth/ (comme /api/auth/signin, /api/auth/signout, etc.)
 * 
 * NextAuth.js utilise cette route pour :
 * - Gérer les connexions/déconnexions
 * - Gérer les callbacks OAuth
 * - Gérer les sessions
 * - Gérer les tokens
 */

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 