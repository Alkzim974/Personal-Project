import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // Chemin vers votre fichier JSON
    const jsonPath = path.join(process.cwd(), 'data', 'default-cards-english-mtg.json');
    
    console.log('📁 Chargement du fichier:', jsonPath);
    
    // Lire le fichier JSON
    const jsonData = await fs.readFile(jsonPath, 'utf-8');
    const cards = JSON.parse(jsonData);
    
    console.log(`✅ ${cards.length} cartes chargées depuis le fichier local`);
    
    // Retourner les données avec cache
    return NextResponse.json(cards, {
      headers: {
        'Cache-Control': 'public, max-age=3600', // Cache 1 heure
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('❌ Erreur lors du chargement des cartes:', error);
    
    return NextResponse.json(
      { error: 'Impossible de charger les cartes locales. Vérifiez que le fichier default-cards-english-mtg.json existe dans le dossier data/' },
      { status: 500 }
    );
  }
} 