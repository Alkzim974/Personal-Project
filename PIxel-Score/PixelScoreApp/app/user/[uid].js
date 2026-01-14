import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, FlatList, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { auth } from '../../firebaseConfig';
import { getPublicUserProfile, getUserGames, followUser, unfollowUser, checkFollowStatus, getFollowCounts } from '../../services/userService';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import GameCard from '../../components/GameCard';

const { width } = Dimensions.get('window');

export default function PublicProfileScreen() {
  const { uid } = useLocalSearchParams(); // L'ID de l'utilisateur à afficher (cible)
  const router = useRouter();
  const currentUser = auth.currentUser;

  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 });
  
  // Lists Data
  const [activeTab, setActiveTab] = useState('played'); // 'played' or 'backlog'
  const [playedGames, setPlayedGames] = useState([]);
  const [backlogGames, setBacklogGames] = useState([]);
  const [loadingLists, setLoadingLists] = useState(true);

  // Initial Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!uid) return;

        // 1. Profil Public
        const profile = await getPublicUserProfile(uid);
        setUserProfile(profile);

        // 2. Stats Follow
        const counts = await getFollowCounts(uid);
        setFollowCounts(counts);

        // 3. Follow Status (si connecté et pas soi-même)
        if (currentUser && currentUser.uid !== uid) {
          const status = await checkFollowStatus(currentUser.uid, uid);
          setIsFollowing(status);
        }

        // 4. Listes de jeux
        const played = await getUserGames(uid, 'played_games');
        const backlog = await getUserGames(uid, 'backlog_games');
        setPlayedGames(played);
        setBacklogGames(backlog);
        
      } catch (error) {
        console.error("Erreur chargement profil public:", error);
      } finally {
        setLoading(false);
        setLoadingLists(false);
      }
    };
    fetchData();
  }, [uid]);

  const handleFollowAction = async () => {
    if (!currentUser) return;
    
    // Optimistic Update
    const newStatus = !isFollowing;
    setIsFollowing(newStatus);
    setFollowCounts(prev => ({
        ...prev,
        followers: newStatus ? prev.followers + 1 : prev.followers - 1
    }));

    let success;
    if (newStatus) {
      success = await followUser(currentUser.uid, uid);
    } else {
      success = await unfollowUser(currentUser.uid, uid);
    }

    if (!success) {
      // Revert if failed
      setIsFollowing(!newStatus);
      setFollowCounts(prev => ({
          ...prev,
          followers: !newStatus ? prev.followers + 1 : prev.followers - 1
      }));
    }
  };

  // Helper pour l'image de couverture favorites
  const getCoverUrl = (coverObj) => {
    if (!coverObj || !coverObj.url) return null;
    let newUrl = coverObj.url.startsWith('//') ? 'https:' + coverObj.url : coverObj.url;
    return newUrl.replace('t_thumb', 't_cover_big'); 
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!userProfile) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Utilisateur introuvable.</Text>
      </View>
    );
  }

  const isMe = currentUser && currentUser.uid === uid;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.foreground} />
        </TouchableOpacity>
        
        <View style={styles.profileInfo}>
            {userProfile.avatar ? (
                <Image source={{ uri: userProfile.avatar }} style={styles.avatar} />
            ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <Text style={styles.avatarText}>{userProfile.username?.charAt(0).toUpperCase()}</Text>
                </View>
            )}
            
            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{followCounts.followers}</Text>
                    <Text style={styles.statLabel}>Abonnés</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{followCounts.following}</Text>
                    <Text style={styles.statLabel}>Abonnements</Text>
                </View>
            </View>
        </View>

        <View style={styles.bioSection}>
            <Text style={styles.username}>{userProfile.username}</Text>
            {userProfile.bio ? <Text style={styles.bio}>{userProfile.bio}</Text> : null}
            {userProfile.location ? (
                <View style={styles.metaRow}>
                    <Ionicons name="location-outline" size={14} color={Colors.mutedForeground} />
                    <Text style={styles.metaText}>{userProfile.location}</Text>
                </View>
            ) : null}
            {userProfile.website ? (
                <View style={styles.metaRow}>
                    <Ionicons name="link-outline" size={14} color={Colors.mutedForeground} />
                    <Text style={styles.metaText}>{userProfile.website}</Text>
                </View>
            ) : null}
        </View>

        {/* Action Button */}
        {!isMe ? (
            <TouchableOpacity 
                style={[styles.followButton, isFollowing ? styles.followingButton : null]} 
                onPress={handleFollowAction}
            >
                <Text style={[styles.followButtonText, isFollowing ? styles.followingButtonText : null]}>
                    {isFollowing ? 'Abonné' : 'Suivre'}
                </Text>
            </TouchableOpacity>
        ) : (
            <TouchableOpacity 
                style={[styles.followButton, styles.followingButton]} 
                onPress={() => router.push('/profile/settings')}
            >
                <Text style={[styles.followButtonText, styles.followingButtonText]}>
                    Modifier le profil
                </Text>
            </TouchableOpacity>
        )}
      </View>

      {/* Favorites Section */}
      {userProfile.favorites && userProfile.favorites.some(f => f !== null) && (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Jeux Favoris</Text>
            <View style={styles.favoritesGrid}>
                {userProfile.favorites.map((fav, index) => (
                    <View key={index} style={styles.favSlotContainer}>
                         {fav ? (
                             <TouchableOpacity onPress={() => router.push(`/game/${fav.id}`)}>
                                 <Image source={{ uri: getCoverUrl(fav.cover) }} style={styles.favImage} />
                             </TouchableOpacity>
                         ) : (
                             <View style={styles.emptySlot} />
                         )}
                    </View>
                ))}
            </View>
        </View>
      )}

      {/* Lists Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
            style={[styles.tab, activeTab === 'played' && styles.activeTab]} 
            onPress={() => setActiveTab('played')}
        >
            <Text style={[styles.tabText, activeTab === 'played' && styles.activeTabText]}>
                Jeux Joués ({playedGames.length})
            </Text>
        </TouchableOpacity>
        <TouchableOpacity 
            style={[styles.tab, activeTab === 'backlog' && styles.activeTab]} 
            onPress={() => setActiveTab('backlog')}
        >
            <Text style={[styles.tabText, activeTab === 'backlog' && styles.activeTabText]}>
                A faire ({backlogGames.length})
            </Text>
        </TouchableOpacity>
      </View>

      {/* Games List */}
      <View style={styles.listContent}>
        {loadingLists ? (
            <ActivityIndicator color={Colors.primary} />
        ) : (
            (activeTab === 'played' ? playedGames : backlogGames).map((item) => (
                <GameCard key={item.id} game={item} />
            ))
        )}
        {(activeTab === 'played' ? playedGames : backlogGames).length === 0 && (
            <Text style={styles.emptyListText}>Aucun jeu dans cette liste.</Text>
        )}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: Colors.destructive,
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  header: {
    padding: 20,
    paddingTop: 50, // Safe Area fallback
  },
  backButton: {
    marginBottom: 20,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 20,
    backgroundColor: Colors.card,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: Colors.foreground,
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: Colors.mutedForeground,
    fontSize: 12,
  },
  bioSection: {
    marginBottom: 20,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.foreground,
    marginBottom: 5,
  },
  bio: {
    color: Colors.cardForeground,
    fontSize: 14,
    marginBottom: 10,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  metaText: {
    color: Colors.mutedForeground,
    fontSize: 12,
    marginLeft: 5,
  },
  followButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  followingButton: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  followButtonText: {
    color: Colors.primaryForeground,
    fontWeight: 'bold',
    fontSize: 16,
  },
  followingButtonText: {
    color: Colors.foreground,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.foreground,
    marginBottom: 15,
  },
  favoritesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  favSlotContainer: {
    width: '18%', 
    aspectRatio: 0.7,
  },
  favImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
    backgroundColor: Colors.muted,
  },
  emptySlot: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.card,
    borderRadius: 4,
    opacity: 0.3,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    color: Colors.mutedForeground,
    fontWeight: 'bold',
  },
  activeTabText: {
    color: Colors.primary,
  },
  listContent: {
    paddingHorizontal: 20,
  },
  emptyListText: {
    color: Colors.mutedForeground,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
});
