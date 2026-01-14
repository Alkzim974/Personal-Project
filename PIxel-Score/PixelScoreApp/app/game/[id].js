// app/game/[id].js

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, Animated, Dimensions, TouchableWithoutFeedback, Alert, ImageBackground, Easing } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getGameDetails } from '../../services/igdb';
import { auth } from '../../firebaseConfig';
import { checkGameStatus, addGameToList, removeGameFromList } from '../../services/userService';
import { addReview, getGameReviews, deleteReview } from '../../services/reviewService';
import Colors from '../../constants/Colors';
import RatingModal from '../../components/RatingModal';
import Toast from '../../components/Toast';

export default function GameDetailsScreen() {
  const { id } = useLocalSearchParams(); 
  const router = useRouter();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState({ isPlayed: false, isBacklog: false });
  const [updating, setUpdating] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // État pour le Toast
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  // Animation "Carte Pokemon" - Effet Parallax Mobile (Floating)
  const rotateXAnim = React.useRef(new Animated.Value(0)).current;
  const rotateYAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Easing inspiré du snippet user: cubic-bezier(0.445, 0.05, 0.55, 0.95)
    const smoothEasing = Easing.bezier(0.445, 0.05, 0.55, 0.95);

    // Boucle Axe Y (Gauche / Droite)
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateYAnim, {
          toValue: 1,
          duration: 4000,
          easing: smoothEasing,
          useNativeDriver: true,
        }),
        Animated.timing(rotateYAnim, {
          toValue: -1,
          duration: 4000,
          easing: smoothEasing,
          useNativeDriver: true,
        }),
        Animated.timing(rotateYAnim, {
          toValue: 0,
          duration: 4000,
          easing: smoothEasing,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Boucle Axe X (Haut / Bas) - Durée différente pour désynchroniser et créer un mouvement organique
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateXAnim, {
          toValue: 1,
          duration: 5500,
          easing: smoothEasing,
          useNativeDriver: true,
        }),
        Animated.timing(rotateXAnim, {
          toValue: -1,
          duration: 5500,
          easing: smoothEasing,
          useNativeDriver: true,
        }),
        Animated.timing(rotateXAnim, {
          toValue: 0,
          duration: 5500,
          easing: smoothEasing,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const rotateY = rotateYAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-15deg', '15deg'], 
  });

  const rotateX = rotateXAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-10deg', '10deg'], // Moins d'amplitude verticale
  });

  useEffect(() => {
    // ... (useEffect inchangé)
    const fetchData = async () => {
      if (id) {
        const data = await getGameDetails(id);
        setGame(data);
        const user = auth.currentUser;
        if (user) {
          const currentStatus = await checkGameStatus(user.uid, parseInt(id));
          setStatus(currentStatus);
        }
      }
      setLoading(false);
    };
    
    const fetchReviews = async () => {
        if (id) {
            const data = await getGameReviews(id);
            setReviews(data);
            setLoadingReviews(false);
        }
    };

    fetchData();
    fetchReviews();
  }, [id]);

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  // Gestion du clic sur les boutons
  const handleListAction = async (listType) => {
    // ... (inchangé)
    const user = auth.currentUser;
    if (!user || !game || updating) return;

    if (listType === 'played_games' && !status.isPlayed) {
      setModalVisible(true);
      return;
    }

    setUpdating(true);
    const targetKey = listType === 'played_games' ? 'isPlayed' : 'isBacklog';
    const isAdding = !status[targetKey]; 

    let success = false;
    if (isAdding) {
      success = await addGameToList(user.uid, game, listType);
    } else {
      success = await removeGameFromList(user.uid, game.id, listType);
    }

    if (success) {
      setStatus(prev => ({
        ...prev,
        [targetKey]: isAdding,
        userRating: (listType === 'played_games' && !isAdding) ? null : prev.userRating
      }));

      // Feedback Toast
      if (isAdding) {
        showToast(listType === 'played_games' ? "Ajouté aux jeux joués !" : "Ajouté à la liste !");
      } else {
        showToast(listType === 'played_games' ? "Retiré des jeux joués." : "Retiré de la liste.", "success");
      }
    } else {
        showToast("Une erreur est survenue.", "error");
    }
    setUpdating(false);
  };

  const handleRateConfirm = async (rating, comment) => {
    setModalVisible(false);
    setUpdating(true);
    const user = auth.currentUser;
    if (user && game) {
      // 1. Ajouter à la liste "Joués" avec la note
      const success = await addGameToList(user.uid, game, 'played_games', rating);
      
      // 2. Ajouter l'avis (si succès et commentaire présent ou juste pour mettre à jour la note)
      // On ajoute l'avis séparément dans la collection 'reviews'
      if (success) {
          // On sauvegarde l'avis public
       const success = await addReview(game, auth.currentUser, rating, comment);
          
          // Refresh reviews
          const newReviews = await getGameReviews(id);
          setReviews(newReviews);

        setStatus(prev => ({ 
            ...prev, 
            isPlayed: true,
            userRating: rating 
        }));
        showToast(`Avis publié !`);
      } else {
        showToast("Erreur lors de la notation.", "error");
      }
    }
    setUpdating(false);
  };

  const handleDeleteReview = async () => {
      // Confirmer la suppression
      Alert.alert(
          "Supprimer l'avis",
          "Voulez-vous vraiment supprimer votre avis public ? Votre note restera enregistrée dans votre liste.",
          [
              { text: "Annuler", style: "cancel" },
              { 
                  text: "Supprimer", 
                  style: "destructive", 
                  onPress: async () => {
                    setModalVisible(false);
                    setUpdating(true);
                    
                    const userReview = reviews.find(r => r.userId === auth.currentUser?.uid);
                    if (userReview) {
                        const success = await deleteReview(userReview.id);
                        if (success) {
                            showToast("Avis supprimé.");
                            // Refresh reviews
                            const newReviews = await getGameReviews(id);
                            setReviews(newReviews);
                            // On ne touche PAS au status.userRating ni à isPlayed
                        } else {
                            showToast("Erreur suppression.", "error");
                        }
                    }
                    setUpdating(false);
                  }
              }
          ]
      );
  };

  // ... (Reste du code getCoverUrl et render) ...
  const getCoverUrl = (url) => {
    if (!url) return null;
    let newUrl = url.startsWith('//') ? 'https:' + url : url;
    return newUrl.replace('t_thumb', 't_cover_big'); 
  };


  if (loading) { /* ... */ return <ActivityIndicator size="large" color={Colors.primary} />; }
  if (!game) { /* ... */ return <Text>Jeu introuvable.</Text>; }

  const coverUrl = game.cover ? getCoverUrl(game.cover.url) : null;
  const year = game.first_release_date ? new Date(game.first_release_date * 1000).getFullYear() : 'N/A';

  return (
    <>
    <ScrollView style={styles.container}>
      {/* ... (Contenu ScrollView inchangé) ... */}

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Retour</Text>
      </TouchableOpacity>

      <ImageBackground 
        source={coverUrl ? { uri: coverUrl } : null} 
        style={styles.headerBackground}
        blurRadius={5}
      >
        <View style={styles.headerOverlay}>
            <View style={styles.headerContent}>
                {coverUrl && (
                    <Animated.Image 
                        source={{ uri: coverUrl }} 
                        style={[
                            styles.cover, 
                            { 
                                transform: [
                                    { perspective: 1000 }, 
                                    { rotateY },
                                    { rotateX }
                                ],
                                // Ombre portée dynamique pour la profondeur
                                shadowColor: "#000",
                                shadowOffset: {
                                    width: 0,
                                    height: 10,
                                },
                                shadowOpacity: 0.5,
                                shadowRadius: 10,
                                elevation: 15,
                            } 
                        ]} 
                    />
                )}
                <View style={styles.headerInfo}>
                    <Text style={styles.title}>{game.name}</Text>
                    <Text style={styles.year}>{year}</Text>
                    {game.rating && (
                        <View style={styles.ratingBadge}>
                            <Text style={styles.ratingText}>{Math.round(game.rating)}/100</Text>
                        </View>
                    )}
                    
                    {status.isPlayed && status.userRating && (
                        <TouchableOpacity 
                            style={[styles.ratingBadge, { backgroundColor: Colors.secondary }]}
                            onPress={() => setModalVisible(true)}
                        >
                            <Text style={styles.ratingText}>
                                Ma note: {status.userRating}
                            </Text>
                        </TouchableOpacity>
                    )}

                    <Text style={styles.genres}>
                        {game.genres ? game.genres.map(g => g.name).join(', ') : ''}
                    </Text>
                </View>
            </View>
        </View>
      </ImageBackground>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Résumé</Text>
        <Text style={styles.summary}>{game.summary || "Pas de description disponible."}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
            style={[styles.actionButton, status.isPlayed && styles.activeButton]}
            onPress={() => handleListAction('played_games')}
            disabled={updating}
        >
            <Text style={[styles.actionButtonText, status.isPlayed && styles.activeButtonText]}>
                {status.isPlayed ? "✅ Joué" : "👁️ J'ai joué"}
            </Text>
        </TouchableOpacity>

        <TouchableOpacity 
            style={[styles.actionButton, styles.wishlistButton, status.isBacklog && styles.activeButton]}
            onPress={() => handleListAction('backlog_games')}
            disabled={updating}
        >
            <Text style={[styles.actionButtonText, status.isBacklog && styles.activeButtonText]}>
                {status.isBacklog ? "📅 Dans ma liste" : "📅 À faire"}
            </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Avis de la communauté</Text>
        {loadingReviews ? (
             <ActivityIndicator color={Colors.primary} size="small" />
        ) : reviews.length > 0 ? (
            reviews.map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                        <TouchableOpacity 
                            style={styles.reviewUser} 
                            onPress={() => router.push(`/user/${review.userId}`)}
                        >
                             <View style={styles.avatarSmall}>
                                 {review.avatar ? (
                                    <Image source={{ uri: review.avatar }} style={{width: 30, height: 30, borderRadius: 15}} />
                                 ) : (
                                    <Text style={styles.avatarLetter}>{review.username.charAt(0).toUpperCase()}</Text>
                                 )}
                             </View>
                             <View>
                                <Text style={styles.reviewUsername}>{review.username}</Text>
                                <Text style={styles.reviewDate}>{review.createdAt ? new Date(review.createdAt.seconds * 1000).toLocaleDateString() : 'Récemment'}</Text>
                             </View>
                        </TouchableOpacity>
                        <View style={styles.reviewRating}>
                            <Text style={styles.reviewScore}>{review.rating}</Text>
                        </View>
                    </View>
                    {review.comment ? (
                        <Text style={styles.reviewComment}>{review.comment}</Text>
                    ) : null}
                </View>
            ))
        ) : (
            <Text style={styles.noReviewsText}>Soyez le premier à donner votre avis !</Text>
        )}
      </View>

      <RatingModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        onConfirm={handleRateConfirm}
        onDelete={handleDeleteReview}
        gameTitle={game.name}
        gameCover={game?.cover?.url}
        initialRating={status.userRating}
        initialComment={reviews.find(r => r.userId === auth.currentUser?.uid)?.comment || ''}
      />
    </ScrollView>

    {/* Toast Rendered outside ScrollView but inside Fragment/Container logic */}
    <Toast 
        visible={toast.visible} 
        message={toast.message} 
        type={toast.type}
        onHide={hideToast}
    />
    </>
  );
}

const styles = StyleSheet.create({
  // ... (Styles existants inchangés jusqu'à actions) ...
  container: { flex: 1, backgroundColor: Colors.background },
  centerContainer: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: Colors.destructive, fontSize: 18 },
  backButton: { 
    position: 'absolute', // Positionner le bouton retour par dessus l'image si on veut, ou le laisser dans le flux.
    // Pour l'instant on le laisse au dessus du header dans le flux, mais on peut ajuster.
    marginTop: 40, marginLeft: 16, padding: 10, zIndex: 10 
  },
  backButtonText: { color: Colors.foreground, fontSize: 16, fontWeight: 'bold' }, // Texte plus visible
  
  headerBackground: {
    width: '100%',
    // Pas de hauteur fixe, s'adapte au contenu
  },
  headerOverlay: {
    backgroundColor: 'rgba(0,0,0,0.6)', // Voile sombre pour lisibilité
    padding: 20,
    paddingTop: 40, // Espace pour ne pas coller en haut si on déplace le bouton retour
  },
  headerContent: {
    flexDirection: 'row',
  },
  // header: REMOVED
  cover: { width: 120, height: 160, borderRadius: 8, marginRight: 16, borderWidth: 1, borderColor: Colors.border },
  headerInfo: { flex: 1, justifyContent: 'flex-start' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 5 }, // Force blanc pour lisibilité sur fond sombre
  year: { fontSize: 16, color: '#DDDDDD', marginBottom: 10 },
  ratingBadge: { backgroundColor: Colors.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, alignSelf: 'flex-start', marginBottom: 10 },
  ratingText: { color: Colors.primaryForeground, fontWeight: 'bold' },
  genres: { color: '#CCCCCC', fontSize: 14, fontStyle: 'italic' },
  section: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.foreground, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: Colors.border, paddingBottom: 5 },
  summary: { color: Colors.cardForeground, fontSize: 16, lineHeight: 24 },
  
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: Colors.card, // Par défaut: couleur carte (inactif)
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  wishlistButton: {
    // Peut garder le même style de base
  },
  activeButton: {
    backgroundColor: Colors.primary, // Devient jaune quand actif
    borderColor: Colors.primary,
  },
  actionButtonText: {
    color: Colors.foreground,
    fontWeight: 'bold',
    fontSize: 14,
  },
  activeButtonText: {
    color: Colors.primaryForeground, // Texte noir quand fond jaune
  },
  reviewCard: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarSmall: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarLetter: {
    color: Colors.primaryForeground,
    fontWeight: 'bold',
    fontSize: 14,
  },
  reviewUsername: {
    color: Colors.foreground,
    fontWeight: 'bold',
    fontSize: 14,
  },
  reviewDate: {
    color: Colors.mutedForeground,
    fontSize: 10,
  },
  reviewRating: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  reviewScore: {
    color: Colors.primaryForeground,
    fontWeight: 'bold',
    fontSize: 14,
  },
  reviewComment: {
    color: Colors.cardForeground,
    fontSize: 14,
    lineHeight: 20,
  },
  noReviewsText: {
    color: Colors.mutedForeground,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
});
