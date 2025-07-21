'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/types';
import { ScryfallService } from '@/lib/scryfall';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card as CardComponent } from '@/components/ui/card';
import { Search, Loader2, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CardSearchProps {
  onCardSelect: (card: Card) => void;
  placeholder?: string;
  className?: string;
  isCommanderSearch?: boolean;
  commanderColorIdentity?: string[];
}

// Cartes populaires pour les suggestions
const POPULAR_CARDS = [
  { name: 'Sol Ring', id: 'sol-ring' },
  { name: 'Lightning Bolt', id: 'lightning-bolt' },
  { name: 'Counterspell', id: 'counterspell' },
  { name: 'Swords to Plowshares', id: 'swords-to-plowshares' },
  { name: 'Cultivate', id: 'cultivate' },
  { name: 'Arcane Signet', id: 'arcane-signet' },
  { name: 'Command Tower', id: 'command-tower' },
  { name: 'Evolving Wilds', id: 'evolving-wilds' },
  { name: 'Terramorphic Expanse', id: 'terramorphic-expanse' },
  { name: 'Mind Stone', id: 'mind-stone' },
];

export function CardSearch({ 
  onCardSelect, 
  placeholder = "Rechercher une carte...", 
  className, 
  isCommanderSearch = false, 
  commanderColorIdentity 
}: CardSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Card[]>([]);
  const [suggestions, setSuggestions] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  // Charger les suggestions de cartes populaires
  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const popularCards: Card[] = [];
        
        for (const popularCard of POPULAR_CARDS) {
          try {
            const response = await fetch(`https://api.scryfall.com/cards/${popularCard.id}`);
            if (response.ok) {
              const scryfallCard = await response.json();
              const card = ScryfallService.transformCard(scryfallCard);
              
              // Filtrer selon les critères Commander si nécessaire
              if (isCommanderSearch) {
                if (card.legalities?.commander !== 'legal') continue;
                if (commanderColorIdentity && commanderColorIdentity.length >= 0) {
                  if (!ScryfallService.validateCardCommanderIdentity(card, commanderColorIdentity)) continue;
                }
              }
              
              popularCards.push(card);
            }
          } catch (error) {
            console.error(`Erreur lors du chargement de ${popularCard.name}:`, error);
          }
        }
        
        setSuggestions(popularCards);
      } catch (error) {
        console.error('Erreur lors du chargement des suggestions:', error);
      }
    };

    loadSuggestions();
  }, [isCommanderSearch, commanderColorIdentity]);

  useEffect(() => {
    // Fermer les résultats quand on clique en dehors
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (query.length < 2) {
      setResults([]);
      setShowResults(false);
      setShowSuggestions(true);
      return;
    }

    setLoading(true);
    setShowSuggestions(false);
    
    searchTimeout.current = setTimeout(async () => {
      try {
        const searchResults = await ScryfallService.searchCard(query, isCommanderSearch);
        setResults(searchResults);
        setShowResults(searchResults.length > 0);
      } catch (error) {
        console.error('Erreur lors de la recherche:', error);
        setResults([]);
        setShowResults(false);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [query, isCommanderSearch, commanderColorIdentity]);

  const handleCardSelect = (card: Card) => {
    onCardSelect(card);
    setQuery('');
    setShowResults(false);
    setShowSuggestions(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleInputFocus = () => {
    if (query.length < 2) {
      setShowSuggestions(true);
    } else if (results.length > 0) {
      setShowResults(true);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 animate-spin" />
        )}
      </div>

      {/* Suggestions de cartes populaires */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">Cartes populaires</span>
            </div>
          </div>
          <div className="py-2">
            {suggestions.map((card) => (
              <div
                key={card.id}
                className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                onClick={() => handleCardSelect(card)}
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={card.imageUrl || card.image_uris?.small || '/placeholder-card.svg'}
                    alt={card.name}
                    className="w-12 h-16 object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-card.svg';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-sm truncate">{card.name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {card.type_line?.split('—')[0].trim()}
                          </span>
                          {card.mana_cost && (
                            <span className="text-xs text-muted-foreground">
                              {card.mana_cost}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {card.set_name}
                          </span>
                        </div>
                        {card.legalities?.commander && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {card.legalities.commander === 'legal' ? 'Commander' : card.legalities.commander}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Résultats de recherche */}
      {showResults && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-96 overflow-y-auto">
          {results.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Aucune carte trouvée
            </div>
          ) : (
            <div className="py-2">
              {results.map((card) => (
                <div
                  key={card.id}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => handleCardSelect(card)}
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={card.imageUrl || card.image_uris?.small || '/placeholder-card.svg'}
                      alt={card.name}
                      className="w-12 h-16 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-card.svg';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-sm truncate">{card.name}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {card.type_line?.split('—')[0].trim()}
                            </span>
                            {card.mana_cost && (
                              <span className="text-xs text-muted-foreground">
                                {card.mana_cost}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {card.set_name}
                            </span>
                          </div>
                          {card.legalities?.commander && (
                            <Badge variant="outline" className="text-xs mt-1">
                              {card.legalities.commander === 'legal' ? 'Commander' : card.legalities.commander}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 