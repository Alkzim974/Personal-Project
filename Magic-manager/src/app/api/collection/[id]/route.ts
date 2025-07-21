import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Route API pour les opérations individuelles sur les cartes de collection
 * 
 * PUT /api/collection/[id] - Modifier une carte de la collection
 * DELETE /api/collection/[id] - Supprimer une carte de la collection
 */

// PUT - Modifier une carte de la collection
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { quantity, condition, isFoil, language } = body;

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

    // Vérifier que la carte appartient à l'utilisateur
    const collectionCard = await prisma.collectionCard.findFirst({
      where: {
        id: params.id,
        userId: user.id
      },
      include: {
        card: true
      }
    });

    if (!collectionCard) {
      return NextResponse.json(
        { error: 'Carte de collection non trouvée' },
        { status: 404 }
      );
    }

    // Préparer les données de mise à jour
    const updateData: any = {};
    
    if (quantity !== undefined) {
      if (quantity < 0) {
        return NextResponse.json(
          { error: 'Quantité doit être supérieure ou égale à 0' },
          { status: 400 }
        );
      }
      updateData.quantity = quantity;
    }

    if (condition !== undefined) {
      const validConditions = ['mint', 'near_mint', 'lightly_played', 'moderately_played', 'heavily_played', 'damaged'];
      if (!validConditions.includes(condition)) {
        return NextResponse.json(
          { error: 'Condition invalide' },
          { status: 400 }
        );
      }
      updateData.condition = condition;
    }

    if (isFoil !== undefined) {
      updateData.isFoil = isFoil;
    }

    if (language !== undefined) {
      const validLanguages = ['en', 'fr'];
      if (!validLanguages.includes(language)) {
        return NextResponse.json(
          { error: 'Langue invalide' },
          { status: 400 }
        );
      }
      updateData.language = language;
    }

    // Mettre à jour la carte
    const updatedCard = await prisma.collectionCard.update({
      where: { id: params.id },
      data: updateData,
      include: {
        card: true
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedCard,
      message: 'Carte mise à jour avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la carte:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une carte de la collection
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
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

    // Vérifier que la carte appartient à l'utilisateur
    const collectionCard = await prisma.collectionCard.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    });

    if (!collectionCard) {
      return NextResponse.json(
        { error: 'Carte de collection non trouvée' },
        { status: 404 }
      );
    }

    // Supprimer la carte
    await prisma.collectionCard.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Carte supprimée de la collection'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de la carte:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
} 