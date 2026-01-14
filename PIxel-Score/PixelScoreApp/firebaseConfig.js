import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Remplacez ce qui suit par la configuration de votre projet Firebase
// Voir : https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
  apiKey: "AIzaSyB_HJv_7CZA1FyfQmK6wPojlSAMJ3FauFY",
  authDomain: "pixel-score-6980e.firebaseapp.com",
  projectId: "pixel-score-6980e",
  storageBucket: "pixel-score-6980e.firebasestorage.app",
  messagingSenderId: "116990424000",
  appId: "1:116990424000:web:fda200cc3e402ccb0f0e25",
  measurementId: "G-TX6PWZ8M6G"
};

// Initialiser Firebase
export const app = initializeApp(firebaseConfig);

// Initialiser l'Authentification et Firestore (Base de données)
export const auth = getAuth(app);
export const db = getFirestore(app);
