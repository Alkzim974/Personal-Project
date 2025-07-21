'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function TestApiPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testSearch = async () => {
    setLoading(true);
    setError('');
    setResults([]);

    try {
      // Test direct de l'API Scryfall
      const response = await fetch(
        `https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Magic-Manager/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.object === 'error') {
        throw new Error(data.details || 'Erreur API');
      }

      setResults(data.data.slice(0, 5));
    } catch (err: any) {
      setError(err.message);
      console.error('Erreur de test:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Test API Scryfall</h1>
      
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Entrez une recherche (ex: atraxa)"
            className="flex-1"
          />
          <Button onClick={testSearch} disabled={loading || !query.trim()}>
            {loading ? 'Test...' : 'Tester'}
          </Button>
        </div>

        {error && (
          <Card className="p-4 bg-red-50 border-red-200">
            <h3 className="font-semibold text-red-800">Erreur :</h3>
            <p className="text-red-600">{error}</p>
          </Card>
        )}

        {results.length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Résultats ({results.length}) :</h3>
            <div className="space-y-2">
              {results.map((card: any) => (
                <div key={card.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                  <img
                    src={card.image_uris?.small || '/placeholder-card.svg'}
                    alt={card.name}
                    className="w-8 h-10 object-cover rounded"
                  />
                  <div>
                    <p className="font-medium">{card.name}</p>
                    <p className="text-sm text-gray-600">{card.type_line}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
} 