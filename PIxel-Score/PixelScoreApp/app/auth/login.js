// app/auth/login.js

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import Colors from '../../constants/Colors';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Fonction pour gérer la connexion
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      // Tentative de connexion avec Firebase
      await signInWithEmailAndPassword(auth, email, password);
      // Si réussite, la redirection sera gérée automatiquement par le _layout (ou on peut forcer ici)
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error(error);
      Alert.alert('Échec de la connexion', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Aller vers l'écran d'inscription
  const goToRegister = () => {
    router.push('/auth/register');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pixel Score</Text>
      <Text style={styles.subtitle}>Connectez-vous pour suivre vos jeux</Text>

      <TextInput
        style={styles.input}
        placeholder="Adresse Email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        placeholderTextColor="#aaa"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Se Connecter</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={goToRegister} style={styles.linkContainer}>
        <Text style={styles.linkText}>Pas encore de compte ? Créer un compte</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 10,
    textTransform: 'uppercase', // Style plus "Gaming"
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.mutedForeground,
    marginBottom: 40,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: Colors.input,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    color: Colors.foreground,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: Colors.primaryForeground,
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkContainer: {
    marginTop: 20,
  },
  linkText: {
    color: Colors.primary,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
