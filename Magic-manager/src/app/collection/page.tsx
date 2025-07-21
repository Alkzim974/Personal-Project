'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Filter, 
  Grid, 
  List, 
  BarChart3, 
  Download, 
  Upload,
  Settings,
  Eye,
  Heart,
  Share2
} from 'lucide-react';
import { Card as MagicCard } from '@/types';
import CollectionStats from '@/components/CollectionStats';
import CollectionFilters from '@/components/CollectionFilters';
import { CardSearch } from '@/components/CardSearch';

/**
 * Page de collection de cartes
 * 
 * Cette page permet aux utilisateurs de :
 * - Voir leur collection de cartes
 * - Ajouter de nouvelles cartes
 * - Filtrer et rechercher dans leur collection
 * - Voir les statistiques de leur collection
 */

export default function CollectionPage() {
  const { data: session, status } = useSession();
  const [isMounted, setIsMounted] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [showCardSearch, setShowCardSearch] = useState(false);

  // État pour les cartes de la collection (simulé pour l'instant)
  const [collectionCards, setCollectionCards] = useState<MagicCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Éviter l'hydratation en attendant que le composant soit monté côté client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Charger la collection de l'utilisateur
  useEffect(() => {
    if (isMounted && session?.user) {
      loadUserCollection();
    }
  }, [session, isMounted]);

  const loadUserCollection = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/collection');
      if (!response.ok) {
        throw new Error('Erreur lors du chargement de la collection');
      }
      
      const data = await response.json();
      if (data.success) {
        setCollectionCards(data.data.cards.map((cc: any) => cc.card));
      } else {
        console.error('Erreur API:', data.error);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la collection:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCard = async (card: MagicCard) => {
    setShowCardSearch(false);
    try {
      const response = await fetch('/api/collection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardId: card.id,
          quantity: 1,
          condition: 'near_mint',
          isFoil: false,
          language: 'en'
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'ajout de la carte');
      }

      const data = await response.json();
      if (data.success) {
        // Recharger la collection
        await loadUserCollection();
        console.log('Carte ajoutée:', data.message);
      } else {
        console.error('Erreur API:', data.error);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la carte:', error);
    }
  };

  const handleCardSelect = (cardId: string) => {
    setSelectedCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  const handleBulkAction = (action: 'delete' | 'export' | 'move') => {
    if (selectedCards.length === 0) return;
    
    switch (action) {
      case 'delete':
        // TODO: Supprimer les cartes sélectionnées
        console.log('Supprimer:', selectedCards);
        break;
      case 'export':
        // TODO: Exporter les cartes sélectionnées
        console.log('Exporter:', selectedCards);
        break;
      case 'move':
        // TODO: Déplacer les cartes sélectionnées
        console.log('Déplacer:', selectedCards);
        break;
    }
  };

  // Ne pas rendre le contenu jusqu'à ce que le composant soit monté côté client
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Vérifier l'authentification
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre collection...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-bold text-gray-900">
              Connexion requise
            </CardTitle>
            <CardDescription>
              Vous devez être connecté pour accéder à votre collection.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => signIn()} className="w-full">
              Se connecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Ma Collection
              </h1>
              <p className="text-gray-600 mt-1">
                Gérez vos cartes Magic: The Gathering
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                onClick={() => setShowCardSearch(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter des cartes
              </Button>
              
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Importer
              </Button>
              
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="cards" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="cards">Cartes ({collectionCards.length})</TabsTrigger>
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          {/* Onglet Cartes */}
          <TabsContent value="cards" className="space-y-6">
            {/* Barre d'outils */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Recherche */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Rechercher dans votre collection..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Filtres */}
                <CollectionFilters />

                {/* Mode d'affichage */}
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Actions en lot */}
              {selectedCards.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">
                      {selectedCards.length} carte(s) sélectionnée(s)
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAction('delete')}
                    >
                      Supprimer
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAction('export')}
                    >
                      Exporter
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCards([])}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Contenu de la collection */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement de votre collection...</p>
              </div>
            ) : collectionCards.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Votre collection est vide
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Commencez par ajouter vos premières cartes à votre collection.
                  </p>
                  <Button 
                    onClick={() => setShowCardSearch(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter des cartes
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
                {/* Les cartes seront affichées ici */}
                <p className="text-gray-600 col-span-full text-center py-8">
                  Interface de cartes en cours de développement...
                </p>
              </div>
            )}
          </TabsContent>

          {/* Onglet Statistiques */}
          <TabsContent value="stats">
            <CollectionStats cards={collectionCards} />
          </TabsContent>

          {/* Onglet Paramètres */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Paramètres de la collection
                </CardTitle>
                <CardDescription>
                  Configurez les préférences de votre collection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Affichage par défaut</h4>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="defaultView"
                        value="grid"
                        defaultChecked
                        className="text-blue-600"
                      />
                      Grille
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="defaultView"
                        value="list"
                        className="text-blue-600"
                      />
                      Liste
                    </label>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Notifications</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="text-blue-600"
                      />
                      Notifications de prix
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="text-blue-600"
                      />
                      Rappels de maintenance
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de recherche de cartes */}
      {showCardSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Ajouter des cartes</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCardSearch(false)}
                >
                  ✕
                </Button>
              </div>
              <CardSearch onCardSelect={handleAddCard} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 