// app/(tabs)/profile.js

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image, Animated } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { auth, db } from '../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { getUserGames } from '../../services/userService';
import GameCard from '../../components/GameCard';
import Colors from '../../constants/Colors';
import { signOut } from 'firebase/auth';

export default function ProfileScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('Gamer');
  const [avatar, setAvatar] = useState(null); // Avatar state
  const [activeTab, setActiveTab] = useState('played'); 
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

  // useFocusEffect permet de recharger les données quand on revient sur l'écran
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setLoading(true);
        fadeAnim.setValue(0); // Reset

        const user = auth.currentUser;
        if (user) {
          // 1. Info User
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUsername(data.username);
            setAvatar(data.avatar || null);
          }

          // 2. Liste de jeux
          const listType = activeTab === 'played' ? 'played_games' : 'backlog_games';
          const userGames = await getUserGames(user.uid, listType);
          setGames(userGames);
        }
        setLoading(false);

        // Animation
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
      };

      fetchData();
    }, [activeTab]) // Recharger si on change d'onglet
  );



  return (
    <View style={styles.container}>
      {/* Header Profil */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.profileInfo} onPress={() => router.push('/profile/settings')}>
            <View style={styles.avatarPlaceholder}>
                {avatar ? (
                    <Image source={{ uri: avatar }} style={styles.avatarImage} />
                ) : (
                    <Text style={styles.avatarText}>{username.charAt(0).toUpperCase()}</Text>
                )}
            </View>
            <View>
                <Text style={styles.username}>{username}</Text>
                <Text style={styles.editProfileText}>Modifier le profil</Text>
            </View>
        </TouchableOpacity>
      </View>

      {/* Onglets Listes */}
      <View style={styles.tabsHeader}>
        <View style={styles.tabs}>
            <TouchableOpacity 
                style={[styles.tab, activeTab === 'played' && styles.activeTab]}
                onPress={() => setActiveTab('played')}
            >
                <Text style={[styles.tabText, activeTab === 'played' && styles.activeTabText]}>
                    Joués
                </Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.tab, activeTab === 'backlog' && styles.activeTab]}
                onPress={() => setActiveTab('backlog')}
            >
                <Text style={[styles.tabText, activeTab === 'backlog' && styles.activeTabText]}>
                    À faire
                </Text>
            </TouchableOpacity>
        </View>

        {/* View Toggle Buttons */}
        <View style={styles.viewToggle}>
            <TouchableOpacity onPress={() => setViewMode('list')} style={[styles.toggleBtn, viewMode === 'list' && styles.activeToggleBtn]}>
                <Text style={[styles.toggleText, viewMode === 'list' && styles.activeToggleText]}>☰</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setViewMode('grid')} style={[styles.toggleBtn, viewMode === 'grid' && styles.activeToggleBtn]}>
                <Text style={[styles.toggleText, viewMode === 'grid' && styles.activeToggleText]}>▦</Text>
            </TouchableOpacity>
        </View>
      </View>

      {/* Liste de Jeux */}
      {loading ? (
        <View style={styles.centerContainer}>
            <ActivityIndicator color={Colors.primary} />
        </View>
      ) : (
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
            <FlatList
                key={viewMode} // Force re-render on mode change
                data={games}
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
                        // List Item Render (Existing)
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
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            {activeTab === 'played' ? "Aucun jeu terminé." : "Ta liste est vide."}
                        </Text>
                        <Text style={styles.emptySubText}>Va dans l'onglet Explorer pour ajouter des jeux !</Text>
                    </View>
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
    paddingTop: 50,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    overflow: 'hidden', // Pour l'image ronde
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.foreground,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    color: Colors.destructive,
    marginTop: 5,
    fontSize: 14,
  },
  editProfileText: {
    color: Colors.mutedForeground,
    fontSize: 12,
    marginTop: 2,
  },
  tabsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 16, // Espace pour les boutons toggle
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 10,
  },
  tabs: {
    flexDirection: 'row',
    flex: 1, // Prend la place restante
  },
  viewToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleBtn: {
    padding: 8,
    marginLeft: 5,
  },
  activeToggleBtn: {
    // Optionnel: ajouter un fond ou changer l'opacité
  },
  toggleText: {
    fontSize: 20,
    color: Colors.mutedForeground,
  },
  activeToggleText: {
    color: Colors.primary,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    marginRight: 10, // un peu d'espace
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: Colors.mutedForeground,
    fontWeight: 'bold',
  },
  activeTabText: {
    color: Colors.primary,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  // Grid Styles
  gridItem: {
    flex: 1/3, // 3 colonnes
    aspectRatio: 0.7, // Portrait
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
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: Colors.mutedForeground,
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: Colors.muted,
  },
});
