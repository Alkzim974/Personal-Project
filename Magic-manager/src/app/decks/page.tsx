'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Edit, Eye, Search } from 'lucide-react';
import { Deck, Format, Card as MagicCard } from '@/types';
import { DeckClientService } from '@/lib/deckClientService';
import { CardSearch } from '@/components/CardSearch';

export default function DecksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDeck, setNewDeck] = useState({
    name: '',
    description: '',
    format: 'standard' as Format,
    isPublic: false,
  });
  const [selectedCommander, setSelectedCommander] = useState<MagicCard | null>(null);

  useEffect(() => {
    if (session?.user) {
      loadUserDecks();
    }
  }, [session]);

  const loadUserDecks = async () => {
    try {
      setLoading(true);
      const userDecks = await DeckClientService.getUserDecks();
      setDecks(userDecks);
    } catch (error) {
      console.error('Erreur lors du chargement des decks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation pour Commander
    if (newDeck.format === 'commander' && !selectedCommander) {
      alert('Vous devez sélectionner un commander pour un deck Commander.');
      return;
    }
    
    try {
      const deck = await DeckClientService.createDeck(newDeck);
      
      // Si c'est un deck Commander, ajouter le commander
      if (newDeck.format === 'commander' && selectedCommander) {
        await DeckClientService.addCardToDeck(deck.id, selectedCommander.id, 1, true, false);
      }
      
      // Rediriger vers l'éditeur du deck
      router.push(`/decks/${deck.id}/edit`);
    } catch (error) {
      console.error('Erreur lors de la création du deck:', error);
    }
  };

  const handleDeleteDeck = async (deckId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce deck ?')) {
      try {
        await DeckClientService.deleteDeck(deckId);
        setDecks(decks.filter(deck => deck.id !== deckId));
      } catch (error) {
        console.error('Erreur lors de la suppression du deck:', error);
      }
    }
  };

  const handleCommanderSelect = (card: MagicCard) => {
    setSelectedCommander(card);
  };

  const isCommanderRequired = newDeck.format === 'commander';
  const canCreateDeck = newDeck.name.trim() && (!isCommanderRequired || selectedCommander);

  // Réinitialiser le commander si le format change
  useEffect(() => {
    if (newDeck.format !== 'commander') {
      setSelectedCommander(null);
    }
  }, [newDeck.format]);

  const getCardType = (typeLine: string): string => {
    const safeTypeLine = typeLine || '';
    if (safeTypeLine.includes('Land')) return 'Lands';
    if (safeTypeLine.includes('Creature')) return 'Creatures';
    if (safeTypeLine.includes('Instant')) return 'Instants';
    if (safeTypeLine.includes('Sorcery')) return 'Sorceries';
    if (safeTypeLine.includes('Enchantment')) return 'Enchantments';
    if (safeTypeLine.includes('Artifact')) return 'Artifacts';
    if (safeTypeLine.includes('Planeswalker')) return 'Planeswalkers';
    return 'Other';
  };

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Chargement...</div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Connexion requise</h2>
            <p className="text-muted-foreground mb-4">
              Vous devez être connecté pour accéder à vos decks.
            </p>
            <Button onClick={() => window.location.href = '/auth/signin'}>
              Se connecter
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Mes Decks</h1>
          <p className="text-muted-foreground">
            Gérez vos decks Magic: The Gathering
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Deck
        </Button>
      </div>

      {/* Formulaire de création */}
      {showCreateForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Créer un nouveau deck</CardTitle>
            <CardDescription>
              Remplissez les informations pour créer votre deck
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateDeck} className="space-y-4">
              <div>
                <Label htmlFor="name">Nom du deck</Label>
                <Input
                  id="name"
                  value={newDeck.name}
                  onChange={(e) => setNewDeck({ ...newDeck, name: e.target.value })}
                  placeholder="Nom de votre deck"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description (optionnel)</Label>
                <Input
                  id="description"
                  value={newDeck.description}
                  onChange={(e) => setNewDeck({ ...newDeck, description: e.target.value })}
                  placeholder="Description de votre deck"
                />
              </div>
              <div>
                <Label htmlFor="format">Format</Label>
                <Select
                  value={newDeck.format}
                  onValueChange={(value: string) => {
                    setNewDeck({ ...newDeck, format: value as Format });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="commander">Commander</SelectItem>
                    <SelectItem value="modern">Modern</SelectItem>
                    <SelectItem value="pioneer">Pioneer</SelectItem>
                    <SelectItem value="legacy">Legacy</SelectItem>
                    <SelectItem value="vintage">Vintage</SelectItem>
                    <SelectItem value="pauper">Pauper</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sélection du Commander */}
              {isCommanderRequired && (
                <div>
                  {selectedCommander ? (
                    <>
                      <Label>Commander sélectionné</Label>
                      <div className="mt-2 p-3 border rounded-lg bg-gray-50">
                        <div className="flex items-center space-x-3">
                                                            <img
                                    src={selectedCommander.image_uris?.small || '/placeholder-card.svg'}
                                    alt={selectedCommander.name}
                                    className="w-12 h-16 object-cover rounded"
                                  />
                          <div>
                            <h4 className="font-medium">{selectedCommander.name}</h4>
                            <p className="text-sm text-muted-foreground">{selectedCommander.type_line}</p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedCommander(null)}
                          >
                            Changer
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div>
                      <Label>Commander (obligatoire)</Label>
                      <CardSearch 
                        onCardSelect={handleCommanderSelect}
                        placeholder="Rechercher un commander..."
                        isCommanderSearch={true}
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-4">
                <Button type="submit" disabled={!canCreateDeck}>
                  {isCommanderRequired && !selectedCommander ? 'Sélectionnez un commander' : 'Créer le deck'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setSelectedCommander(null);
                  }}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}



      {/* Liste des decks */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Chargement des decks...</div>
        </div>
      ) : decks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Aucun deck trouvé</h3>
              <p className="text-muted-foreground mb-4">
                Créez votre premier deck pour commencer !
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Créer un deck
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {decks.map((deck) => {
            // Trouver le commander pour les decks Commander
            const commander = deck.format === 'commander' 
              ? deck.cards.find(card => card.is_commander)?.card 
              : null;

            return (
              <Card key={deck.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3">
                      {/* Afficher le commander en grand pour les decks Commander */}
                      {commander && (
                        <img
                          src={commander.imageUrl || commander.image_uris?.normal || '/placeholder-card.svg'}
                          alt={commander.name}
                          className="w-16 h-24 object-cover rounded shadow-md"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-card.svg';
                          }}
                        />
                      )}
                      <div>
                        <CardTitle className="text-lg">{deck.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {deck.description || 'Aucune description'}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary">{deck.format}</Badge>
                  </div>
                </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Cartes:</span>
                    <span className="font-medium">
                      {deck.cards.reduce((sum, card) => sum + card.quantity, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Créé le:</span>
                    <span className="text-muted-foreground">
                      {new Date(deck.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Statut:</span>
                    <Badge variant={deck.is_public ? 'default' : 'outline'}>
                      {deck.is_public ? 'Public' : 'Privé'}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => router.push(`/decks/${deck.id}`)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Voir
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => router.push(`/decks/${deck.id}/edit`)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Modifier
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteDeck(deck.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Supprimer
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        </div>
      )}
    </div>
  );
} 