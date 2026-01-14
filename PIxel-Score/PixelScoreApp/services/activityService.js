import { db } from '../firebaseConfig';
import { collection, addDoc, query, where, orderBy, limit, getDocs, Timestamp, getDoc, doc } from 'firebase/firestore';

/**
 * Log une activité utilisateur (Review, Note, Ajout Collection).
 * @param {string} userId
 * @param {string} type - 'REVIEW', 'RATING', 'COLLECTION'
 * @param {object} data - Données liées à l'activité (gameId, gameTitle, cover, rating, comment...)
 */
export const logActivity = async (userId, type, data) => {
  try {
    // Récupérer les infos user à jour pour l'instantané
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.exists() ? userDoc.data() : {};
    
    const activityData = {
      userId,
      username: userData.username || 'Utilisateur',
      avatar: userData.avatar || null,
      type, // 'REVIEW', 'RATING', 'COLLECTION'
      timestamp: Timestamp.now(),
      ...data
    };

    await addDoc(collection(db, 'activities'), activityData);
    console.log("Activité loggée:", type);
    return true;
  } catch (error) {
    console.error("Erreur logActivity:", error);
    return false;
  }
};

/**
 * Récupère le fil d'actualité des utilisateurs suivis.
 * @param {string} currentUserId 
 */
export const getFollowingFeed = async (currentUserId) => {
  try {
    // 1. Récupérer la liste des ID suivis
    const followingRef = collection(db, 'users', currentUserId, 'following');
    const followingSnap = await getDocs(followingRef);
    
    if (followingSnap.empty) {
      return [];
    }

    const followingIds = followingSnap.docs.map(doc => doc.id);
    
    // Firestore 'in' limit est de 10. Si > 10, il faudrait chunker.
    // Pour l'instant, on prend les 10 premiers ou on fait une query simple si peu d'amis.
    // TODO: Gérer la pagination et chunks si > 10 amis.
    const safeIds = followingIds.slice(0, 10); 

    const q = query(
      collection(db, 'activities'),
      where('userId', 'in', safeIds),
      orderBy('timestamp', 'desc'),
      limit(20)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  } catch (error) {
    console.error("Erreur getFollowingFeed:", error);
    return [];
  }
};
