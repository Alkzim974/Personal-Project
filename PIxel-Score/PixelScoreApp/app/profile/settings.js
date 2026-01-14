// app/profile/settings.js

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { auth, db } from '../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { updateUserProfile } from '../../services/userService';
import Colors from '../../constants/Colors';
import Toast from '../../components/Toast';
import * as ImagePicker from 'expo-image-picker';
import GameSearchModal from '../../components/GameSearchModal';



export default function SettingsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false); 
  // User Data
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState(null); // Avatar en Base64
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [favorites, setFavorites] = useState([null, null, null, null, null]); 

  // Search Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [currentSlotIndex, setCurrentSlotIndex] = useState(null);

  // Toast
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUsername(data.username || '');
          setAvatar(data.avatar || null);
          setBio(data.bio || '');
          setLocation(data.location || '');
          setWebsite(data.website || '');
          
          if (data.favorites && Array.isArray(data.favorites)) {
              setFavorites(data.favorites);
          }
        }
      } catch (error) {
          console.error("Erreur chargement profil:", error);
          setToast({ visible: true, message: "Erreur de chargement.", type: 'error' });
      }
      setLoading(false);
    };
    fetchUserData();
  }, []);

  const pickImage = async () => {
    // Demander la permission d'accès à la galerie
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Permission requise", "Tu dois autoriser l'accès à tes photos pour changer d'avatar.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], // Updated API Usage: mediaTypes expects an array or specific enum depending on version, generic string usually works or remove if issues. documentation says MediaTypeOptions.Images.
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      // On crée l'URI data complète
      const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setAvatar(base64Img);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const user = auth.currentUser;
    if (!user) return;

    const data = {
      username,
      avatar, // Sauvegarde de l'avatar
      bio,
      location,
      website,
      favorites
    };

    const success = await updateUserProfile(user.uid, data);
    setSaving(false);
    if (success) {
      setToast({ visible: true, message: "Profil mis à jour !", type: 'success' });
    } else {
      setToast({ visible: true, message: "Erreur lors de la sauvegarde.", type: 'error' });
    }
  };

  // ... (handleSignOut, openSearchForSlot etc inchangés) - NON, ILS ETAIENT SUPPRIMES, JE LES REMETS !
  
  const handleSignOut = async () => {
    await signOut(auth);
    router.replace('/auth/login');
  };

  const openSearchForSlot = (index) => {
    setCurrentSlotIndex(index);
    setModalVisible(true);
  };

  const handleSelectGame = (game) => {
    if (currentSlotIndex !== null) {
      const newFavs = [...favorites];
      // On ne garde que l'essentiel du jeu pour le favori
      newFavs[currentSlotIndex] = {
        id: game.id,
        name: game.name,
        cover: game.cover, // Object { id, url }
      };
      setFavorites(newFavs);
    }
  };

  const clearSlot = (index) => {
    const newFavs = [...favorites];
    newFavs[index] = null;
    setFavorites(newFavs);
  };

  // Helper to get cover image URL
  const getCoverUrl = (coverObj) => {
    if (!coverObj || !coverObj.url) return null;
    let newUrl = coverObj.url.startsWith('//') ? 'https:' + coverObj.url : coverObj.url;
    return newUrl.replace('t_thumb', 't_cover_big'); 
  };

  return (
    <View style={styles.container}>
      {/* Header (Inchangé) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.cancelText}>Annuler</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Modifier le profil</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator size="small" color={Colors.primary} /> : <Text style={styles.saveText}>Enregistrer</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
            <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
                {avatar ? (
                    <Image source={{ uri: avatar }} style={styles.avatarImage} />
                ) : (
                     <View style={[styles.avatarImage, styles.avatarPlaceholder]}>
                        <Text style={styles.avatarPlaceholderText}>{username ? username.charAt(0).toUpperCase() : '?'}</Text>
                     </View>
                )}
                <View style={styles.editIconBadge}>
                    <Text style={styles.editIconText}>✎</Text>
                </View>
            </TouchableOpacity>
            <Text style={styles.changePhotoText}>Changer de photo</Text>
        </View>

        {/* User Info Fields */}
        <View style={styles.section}>
            <Text style={styles.label}>Nom d'utilisateur</Text>
            <TextInput style={styles.input} value={username} onChangeText={setUsername} placeholder="Pseudo" placeholderTextColor={Colors.muted} />
        </View>

        <View style={styles.section}>
            <Text style={styles.label}>Bio</Text>
            <TextInput 
                style={[styles.input, styles.textArea]} 
                value={bio} 
                onChangeText={setBio} 
                placeholder="Parle-nous de toi..." 
                placeholderTextColor={Colors.muted} 
                multiline 
                numberOfLines={4}
            />
        </View>

        <View style={styles.section}>
            <Text style={styles.label}>Localisation</Text>
            <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="Paris, France" placeholderTextColor={Colors.muted} />
        </View>

        <View style={styles.section}>
            <Text style={styles.label}>Site Web</Text>
            <TextInput style={styles.input} value={website} onChangeText={setWebsite} placeholder="https://..." placeholderTextColor={Colors.muted} autoCapitalize="none" />
        </View>

        {/* Favorite Games */}
        <View style={styles.section}>
            <Text style={styles.label}>Jeux Favoris (Top 5)</Text>
            <Text style={styles.subLabel}>Sélectionne tes 5 jeux préférés pour les afficher sur ton profil.</Text>
            
            <View style={styles.favoritesGrid}>
                {favorites.map((fav, index) => (
                    <View key={index} style={styles.favSlotContainer}>
                         {fav ? (
                             <TouchableOpacity onPress={() => clearSlot(index)} onLongPress={() => openSearchForSlot(index)}>
                                 {/* Image du jeu */}
                                 {fav.cover ? (
                                     <Image source={{ uri: getCoverUrl(fav.cover) }} style={styles.favImage} />
                                 ) : (
                                     <View style={[styles.favImage, styles.favPlaceholder]}>
                                         <Text style={styles.favGameTitle}>{fav.name}</Text>
                                     </View>
                                 )}
                                 {/* Petite croix pour supprimer (ou overlay) */}
                                 <View style={styles.removeBadge}><Text style={styles.removeText}>×</Text></View>
                             </TouchableOpacity>
                         ) : (
                             <TouchableOpacity style={styles.emptySlot} onPress={() => openSearchForSlot(index)}>
                                 <Text style={styles.plusIcon}>+</Text>
                             </TouchableOpacity>
                         )}
                    </View>
                ))}
            </View>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutText}>Se déconnecter</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Modal de recherche */}
      <GameSearchModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        onSelect={handleSelectGame} 
      />

       <Toast 
          visible={toast.visible} 
          message={toast.message} 
          type={toast.type}
          onHide={() => setToast(prev => ({ ...prev, visible: false }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 50,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.foreground,
  },
  cancelText: {
    color: Colors.mutedForeground,
    fontSize: 16,
  },
  saveText: {
    color: Colors.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  content: {
    padding: 20,
    paddingBottom: 50,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.card,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarPlaceholderText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  editIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  editIconText: {
    color: Colors.primaryForeground,
    fontWeight: 'bold',
    fontSize: 16,
  },
  changePhotoText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 25,
  },
  label: {
    color: Colors.mutedForeground,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  subLabel: {
    color: Colors.muted,
    fontSize: 12,
    marginBottom: 10,
  },
  input: {
    backgroundColor: Colors.input,
    color: Colors.foreground,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  favoritesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Space evenly
  },
  favSlotContainer: {
    width: '18%', // 5 items ~20% each, minus spacing
    aspectRatio: 0.7, // Portrait ratio
  },
  favImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
    backgroundColor: Colors.muted,
  },
  favPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  favGameTitle: {
    color: Colors.foreground,
    fontSize: 8,
    textAlign: 'center',
  },
  emptySlot: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.card,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusIcon: {
    fontSize: 24,
    color: Colors.mutedForeground,
  },
  removeBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: Colors.destructive,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  signOutButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.destructive,
    alignItems: 'center',
  },
  signOutText: {
    color: Colors.destructive,
    fontWeight: 'bold',
  },
});
