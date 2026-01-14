// app/index.js

import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';

export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Écouter l'état de l'authentification
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Si l'utilisateur est connecté, aller à l'accueil
        router.replace('/(tabs)/home');
      } else {
        // Sinon, aller à l'écran de connexion
        router.replace('/auth/login');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Afficher un loader pendant la vérification
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
      <ActivityIndicator size="large" color="#ff4757" />
    </View>
  );
}
