'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Palette,
  Zap,
  Shield,
  Heart,
  Star
} from 'lucide-react';
import { Card as MagicCard } from '@/types';

interface CollectionStatsProps {
  cards: MagicCard[];
}

/**
 * Composant pour afficher les statistiques de la collection
 * 
 * Affiche :
 * - Nombre total de cartes
 * - Valeur estimée
 * - Répartition par couleur
 * - Répartition par rareté
 * - Formats légaux
 */

export default function CollectionStats({ cards }: CollectionStatsProps) {
  // Calcul des statistiques
  const totalCards = cards.length;
  const uniqueCards = new Set(cards.map(card => card.id)).size;
  
  // Calcul de la valeur estimée
  const totalValue = cards.reduce((sum, card) => {
    const price = card.prices?.eur ? parseFloat(card.prices.eur) : 0;
    return sum + price;
  }, 0);

  // Répartition par couleur
  const colorStats = cards.reduce((acc, card) => {
    const colors = card.colors || [];
    if (colors.length === 0) {
      acc['Incolore'] = (acc['Incolore'] || 0) + 1;
    } else {
      colors.forEach(color => {
        const colorName = getColorName(color);
        acc[colorName] = (acc[colorName] || 0) + 1;
      });
    }
    return acc;
  }, {} as Record<string, number>);

  // Répartition par rareté
  const rarityStats = cards.reduce((acc, card) => {
    const rarity = card.rarity || 'Unknown';
    acc[rarity] = (acc[rarity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Formats légaux
  const formatStats = cards.reduce((acc, card) => {
    const legalities = card.legalities || {};
    Object.entries(legalities).forEach(([format, status]) => {
      if (status === 'legal') {
        acc[format] = (acc[format] || 0) + 1;
      }
    });
    return acc;
  }, {} as Record<string, number>);

  const getColorName = (color: string) => {
    const colorMap: Record<string, string> = {
      'W': 'Blanc',
      'U': 'Bleu',
      'B': 'Noir',
      'R': 'Rouge',
      'G': 'Vert'
    };
    return colorMap[color] || color;
  };

  const getRarityName = (rarity: string) => {
    const rarityMap: Record<string, string> = {
      'common': 'Commune',
      'uncommon': 'Peu commune',
      'rare': 'Rare',
      'mythic': 'Mythique'
    };
    return rarityMap[rarity] || rarity;
  };

  const getFormatName = (format: string) => {
    const formatMap: Record<string, string> = {
      'standard': 'Standard',
      'pioneer': 'Pioneer',
      'modern': 'Modern',
      'legacy': 'Legacy',
      'vintage': 'Vintage',
      'commander': 'Commander'
    };
    return formatMap[format] || format;
  };

  return (
    <div className="space-y-6">
      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de cartes</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCards}</div>
            <p className="text-xs text-muted-foreground">
              {uniqueCards} cartes uniques
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur estimée</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalValue.toFixed(2)}€
            </div>
            <p className="text-xs text-muted-foreground">
              Prix moyen: {(totalValue / totalCards || 0).toFixed(2)}€
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Couleurs</CardTitle>
            <Palette className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(colorStats).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Couleurs représentées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Formats</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(formatStats).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Formats supportés
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Répartition par couleur */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Répartition par couleur
          </CardTitle>
          <CardDescription>
            Nombre de cartes par couleur d&apos;identité
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(colorStats).length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Object.entries(colorStats)
                .sort(([,a], [,b]) => b - a)
                .map(([color, count]) => (
                  <div key={color} className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{count}</div>
                    <div className="text-sm text-gray-600">{color}</div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              Aucune carte dans la collection
            </p>
          )}
        </CardContent>
      </Card>

      {/* Répartition par rareté */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Répartition par rareté
          </CardTitle>
          <CardDescription>
            Nombre de cartes par niveau de rareté
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(rarityStats).length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(rarityStats)
                .sort(([,a], [,b]) => b - a)
                .map(([rarity, count]) => (
                  <div key={rarity} className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{count}</div>
                    <div className="text-sm text-gray-600">
                      {getRarityName(rarity)}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              Aucune carte dans la collection
            </p>
          )}
        </CardContent>
      </Card>

      {/* Formats légaux */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Formats légaux
          </CardTitle>
          <CardDescription>
            Nombre de cartes légales par format
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(formatStats).length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(formatStats)
                .sort(([,a], [,b]) => b - a)
                .map(([format, count]) => (
                  <div key={format} className="text-center">
                    <div className="text-2xl font-bold text-green-600">{count}</div>
                    <div className="text-sm text-gray-600">
                      {getFormatName(format)}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              Aucune carte légale dans les formats populaires
            </p>
          )}
        </CardContent>
      </Card>

      {/* Cartes les plus précieuses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Cartes les plus précieuses
          </CardTitle>
          <CardDescription>
            Top 5 des cartes les plus chères de votre collection
          </CardDescription>
        </CardHeader>
        <CardContent>
          {cards.length > 0 ? (
            <div className="space-y-3">
              {cards
                .filter(card => card.prices?.eur)
                .sort((a, b) => {
                  const priceA = parseFloat(a.prices?.eur || '0');
                  const priceB = parseFloat(b.prices?.eur || '0');
                  return priceB - priceA;
                })
                .slice(0, 5)
                .map((card, index) => (
                  <div key={card.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-lg font-bold text-gray-400">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{card.name}</div>
                        <div className="text-sm text-gray-600">
                          {card.set_name} • {card.rarity}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        {parseFloat(card.prices?.eur || '0').toFixed(2)}€
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              Aucune carte dans la collection
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 