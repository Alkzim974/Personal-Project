import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DeckService } from '@/lib/deckService';
import { ApiResponse } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const deckId = params.id;

    const deck = await DeckService.getDeckById(deckId, session?.user?.id);

    if (!deck) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Deck non trouvé',
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      data: deck,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du deck:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Erreur interne du serveur',
    }, { status: 500 });
  }
}

export async function PUT(
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
    const { name, description, format, isPublic } = body;

    // Validation des données
    if (name && (name.length < 1 || name.length > 100)) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Le nom doit contenir entre 1 et 100 caractères',
      }, { status: 400 });
    }

    const deck = await DeckService.updateDeck(deckId, session.user.id, {
      name,
      description,
      format,
      isPublic,
    });

    if (!deck) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Deck non trouvé ou accès refusé',
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      data: deck,
      message: 'Deck mis à jour avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du deck:', error);
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
    const success = await DeckService.deleteDeck(deckId, session.user.id);

    if (!success) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Deck non trouvé ou accès refusé',
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      message: 'Deck supprimé avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du deck:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Erreur interne du serveur',
    }, { status: 500 });
  }
} 