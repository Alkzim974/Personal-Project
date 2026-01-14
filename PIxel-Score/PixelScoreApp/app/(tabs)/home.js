// app/(tabs)/home.js

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, FlatList, Animated, Image } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../firebaseConfig';
import { useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { searchGames, getRecentHighRatedGames } from '../../services/igdb';
import GameCard from '../../components/GameCard';
import Colors from '../../constants/Colors';

export default function HomeScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('Gamer');
  const [loadingUser, setLoadingUser] = useState(true); // Chargement user
  
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [games, setGames] = useState([]); // Résultats de recherche
  const [suggestions, setSuggestions] = useState([]); // Suggestions par défaut
  const [loadingGames, setLoadingGames] = useState(false); // Chargement recherche
  
  // Opacité pour l'animation
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // 1. Charger le profil utilisateur ET les suggestions
  useEffect(() => {
    const fetchData = async () => {
      // User Profile
      const user = auth.currentUser;
      if (user) {
        try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) setUsername(userDoc.data().username);
        } catch (e) {
            console.error(e);
        }
      }
      setLoadingUser(false);

      // Suggestions
      const recentGames = await getRecentHighRatedGames();
      setSuggestions(recentGames);
      
      // Animation d'entrée
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 800, useNativeDriver: true
      }).start();
    };

    fetchData();
  }, []);

  // 2. Fonction de recherche
  const handleSearch = async () => {
    if (searchQuery.length < 2) {
        setGames([]); // Reset si recherche trop courte
        return;
    }

    setLoadingGames(true);
    // On ne reset pas l'animation ici pour garder la fluidité
    
    const results = await searchGames(searchQuery);
    setGames(results || []); 
    setLoadingGames(false);
  };
  
  // Effet pour lancer la recherche (ou reset) quand le texte change
  // Note: j'ai enlevé le bouton Go explicite pour un UX plus fluide si on veut, 
  // mais ici on garde la logique "onSubmit" pour éviter trop d'appels,
  // SAUF si on efface le texte -> retour aux suggestions.
  useEffect(() => {
    if (searchQuery.length === 0) {
        setGames([]); // Retour aux suggestions
    }
  }, [searchQuery]);


  const handleLogout = async () => {
    await signOut(auth);
    router.replace('/auth/login');
  };

  if (loadingUser) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Détermine la liste à afficher
  const checkResults = searchQuery.length > 0; // Est-ce qu'on cherche ?
  const displayList = checkResults ? games : suggestions;
  const listTitle = checkResults ? (loadingGames ? "Recherche..." : "Résultats") : "💎 Pépites du Moment";

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Bonjour, {username}</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>
      </View>

      {/* Barre de Recherche */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un jeu (ex: Zelda)..."
          placeholderTextColor="#aaa"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch} 
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Go</Text>
        </TouchableOpacity>
      </View>

      {/* Header Section (Titre + Toggle) */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{listTitle}</Text>
        
        {/* Toggle Buttons */}
        <View style={styles.viewToggle}>
            <TouchableOpacity onPress={() => setViewMode('list')} style={[styles.toggleBtn, viewMode === 'list' && styles.activeToggleBtn]}>
                <Text style={[styles.toggleText, viewMode === 'list' && styles.activeToggleText]}>☰</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setViewMode('grid')} style={[styles.toggleBtn, viewMode === 'grid' && styles.activeToggleBtn]}>
                <Text style={[styles.toggleText, viewMode === 'grid' && styles.activeToggleText]}>▦</Text>
            </TouchableOpacity>
        </View>
      </View>

      {/* Résultats ou Suggestions */}
      {loadingGames ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 20 }} />
      ) : (
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
            <FlatList
                key={viewMode} // Force re-render on mode change
                data={displayList}
                keyExtractor={(item) => item.id.toString()}
                numColumns={viewMode === 'grid' ? 3 : 1}
                renderItem={({ item }) => {
                    if (viewMode === 'grid') {
                        // Grid Item Render
                        const coverUrl = item.cover && item.cover.url 
                            ? (item.cover.url.startsWith('//') ? 'https:' + item.cover.url : item.cover.url).replace('t_thumb', 't_cover_big')
                            : null;
                        
                        return (
                            <TouchableOpacity 
                                style={styles.gridItem} 
                                onPress={() => router.push(`/game/${item.id}`)}
                            >
                                {coverUrl ? (
                                    <Image source={{ uri: coverUrl }} style={styles.gridImage} />
                                ) : (
                                    <View style={[styles.gridImage, styles.gridPlaceholder]}>
                                        <Text style={styles.gridTitle}>{item.name}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    } else {
                        // List Item Render
                        return (
                            <GameCard 
                                game={item} 
                                onPress={() => router.push(`/game/${item.id}`)} 
                            />
                        );
                    }
                }}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>
                        {checkResults ? "Aucun jeu trouvé." : "Aucune suggestion disponible."}
                    </Text>
                }
            />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 50, // Pour éviter la barre de statut (notch)
    paddingHorizontal: 16,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.foreground,
  },
  logoutButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Colors.card,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  logoutText: {
    color: Colors.destructive, // Rouge pour déconnexion
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    height: 50,
    backgroundColor: Colors.input,
    borderRadius: 8,
    paddingHorizontal: 15,
    color: Colors.foreground,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 10,
  },
  searchButton: {
    width: 50,
    height: 50,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    color: Colors.primaryForeground,
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingRight: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary,
    marginLeft: 5,
  },
  viewToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleBtn: {
    padding: 8,
    marginLeft: 5,
  },
  toggleText: {
    fontSize: 20,
    color: Colors.mutedForeground,
  },
  activeToggleText: {
    color: Colors.primary,
  },
  listContent: {
    paddingBottom: 20,
  },
  // Grid Styles
  gridItem: {
    flex: 1/3, 
    aspectRatio: 0.7, 
    margin: 4,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: Colors.card,
  },
  gridPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  gridTitle: {
    color: Colors.mutedForeground,
    fontSize: 10,
    textAlign: 'center',
  },
  emptyText: {
    color: Colors.mutedForeground,
    textAlign: 'center',
    marginTop: 20,
  },
});
