import { prisma } from './prisma';
import { Deck, DeckCard, Format, Card } from '@/types';

export class DeckService {
  /**
   * Créer un nouveau deck
   */
  static async createDeck(data: {
    name: string;
    description?: string;
    format: Format;
    userId: string;
    isPublic?: boolean;
  }): Promise<Deck> {
    const deck = await prisma.deck.create({
      data: {
        name: data.name,
        description: data.description,
        format: data.format,
        userId: data.userId,
        isPublic: data.isPublic || false,
      },
      include: {
        cards: {
          include: {
            card: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return this.transformDeck(deck);
  }

  /**
   * Obtenir un deck par ID
   */
  static async getDeckById(deckId: string, userId?: string): Promise<Deck | null> {
    const deck = await prisma.deck.findUnique({
      where: { id: deckId },
      include: {
        cards: {
          include: {
            card: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    if (!deck) return null;

    // Vérifier si l'utilisateur peut voir le deck
    if (!deck.isPublic && deck.userId !== userId) {
      return null;
    }

    return this.transformDeck(deck);
  }

  /**
   * Obtenir tous les decks d'un utilisateur
   */
  static async getUserDecks(userId: string): Promise<Deck[]> {
    const decks = await prisma.deck.findMany({
      where: { userId },
      include: {
        cards: {
          include: {
            card: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return decks.map(deck => this.transformDeck(deck));
  }

  /**
   * Obtenir les decks publics
   */
  static async getPublicDecks(limit: number = 20, offset: number = 0): Promise<Deck[]> {
    const decks = await prisma.deck.findMany({
      where: { isPublic: true },
      include: {
        cards: {
          include: {
            card: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return decks.map(deck => this.transformDeck(deck));
  }

  /**
   * Mettre à jour un deck
   */
  static async updateDeck(
    deckId: string,
    userId: string,
    data: {
      name?: string;
      description?: string;
      format?: Format;
      isPublic?: boolean;
    }
  ): Promise<Deck | null> {
    // Vérifier que l'utilisateur possède le deck
    const existingDeck = await prisma.deck.findFirst({
      where: { id: deckId, userId },
    });

    if (!existingDeck) return null;

    const deck = await prisma.deck.update({
      where: { id: deckId },
      data,
      include: {
        cards: {
          include: {
            card: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return this.transformDeck(deck);
  }

  /**
   * Supprimer un deck
   */
  static async deleteDeck(deckId: string, userId: string): Promise<boolean> {
    const deck = await prisma.deck.findFirst({
      where: { id: deckId, userId },
    });

    if (!deck) return false;

    await prisma.deck.delete({
      where: { id: deckId },
    });

    return true;
  }

  /**
   * Ajouter une carte à un deck
   */
  static async addCardToDeck(
    deckId: string,
    userId: string,
    cardId: string,
    quantity: number = 1,
    isCommander: boolean = false,
    isCompanion: boolean = false
  ): Promise<boolean> {
    console.log('🔍 addCardToDeck appelé avec:', { deckId, userId, cardId, quantity, isCommander, isCompanion });
    
    try {
      // Vérifier que l'utilisateur possède le deck
      const deck = await prisma.deck.findFirst({
        where: { id: deckId, userId },
      });

      if (!deck) {
        console.log('❌ Deck non trouvé ou utilisateur non autorisé');
        return false;
      }
      
      console.log('✅ Deck trouvé:', deck.name, 'Format:', deck.format);

      // Vérifier que la carte existe ou l'ajouter si elle n'existe pas
      let card = await prisma.card.findUnique({
        where: { scryfallId: cardId },
      });

      if (!card) {
        console.log('⚠️ Carte non trouvée en base, récupération depuis Scryfall...');
        // Récupérer les données de la carte depuis Scryfall
        try {
          const response = await fetch(`https://api.scryfall.com/cards/${cardId}`);
          if (!response.ok) {
            console.log('❌ Erreur Scryfall:', response.status, response.statusText);
            return false;
          }
          
          const scryfallCard = await response.json();
          console.log('✅ Carte récupérée depuis Scryfall:', scryfallCard.name);
          
          // Ajouter la carte à la base de données
          card = await prisma.card.create({
            data: {
              scryfallId: scryfallCard.id,
              name: scryfallCard.name,
              nameFr: scryfallCard.printed_name,
              manaCost: scryfallCard.mana_cost,
              cmc: scryfallCard.cmc,
              typeLine: scryfallCard.type_line,
              oracleText: scryfallCard.oracle_text,
              power: scryfallCard.power,
              toughness: scryfallCard.toughness,
              colors: JSON.stringify(scryfallCard.colors),
              colorIdentity: JSON.stringify(scryfallCard.color_identity),
              rarity: scryfallCard.rarity,
              set: scryfallCard.set,
              setName: scryfallCard.set_name,
              collectorNumber: scryfallCard.collector_number,
              imageUrl: scryfallCard.image_uris?.normal,
              prices: JSON.stringify(scryfallCard.prices),
              legalities: JSON.stringify(scryfallCard.legalities),
            },
          });
          console.log('✅ Carte ajoutée en base:', card.name);
        } catch (error) {
          console.error('❌ Erreur lors de la récupération de la carte depuis Scryfall:', error);
          return false;
        }
      } else {
        console.log('✅ Carte trouvée en base:', card.name);
      }

      // Vérifier les règles du format
      const format = this.validateFormat(deck.format);
      console.log('🔍 Validation de la carte pour le format:', format, 'isCommander:', isCommander);
      
      if (!this.validateCardForFormat(card, format, isCommander, isCompanion)) {
        console.log('❌ Carte non valide pour le format');
        return false;
      }

      // Validation stricte Commander pour l'identité couleur
      if (format === 'commander' && !isCommander) {
        const commander = await prisma.deckCard.findFirst({
          where: { deckId, isCommander: true },
          include: { card: true }
        });
        
        if (commander) {
          const commanderColors = Array.isArray(commander.card.colorIdentity) 
            ? commander.card.colorIdentity 
            : commander.card.colorIdentity 
              ? JSON.parse(commander.card.colorIdentity)
              : [];
          
          if (!this.validateCommanderColorIdentity(card, commanderColors)) {
            console.log('❌ Carte non valide pour l\'identité couleur du commander');
            return false;
          }
        }
      }
      
      console.log('✅ Carte validée avec succès');

      // Ajouter ou mettre à jour la carte dans le deck
      console.log('💾 Ajout de la carte au deck...');
      await prisma.deckCard.upsert({
        where: {
          deckId_cardId: {
            deckId,
            cardId,
          },
        },
        update: {
          quantity: quantity,
          isCommander,
          isCompanion,
        },
        create: {
          deckId,
          cardId,
          quantity,
          isCommander,
          isCompanion,
        },
      });

      console.log('✅ Carte ajoutée au deck avec succès');
      return true;
    } catch (error) {
      console.error('❌ Erreur dans addCardToDeck:', error);
      return false;
    }
  }

  /**
   * Supprimer une carte d'un deck
   */
  static async removeCardFromDeck(
    deckId: string,
    userId: string,
    cardId: string
  ): Promise<boolean> {
    // Vérifier que l'utilisateur possède le deck
    const deck = await prisma.deck.findFirst({
      where: { id: deckId, userId },
    });

    if (!deck) return false;

    await prisma.deckCard.deleteMany({
      where: {
        deckId,
        cardId,
      },
    });

    return true;
  }

  /**
   * Valider une carte pour un format donné
   */
  static validateCardForFormat(
    card: any,
    format: Format,
    isCommander: boolean = false,
    isCompanion: boolean = false
  ): boolean {
    // Vérifier la légalité de la carte dans le format
    if (card.legalities && card.legalities[format] === 'banned') {
      return false;
    }

    // Règles spécifiques au format Commander
    if (format === 'commander') {
      if (isCommander) {
        // Un commander doit être une créature légendaire
        if (!card.typeLine?.includes('Legendary') || !card.typeLine?.includes('Creature')) {
          return false;
        }
      }
      if (isCompanion) {
        // Un companion doit avoir une capacité companion
        if (!card.oracleText?.includes('Companion')) {
          return false;
        }
      }
    }

    // Règles pour Standard
    if (format === 'standard') {
      // Vérifier que la carte est dans un set Standard actuel
      // Cette logique devrait être plus sophistiquée avec une liste des sets Standard
    }

    return true;
  }

  /**
   * Extraire tous les symboles de mana d'une carte (coût + texte)
   */
  private static extractManaSymbols(card: any): string[] {
    const symbols = new Set<string>();
    const manaCost = card.manaCost || '';
    const oracleText = card.oracleText || '';
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

  /**
   * Valider l'identité couleur Commander stricte
   */
  private static validateCommanderColorIdentity(card: any, commanderColors: string[]): boolean {
    if (!commanderColors || commanderColors.length === 0) {
      // Commander incolore : aucune couleur autorisée
      return this.extractManaSymbols(card).length === 0;
    }
    // Tous les symboles de mana doivent être inclus dans l'identité du commander
    return this.extractManaSymbols(card).every(symbol => commanderColors.includes(symbol));
  }

  /**
   * Analyser un deck et retourner des statistiques
   */
  static analyzeDeck(cards: DeckCard[]): {
    totalCards: number;
    manaCurve: Record<number, number>;
    colorDistribution: Record<string, number>;
    averageCMC: number;
    landCount: number;
    creatureCount: number;
    spellCount: number;
  } {
    const manaCurve: Record<number, number> = {};
    const colorDistribution: Record<string, number> = {};
    let totalCMC = 0;
    let landCount = 0;
    let creatureCount = 0;
    let spellCount = 0;

    cards.forEach(deckCard => {
      const card = deckCard.card;
      const quantity = deckCard.quantity;

      // Mana curve
      const cmc = card.cmc || 0;
      manaCurve[cmc] = (manaCurve[cmc] || 0) + quantity;

      // CMC total
      totalCMC += (cmc * quantity);

      // Types de cartes
      if (card.type_line?.includes('Land')) {
        landCount += quantity;
      } else if (card.type_line?.includes('Creature')) {
        creatureCount += quantity;
      } else {
        spellCount += quantity;
      }

      // Distribution des couleurs
      if (card.colors) {
        card.colors.forEach(color => {
          colorDistribution[color] = (colorDistribution[color] || 0) + quantity;
        });
      }
    });

    const totalCards = cards.reduce((sum, deckCard) => sum + deckCard.quantity, 0);

    return {
      totalCards,
      manaCurve,
      colorDistribution,
      averageCMC: totalCards > 0 ? totalCMC / totalCards : 0,
      landCount,
      creatureCount,
      spellCount,
    };
  }

  /**
   * Valider et convertir un format string en type Format
   */
  private static validateFormat(format: string): Format {
    const validFormats: Format[] = ['standard', 'pioneer', 'modern', 'legacy', 'vintage', 'commander', 'pauper', 'draft', 'sealed'];
    if (validFormats.includes(format as Format)) {
      return format as Format;
    }
    return 'standard'; // Format par défaut
  }

  /**
   * Transformer un deck Prisma en type Deck
   */
  private static transformDeck(deck: any): Deck {
    return {
      id: deck.id,
      name: deck.name,
      description: deck.description,
      format: this.validateFormat(deck.format),
      cards: deck.cards.map((deckCard: any) => ({
        card: deckCard.card,
        quantity: deckCard.quantity,
        is_commander: deckCard.isCommander,
        is_companion: deckCard.isCompanion,
      })),
      created_at: deck.createdAt,
      updated_at: deck.updatedAt,
      user_id: deck.userId,
      is_public: deck.isPublic,
      likes_count: deck._count?.likes || deck.likesCount || 0,
      views_count: deck._count?.comments || deck.viewsCount || 0,
    };
  }
} 