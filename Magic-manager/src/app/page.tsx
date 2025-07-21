'use client';

import { CardSearch } from '@/components/CardSearch';
import { CardDisplay } from '@/components/CardDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Heart, 
  Users, 
  BookOpen, 
  TrendingUp,
  Sparkles,
  Shield,
  Zap
} from 'lucide-react';
import { Card as MagicCard } from '@/types';

export default function HomePage() {
  const handleCardSelect = (card: MagicCard) => {
    console.log('Card selected:', card);
    // Ici nous pourrons ajouter la logique pour afficher la carte sélectionnée
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold mb-6">
              Gestionnaire de Cartes Magic
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Créez, analysez et partagez vos decks Magic: The Gathering. 
              Gérez votre collection et découvrez de nouvelles stratégies.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <CardSearch 
                onCardSelect={handleCardSelect}
                placeholder="Rechercher une carte Magic..."
                className="w-full"
              />
            </div>

            <div className="flex justify-center gap-4">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                <Plus className="mr-2 h-5 w-5" />
                Créer un deck
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                <BookOpen className="mr-2 h-5 w-5" />
                Explorer les cartes
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Fonctionnalités principales
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tout ce dont vous avez besoin pour gérer votre passion Magic: The Gathering
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="mb-2">Création de Decks</CardTitle>
              <CardDescription>
                Créez des decks pour tous les formats populaires avec validation automatique des règles.
              </CardDescription>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="mb-2">Gestion de Collection</CardTitle>
              <CardDescription>
                Organisez votre collection de cartes avec des statistiques détaillées et des prix en temps réel.
              </CardDescription>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="mb-2">Communauté</CardTitle>
              <CardDescription>
                Partagez vos decks, découvrez ceux des autres et participez à la communauté.
              </CardDescription>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Formats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Formats populaires
            </h2>
            <p className="text-lg text-gray-600">
              Support pour tous les formats de jeu Magic: The Gathering
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Commander', icon: Shield, color: 'bg-red-500', description: 'Format casual à 4 joueurs' },
              { name: 'Standard', icon: Zap, color: 'bg-blue-500', description: 'Format standard actuel' },
              { name: 'Modern', icon: Sparkles, color: 'bg-green-500', description: 'Format étendu moderne' },
              { name: 'Pioneer', icon: TrendingUp, color: 'bg-purple-500', description: 'Format intermédiaire' },
            ].map((format) => (
              <Card key={format.name} className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className={`w-12 h-12 ${format.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <format.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="mb-2">{format.name}</CardTitle>
                <CardDescription>{format.description}</CardDescription>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Statistiques de la communauté
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">25,000+</div>
              <div className="text-gray-600">Decks créés</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">10,000+</div>
              <div className="text-gray-600">Utilisateurs actifs</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">50,000+</div>
              <div className="text-gray-600">Cartes dans les collections</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-red-600 mb-2">100,000+</div>
              <div className="text-gray-600">Likes donnés</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Prêt à commencer ?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Rejoignez la communauté et commencez à créer vos decks dès aujourd&apos;hui.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              Créer un compte
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              En savoir plus
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
