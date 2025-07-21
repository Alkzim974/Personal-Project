'use client';

import { SessionProvider } from "next-auth/react";
import { ReactNode, useEffect } from "react";

/**
 * AuthProvider - Provider pour l'authentification
 * 
 * Ce composant enveloppe notre application pour fournir
 * l'état d'authentification à tous les composants enfants.
 * 
 * SessionProvider de NextAuth.js :
 * - Gère automatiquement les sessions
 * - Fournit les hooks useSession() dans toute l'app
 * - Gère le rafraîchissement automatique des tokens
 * - Gère la synchronisation entre onglets
 */

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Supprimer les attributs ajoutés par les extensions de navigateur
  useEffect(() => {
    const removeExtensionAttributes = () => {
      const elements = document.querySelectorAll('[data-nlok-ref-guid]');
      elements.forEach(element => {
        element.removeAttribute('data-nlok-ref-guid');
      });
    };

    // Supprimer les attributs après l'hydratation
    const timer = setTimeout(removeExtensionAttributes, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <SessionProvider 
      refetchInterval={5 * 60} // Rafraîchir la session toutes les 5 minutes
      refetchOnWindowFocus={true} // Rafraîchir quand la fenêtre reprend le focus
    >
      {children}
    </SessionProvider>
  );
} 