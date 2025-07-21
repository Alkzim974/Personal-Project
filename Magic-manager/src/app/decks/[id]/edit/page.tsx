'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Save, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Crown, 
  Star,
  BarChart3,
  AlertTriangle
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Deck, DeckCard, Card as MagicCard, Format } from '@/types';
import { DeckClientService } from '@/lib/deckClientService';
import { CardSearch } from '@/components/CardSearch';
import { ScryfallService } from '@/lib/scryfall';

// Fonction pour obtenir le type principal d'une carte
function getCardType(card: MagicCard): string {
  const typeLine = card.type_line || '';
  if (typeLine.includes('Land')) return 'Lands';
  if (typeLine.includes('Creature')) return 'Creatures';
  if (typeLine.includes('Instant')) return 'Instants';
  if (typeLine.includes('Sorcery')) return 'Sorceries';
  if (typeLine.includes('Enchantment')) return 'Enchantments';
  if (typeLine.includes('Artifact')) return 'Artifacts';
  if (typeLine.includes('Planeswalker')) return 'Planeswalkers';
  return 'Other';
}

// Fonction pour trier les cartes par type
function sortCardsByType(cards: DeckCard[]): DeckCard[] {
  const typeOrder = ['Lands', 'Creatures', 'Planeswalkers', 'Artifacts', 'Enchantments', 'Instants', 'Sorceries', 'Other'];
  
  return cards.sort((a, b) => {
    const typeA = getCardType(a.card);
    const typeB = getCardType(b.card);
    
    const indexA = typeOrder.indexOf(typeA);
    const indexB = typeOrder.indexOf(typeB);
    
    if (indexA !== indexB) {
      return indexA - indexB;
    }
    
    // Si même type, trier par nom
    return a.card.name.localeCompare(b.card.name);
  });
}

// Fonction pour extraire tous les symboles de mana d'une carte (coût + texte)
function extractManaSymbols(card: MagicCard): string[] {
  const symbols = new Set<string>();
  const manaCost = card.mana_cost || '';
  const oracleText = card.oracle_text || '';
  const regex = /{([WUBRG])}/g;
  let match;
  while ((match = regex.exec(manaCost)) !== null) {
    symbols.add(match[1]);
  }
  regex.lastIndex = 0;
  while ((match = regex.exec(oracleText)) !== null) {
    symbols.add(match[1]);
  }
  return Array.from(symbols);
}

function validateCardCommanderIdentity(card: MagicCard, commanderColors: string[]): boolean {
  if (!commanderColors || commanderColors.length === 0) {
    // Commander incolore : aucune couleur autorisée
    return extractManaSymbols(card).length === 0;
  }
  // Tous les symboles de mana doivent être inclus dans l'identité du commander
  return extractManaSymbols(card).every(symbol => commanderColors.includes(symbol));
}

// Composant de carte triable
function SortableCard({ deckCard, onRemove, onQuantityChange, onRoleChange }: {
  deckCard: DeckCard;
  onRemove: () => void;
  onQuantityChange: (quantity: number) => void;
  onRoleChange: (role: 'commander' | 'companion' | 'normal') => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deckCard.card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getRoleIcon = () => {
    if (deckCard.is_commander) return <Crown className="w-4 h-4 text-yellow-600" />;
    if (deckCard.is_companion) return <Star className="w-4 h-4 text-blue-600" />;
    return null;
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className="cursor-move hover:shadow-lg transition-shadow"
    >
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
              <div className="flex items-center space-x-2">
                <h3 className="font-medium text-sm truncate">{deckCard.card.name}</h3>
                {getRoleIcon()}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (deckCard.quantity > 1) {
                      onQuantityChange(deckCard.quantity - 1);
                    }
                  }}
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <Badge variant="outline" className="text-xs">
                  {deckCard.quantity}x
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (deckCard.quantity < 4) {
                      onQuantityChange(deckCard.quantity + 1);
                    }
                  }}
                >
                  <Plus className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {deckCard.card.type_line} • CMC: {deckCard.card.cmc || 0}
            </p>
            <div className="flex space-x-1 mt-2">
              <Button
                size="sm"
                variant={deckCard.is_commander ? 'default' : 'outline'}
                onClick={(e) => {
                  e.stopPropagation();
                  onRoleChange(deckCard.is_commander ? 'normal' : 'commander');
                }}
                className="text-xs"
              >
                Commander
              </Button>
              <Button
                size="sm"
                variant={deckCard.is_companion ? 'default' : 'outline'}
                onClick={(e) => {
                  e.stopPropagation();
                  onRoleChange(deckCard.is_companion ? 'normal' : 'companion');
                }}
                className="text-xs"
              >
                Companion
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DeckEditPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const deckId = params.id as string;
  
  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCardSearch, setShowCardSearch] = useState(false);
  const [activeTab, setActiveTab] = useState('editor');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (deckId) {
      loadDeck();
    }
  }, [deckId]);

  const loadDeck = async () => {
    try {
      setLoading(true);
      const deckData = await DeckClientService.getDeckById(deckId);
      
      // Trier les cartes par type au chargement
      const sortedDeck = {
        ...deckData,
        cards: sortCardsByType(deckData.cards),
      };
      
      setDeck(sortedDeck);
    } catch (error) {
      console.error('Erreur lors du chargement du deck:', error);
      setError('Impossible de charger le deck');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && deck) {
      const oldIndex = deck.cards.findIndex(card => card.card.id === active.id);
      const newIndex = deck.cards.findIndex(card => card.card.id === over?.id);

      setDeck({
        ...deck,
        cards: arrayMove(deck.cards, oldIndex, newIndex),
      });
    }
  };

  const handleAddCard = async (card: MagicCard) => {
    if (!deck) return;
    
    try {
      // Validation pour les decks Commander
      if (deck.format === 'commander') {
        // Vérifier si la carte est légale en Commander
        if (card.legalities?.commander !== 'legal') {
          alert(`${card.name} n'est pas légale en Commander.`);
          return;
        }

        // Vérifier l'identité de couleur si un commander est défini
        const commander = deck.cards.find(dc => dc.is_commander)?.card;
        if (commander) {
          const commanderColors = Array.isArray(commander.color_identity) 
            ? commander.color_identity 
            : commander.color_identity 
              ? JSON.parse(commander.color_identity)
              : [];
          
          if (!validateCardCommanderIdentity(card, commanderColors)) {
            alert(`${card.name} ne peut pas être jouée avec ce commander (identité de couleur différente).`);
            return;
          }
        }
      }

      // Vérifier si la carte est déjà dans le deck
      const existingCard = deck.cards.find(dc => dc.card.id === card.id);
      if (existingCard) {
        // Augmenter la quantité
        await handleQuantityChange(card.id, existingCard.quantity + 1);
        alert(`Quantité de ${card.name} augmentée à ${existingCard.quantity + 1}.`);
      } else {
        // Ajouter la nouvelle carte
        const response = await fetch(`/api/decks/${deck.id}/cards`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cardId: card.id,
            quantity: 1,
            isCommander: false,
            isCompanion: false,
          }),
        });

        if (!response.ok) {
          throw new Error('Erreur lors de l\'ajout de la carte');
        }

        // Recharger le deck
        await loadDeck();
        
        alert(`${card.name} a été ajoutée au deck.`);
      }

      setShowCardSearch(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la carte:', error);
      alert('Impossible d\'ajouter la carte au deck.');
    }
  };

  const handleRemoveCard = async (cardId: string) => {
    if (!deck) return;

    try {
      await DeckClientService.removeCardFromDeck(deckId, cardId);
      
      setDeck({
        ...deck,
        cards: deck.cards.filter(deckCard => deckCard.card.id !== cardId),
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de la carte:', error);
    }
  };

  const handleQuantityChange = async (cardId: string, newQuantity: number) => {
    if (!deck) return;

    try {
      const deckCard = deck.cards.find(dc => dc.card.id === cardId);
      if (!deckCard) return;

      // Supprimer la carte actuelle
      await DeckClientService.removeCardFromDeck(deckId, cardId);
      
      // Ajouter la nouvelle quantité
      await DeckClientService.addCardToDeck(
        deckId, 
        cardId, 
        newQuantity,
        deckCard.is_commander,
        deckCard.is_companion
      );

      // Mettre à jour localement
      setDeck({
        ...deck,
        cards: deck.cards.map(dc => 
          dc.card.id === cardId 
            ? { ...dc, quantity: newQuantity }
            : dc
        ),
      });
    } catch (error) {
      console.error('Erreur lors du changement de quantité:', error);
    }
  };

  const handleRoleChange = async (cardId: string, role: 'commander' | 'companion' | 'normal') => {
    if (!deck) return;

    try {
      const deckCard = deck.cards.find(dc => dc.card.id === cardId);
      if (!deckCard) return;

      const isCommander = role === 'commander';
      const isCompanion = role === 'companion';

      // Supprimer la carte actuelle
      await DeckClientService.removeCardFromDeck(deckId, cardId);
      
      // Ajouter avec le nouveau rôle
      await DeckClientService.addCardToDeck(
        deckId, 
        cardId, 
        deckCard.quantity,
        isCommander,
        isCompanion
      );

      // Mettre à jour localement
      setDeck({
        ...deck,
        cards: deck.cards.map(dc => 
          dc.card.id === cardId 
            ? { 
                ...dc, 
                is_commander: isCommander,
                is_companion: isCompanion
              }
            : dc
        ),
      });
    } catch (error) {
      console.error('Erreur lors du changement de rôle:', error);
    }
  };

  const handleSave = async () => {
    if (!deck) return;

    setSaving(true);
    try {
      // Ici vous pourriez sauvegarder les modifications du deck
      // Pour l'instant, les modifications sont sauvegardées en temps réel
      alert('Deck sauvegardé avec succès !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
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
            <p className="text-muted-foreground mb-4">{error}</p>
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
          <Button variant="outline" onClick={() => router.push(`/decks/${deckId}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Éditer: {deck.name}</h1>
            <p className="text-muted-foreground">
              {deck.format} • {analysis.totalCards} cartes
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </div>

      {/* Validation */}
      {!validation.isValid && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Problèmes détectés
            </CardTitle>
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="editor">Éditeur</TabsTrigger>
          <TabsTrigger value="stats">Statistiques</TabsTrigger>
        </TabsList>

        {/* Onglet Éditeur */}
        <TabsContent value="editor" className="space-y-6">
          {/* Barre d'outils */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button onClick={() => setShowCardSearch(true)}>
                    <Search className="w-4 h-4 mr-2" />
                    Ajouter une carte
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {analysis.totalCards} cartes au total
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{deck.format}</Badge>
                  <Badge variant={validation.isValid ? 'default' : 'destructive'}>
                    {validation.isValid ? 'Valide' : 'Non valide'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recherche de cartes */}
          {showCardSearch && (
            <Card>
              <CardHeader>
                <CardTitle>Ajouter une carte</CardTitle>
                <CardDescription>
                  {(() => {
                    if (deck.format === 'commander') {
                      const commander = deck.cards.find(dc => dc.is_commander)?.card;
                      if (commander) {
                        const colors = Array.isArray(commander.color_identity) 
                          ? commander.color_identity 
                          : commander.color_identity 
                            ? JSON.parse(commander.color_identity)
                            : [];
                        if (colors.length > 0) {
                          return `Résultats filtrés selon l'identité de couleur du commander (${colors.join(', ')})`;
                        }
                      }
                    }
                    return 'Recherchez et ajoutez des cartes à votre deck';
                  })()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CardSearch 
                  onCardSelect={handleAddCard}
                  placeholder="Rechercher une carte..."
                  isCommanderSearch={deck.format === 'commander'}
                  commanderColorIdentity={(() => {
                    if (deck.format === 'commander') {
                      const commander = deck.cards.find(dc => dc.is_commander)?.card;
                      if (commander) {
                        return Array.isArray(commander.color_identity) 
                          ? commander.color_identity 
                          : commander.color_identity 
                            ? JSON.parse(commander.color_identity)
                            : [];
                      }
                    }
                    return undefined;
                  })()}
                />
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setShowCardSearch(false)}
                >
                  Fermer
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Liste des cartes */}
          <Card>
            <CardHeader>
              <CardTitle>Cartes du deck</CardTitle>
              <CardDescription>
                Glissez-déposez pour réorganiser les cartes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {deck.cards.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    Aucune carte dans ce deck
                  </p>
                  <Button onClick={() => setShowCardSearch(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter votre première carte
                  </Button>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={deck.cards.map(dc => dc.card.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-6">
                      {/* Grouper les cartes par type */}
                      {(() => {
                        const groupedCards: Record<string, DeckCard[]> = {};
                        deck.cards.forEach(deckCard => {
                          const type = getCardType(deckCard.card);
                          if (!groupedCards[type]) {
                            groupedCards[type] = [];
                          }
                          groupedCards[type].push(deckCard);
                        });

                        return Object.entries(groupedCards).map(([type, cards]) => (
                          <div key={type} className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <h3 className="text-lg font-semibold text-muted-foreground">{type}</h3>
                              <Badge variant="outline">{cards.length}</Badge>
                            </div>
                            <div className="space-y-2">
                              {cards.map((deckCard) => (
                                <SortableCard
                                  key={deckCard.card.id}
                                  deckCard={deckCard}
                                  onRemove={() => handleRemoveCard(deckCard.card.id)}
                                  onQuantityChange={(quantity) => handleQuantityChange(deckCard.card.id, quantity)}
                                  onRoleChange={(role) => handleRoleChange(deckCard.card.id, role)}
                                />
                              ))}
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </CardContent>
          </Card>
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
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analysis.averageCMC.toFixed(1)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Terrains</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
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
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analysis.creatureCount}</div>
                <p className="text-xs text-muted-foreground">
                  {((analysis.creatureCount / analysis.totalCards) * 100).toFixed(1)}% du deck
                </p>
              </CardContent>
            </Card>
          </div>

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
        </TabsContent>
      </Tabs>
    </div>
  );
} 