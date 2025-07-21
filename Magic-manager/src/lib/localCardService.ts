import { Card, ScryfallCard } from '@/types';

// Cache global pour les cartes chargées
let cardsCache: Card[] | null = null;
let searchIndex: Map<string, Card[]> | null = null;

export class LocalCardService {
  /**
   * Charger les cartes depuis le fichier JSON local
   */
  static async loadCards(): Promise<Card[]> {
    if (cardsCache) {
      return cardsCache;
    }

    try {
      console.log('Chargement des cartes locales...');
      
      // Charger le fichier JSON (à adapter selon l'emplacement)
      const response = await fetch('/api/cards/bulk-data');
      const data: ScryfallCard[] = await response.json();
      
      // Transformer les cartes
      cardsCache = data.map(card => this.transformCard(card));
      
      // Créer l'index de recherche
      this.buildSearchIndex();
      
      console.log(`✅ ${cardsCache.length} cartes chargées localement`);
      return cardsCache;
    } catch (error) {
      console.error('Erreur lors du chargement des cartes locales:', error);
      return [];
    }
  }

  /**
   * Construire l'index de recherche pour une recherche ultra-rapide
   */
  private static buildSearchIndex(): void {
    if (!cardsCache) return;

    searchIndex = new Map();
    
    for (const card of cardsCache) {
      // Index par nom (normalisé)
      const normalizedName = card.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      this.addToIndex(normalizedName, card);
      
      // Index par mots-clés du nom
      const nameWords = card.name.toLowerCase().split(/\s+/);
      for (const word of nameWords) {
        if (word.length >= 2) {
          this.addToIndex(word, card);
        }
      }
      
      // Index par type
      if (card.type_line) {
        const types = card.type_line.toLowerCase().split(/\s+/);
        for (const type of types) {
          if (type.length >= 3) {
            this.addToIndex(type, card);
          }
        }
      }
      
      // Index par set
      if (card.set_name) {
        const setWords = card.set_name.toLowerCase().split(/\s+/);
        for (const word of setWords) {
          if (word.length >= 2) {
            this.addToIndex(word, card);
          }
        }
      }
    }
    
    console.log('✅ Index de recherche construit');
  }

  /**
   * Ajouter une carte à l'index
   */
  private static addToIndex(key: string, card: Card): void {
    if (!searchIndex) return;
    
    if (!searchIndex.has(key)) {
      searchIndex.set(key, []);
    }
    searchIndex.get(key)!.push(card);
  }

  /**
   * Recherche locale ultra-rapide
   */
  static async searchCards(
    query: string,
    isCommanderSearch: boolean = false,
    commanderColorIdentity?: string[]
  ): Promise<Card[]> {
    // Charger les cartes si pas encore fait
    if (!cardsCache) {
      await this.loadCards();
    }

    if (!searchIndex || !cardsCache) {
      return [];
    }

    const cleanQuery = query.trim().toLowerCase();
    if (cleanQuery.length < 2) {
      return [];
    }

    // Recherche dans l'index
    const results = new Set<Card>();
    
    // Recherche exacte
    const exactMatches = searchIndex.get(cleanQuery) || [];
    exactMatches.forEach(card => results.add(card));
    
    // Recherche par préfixe
    for (const [key, cards] of searchIndex.entries()) {
      if (key.startsWith(cleanQuery) && key !== cleanQuery) {
        cards.forEach(card => results.add(card));
      }
    }
    
    // Recherche par mots-clés
    const queryWords = cleanQuery.split(/\s+/);
    for (const word of queryWords) {
      if (word.length >= 2) {
        const wordMatches = searchIndex.get(word) || [];
        wordMatches.forEach(card => results.add(card));
      }
    }

    // Recherche par nom normalisé (sans caractères spéciaux)
    const normalizedQuery = cleanQuery.replace(/[^a-z0-9]/g, '');
    if (normalizedQuery.length >= 2) {
      const normalizedMatches = searchIndex.get(normalizedQuery) || [];
      normalizedMatches.forEach(card => results.add(card));
    }

    // Recherche par similarité de nom (pour les copier-coller)
    for (const card of cardsCache) {
      const cardNameLower = card.name.toLowerCase();
      
      // Correspondance exacte
      if (cardNameLower === cleanQuery) {
        results.add(card);
        continue;
      }
      
      // Correspondance partielle
      if (cardNameLower.includes(cleanQuery) || cleanQuery.includes(cardNameLower)) {
        results.add(card);
        continue;
      }
      
      // Correspondance par mots
      const cardWords = cardNameLower.split(/\s+/);
      const queryWords = cleanQuery.split(/\s+/);
      
      const matchingWords = queryWords.filter(qw => 
        cardWords.some(cw => cw.includes(qw) || qw.includes(cw))
      );
      
      if (matchingWords.length >= Math.min(2, queryWords.length)) {
        results.add(card);
      }
    }

    let filteredResults = Array.from(results);

    // Filtrer par légalité Commander
    if (isCommanderSearch) {
      filteredResults = filteredResults.filter(card => 
        card.legalities?.commander === 'legal'
      );
    }

    // Filtrer par identité de couleur Commander
    if (commanderColorIdentity && commanderColorIdentity.length >= 0) {
      filteredResults = filteredResults.filter(card => 
        this.validateCardCommanderIdentity(card, commanderColorIdentity)
      );
    }

    // Trier par pertinence améliorée
    filteredResults.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      
      // 1. Correspondance exacte en premier
      const aExact = aName === cleanQuery;
      const bExact = bName === cleanQuery;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      // 2. Commence par la requête
      const aStartsWith = aName.startsWith(cleanQuery);
      const bStartsWith = bName.startsWith(cleanQuery);
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      
      // 3. Contient la requête
      const aContains = aName.includes(cleanQuery);
      const bContains = bName.includes(cleanQuery);
      if (aContains && !bContains) return -1;
      if (!aContains && bContains) return 1;
      
      // 4. Nombre de mots correspondants
      const aWords = aName.split(/\s+/);
      const bWords = bName.split(/\s+/);
      const queryWords = cleanQuery.split(/\s+/);
      
      const aMatchingWords = queryWords.filter(qw => 
        aWords.some(aw => aw.includes(qw) || qw.includes(aw))
      ).length;
      const bMatchingWords = queryWords.filter(qw => 
        bWords.some(bw => bw.includes(qw) || qw.includes(bw))
      ).length;
      
      if (aMatchingWords !== bMatchingWords) {
        return bMatchingWords - aMatchingWords; // Plus de mots = plus pertinent
      }
      
      // 5. Longueur du nom (noms courts en premier)
      if (aName.length !== bName.length) {
        return aName.length - bName.length;
      }
      
      // 6. Ordre alphabétique
      return aName.localeCompare(bName);
    });

    return filteredResults.slice(0, 20);
  }

  /**
   * Valider l'identité de couleur Commander
   */
  private static validateCardCommanderIdentity(card: Card, commanderColors: string[]): boolean {
    if (!commanderColors || commanderColors.length === 0) {
      return this.extractManaSymbols(card).length === 0;
    }
    return this.extractManaSymbols(card).every(symbol => commanderColors.includes(symbol));
  }

  /**
   * Extraire les symboles de mana d'une carte
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

  /**
   * Transformer une carte Scryfall en format local
   */
  private static transformCard(scryfallCard: ScryfallCard): Card {
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
      imageUrl: scryfallCard.image_uris?.normal || null,
    };
  }

  /**
   * Obtenir les statistiques de la base locale
   */
  static getStats(): { totalCards: number; indexedKeys: number } {
    return {
      totalCards: cardsCache?.length || 0,
      indexedKeys: searchIndex?.size || 0
    };
  }
} 