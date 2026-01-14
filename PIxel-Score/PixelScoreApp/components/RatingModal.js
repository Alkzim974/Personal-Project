// components/RatingModal.js

import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, TextInput, Image, SafeAreaView } from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

export default function RatingModal({ visible, onClose, onConfirm, onDelete, gameTitle, gameCover, initialRating, initialComment }) {
  const [rating, setRating] = useState(50);
  const [comment, setComment] = useState('');
  
  // Date du jour formatée en français
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Reset rating when modal opens
  useEffect(() => {
    if (visible) {
      setRating(initialRating || 50);
      setComment(initialComment || '');
    }
  }, [visible, initialRating, initialComment]);

  const handleConfirm = () => {
    onConfirm(rating, comment);
  };

  const coverUrl = gameCover 
    ? (gameCover.startsWith('//') ? 'https:' + gameCover : gameCover).replace('t_thumb', 't_cover_big')
    : null;

  return (
    <Modal
      animationType="slide"
      transparent={false} // Full screen opaque
      visible={visible}
      presentationStyle="pageSheet" // iOS style card
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
                <Ionicons name="close" size={28} color={Colors.foreground} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>J'ai joué</Text>
            <TouchableOpacity onPress={handleConfirm} style={styles.headerBtn}>
                <Ionicons name="checkmark" size={28} color={Colors.primary} />
            </TouchableOpacity>
        </View>

        {/* Game Info Row */}
        <View style={styles.gameInfoContainer}>
            {coverUrl && <Image source={{ uri: coverUrl }} style={styles.miniCover} />}
            <Text style={styles.gameTitle}>{gameTitle}</Text>
        </View>

        {/* Date Row */}
        <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Date</Text>
            <View style={styles.dateValueContainer}>
                <Text style={styles.dateValue}>{today}</Text>
                <Ionicons name="close-circle" size={16} color={Colors.mutedForeground} style={{marginLeft: 5}}/>
            </View>
        </View>

        <View style={styles.separator} />

        {/* Rating Section */}
        <View style={styles.ratingSection}>
            <Text style={styles.ratingLabel}>Note</Text>
            <View style={styles.sliderContainer}>
                <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={100}
                    step={1}
                    value={typeof rating === 'number' ? rating : 0}
                    onValueChange={setRating}
                    minimumTrackTintColor={Colors.primary}
                    maximumTrackTintColor={Colors.muted}
                    thumbTintColor={Colors.primary}
                />
                <Text style={styles.ratingValue}>{rating}<Text style={styles.ratingMax}>/100</Text></Text>
            </View>
        </View>

        <View style={styles.separator} />

        {/* Review Input */}
          <TextInput
            style={styles.reviewInput}
            placeholder="Ajouter une critique..."
            placeholderTextColor={Colors.mutedForeground}
            multiline
            value={comment}
            onChangeText={setComment}
            textAlignVertical="top"
          />

          {/* Delete Button (Only if editing an existing review/rating) */}
          {(initialRating || initialComment) && (
              <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
                  <Text style={styles.deleteButtonText}>Supprimer mon avis</Text>
              </TouchableOpacity>
          )}

      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Dark background like Letterboxd
    paddingTop: 20, // Status bar safe area if needed
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerBtn: {
    padding: 5,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  gameInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#1a1a1a',
  },
  miniCover: {
    width: 40,
    height: 60,
    borderRadius: 4,
    marginRight: 15,
  },
  gameTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#1a1a1a', // Slightly lighter than bg
    marginTop: 1, // Tiny separator effect
  },
  dateLabel: {
    color: Colors.mutedForeground,
    fontSize: 16,
  },
  dateValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateValue: {
    color: Colors.mutedForeground,
    fontSize: 16,
  },
  separator: {
    height: 1,
    backgroundColor: '#222',
    marginHorizontal: 15,
  },
  ratingSection: {
    padding: 20,
    alignItems: 'center',
  },
  ratingLabel: {
    color: Colors.mutedForeground,
    fontSize: 14,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  sliderContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  slider: {
    flex: 1,
    height: 40,
    marginRight: 10,
  },
  ratingValue: {
    color: Colors.primary,
    fontSize: 24,
    fontWeight: 'bold',
    width: 80,
    textAlign: 'right',
  },
  ratingMax: {
    fontSize: 14,
    color: Colors.mutedForeground,
    fontWeight: 'normal',
  },
  reviewInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: '#eee',
    textAlignVertical: 'top',
  },
  deleteButton: {
      padding: 15,
      alignItems: 'center',
      marginTop: 'auto', // Push to bottom
      marginBottom: 20,
      marginHorizontal: 15,
      backgroundColor: '#331111',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: Colors.destructive,
  },
  deleteButtonText: {
      color: Colors.destructive,
      fontWeight: 'bold',
      fontSize: 16,
  },
});
