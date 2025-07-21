'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Minus, 
  Trash2, 
  Edit3,
  Eye,
  Star,
  DollarSign
} from 'lucide-react';
import { Card as MagicCard } from '@/types';

interface CollectionCardProps {
  card: MagicCard;
  quantity: number;
  condition: 'mint' | 'near_mint' | 'lightly_played' | 'moderately_played' | 'heavily_played' | 'damaged';
  isFoil: boolean;
  language: 'en' | 'fr';
  isSelected?: boolean;
  onSelect?: (cardId: string) => void;
  onQuantityChange?: (cardId: string, quantity: number) => void;
  onConditionChange?: (cardId: string, condition: string) => void;
  onDelete?: (cardId: string) => void;
}

/**
 * Composant pour afficher une carte dans la collection
 * 
 * Permet de :
 * - Voir les détails de la carte
 * - Modifier la quantité
 * - Changer la condition
 * - Supprimer la carte
 */

export default function CollectionCard({
  card,
  quantity,
  condition,
  isFoil,
  language,
  isSelected = false,
  onSelect,
  onQuantityChange,
  onConditionChange,
  onDelete
}: CollectionCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  const conditionLabels = {
    mint: 'Mint',
    near_mint: 'Near Mint',
    lightly_played: 'Lightly Played',
    moderately_played: 'Moderately Played',
    heavily_played: 'Heavily Played',
    damaged: 'Damaged'
  };

  const conditionColors = {
    mint: 'bg-green-100 text-green-800',
    near_mint: 'bg-blue-100 text-blue-800',
    lightly_played: 'bg-yellow-100 text-yellow-800',
    moderately_played: 'bg-orange-100 text-orange-800',
    heavily_played: 'bg-red-100 text-red-800',
    damaged: 'bg-gray-100 text-gray-800'
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(0, quantity + delta);
    onQuantityChange?.(card.id, newQuantity);
  };

  const handleConditionChange = (newCondition: string) => {
    onConditionChange?.(card.id, newCondition);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette carte de votre collection ?')) {
      onDelete?.(card.id);
    }
  };

  const getCardImage = () => {
    return card.image_uris?.normal || '/placeholder-card.jpg';
  };

  const getCardPrice = () => {
    if (isFoil) {
      return card.prices?.eur_foil || card.prices?.eur || '0';
    }
    return card.prices?.eur || '0';
  };

  return (
    <Card 
      className={`relative overflow-hidden transition-all hover:shadow-lg ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
    >
      <div className="relative">
        {/* Image de la carte */}
        <div className="relative aspect-[745/1040] bg-gray-100">
          <img
            src={getCardImage()}
            alt={card.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          
          {/* Overlay pour la sélection */}
          {onSelect && (
            <div 
              className={`absolute inset-0 cursor-pointer transition-colors ${
                isSelected ? 'bg-blue-500 bg-opacity-20' : 'hover:bg-black hover:bg-opacity-10'
              }`}
              onClick={() => onSelect(card.id)}
            />
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {isFoil && (
              <Badge variant="secondary" className="text-xs">
                Foil
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {language.toUpperCase()}
            </Badge>
          </div>

          {/* Prix */}
          <div className="absolute top-2 right-2">
            <Badge className="bg-green-600 text-white text-xs">
              <DollarSign className="h-3 w-3 mr-1" />
              {parseFloat(getCardPrice()).toFixed(2)}€
            </Badge>
          </div>

          {/* Condition */}
          <div className="absolute bottom-2 left-2">
            <Badge className={`text-xs ${conditionColors[condition]}`}>
              {conditionLabels[condition]}
            </Badge>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="secondary"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit3 className="h-3 w-3" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={handleDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <CardContent className="p-3">
        {/* Informations de la carte */}
        <div className="space-y-2">
          <h3 className="font-medium text-sm line-clamp-2" title={card.name}>
            {card.name}
          </h3>
          
          <div className="text-xs text-gray-600 space-y-1">
            <div>{card.set_name}</div>
            <div className="flex items-center justify-between">
              <span>{card.rarity}</span>
              <span>{card.collector_number}</span>
            </div>
          </div>

          {/* Contrôles de quantité */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 0}
              >
                <Minus className="h-3 w-3" />
              </Button>
              
              <span className="text-sm font-medium min-w-[2rem] text-center">
                {quantity}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => handleQuantityChange(1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            {/* Valeur totale */}
            <div className="text-xs text-gray-600">
              {(parseFloat(getCardPrice()) * quantity).toFixed(2)}€
            </div>
          </div>

          {/* Éditeur de condition */}
          {isEditing && (
            <div className="mt-2 p-2 bg-gray-50 rounded border">
              <div className="text-xs font-medium mb-2">Changer la condition :</div>
              <div className="grid grid-cols-2 gap-1">
                {Object.entries(conditionLabels).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => handleConditionChange(key)}
                    className={`text-xs p-1 rounded border transition-colors ${
                      condition === key
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 