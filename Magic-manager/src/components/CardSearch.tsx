'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/types';
import { ScryfallService } from '@/lib/scryfall';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card as CardComponent } from '@/components/ui/card';
import { Search, Loader2 } from 'lucide-react';

interface CardSearchProps {
  onCardSelect: (card: Card) => void;
  placeholder?: string;
  className?: string;
}

export function CardSearch({ onCardSelect, placeholder = "Rechercher une carte...", className }: CardSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fermer les résultats quand on clique en dehors
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
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
      return;
    }

    setLoading(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const searchResults = await ScryfallService.searchCard(query);
        setResults(searchResults.slice(0, 10)); // Limiter à 10 résultats
        setShowResults(true);
      } catch (error) {
        console.error('Erreur lors de la recherche:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300); // Délai de 300ms pour éviter trop de requêtes

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [query]);

  const handleCardSelect = (card: Card) => {
    onCardSelect(card);
    setQuery('');
    setShowResults(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleInputFocus = () => {
    if (results.length > 0) {
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

      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-96 overflow-y-auto">
          {results.map((card) => (
            <div
              key={card.id}
              className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              onClick={() => handleCardSelect(card)}
            >
              <div className="flex-shrink-0 mr-3">
                <img
                  src={ScryfallService.getCardImage(card, 'small')}
                  alt={card.name}
                  className="w-12 h-16 object-cover rounded"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/48x64/2a2a2a/ffffff?text=Card';
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {card.name}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {card.type_line}
                </div>
                <div className="text-xs text-gray-400">
                  {card.set_name} • {card.rarity}
                </div>
              </div>
              <div className="flex-shrink-0 ml-2">
                <Button size="sm" variant="outline">
                  Ajouter
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showResults && results.length === 0 && !loading && query.length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4 text-center text-gray-500">
          Aucune carte trouvée
        </div>
      )}
    </div>
  );
} 