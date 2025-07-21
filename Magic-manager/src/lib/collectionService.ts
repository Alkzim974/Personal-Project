import { Card as MagicCard } from '@/types';

export interface CollectionCard {
  id: string;
  quantity: number;
  condition: 'mint' | 'near_mint' | 'lightly_played' | 'moderately_played' | 'heavily_played' | 'damaged';
  isFoil: boolean;
  language: 'en' | 'fr';
  createdAt: string;
  updatedAt: string;
  card: MagicCard;
}

export interface CollectionResponse {
  success: boolean;
  data: {
    cards: CollectionCard[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    stats: {
      totalCards: number;
      uniqueCards: number;
    };
  };
  error?: string;
}

export interface AddCardRequest {
  cardId: string;
  quantity?: number;
  condition?: string;
  isFoil?: boolean;
  language?: 'en' | 'fr';
}

export interface UpdateCardRequest {
  quantity?: number;
  condition?: string;
  isFoil?: boolean;
  language?: 'en' | 'fr';
}

/**
 * Service pour gérer les opérations de collection
 */
export class CollectionService {
  /**
   * Récupère la collection de l'utilisateur
   */
  static async getCollection(params?: {
    page?: number;
    limit?: number;
    search?: string;
    colors?: string[];
    rarity?: string;
    format?: string;
    priceRange?: string;
  }): Promise<CollectionResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.colors?.length) searchParams.append('colors', params.colors.join(','));
    if (params?.rarity) searchParams.append('rarity', params.rarity);
    if (params?.format) searchParams.append('format', params.format);
    if (params?.priceRange) searchParams.append('priceRange', params.priceRange);

    const response = await fetch(`/api/collection?${searchParams.toString()}`);
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération de la collection');
    }

    return response.json();
  }

  /**
   * Ajoute une carte à la collection
   */
  static async addCard(data: AddCardRequest): Promise<{ success: boolean; data?: CollectionCard; message?: string; error?: string }> {
    const response = await fetch('/api/collection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cardId: data.cardId,
        quantity: data.quantity || 1,
        condition: data.condition || 'near_mint',
        isFoil: data.isFoil || false,
        language: data.language || 'en'
      }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'ajout de la carte');
    }

    return response.json();
  }

  /**
   * Met à jour une carte de la collection
   */
  static async updateCard(cardId: string, data: UpdateCardRequest): Promise<{ success: boolean; data?: CollectionCard; message?: string; error?: string }> {
    const response = await fetch(`/api/collection/${cardId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour de la carte');
    }

    return response.json();
  }

  /**
   * Supprime une carte de la collection
   */
  static async deleteCard(cardId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await fetch(`/api/collection/${cardId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la suppression de la carte');
    }

    return response.json();
  }

  /**
   * Actions en lot sur les cartes
   */
  static async bulkAction(action: 'delete' | 'update', cardIds: string[], data?: UpdateCardRequest): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await fetch('/api/collection/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        cardIds,
        data
      }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'action en lot');
    }

    return response.json();
  }
} 