import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DeckService } from '@/lib/deckService';
import { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    
    const type = searchParams.get('type'); // 'user' ou 'public'
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (type === 'user') {
      // Obtenir les decks de l'utilisateur connecté
      if (!session?.user?.id) {
        return NextResponse.json<ApiResponse<null>>({
          success: false,
          error: 'Non authentifié',
        }, { status: 401 });
      }

      const decks = await DeckService.getUserDecks(session.user.id);
      return NextResponse.json<ApiResponse<any[]>>({
        success: true,
        data: decks,
      });
    } else {
      // Obtenir les decks publics
      const decks = await DeckService.getPublicDecks(limit, offset);
      return NextResponse.json<ApiResponse<any[]>>({
        success: true,
        data: decks,
      });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des decks:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Erreur interne du serveur',
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Non authentifié',
      }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, format, isPublic } = body;

    // Validation des données
    if (!name || !format) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Nom et format requis',
      }, { status: 400 });
    }

    if (name.length < 1 || name.length > 100) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Le nom doit contenir entre 1 et 100 caractères',
      }, { status: 400 });
    }

    // Créer le deck
    const deck = await DeckService.createDeck({
      name,
      description,
      format,
      userId: session.user.id,
      isPublic: isPublic || false,
    });

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      data: deck,
      message: 'Deck créé avec succès',
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du deck:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Erreur interne du serveur',
    }, { status: 500 });
  }
} 