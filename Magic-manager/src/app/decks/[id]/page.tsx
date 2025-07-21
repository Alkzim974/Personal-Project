'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit, Share2, BarChart3, PieChart, TrendingUp, Eye } from 'lucide-react';
import { Deck, DeckCard } from '@/types';
import { DeckClientService } from '@/lib/deckClientService';
import { ScryfallService } from '@/lib/scryfall';

export default function DeckViewPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const deckId = params.id as string;
  
  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('cards');

  useEffect(() => {
    if (deckId) {
      loadDeck();
    }
  }, [deckId]);

  const loadDeck = async () => {
    try {
      setLoading(true);
      const deckData = await DeckClientService.getDeckById(deckId);
      setDeck(deckData);
    } catch (error) {
      console.error('Erreur lors du chargement du deck:', error);
      setError('Impossible de charger le deck');
    } finally {
      setLoading(false);
    }
  };

  const handleEditDeck = () => {
    router.push(`/decks/${deckId}/edit`);
  };

  const handleShareDeck = () => {
    const url = `${window.location.origin}/decks/${deckId}`;
    navigator.clipboard.writeText(url);
    // Ici vous pourriez ajouter une notification de succès
    alert('Lien du deck copié dans le presse-papiers !');
  };

  const getCardType = (typeLine: string): string => {
    const safeTypeLine = typeLine || '';
    if (safeTypeLine.includes('Land')) return 'Terrain';
    if (safeTypeLine.includes('Creature')) return 'Créature';
    if (safeTypeLine.includes('Instant')) return 'Éphémère';
    if (safeTypeLine.includes('Sorcery')) return 'Rituel';
    if (safeTypeLine.includes('Enchantment')) return 'Enchantement';
    if (safeTypeLine.includes('Artifact')) return 'Artefact';
    if (safeTypeLine.includes('Planeswalker')) return 'Planeswalker';
    return 'Autre';
  };

  const getColorName = (color: string): string => {
    const colorNames: Record<string, string> = {
      'W': 'Blanc',
      'U': 'Bleu',
      'B': 'Noir',
      'R': 'Rouge',
      'G': 'Vert',
    };
    return colorNames[color] || color;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Chargement du deck...</div>
        </div>
      </div>
    );
  }

  if (error || !deck) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Deck non trouvé</h2>
            <p className="text-muted-foreground mb-4">
              {error || 'Le deck que vous recherchez n\'existe pas ou vous n\'avez pas les permissions pour le voir.'}
            </p>
            <Button onClick={() => router.push('/decks')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux decks
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const analysis = DeckClientService.analyzeDeck(deck.cards);
  const validation = DeckClientService.validateDeck(deck.cards, deck.format);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.push('/decks')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{deck.name}</h1>
            <p className="text-muted-foreground">
              Par {deck.user_id} • {new Date(deck.created_at).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Badge variant="secondary">{deck.format}</Badge>
          <Badge variant={deck.is_public ? 'default' : 'outline'}>
            {deck.is_public ? 'Public' : 'Privé'}
          </Badge>
          {session?.user?.id === deck.user_id && (
            <Button onClick={handleEditDeck}>
              <Edit className="w-4 h-4 mr-2" />
              Modifier
            </Button>
          )}
          <Button variant="outline" onClick={handleShareDeck}>
            <Share2 className="w-4 h-4 mr-2" />
            Partager
          </Button>
        </div>
      </div>

      {/* Description */}
      {deck.description && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">{deck.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Validation */}
      {!validation.isValid && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Problèmes détectés</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {validation.errors.map((error, index) => (
                <li key={index} className="text-red-700 text-sm">• {error}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="cards">Cartes ({analysis.totalCards})</TabsTrigger>
          <TabsTrigger value="stats">Statistiques</TabsTrigger>
          <TabsTrigger value="analysis">Analyse</TabsTrigger>
        </TabsList>

        {/* Onglet Cartes */}
        <TabsContent value="cards" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {deck.cards.map((deckCard, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                                    <img
                  src={deckCard.card.imageUrl || deckCard.card.image_uris?.small || '/placeholder-card.svg'}
                  alt={deckCard.card.name}
                  className="w-12 h-16 object-cover rounded"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-card.svg';
                  }}
                />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-sm truncate">{deckCard.card.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {deckCard.quantity}x
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {getCardType(deckCard.card.type_line)}
                      </p>
                      {deckCard.is_commander && (
                        <Badge variant="default" className="text-xs mt-1">Commander</Badge>
                      )}
                      {deckCard.is_companion && (
                        <Badge variant="secondary" className="text-xs mt-1">Companion</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Onglet Statistiques */}
        <TabsContent value="stats" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cartes</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analysis.totalCards}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CMC Moyen</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analysis.averageCMC.toFixed(1)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Terrains</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analysis.landCount}</div>
                <p className="text-xs text-muted-foreground">
                  {((analysis.landCount / analysis.totalCards) * 100).toFixed(1)}% du deck
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Créatures</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analysis.creatureCount}</div>
                <p className="text-xs text-muted-foreground">
                  {((analysis.creatureCount / analysis.totalCards) * 100).toFixed(1)}% du deck
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Distribution des couleurs */}
          <Card>
            <CardHeader>
              <CardTitle>Distribution des couleurs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {Object.entries(analysis.colorDistribution).map(([color, count]) => (
                  <div key={color} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{
                          backgroundColor: 
                            color === 'W' ? '#f8f9fa' :
                            color === 'U' ? '#007bff' :
                            color === 'B' ? '#343a40' :
                            color === 'R' ? '#dc3545' :
                            color === 'G' ? '#28a745' : '#6c757d'
                        }}
                      />
                      <span className="text-sm">{getColorName(color)}</span>
                    </div>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Analyse */}
        <TabsContent value="analysis" className="space-y-6">
          {/* Courbe de mana */}
          <Card>
            <CardHeader>
              <CardTitle>Courbe de mana</CardTitle>
              <CardDescription>
                Distribution des coûts de mana convertis (CMC)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Array.from({ length: Math.max(...Object.keys(analysis.manaCurve).map(Number)) + 1 }, (_, i) => i).map((cmc) => {
                  const count = analysis.manaCurve[cmc] || 0;
                  const percentage = (count / analysis.totalCards) * 100;
                  return (
                    <div key={cmc} className="flex items-center space-x-4">
                      <div className="w-8 text-sm font-medium">{cmc}</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <div 
                          className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="w-12 text-sm text-right">{count}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Types de cartes */}
          <Card>
            <CardHeader>
              <CardTitle>Répartition par type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{analysis.landCount}</div>
                  <div className="text-sm text-muted-foreground">Terrains</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{analysis.creatureCount}</div>
                  <div className="text-sm text-muted-foreground">Créatures</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{analysis.spellCount}</div>
                  <div className="text-sm text-muted-foreground">Sorts</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 