import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CardService } from '@/lib/cardService';
import { ScryfallService } from '@/lib/scryfall';

/**
 * Route API pour la collection
 * 
 * GET /api/collection - Récupère la collection de l'utilisateur
 * POST /api/collection - Ajoute une carte à la collection
 */

// GET - Récupérer la collection de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const colors = searchParams.get('colors')?.split(',') || [];
    const rarity = searchParams.get('rarity') || '';
    const format = searchParams.get('format') || '';
    const priceRange = searchParams.get('priceRange') || '';

    // Calculer l'offset pour la pagination
    const offset = (page - 1) * limit;

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Construire les filtres
    const where: any = {
      userId: user.id
    };

    // Filtre par recherche (nom de carte)
    if (search) {
      where.card = {
        name: {
          contains: search,
          mode: 'insensitive'
        }
      };
    }

    // Filtre par couleur
    if (colors.length > 0) {
      where.card = {
        ...where.card,
        colors: {
          hasSome: colors
        }
      };
    }

    // Filtre par rareté
    if (rarity) {
      where.card = {
        ...where.card,
        rarity: rarity
      };
    }

    // Récupérer la collection avec les cartes
    const collectionCards = await prisma.collectionCard.findMany({
      where,
      include: {
        card: true
      },
      orderBy: {
        updatedAt: 'desc'
      },
      skip: offset,
      take: limit
    });

    // Compter le total pour la pagination
    const total = await prisma.collectionCard.count({ where });

    // Calculer les statistiques
    const stats = await prisma.collectionCard.aggregate({
      where: {
        userId: user.id
      },
      _sum: {
        quantity: true
      },
      _count: {
        id: true
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        cards: collectionCards,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        stats: {
          totalCards: stats._sum?.quantity || 0,
          uniqueCards: stats._count?.id || 0
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de la collection:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}

// POST - Ajouter une carte à la collection
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    // Parser le body de la requête
    const body = await request.json();
    const { cardId, quantity = 1, condition = 'near_mint', isFoil = false, language = 'en' } = body;

    // Validation des données
    if (!cardId) {
      return NextResponse.json(
        { error: 'ID de carte requis' },
        { status: 400 }
      );
    }

    if (quantity < 1) {
      return NextResponse.json(
        { error: 'Quantité doit être supérieure à 0' },
        { status: 400 }
      );
    }

    // Vérifier que la carte existe dans notre base de données
    let card = await prisma.card.findUnique({
      where: { scryfallId: cardId }
    });

    // Si la carte n'existe pas, essayer de la récupérer depuis Scryfall
    if (!card) {
      try {
        // Récupérer directement depuis l'API Scryfall
        const response = await fetch(`https://api.scryfall.com/cards/${cardId}`);
        if (response.ok) {
          const scryfallCard = await response.json();
          // Créer la carte dans notre base de données
          await CardService.createOrUpdateCard(scryfallCard);
          card = await prisma.card.findUnique({
            where: { scryfallId: cardId }
          });
        }
      } catch (error) {
        console.error('Erreur lors de la récupération depuis Scryfall:', error);
      }
    }

    if (!card) {
      return NextResponse.json(
        { error: 'Carte non trouvée' },
        { status: 404 }
      );
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier si la carte est déjà dans la collection
    const existingCard = await prisma.collectionCard.findFirst({
      where: {
        userId: user.id,
        cardId: card.scryfallId, // Utiliser scryfallId comme cardId
        isFoil: isFoil,
        language: language
      }
    });

    let collectionCard;

    if (existingCard) {
      // Mettre à jour la quantité existante
      collectionCard = await prisma.collectionCard.update({
        where: { id: existingCard.id },
        data: {
          quantity: existingCard.quantity + quantity
        },
        include: {
          card: true
        }
      });
    } else {
      // Créer une nouvelle entrée
      collectionCard = await prisma.collectionCard.create({
        data: {
          userId: user.id,
          cardId: card.scryfallId, // Utiliser scryfallId comme cardId
          quantity: quantity,
          condition: condition,
          isFoil: isFoil,
          language: language
        },
        include: {
          card: true
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: collectionCard,
      message: existingCard 
        ? 'Quantité mise à jour dans la collection'
        : 'Carte ajoutée à la collection'
    });

  } catch (error) {
    console.error('Erreur lors de l\'ajout à la collection:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
} 