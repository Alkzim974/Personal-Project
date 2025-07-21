'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';

/**
 * Page d'erreur d'authentification
 * 
 * Cette page affiche les erreurs d'authentification de manière conviviale.
 * Elle récupère le type d'erreur depuis les paramètres d'URL.
 */

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  // Messages d'erreur personnalisés
  const getErrorMessage = (errorType: string | null) => {
    switch (errorType) {
      case 'Configuration':
        return {
          title: 'Erreur de configuration',
          message: 'Il y a un problème avec la configuration du serveur. Veuillez réessayer plus tard.',
        };
      case 'AccessDenied':
        return {
          title: 'Accès refusé',
          message: 'Vous n&apos;avez pas l&apos;autorisation d&apos;accéder à cette ressource.',
        };
      case 'Verification':
        return {
          title: 'Erreur de vérification',
          message: 'Le lien de vérification a expiré ou est invalide.',
        };
      case 'OAuthSignin':
        return {
          title: 'Erreur de connexion OAuth',
          message: 'Une erreur s&apos;est produite lors de la connexion avec le fournisseur.',
        };
      case 'OAuthCallback':
        return {
          title: 'Erreur de callback OAuth',
          message: 'Une erreur s&apos;est produite lors du retour du fournisseur.',
        };
      case 'OAuthCreateAccount':
        return {
          title: 'Erreur de création de compte',
          message: 'Impossible de créer un compte avec ce fournisseur.',
        };
      case 'EmailCreateAccount':
        return {
          title: 'Erreur de création de compte',
          message: 'Impossible de créer un compte avec cet email.',
        };
      case 'Callback':
        return {
          title: 'Erreur de callback',
          message: 'Une erreur s&apos;est produite lors de la connexion.',
        };
      case 'OAuthAccountNotLinked':
        return {
          title: 'Compte non lié',
          message: 'Cet email est déjà utilisé avec un autre compte. Veuillez utiliser la même méthode de connexion.',
        };
      case 'EmailSignin':
        return {
          title: 'Erreur d&apos;envoi d&apos;email',
          message: 'Impossible d&apos;envoyer l&apos;email de connexion.',
        };
      case 'CredentialsSignin':
        return {
          title: 'Identifiants invalides',
          message: 'L&apos;email ou le mot de passe est incorrect.',
        };
      case 'SessionRequired':
        return {
          title: 'Session requise',
          message: 'Vous devez être connecté pour accéder à cette page.',
        };
      default:
        return {
          title: 'Erreur inconnue',
          message: 'Une erreur inattendue s&apos;est produite. Veuillez réessayer.',
        };
    }
  };

  const errorInfo = getErrorMessage(error);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-bold text-red-600">
            {errorInfo.title}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {errorInfo.message}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-gray-500">
            Code d&apos;erreur : {error || 'inconnu'}
          </div>
          
          <div className="flex flex-col space-y-2">
            <Button asChild className="w-full">
              <Link href="/auth/signin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à la connexion
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="w-full">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Retour à l&apos;accueil
              </Link>
            </Button>
          </div>
          
          <div className="text-center text-xs text-gray-400">
            Si le problème persiste, contactez le support.
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 