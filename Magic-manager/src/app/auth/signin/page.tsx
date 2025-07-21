'use client';

import { useState, useEffect } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  Github,
  Chrome,
  Loader2
} from 'lucide-react';

/**
 * Page de connexion personnalisée
 * 
 * Cette page remplace la page de connexion par défaut de NextAuth.js.
 * Elle offre plusieurs méthodes de connexion :
 * - Email/mot de passe (sera implémenté plus tard)
 * - Google OAuth
 * - GitHub OAuth
 */

export default function SignInPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Éviter l'hydratation en attendant que le composant soit monté côté client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Gestion de la connexion avec email/mot de passe
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        // Gérer les erreurs (sera amélioré plus tard)
        console.error('Erreur de connexion:', result.error);
      } else {
        // Redirection vers la page d'accueil
        router.push('/');
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion de la connexion avec Google
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn('google', { callbackUrl: '/' });
    } catch (error) {
      console.error('Erreur Google:', error);
      setIsLoading(false);
    }
  };

  // Gestion de la connexion avec GitHub
  const handleGitHubSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn('github', { callbackUrl: '/' });
    } catch (error) {
      console.error('Erreur GitHub:', error);
      setIsLoading(false);
    }
  };

  // Ne pas rendre le contenu jusqu'à ce que le composant soit monté côté client
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              <div className="space-y-3">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Connexion</CardTitle>
          <CardDescription>
            Connectez-vous à votre compte Magic Manager
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Boutons OAuth */}
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              suppressHydrationWarning
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Chrome className="h-4 w-4 mr-2" />
              )}
              Continuer avec Google
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleGitHubSignIn}
              disabled={isLoading}
              suppressHydrationWarning
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Github className="h-4 w-4 mr-2" />
              )}
              Continuer avec GitHub
            </Button>
          </div>

          {/* Séparateur */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Ou continuer avec
              </span>
            </div>
          </div>

          {/* Formulaire email/mot de passe */}
          <form onSubmit={handleEmailSignIn} className="space-y-4" suppressHydrationWarning>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10"
                  required
                  suppressHydrationWarning
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Votre mot de passe"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 pr-10"
                  required
                  suppressHydrationWarning
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  suppressHydrationWarning
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
              suppressHydrationWarning
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </Button>
          </form>

          {/* Liens utiles */}
          <div className="text-center text-sm text-gray-600">
            <p>
              Pas encore de compte ?{' '}
              <a href="/auth/signup" className="text-blue-600 hover:underline">
                Créer un compte
              </a>
            </p>
            <p className="mt-2">
              <a href="/auth/forgot-password" className="text-blue-600 hover:underline">
                Mot de passe oublié ?
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 