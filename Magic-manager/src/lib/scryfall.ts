import { Card, ScryfallCard } from '@/types';

const SCRYFALL_API_BASE = 'https://api.scryfall.com';

export class ScryfallService {
  /**
   * Recherche une carte par son nom
   */
  static async searchCard(query: string): Promise<Card[]> {
    try {
      const response = await fetch(
        `${SCRYFALL_API_BASE}/cards/search?q=${encodeURIComponent(query)}`
      );
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.object === 'error') {
        throw new Error(data.details || 'Erreur lors de la recherche');
      }
      
      return data.data.map((card: ScryfallCard) => this.transformCard(card));
    } catch (error) {
      console.error('Erreur lors de la recherche de carte:', error);
      throw error;
    }
  }

  /**
   * Récupère une carte par son nom exact
   */
  static async getCardByName(name: string): Promise<Card> {
    try {
      const response = await fetch(
        `${SCRYFALL_API_BASE}/cards/named?exact=${encodeURIComponent(name)}`
      );
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const card = await response.json();
      return this.transformCard(card);
    } catch (error) {
      console.error('Erreur lors de la récupération de la carte:', error);
      throw error;
    }
  }

  /**
   * Récupère une carte par son ID
   */
  static async getCardById(id: string): Promise<Card> {
    try {
      const response = await fetch(`${SCRYFALL_API_BASE}/cards/${id}`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const card = await response.json();
      return this.transformCard(card);
    } catch (error) {
      console.error('Erreur lors de la récupération de la carte:', error);
      throw error;
    }
  }

  /**
   * Récupère les cartes d'un set spécifique
   */
  static async getCardsBySet(setCode: string): Promise<Card[]> {
    try {
      const response = await fetch(
        `${SCRYFALL_API_BASE}/cards/search?q=set:${setCode}`
      );
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.object === 'error') {
        throw new Error(data.details || 'Erreur lors de la récupération du set');
      }
      
      return data.data.map((card: ScryfallCard) => this.transformCard(card));
    } catch (error) {
      console.error('Erreur lors de la récupération du set:', error);
      throw error;
    }
  }

  /**
   * Récupère les formats légaux pour une carte
   */
  static async getCardLegalities(cardName: string): Promise<Record<string, string>> {
    try {
      const card = await this.getCardByName(cardName);
      return card.legalities || {};
    } catch (error) {
      console.error('Erreur lors de la récupération des légalités:', error);
      throw error;
    }
  }

  /**
   * Transforme les données de l'API Scryfall en format Card
   */
  private static transformCard(scryfallCard: ScryfallCard): Card {
    return {
      id: scryfallCard.id,
      name: scryfallCard.name,
      name_fr: scryfallCard.printed_name || scryfallCard.name,
      mana_cost: scryfallCard.mana_cost,
      cmc: scryfallCard.cmc,
      type_line: scryfallCard.type_line,
      oracle_text: scryfallCard.oracle_text,
      power: scryfallCard.power,
      toughness: scryfallCard.toughness,
      colors: scryfallCard.colors,
      color_identity: scryfallCard.color_identity,
      rarity: scryfallCard.rarity,
      set: scryfallCard.set,
      set_name: scryfallCard.set_name,
      collector_number: scryfallCard.collector_number,
      image_uris: scryfallCard.image_uris,
      prices: scryfallCard.prices,
      legalities: scryfallCard.legalities,
    };
  }

  /**
   * Récupère l'image d'une carte
   */
  static getCardImage(card: Card, size: 'small' | 'normal' | 'large' | 'png' | 'art_crop' | 'border_crop' = 'normal'): string {
    if (!card.image_uris) {
      return 'https://via.placeholder.com/223x310/2a2a2a/ffffff?text=Magic+Card'; // Image par défaut
    }
    
    return card.image_uris[size] || card.image_uris.normal;
  }

  /**
   * Récupère le prix d'une carte
   */
  static getCardPrice(card: Card, currency: 'usd' | 'eur' = 'eur', foil: boolean = false): string | null {
    if (!card.prices) {
      return null;
    }
    
    const priceKey = foil ? `${currency}_foil` : currency;
    return card.prices[priceKey as keyof typeof card.prices] || null;
  }

  /**
   * Vérifie si une carte est légale dans un format
   */
  static isCardLegal(card: Card, format: string): boolean {
    if (!card.legalities) {
      return false;
    }
    
    const legality = card.legalities[format as keyof typeof card.legalities];
    return legality === 'legal' || legality === 'restricted';
  }
} 