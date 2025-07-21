'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScryfallService } from '@/lib/scryfall';
import { LocalCardService } from '@/lib/localCardService';

export default function TestHybridPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<any>(null);

  const testHybridSearch = async () => {
    setLoading(true);
    setError('');
    setResults([]);

    try {
      const startTime = performance.now();
      const searchResults = await ScryfallService.searchCardAdvanced(query, false);
      const endTime = performance.now();
      
      setResults(searchResults);
      console.log(`Recherche effectuée en ${(endTime - startTime).toFixed(2)}ms`);
    } catch (err: any) {
      setError(err.message);
      console.error('Erreur de recherche hybride:', err);
    } finally {
      setLoading(false);
    }
  };

  const testCopyPaste = async (testName: string) => {
    setQuery(testName);
    setLoading(true);
    setError('');
    setResults([]);

    try {
      const startTime = performance.now();
      const searchResults = await ScryfallService.searchCardAdvanced(testName, false);
      const endTime = performance.now();
      
      setResults(searchResults);
      console.log(`Test "${testName}" : ${(endTime - startTime).toFixed(2)}ms, ${searchResults.length} résultats`);
    } catch (err: any) {
      setError(err.message);
      console.error('Erreur de test copier-coller:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadLocalCards = async () => {
    setLoading(true);
    try {
      await LocalCardService.loadCards();
      const stats = LocalCardService.getStats();
      setStats(stats);
      console.log('✅ Cartes locales chargées:', stats);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Test Système Hybride</h1>
      
      <div className="space-y-6">
        {/* Chargement des cartes locales */}
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-2">1. Chargement des cartes locales</h2>
          <p className="text-sm text-gray-600 mb-3">
            Fichier détecté : <code>data/default-cards-english-mtg.json</code>
          </p>
          <Button onClick={loadLocalCards} disabled={loading}>
            {loading ? 'Chargement...' : 'Charger les cartes locales'}
          </Button>
          {stats && (
            <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-800">
                ✅ {stats.totalCards} cartes chargées, {stats.indexedKeys} clés indexées
              </p>
            </div>
          )}
        </Card>

        {/* Test de recherche */}
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-2">2. Test de recherche hybride</h2>
          <div className="flex gap-2 mb-3">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Entrez une recherche (ex: atraxa, jace, instant)"
              className="flex-1"
            />
            <Button onClick={testHybridSearch} disabled={loading || !query.trim()}>
              {loading ? 'Recherche...' : 'Rechercher'}
            </Button>
          </div>
          
          <div className="text-sm text-gray-600 mb-3">
            <p>Le système essaie d'abord la recherche locale, puis l'API Scryfall en fallback.</p>
            <p>Regardez la console pour voir les logs de performance.</p>
          </div>
        </Card>

        {/* Tests de copier-coller */}
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-2">3. Tests de copier-coller</h2>
          <p className="text-sm text-gray-600 mb-3">
            Testez différents formats de noms de cartes copiés-collés
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => testCopyPaste('Atraxa, Praetors\' Voice')}
              disabled={loading}
            >
              Test: "Atraxa, Praetors' Voice"
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => testCopyPaste('Jace, the Mind Sculptor')}
              disabled={loading}
            >
              Test: "Jace, the Mind Sculptor"
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => testCopyPaste('Lightning Bolt')}
              disabled={loading}
            >
              Test: "Lightning Bolt"
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => testCopyPaste('Sol Ring')}
              disabled={loading}
            >
              Test: "Sol Ring"
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => testCopyPaste('Counterspell')}
              disabled={loading}
            >
              Test: "Counterspell"
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => testCopyPaste('Swords to Plowshares')}
              disabled={loading}
            >
              Test: "Swords to Plowshares"
            </Button>
          </div>
        </Card>

        {/* Résultats */}
        {error && (
          <Card className="p-4 bg-red-50 border-red-200">
            <h3 className="font-semibold text-red-800">Erreur :</h3>
            <p className="text-red-600">{error}</p>
          </Card>
        )}

        {results.length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Résultats ({results.length}) :</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {results.map((card: any) => (
                <div key={card.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                  <img
                    src={card.imageUrl || card.image_uris?.small || '/placeholder-card.svg'}
                    alt={card.name}
                    className="w-8 h-10 object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-card.svg';
                    }}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{card.name}</p>
                    <p className="text-xs text-gray-600">{card.type_line}</p>
                    <p className="text-xs text-gray-500">{card.set_name}</p>
                  </div>
                  {card.legalities?.commander && (
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                      {card.legalities.commander === 'legal' ? 'Commander' : card.legalities.commander}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Instructions */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">Instructions :</h3>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. ✅ Fichier <code>default-cards-english-mtg.json</code> détecté</li>
            <li>2. ✅ Fichier placé dans le dossier <code>Magic-manager/data/</code></li>
            <li>3. Cliquez sur "Charger les cartes locales"</li>
            <li>4. Testez la recherche hybride</li>
            <li>5. Vérifiez les performances dans la console</li>
          </ol>
        </Card>
      </div>
    </div>
  );
} 