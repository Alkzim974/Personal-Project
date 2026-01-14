// components/GameCard.js

import React, { useRef } from 'react';
import { View, Text, Image, StyleSheet, TouchableWithoutFeedback, Animated } from 'react-native';
import Colors from '../constants/Colors';

export default function GameCard({ game, onPress }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // L'URL de l'image IGDB commence souvent par "//", il faut ajouter "https:"
  // On remplace aussi 't_thumb' par 't_cover_big' pour une meilleure qualité
  const getCoverUrl = (url) => {
    if (!url) return null;
    let newUrl = url.startsWith('//') ? 'https:' + url : url;
    return newUrl.replace('t_thumb', 't_cover_big');
  };

  const coverUrl = game.cover ? getCoverUrl(game.cover.url) : null;
  const year = game.first_release_date 
    ? new Date(game.first_release_date * 1000).getFullYear() 
    : 'N/A';

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  return (
    <TouchableWithoutFeedback
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
    >
        <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
            {coverUrl ? (
                <Image source={{ uri: coverUrl }} style={styles.cover} />
            ) : (
                <View style={[styles.cover, styles.placeholder]}>
                <Text style={styles.placeholderText}>No Image</Text>
                </View>
            )}
            
            <View style={styles.info}>
                <Text style={styles.title} numberOfLines={2}>{game.name}</Text>
                <Text style={styles.year}>{year}</Text>
                <Text style={styles.platform}>
                {game.platforms ? game.platforms.map(p => p.name).slice(0, 3).join(', ') : ''}
                </Text>
                
                {/* Badge de note utilisateur (si présente) */}
                {game.userRating !== undefined && game.userRating !== null && (
                <View style={styles.userRatingBadge}>
                    <Text style={styles.userRatingText}>Ma note: {game.userRating}</Text>
                </View>
                )}
            </View>
        </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cover: {
    width: 90,
    height: 120,
    resizeMode: 'cover',
  },
  placeholder: {
    backgroundColor: Colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: Colors.mutedForeground,
    fontSize: 12,
  },
  info: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.cardForeground,
    marginBottom: 5,
  },
  year: {
    fontSize: 14,
    color: Colors.mutedForeground,
    marginBottom: 5,
  },
  platform: {
    fontSize: 12,
    color: Colors.mutedForeground,
  },
  userRatingBadge: {
    backgroundColor: Colors.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 5,
  },
  userRatingText: {
    color: Colors.primaryForeground,
    fontWeight: 'bold',
    fontSize: 12,
  },
});
