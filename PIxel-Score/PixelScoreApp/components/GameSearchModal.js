// components/GameSearchModal.js

import React, { useState } from 'react';
import { View, Text, Modal, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { searchGames } from '../services/igdb';
import Colors from '../constants/Colors';
import GameCard from './GameCard';

export default function GameSearchModal({ visible, onClose, onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (query.length < 2) return;
    setLoading(true);
    const games = await searchGames(query);
    setResults(games || []);
    setLoading(false);
  };

  const handleSelect = (game) => {
    onSelect(game);
    onClose();
    // Reset state
    setQuery('');
    setResults([]);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header Modal */}
        <View style={styles.header}>
            <Text style={styles.title}>Choisir un jeu</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeText}>Fermer</Text>
            </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
            <TextInput
                style={styles.input}
                placeholder="Rechercher..."
                placeholderTextColor={Colors.mutedForeground}
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={handleSearch}
                autoFocus={true}
            />
            <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
                <Text style={styles.searchBtnText}>🔍</Text>
            </TouchableOpacity>
        </View>

        {/* Results */}
        {loading ? (
            <ActivityIndicator color={Colors.primary} size="large" style={{ marginTop: 20 }} />
        ) : (
            <FlatList
                data={results}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handleSelect(item)}>
                        {/* On réutilise GameCard mais en désactivant son onPress interne si besoin, 
                            ou on l'enveloppe juste. Ici GameCard a un prop onPress. */}
                        <View pointerEvents="none"> 
                             {/* pointerEvents="none" pour que le clic soit géré par le TouchableOpacity parent 
                                 et non par le GameCard (s'il a des boutons interactifs, ce qui n'est pas le cas ici) */}
                             <GameCard game={item} />
                        </View>
                    </TouchableOpacity>
                )}
                contentContainerStyle={styles.list}
            />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.foreground,
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.input,
    padding: 12,
    borderRadius: 8,
    color: Colors.foreground,
    marginRight: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchBtn: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBtnText: {
    fontSize: 20,
  },
  list: {
    paddingBottom: 40,
  },
});
