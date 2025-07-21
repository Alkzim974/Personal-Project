import { Card as MagicCard, ScryfallCard } from '@/types';
import { prisma } from './prisma';

/**
 * Service pour gérer les cartes dans la base de données locale
 */
export class CardService {
  /**
   * Récupère une carte par son ID Scryfall
   */
  static async getCardByScryfallId(scryfallId: string): Promise<MagicCard | null> {
    try {
      const card = await prisma.card.findUnique({
        where: { scryfallId }
      });
      
      if (!card) return null;
      
      return this.transformDbCardToMagicCard(card);
    } catch (error) {
      console.error('Erreur lors de la récupération de la carte:', error);
      return null;
    }
  }

  /**
   * Crée ou met à jour une carte dans la base de données
   */
  static async createOrUpdateCard(scryfallCard: ScryfallCard): Promise<MagicCard> {
    try {
      const cardData = {
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
        legalities: JSON.stringify(scryfallCard.legalities)
      };

      const card = await prisma.card.upsert({
        where: { scryfallId: scryfallCard.id },
        update: cardData,
        create: cardData
      });

      return this.transformDbCardToMagicCard(card);
    } catch (error) {
      console.error('Erreur lors de la création/mise à jour de la carte:', error);
      throw error;
    }
  }

  /**
   * Transforme une carte de la base de données en format MagicCard
   */
  private static transformDbCardToMagicCard(dbCard: any): MagicCard {
    return {
      id: dbCard.scryfallId, // Utiliser scryfallId comme ID principal
      name: dbCard.name,
      name_fr: dbCard.nameFr,
      mana_cost: dbCard.manaCost,
      cmc: dbCard.cmc,
      type_line: dbCard.typeLine,
      oracle_text: dbCard.oracleText,
      power: dbCard.power,
      toughness: dbCard.toughness,
      colors: dbCard.colors ? JSON.parse(dbCard.colors) : [],
      color_identity: dbCard.colorIdentity ? JSON.parse(dbCard.colorIdentity) : [],
      rarity: dbCard.rarity,
      set: dbCard.set,
      set_name: dbCard.setName,
      collector_number: dbCard.collectorNumber,
      image_uris: dbCard.imageUrl ? {
        small: dbCard.imageUrl.replace('/normal/', '/small/'),
        normal: dbCard.imageUrl,
        large: dbCard.imageUrl.replace('/normal/', '/large/'),
        png: dbCard.imageUrl.replace('/normal/', '/png/'),
        art_crop: dbCard.imageUrl.replace('/normal/', '/art_crop/'),
        border_crop: dbCard.imageUrl.replace('/normal/', '/border_crop/')
      } : undefined,
      prices: dbCard.prices ? JSON.parse(dbCard.prices) : {},
      legalities: dbCard.legalities ? JSON.parse(dbCard.legalities) : {}
    };
  }
} 