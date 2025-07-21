import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cardId = params.id;
    
    console.log('🔍 Recherche de la carte:', cardId);
    
    const card = await prisma.card.findUnique({
      where: { scryfallId: cardId },
    });

    if (!card) {
      console.log('❌ Carte non trouvée en base');
      return NextResponse.json(
        { error: 'Carte non trouvée' },
        { status: 404 }
      );
    }

    console.log('✅ Carte trouvée:', card.name);
    
    return NextResponse.json(card);
  } catch (error) {
    console.error('❌ Erreur lors de la recherche de la carte:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 