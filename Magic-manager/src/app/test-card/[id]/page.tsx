'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function TestCardPage({ params }: { params: { id: string } }) {
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testCard = async (cardId: string) => {
    setLoading(true);
    setError('');
    setCard(null);

    try {
      // Test 1: Vérifier si la carte existe en base
      const dbResponse = await fetch(`/api/cards/${cardId}`);
      if (dbResponse.ok) {
        const dbCard = await dbResponse.json();
        setCard({ source: 'Database', data: dbCard });
        return;
      }

      // Test 2: Récupérer depuis Scryfall
      const scryfallResponse = await fetch(`https://api.scryfall.com/cards/${cardId}`);
      if (scryfallResponse.ok) {
        const scryfallCard = await scryfallResponse.json();
        setCard({ source: 'Scryfall', data: scryfallCard });
        return;
      }

      setError('Carte non trouvée');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      testCard(params.id);
    }
  }, [params.id]);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Test Carte: {params.id}</h1>
      
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Entrez un ID de carte"
            defaultValue={params.id}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                testCard(e.currentTarget.value);
              }
            }}
          />
          <Button onClick={() => testCard(params.id)} disabled={loading}>
            {loading ? 'Test...' : 'Tester'}
          </Button>
        </div>

        {error && (
          <Card className="p-4 bg-red-50 border-red-200">
            <h3 className="font-semibold text-red-800">Erreur :</h3>
            <p className="text-red-600">{error}</p>
          </Card>
        )}

        {card && (
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Carte trouvée ({card.source}) :</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <img
                  src={card.data.imageUrl || card.data.image_uris?.normal || '/placeholder-card.svg'}
                  alt={card.data.name}
                  className="w-16 h-24 object-cover rounded"
                />
                <div>
                  <p className="font-medium">{card.data.name}</p>
                  <p className="text-sm text-gray-600">{card.data.type_line || card.data.typeLine}</p>
                  <p className="text-sm text-gray-500">{card.data.set_name || card.data.setName}</p>
                  {card.data.legalities?.commander && (
                    <p className="text-sm text-blue-600">
                      Commander: {card.data.legalities.commander}
                    </p>
                  )}
                </div>
              </div>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(card.data, null, 2)}
              </pre>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
} 