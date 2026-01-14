import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function FeedItem({ item }) {
  const router = useRouter();

  const handlePressGame = () => {
    if (item.gameId) {
       router.push(`/game/${item.gameId}`);
    }
  };

  const handlePressUser = () => {
      if (item.userId) {
          router.push(`/user/${item.userId}`);
      }
  };

  const timeAgo = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString(); 
  };

  // Helper pour l'image
  const getCoverUrl = (url) => {
    if (!url) return null;
    let newUrl = url.startsWith('//') ? 'https:' + url : url;
    return newUrl.replace('t_thumb', 't_cover_big'); 
  };

  // Texte selon le type
  const renderContent = () => {
    switch (item.type) {
        case 'REVIEW':
            return (
                <View>
                    <Text style={styles.actionText}>
                        a laissé un avis sur <Text style={styles.gameTitle}>{item.gameTitle || item.title || "un jeu"}</Text>
                    </Text>
                     {item.rating && (
                        <View style={styles.ratingBadge}>
                            <Text style={styles.ratingText}>{item.rating}</Text>
                        </View>
                    )}
                    {item.comment ? (
                        <Text style={styles.commentText} numberOfLines={3}>"{item.comment}"</Text>
                    ) : null}
                </View>
            );
        case 'COLLECTION':
            return (
                <Text style={styles.actionText}>
                    a joué à <Text style={styles.gameTitle}>{item.gameTitle}</Text>
                </Text>
            );
        default:
            return <Text style={styles.actionText}>a effectué une action.</Text>;
    }
  };

  // Récupérer cover url depuis item.data ou item direct
  // Dans logActivity on a mis item.gameCover pour COLLECTION, mais pour REVIEW on n'a pas passé cover/title dans logActivity call précédent (oups). 
  // Note: On va corriger le logActivity call pour passer gameTitle/Cover aussi dans Review.
  // En attendant, on gère ce qu'on a.
  
  const coverUrl = getCoverUrl(item.gameCover || (item.game ? item.game.cover?.url : null));

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePressUser} style={styles.userRow}>
             {item.avatar ? (
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
             ) : (
                <View style={[styles.avatar, styles.placeholder]}>
                    <Text style={styles.placeholderText}>{item.username?.charAt(0)}</Text>
                </View>
             )}
             <View>
                <Text style={styles.username}>{item.username}</Text>
                <Text style={styles.date}>{timeAgo(item.timestamp)}</Text>
             </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={handlePressGame} style={styles.content}>
           {renderContent()}
           {/* Si on avait l'image du jeu, on l'afficherait ici en petit ou background */}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  userRow: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  placeholder: {
      backgroundColor: Colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
  },
  placeholderText: {
      color: '#fff',
      fontWeight: 'bold',
  },
  username: {
      color: Colors.foreground,
      fontWeight: 'bold',
      fontSize: 16,
  },
  date: {
      color: Colors.mutedForeground,
      fontSize: 12,
  },
  content: {
      marginTop: 5,
  },
  actionText: {
      color: Colors.foreground,
      fontSize: 15,
      marginBottom: 5,
  },
  gameTitle: {
      fontWeight: 'bold',
      color: Colors.primary,
  },
  commentText: {
      color: Colors.cardForeground,
      fontStyle: 'italic',
      marginTop: 5,
      borderLeftWidth: 2,
      borderLeftColor: Colors.border,
      paddingLeft: 10,
  },
  ratingBadge: {
      backgroundColor: Colors.secondary,
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
      marginTop: 5,
  },
  ratingText: {
      color: Colors.secondaryForeground,
      fontWeight: 'bold',
      fontSize: 12,
  },
});
