'use client';

import { Card } from '@/types';
import { ScryfallService } from '@/lib/scryfall';
import { Card as CardComponent, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Share2, Info, Plus, Minus } from 'lucide-react';
import { useState } from 'react';

interface CardDisplayProps {
  card: Card;
  quantity?: number;
  showActions?: boolean;
  onQuantityChange?: (quantity: number) => void;
  onAddToDeck?: (card: Card) => void;
  onAddToCollection?: (card: Card) => void;
  className?: string;
}

export function CardDisplay({ 
  card, 
  quantity = 1, 
  showActions = true, 
  onQuantityChange,
  onAddToDeck,
  onAddToCollection,
  className 
}: CardDisplayProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 0 && onQuantityChange) {
      onQuantityChange(newQuantity);
    }
  };

  const getManaCostDisplay = (manaCost: string) => {
    // Conversion basique des symboles de mana
    return manaCost
      .replace(/\{W\}/g, '⚪')
      .replace(/\{U\}/g, '🔵')
      .replace(/\{B\}/g, '⚫')
      .replace(/\{R\}/g, '🔴')
      .replace(/\{G\}/g, '🟢')
      .replace(/\{C\}/g, '⚫')
      .replace(/\{(\d+)\}/g, '$1');
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'common': return 'bg-gray-500';
      case 'uncommon': return 'bg-green-500';
      case 'rare': return 'bg-blue-500';
      case 'mythic': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <CardComponent className={`overflow-hidden ${className}`}>
      <div className="relative">
        <img
          src={ScryfallService.getCardImage(card, 'normal')}
          alt={card.name}
          className="w-full h-auto object-cover"
          onError={(e) => {
            e.currentTarget.src = '/placeholder-card.jpg';
          }}
        />
        
        {showActions && (
          <div className="absolute top-2 right-2 flex gap-1">
            <Button
              size="sm"
              variant="secondary"
              className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
              onClick={() => setShowDetails(!showDetails)}
            >
              <Info className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
              onClick={handleLike}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-lg truncate">{card.name}</h3>
            {card.mana_cost && (
              <div className="text-sm text-gray-600 mt-1">
                {getManaCostDisplay(card.mana_cost)}
              </div>
            )}
          </div>
          {onQuantityChange && (
            <div className="flex items-center gap-2 ml-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => handleQuantityChange(quantity - 1)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[20px] text-center">
                {quantity}
              </span>
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => handleQuantityChange(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary" className="text-xs">
            {card.type_line.split('—')[0].trim()}
          </Badge>
          <Badge 
            variant="outline" 
            className={`text-xs ${getRarityColor(card.rarity)} text-white`}
          >
            {card.rarity}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {card.set_name}
          </Badge>
        </div>

        {showDetails && (
          <div className="mt-3 p-3 bg-gray-50 rounded-md text-sm">
            <div className="mb-2">
              <strong>Type complet:</strong> {card.type_line}
            </div>
            {card.oracle_text && (
              <div className="mb-2">
                <strong>Texte:</strong> {card.oracle_text}
              </div>
            )}
            {card.power && card.toughness && (
              <div className="mb-2">
                <strong>Force/Endurance:</strong> {card.power}/{card.toughness}
              </div>
            )}
            {card.prices && (
              <div className="mb-2">
                <strong>Prix:</strong> {ScryfallService.getCardPrice(card, 'eur')}€
              </div>
            )}
          </div>
        )}

        {showActions && (
          <div className="flex gap-2 mt-3">
            {onAddToDeck && (
              <Button 
                size="sm" 
                className="flex-1"
                onClick={() => onAddToDeck(card)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Ajouter au deck
              </Button>
            )}
            {onAddToCollection && (
              <Button 
                size="sm" 
                variant="outline"
                className="flex-1"
                onClick={() => onAddToCollection(card)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Ajouter à la collection
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </CardComponent>
  );
} 