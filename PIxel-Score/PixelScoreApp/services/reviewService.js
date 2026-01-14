import { db } from '../firebaseConfig';
import { collection, addDoc, query, where, orderBy, limit, getDocs, Timestamp, updateDoc, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { logActivity } from './activityService';

/**
 * Récupérer l'avis d'un utilisateur spécifique pour un jeu.
 * @param {string} gameId 
 * @param {string} userId 
 */
export const getUserReview = async (gameId, userId) => {
    try {
        const q = query(
            collection(db, 'reviews'),
            where("gameId", "==", parseInt(gameId)),
            where("userId", "==", userId),
            limit(1)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return { id: doc.id, ...doc.data() };
        }
        return null; // Pas d'avis trouvé
    } catch (e) {
        console.error("Erreur getUserReview:", e);
        return null;
    }
};

/**
 * Ajouter ou mettre à jour un avis pour un jeu.
 * @param {string} gameId 
 * @param {object} user 
 * @param {number} rating 
 * @param {string} comment 
 */
/**
 * Ajouter ou mettre à jour un avis pour un jeu.
 * @param {object} game - Objet jeu complet (id, name, cover) pour le log
 * @param {object} user 
 * @param {number} rating 
 * @param {string} comment 
 */
export const addReview = async (game, user, rating, comment) => {
    const gameId = game.id;
    try {
        // ... (user fetch code remains same)
        let username = user.displayName || 'Utilisateur';
        let avatar = user.photoURL || null;

        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            if (userData.username) username = userData.username;
            if (userData.avatar) avatar = userData.avatar;
        }

        // 2. Vérifier si un avis existe déjà
        const existingReview = await getUserReview(gameId, user.uid);

        if (existingReview) {
            // MISE À JOUR
             const reviewRef = doc(db, 'reviews', existingReview.id);
            await updateDoc(reviewRef, {
                rating: rating,
                comment: comment || '',
                username: username, 
                avatar: avatar,
                createdAt: Timestamp.now(), 
            });
            
             await logActivity(user.uid, 'REVIEW', {
                gameId: parseInt(gameId),
                gameTitle: game.name,
                gameCover: game.cover ? game.cover.url : null,
                rating,
                comment,
                isUpdate: true
            });

            return { id: existingReview.id, ...existingReview, rating, comment, username, avatar };
        } else {
            // CRÉATION
             const reviewData = {
                gameId: parseInt(gameId),
                userId: user.uid,
                username: username,
                avatar: avatar,
                rating: rating,
                comment: comment || '',
                createdAt: Timestamp.now(),
                likes: 0
            };
            const docRef = await addDoc(collection(db, 'reviews'), reviewData);

            await logActivity(user.uid, 'REVIEW', {
                gameId: parseInt(gameId),
                gameTitle: game.name,
                gameCover: game.cover ? game.cover.url : null,
                rating,
                comment
            });

            return { id: docRef.id, ...reviewData };
        }
    } catch (e) {
         console.error("Erreur lors de l'ajout/maj de l'avis: ", e);
        return null;
    }
};

/**
 * Récupérer les derniers avis pour un jeu.
 * @param {string} gameId - ID du jeu.
 */
export const getGameReviews = async (gameId) => {
    try {
        const q = query(
            collection(db, 'reviews'), 
            where("gameId", "==", parseInt(gameId)),
            orderBy("createdAt", "desc"),
            limit(20)
        );

        const querySnapshot = await getDocs(q);
        const reviews = [];
        querySnapshot.forEach((doc) => {
            reviews.push({ id: doc.id, ...doc.data() });
        });
        return reviews;
    } catch (e) {
        console.error("Erreur lors de la récupération des avis: ", e);
        // Si l'index n'existe pas encore, ça peut échouer.
        // On retourne un tableau vide pour ne pas crasher l'app.
        return [];
    }
};

/**
 * Supprimer un avis.
 * @param {string} reviewId 
 */
export const deleteReview = async (reviewId) => {
    try {
        await deleteDoc(doc(db, 'reviews', reviewId));
        console.log("Avis supprimé: ", reviewId);
        return true;
    } catch (e) {
        console.error("Erreur suppression avis: ", e);
        return false;
    }
};
