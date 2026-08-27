import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { getDonations } from '../services/api';

export default function HomeScreen({ navigation }) {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const res = await getDonations();
      if (res.success) {
        setDonations(res.donations);
      }
    } catch (e) {
      console.warn('Fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDonations();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2e7d32" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Live Food Feed 🍲</Text>
        <Text style={styles.headerSub}>Real-time MongoDB Community Donations</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2e7d32" />
          <Text style={styles.loadingText}>Fetching donations from MongoDB...</Text>
        </View>
      ) : (
        <FlatList
          data={donations}
          keyExtractor={(item) => String(item.id || item._id)}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2e7d32']} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No food donations available right now.</Text>
              <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Donate')}>
                <Text style={styles.actionBtnText}>+ Post First Donation</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.foodTitle}>{item.food_name || item.foodName}</Text>
                <Text style={styles.foodDetails}>
                  Qty: {item.quantity} {item.unit || 'Packs'} • {item.address}
                </Text>
                <Text style={styles.donorText}>Donor: {item.donor_name || 'Community Member'}</Text>
              </View>
              <View style={[styles.badge, item.status === 'COMPLETED' ? styles.completedBadge : null]}>
                <Text style={styles.badgeText}>{item.status || 'PENDING'}</Text>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2e7d32',
    padding: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSub: {
    fontSize: 12,
    color: '#a5d6a7',
    marginTop: 2,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#2e7d32',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  foodTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
  },
  foodDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  donorText: {
    fontSize: 12,
    color: '#2e7d32',
    marginTop: 4,
    fontWeight: '500',
  },
  badge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  completedBadge: {
    backgroundColor: '#c8e6c9',
  },
  badgeText: {
    color: '#2e7d32',
    fontWeight: 'bold',
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#777',
    marginBottom: 16,
  },
  actionBtn: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
