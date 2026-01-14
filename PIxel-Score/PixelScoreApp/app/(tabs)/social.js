import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image, TouchableOpacity, RefreshControl } from 'react-native';
import React, { useEffect, useState } from 'react';
import Colors from '../../constants/Colors';
import { auth } from '../../firebaseConfig';
import { getFollowingFeed } from '../../services/activityService';
import FeedItem from '../../components/FeedItem';

export default function SocialScreen() {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchFeed = async () => {
      if (!user) {
          setLoading(false);
          return;
      }
      try {
        const data = await getFollowingFeed(user.uid);
        setFeed(data);
      } catch (e) {
        console.error("Feed error:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [user]);

  if (!user) {
      return (
          <View style={styles.container}>
              <Text style={styles.text}>Connectez-vous pour voir l'actualité de vos amis.</Text>
          </View>
      );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activité</Text>
      
      {feed.length === 0 ? (
          <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Aucune activité récente.</Text>
              <Text style={styles.emptySubText}>Suivez des utilisateurs pour voir leurs avis et jeux ici !</Text>
          </View>
      ) : (
          <FlatList
            data={feed}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <FeedItem item={item} />}
            contentContainerStyle={styles.list}
            refreshing={loading}
            onRefresh={() => {
                setLoading(true);
                getFollowingFeed(user.uid).then(data => {
                    setFeed(data);
                    setLoading(false);
                });
            }}
          />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.foreground,
    marginBottom: 20,
  },
  text: {
    color: Colors.mutedForeground,
    textAlign: 'center',
    marginTop: 50,
  },
  list: {
      paddingBottom: 20,
  },
  emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
  },
  emptyText: {
      color: Colors.foreground,
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
  },
  emptySubText: {
      color: Colors.mutedForeground,
      textAlign: 'center',
      paddingHorizontal: 30,
  },
});
