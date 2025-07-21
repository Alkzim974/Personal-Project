import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DeckService } from '@/lib/deckService';
import { ApiResponse } from '@/types';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Non authentifié',
      }, { status: 401 });
    }

    const deckId = params.id;
    const body = await request.json();
    const { cardId, quantity = 1, isCommander = false, isCompanion = false } = body;

    // Validation des données
    if (!cardId) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'ID de carte requis',
      }, { status: 400 });
    }

    if (quantity < 1 || quantity > 4) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'La quantité doit être entre 1 et 4',
      }, { status: 400 });
    }

    const success = await DeckService.addCardToDeck(
      deckId,
      session.user.id,
      cardId,
      quantity,
      isCommander,
      isCompanion
    );

    if (!success) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Impossible d\'ajouter la carte au deck',
      }, { status: 400 });
    }

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      message: 'Carte ajoutée au deck avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la carte au deck:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Erreur interne du serveur',
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Non authentifié',
      }, { status: 401 });
    }

    const deckId = params.id;
    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get('cardId');

    if (!cardId) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'ID de carte requis',
      }, { status: 400 });
    }

    const success = await DeckService.removeCardFromDeck(
      deckId,
      session.user.id,
      cardId
    );

    if (!success) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Impossible de supprimer la carte du deck',
      }, { status: 400 });
    }

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      message: 'Carte supprimée du deck avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la carte du deck:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Erreur interne du serveur',
    }, { status: 500 });
  }
} 