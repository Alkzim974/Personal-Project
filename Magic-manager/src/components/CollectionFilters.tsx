'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Filter, 
  X, 
  Palette,
  Star,
  Shield,
  DollarSign
} from 'lucide-react';

/**
 * Composant pour filtrer les cartes de la collection
 * 
 * Permet de filtrer par :
 * - Couleur
 * - Rareté
 * - Format légal
 * - Fourchette de prix
 * - Set
 */

export default function CollectionFilters() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string[] | undefined>>({});

  const colorOptions = [
    { value: 'W', label: 'Blanc', color: 'bg-white border-gray-300' },
    { value: 'U', label: 'Bleu', color: 'bg-blue-500' },
    { value: 'B', label: 'Noir', color: 'bg-gray-800' },
    { value: 'R', label: 'Rouge', color: 'bg-red-500' },
    { value: 'G', label: 'Vert', color: 'bg-green-500' },
    { value: 'C', label: 'Incolore', color: 'bg-gray-300' }
  ];

  const rarityOptions = [
    { value: 'common', label: 'Commune' },
    { value: 'uncommon', label: 'Peu commune' },
    { value: 'rare', label: 'Rare' },
    { value: 'mythic', label: 'Mythique' }
  ];

  const formatOptions = [
    { value: 'standard', label: 'Standard' },
    { value: 'pioneer', label: 'Pioneer' },
    { value: 'modern', label: 'Modern' },
    { value: 'legacy', label: 'Legacy' },
    { value: 'vintage', label: 'Vintage' },
    { value: 'commander', label: 'Commander' }
  ];

  const priceRanges = [
    { value: '0-1', label: '0-1€' },
    { value: '1-5', label: '1-5€' },
    { value: '5-10', label: '5-10€' },
    { value: '10-25', label: '10-25€' },
    { value: '25-50', label: '25-50€' },
    { value: '50+', label: '50€+' }
  ];

  const toggleFilter = (category: string, value: string) => {
    setActiveFilters(prev => {
      const current = prev[category] || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      
      return {
        ...prev,
        [category]: updated.length > 0 ? updated : undefined
      };
    });
  };

  const clearFilters = () => {
    setActiveFilters({});
  };

  const getActiveFiltersCount = () => {
    return Object.values(activeFilters).reduce((sum, filters) => sum + (filters?.length || 0), 0);
  };

  const getFilterLabel = (category: string, value: string) => {
    switch (category) {
      case 'colors':
        return colorOptions.find(opt => opt.value === value)?.label || value;
      case 'rarity':
        return rarityOptions.find(opt => opt.value === value)?.label || value;
      case 'format':
        return formatOptions.find(opt => opt.value === value)?.label || value;
      case 'price':
        return priceRanges.find(opt => opt.value === value)?.label || value;
      default:
        return value;
    }
  };

  return (
    <div className="relative">
      {/* Bouton de filtre */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Filter className="h-4 w-4" />
        Filtres
        {getActiveFiltersCount() > 0 && (
          <Badge variant="secondary" className="ml-1">
            {getActiveFiltersCount()}
          </Badge>
        )}
      </Button>

      {/* Filtres actifs */}
      {getActiveFiltersCount() > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {Object.entries(activeFilters).map(([category, values]) =>
            values?.map(value => (
              <Badge
                key={`${category}-${value}`}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {getFilterLabel(category, value)}
                <button
                  onClick={() => toggleFilter(category, value)}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            Effacer tout
          </Button>
        </div>
      )}

      {/* Panneau de filtres */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Filtres</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {/* Filtre par couleur */}
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Couleur
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {colorOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => toggleFilter('colors', option.value)}
                    className={`p-2 rounded border text-sm transition-colors ${
                      activeFilters.colors?.includes(option.value)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full mx-auto mb-1 ${option.color}`}></div>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtre par rareté */}
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Star className="h-4 w-4" />
                Rareté
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {rarityOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => toggleFilter('rarity', option.value)}
                    className={`p-2 rounded border text-sm transition-colors ${
                      activeFilters.rarity?.includes(option.value)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtre par format */}
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Format légal
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {formatOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => toggleFilter('format', option.value)}
                    className={`p-2 rounded border text-sm transition-colors ${
                      activeFilters.format?.includes(option.value)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtre par prix */}
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Fourchette de prix
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {priceRanges.map(option => (
                  <button
                    key={option.value}
                    onClick={() => toggleFilter('price', option.value)}
                    className={`p-2 rounded border text-sm transition-colors ${
                      activeFilters.price?.includes(option.value)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="flex-1"
            >
              Effacer tout
            </Button>
            <Button
              size="sm"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Appliquer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 