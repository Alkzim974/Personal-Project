import { Deck, DeckCard, Format, ApiResponse } from '@/types';

export class DeckClientService {
  /**
   * Obtenir tous les decks de l'utilisateur
   */
  static async getUserDecks(): Promise<Deck[]> {
    const response = await fetch('/api/decks?type=user');
    const data: ApiResponse<Deck[]> = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Erreur lors de la récupération des decks');
    }
    
    return data.data || [];
  }

  /**
   * Obtenir les decks publics
   */
  static async getPublicDecks(limit: number = 20, offset: number = 0): Promise<Deck[]> {
    const response = await fetch(`/api/decks?type=public&limit=${limit}&offset=${offset}`);
    const data: ApiResponse<Deck[]> = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Erreur lors de la récupération des decks publics');
    }
    
    return data.data || [];
  }

  /**
   * Obtenir un deck par ID
   */
  static async getDeckById(deckId: string): Promise<Deck> {
    const response = await fetch(`/api/decks/${deckId}`);
    const data: ApiResponse<Deck> = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Erreur lors de la récupération du deck');
    }
    
    return data.data!;
  }

  /**
   * Créer un nouveau deck
   */
  static async createDeck(data: {
    name: string;
    description?: string;
    format: Format;
    isPublic?: boolean;
  }): Promise<Deck> {
    const response = await fetch('/api/decks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result: ApiResponse<Deck> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de la création du deck');
    }
    
    return result.data!;
  }

  /**
   * Mettre à jour un deck
   */
  static async updateDeck(
    deckId: string,
    data: {
      name?: string;
      description?: string;
      format?: Format;
      isPublic?: boolean;
    }
  ): Promise<Deck> {
    const response = await fetch(`/api/decks/${deckId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result: ApiResponse<Deck> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de la mise à jour du deck');
    }
    
    return result.data!;
  }

  /**
   * Supprimer un deck
   */
  static async deleteDeck(deckId: string): Promise<void> {
    const response = await fetch(`/api/decks/${deckId}`, {
      method: 'DELETE',
    });
    
    const result: ApiResponse<null> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de la suppression du deck');
    }
  }

  /**
   * Ajouter une carte à un deck
   */
  static async addCardToDeck(
    deckId: string,
    cardId: string,
    quantity: number = 1,
    isCommander: boolean = false,
    isCompanion: boolean = false
  ): Promise<void> {
    const response = await fetch(`/api/decks/${deckId}/cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cardId,
        quantity,
        isCommander,
        isCompanion,
      }),
    });
    
    const result: ApiResponse<null> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de l\'ajout de la carte');
    }
  }

  /**
   * Supprimer une carte d'un deck
   */
  static async removeCardFromDeck(deckId: string, cardId: string): Promise<void> {
    const response = await fetch(`/api/decks/${deckId}/cards?cardId=${cardId}`, {
      method: 'DELETE',
    });
    
    const result: ApiResponse<null> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de la suppression de la carte');
    }
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
    let totalCards = 0;

    cards.forEach((deckCard) => {
      const card = deckCard.card;
      const quantity = deckCard.quantity || 1;
      totalCards += quantity;
      // Correction ici :
      const colors = Array.isArray(card.colors)
        ? card.colors
        : card.colors
          ? JSON.parse(card.colors)
          : [];
      colors.forEach((color: string) => {
        colorDistribution[color] = (colorDistribution[color] || 0) + quantity;
      });
      if (card.cmc !== undefined && card.cmc !== null) {
        manaCurve[card.cmc] = (manaCurve[card.cmc] || 0) + quantity;
        totalCMC += card.cmc * quantity;
      }
      if (card.type_line?.toLowerCase().includes('land')) {
        landCount += quantity;
      } else if (card.type_line?.toLowerCase().includes('creature')) {
        creatureCount += quantity;
      } else {
        spellCount += quantity;
      }
    });

    const averageCMC = totalCards > 0 ? totalCMC / totalCards : 0;

    return {
      totalCards,
      manaCurve,
      colorDistribution,
      averageCMC,
      landCount,
      creatureCount,
      spellCount,
    };
  }

  /**
   * Valider un deck selon son format
   */
  static validateDeck(cards: DeckCard[], format: Format): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const totalCards = cards.reduce((sum, deckCard) => sum + deckCard.quantity, 0);

    // Validation du nombre de cartes
    if (format === 'commander') {
      if (totalCards !== 100) {
        errors.push(`Un deck Commander doit contenir exactement 100 cartes (actuellement: ${totalCards})`);
      }
    } else if (format === 'standard' || format === 'modern' || format === 'pioneer') {
      if (totalCards < 60) {
        errors.push(`Un deck ${format} doit contenir au moins 60 cartes (actuellement: ${totalCards})`);
      }
    }

    // Validation des commanders
    const commanders = cards.filter(deckCard => deckCard.is_commander);
    if (format === 'commander') {
      if (commanders.length === 0) {
        errors.push('Un deck Commander doit avoir un commander');
      } else if (commanders.length > 1) {
        errors.push('Un deck Commander ne peut avoir qu\'un seul commander');
      }
    }

    // Validation des companions
    const companions = cards.filter(deckCard => deckCard.is_companion);
    if (companions.length > 1) {
      errors.push('Un deck ne peut avoir qu\'un seul companion');
    }

    // Validation des cartes bannies (simplifiée)
    const bannedCards = cards.filter(deckCard => {
      const card = deckCard.card;
      return card.legalities && card.legalities[format as keyof typeof card.legalities] === 'banned';
    });

    if (bannedCards.length > 0) {
      bannedCards.forEach(deckCard => {
        errors.push(`${deckCard.card.name} est bannie en ${format}`);
      });
    }

    // Avertissements
    if (format === 'commander' && totalCards > 100) {
      warnings.push('Un deck Commander ne devrait pas dépasser 100 cartes');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
} 