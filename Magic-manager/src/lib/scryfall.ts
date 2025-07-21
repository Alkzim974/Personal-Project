import { Card, ScryfallCard } from '@/types';

const SCRYFALL_API_BASE = 'https://api.scryfall.com';

export class ScryfallService {
  /**
   * Recherche une carte par son nom
   */
  static async searchCard(query: string, isCommanderSearch: boolean = false): Promise<Card[]> {
    try {
      const cleanQuery = query.trim();
      if (cleanQuery.length < 2) {
        return [];
      }

      const response = await fetch(
        `${SCRYFALL_API_BASE}/cards/search?q=${encodeURIComponent(cleanQuery)}`
      );
      
      if (!response.ok) {
        if (response.status === 404) {
          return [];
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.object === 'error') {
        if (data.code === 'not_found' || data.details?.includes('no cards found')) {
          return [];
        }
        throw new Error(data.details || 'Erreur lors de la recherche');
      }
      
      let cards = data.data.map((card: ScryfallCard) => this.transformCard(card));
      
      // Filtrer pour Commander si demandé
      if (isCommanderSearch) {
        cards = cards.filter(card => card.legalities?.commander === 'legal');
      }
      
      return cards.slice(0, 20);
    } catch (error) {
      console.error('Erreur lors de la recherche de carte:', error);
      return [];
    }
  }

  /**
   * Transformer une carte Scryfall en format local
   */
  static transformCard(scryfallCard: ScryfallCard): Card {
    return {
      id: scryfallCard.id,
      name: scryfallCard.name,
      type_line: scryfallCard.type_line,
      mana_cost: scryfallCard.mana_cost,
      oracle_text: scryfallCard.oracle_text,
      power: scryfallCard.power,
      toughness: scryfallCard.toughness,
      rarity: scryfallCard.rarity,
      set_name: scryfallCard.set_name,
      set: scryfallCard.set,
      collector_number: scryfallCard.collector_number,
      image_uris: scryfallCard.image_uris,
      legalities: scryfallCard.legalities,
      color_identity: scryfallCard.color_identity,
      imageUrl: scryfallCard.image_uris?.normal || undefined,
    };
  }

  /**
   * Valider l'identité couleur Commander stricte
   */
  static validateCardCommanderIdentity(card: Card, commanderColors: string[]): boolean {
    if (!commanderColors || commanderColors.length === 0) {
      return this.extractManaSymbols(card).length === 0;
    }
    return this.extractManaSymbols(card).every(symbol => commanderColors.includes(symbol));
  }

  /**
   * Extraire tous les symboles de mana d'une carte (coût + texte)
   */
  private static extractManaSymbols(card: Card): string[] {
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
} 