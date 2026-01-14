// services/userService.js
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { logActivity } from './activityService';
import { db } from '../firebaseConfig';

/**
 * Vérifie si un jeu est déjà dans les listes de l'utilisateur.
 * @param {string} userId - ID de l'utilisateur Firebase
 * @param {number} gameId - ID du jeu IGDB
 * @returns {Promise<Object>} - { isPlayed: boolean, isBacklog: boolean }
 */
export const checkGameStatus = async (userId, gameId) => {
  try {
    const playedRef = doc(db, 'users', userId, 'played_games', gameId.toString());
    const backlogRef = doc(db, 'users', userId, 'backlog_games', gameId.toString());

    const playedSnap = await getDoc(playedRef);
    const backlogSnap = await getDoc(backlogRef);

    const playedData = playedSnap.exists() ? playedSnap.data() : null;
    
    return {
      isPlayed: playedSnap.exists(),
      isBacklog: backlogSnap.exists(),
      userRating: playedData ? playedData.userRating : null,
    };
  } catch (error) {
    console.error("Erreur checkGameStatus:", error);
    return { isPlayed: false, isBacklog: false };
  }
};

/**
 * Ajoute (ou met à jour) un jeu dans une liste spécifique.
 * @param {string} userId 
 * @param {Object} gameData - Les données brutes du jeu
 * @param {string} listType - 'played_games' ou 'backlog_games'
 * @param {number} [rating] - Note optionnelle (0-100) pour les jeux joués
 */
export const addGameToList = async (userId, gameData, listType, rating = null) => {
  try {
    const gameId = gameData.id.toString();
    const ref = doc(db, 'users', userId, listType, gameId);

    // On ne garde que les infos essentielles pour ne pas surcharger la base
    const savedData = {
      id: gameData.id,
      name: gameData.name,
      cover: gameData.cover || null,
      first_release_date: gameData.first_release_date || null,
      addedAt: new Date(),
      userRating: rating, // Sauvegarde la note si présente
    };

    await setDoc(ref, savedData);
    console.log(`Jeu ajouté à ${listType} !`);
    return true;
  } catch (error) {
    console.error(`Erreur ajout ${listType}:`, error);
    return false;
  }
};

/**
 * Retire un jeu d'une liste.
 */
export const removeGameFromList = async (userId, gameId, listType) => {
  try {
    const ref = doc(db, 'users', userId, listType, gameId.toString());
    await deleteDoc(ref);
    return true;
  } catch (error) {
    console.error(`Erreur suppression ${listType}:`, error);
    return false;
  }
};

/**
 * Récupère tous les jeux d'une liste spécifique de l'utilisateur.
 * @param {string} userId
 * @param {string} listType - 'played_games' ou 'backlog_games'
 * @returns {Promise<Array>}
 */
export const getUserGames = async (userId, listType) => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users', userId, listType));
    const games = [];
    querySnapshot.forEach((doc) => {
      games.push(doc.data());
    });
    // Optionnel: Trier par date d'ajout (plus récent en premier)
    games.sort((a, b) => b.addedAt - a.addedAt);
    return games;
  } catch (error) {
    console.error(`Erreur récupération ${listType}:`, error);
    return [];
  }
};

/**
 * Met à jour les informations du profil utilisateur.
 * @param {string} userId
 * @param {Object} data - { username, bio, location, website, favorites: [...] }
 */
export const updateUserProfile = async (userId, data) => {
  try {
    const userRef = doc(db, 'users', userId);
    // On utilise setDoc avec { merge: true } pour ne pas écraser les autres champs (ex: email)
    await setDoc(userRef, data, { merge: true });
    return true;
  } catch (error) {
    console.error("Erreur mise à jour profil:", error);
    return false;
  }
};
/**
 * Récupère le profil public d'un utilisateur.
 * @param {string} uid 
 */
export const getPublicUserProfile = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error("Erreur getPublicUserProfile:", error);
    return null;
  }
};

/**
 * Suivre un utilisateur.
 * @param {string} currentUid - Celui qui suit
 * @param {string} targetUid - Celui qui est suivi
 */
export const followUser = async (currentUid, targetUid) => {
  try {
    const timestamp = new Date();
    // 1. Ajouter à la liste "following" de l'utilisateur courant
    await setDoc(doc(db, 'users', currentUid, 'following', targetUid), {
      followedAt: timestamp
    });
    // 2. Ajouter à la liste "followers" de l'utilisateur cible
    await setDoc(doc(db, 'users', targetUid, 'followers', currentUid), {
      followedAt: timestamp
    });
    return true;
  } catch (error) {
    console.error("Erreur followUser:", error);
    return false;
  }
};

/**
 * Ne plus suivre un utilisateur.
 */
export const unfollowUser = async (currentUid, targetUid) => {
  try {
    await deleteDoc(doc(db, 'users', currentUid, 'following', targetUid));
    await deleteDoc(doc(db, 'users', targetUid, 'followers', currentUid));
    return true;
  } catch (error) {
    console.error("Erreur unfollowUser:", error);
    return false;
  }
};

/**
 * Vérifie si currentUid suit targetUid.
 */
export const checkFollowStatus = async (currentUid, targetUid) => {
  try {
    const docRef = doc(db, 'users', currentUid, 'following', targetUid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  } catch (error) {
    console.error("Erreur checkFollowStatus:", error);
    return false;
  }
};

/**
 * Récupère les compteurs d'abonnés et d'abonnements.
 */
export const getFollowCounts = async (uid) => {
  try {
    const followersSnap = await getDocs(collection(db, 'users', uid, 'followers'));
    const followingSnap = await getDocs(collection(db, 'users', uid, 'following'));
    return {
      followers: followersSnap.size,
      following: followingSnap.size
    };
  } catch (error) {
    console.error("Erreur getFollowCounts:", error);
    return { followers: 0, following: 0 };
  }
};
