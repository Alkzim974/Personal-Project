import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Linking, ActivityIndicator, RefreshControl } from 'react-native';
import Colors from '../../constants/Colors';
import { fetchNews } from '../../services/newsService';

export default function NewsScreen() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNews = async () => {
    try {
        const articles = await fetchNews();
        setNews(articles);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
        setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadNews();
  };
  
  const openLink = (url) => {
    if (url) {
        Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => openLink(item.url)} activeOpacity={0.9}>
        {item.image ? (
            <Image source={{ uri: item.image }} style={styles.cardImage} />
        ) : (
            <View style={[styles.cardImage, styles.placeholderImage]}>
                 <Text style={{color: '#555'}}>Pas d'image</Text>
            </View>
        )}
        <View style={styles.cardOverlay}>
            <View style={[styles.sourceBadge, item.source === 'Ign France' && { backgroundColor: '#bf1313' }]}>
                <Text style={styles.sourceText}>{item.source}</Text>
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.date}>{item.date}</Text>
                <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                {item.snippet ? <Text style={styles.snippet} numberOfLines={2}>{item.snippet}</Text> : null}
            </View>
        </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>L'Actu Gaming</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }}/>
      ) : (
        <FlatList 
            data={news}
            keyExtractor={(item, index) => item.id || index.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
            }
            ListEmptyComponent={
                <Text style={{color: 'white', textAlign: 'center', marginTop: 20}}>Impossible de charger les actus.</Text>
            }
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.foreground,
    marginBottom: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    height: 250,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: Colors.card,
    position: 'relative',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  placeholderImage: {
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardOverlay: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.4)', // Darken image
    justifyContent: 'space-between',
    padding: 16,
  },
  sourceBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  sourceText: {
    color: Colors.primaryForeground,
    fontWeight: 'bold',
    fontSize: 12,
  },
  textContainer: {
    backgroundColor: 'rgba(0,0,0,0.6)', 
    padding: 12,
    borderRadius: 12,
  },
  date: {
    color: '#ccc',
    fontSize: 12,
    marginBottom: 4,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  snippet: {
    color: '#ddd',
    fontSize: 14,
  }
});
