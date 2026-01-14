// components/Toast.js

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Colors from '../constants/Colors';

export default function Toast({ message, visible, onHide, type = 'success' }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible) {
      // Apparition simple (Fade In + Slide Up)
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          speed: 15,
        }),
      ]).start();

      // Disparition automatique après 3 secondes
      const timer = setTimeout(() => {
        hide();
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      hide();
    }
  }, [visible]);

  const hide = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 50,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
        if (onHide) onHide();
    });
  };

  if (!visible) return null;

  return (
    <Animated.View 
        style={[
            styles.container, 
            { opacity, transform: [{ translateY }] },
            type === 'error' && styles.errorContainer
        ]}
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: Colors.primary, // Jaune par défaut
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  errorContainer: {
    backgroundColor: Colors.destructive, // Rouge si erreur
  },
  text: {
    color: Colors.primaryForeground,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
