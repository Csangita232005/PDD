import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { getDonations } from '../services/api';

export default function MyDonationsScreen() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMyDonations();
  }, []);

  const fetchMyDonations = async () => {
    try {
      const res = await getDonations();
      if (res.success) {
        setDonations(res.donations);
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2e7d32" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Donations 📦</Text>
        <Text style={styles.headerSub}>Track pickup status and donation history</Text>
      </View>

      <FlatList
        data={donations}
        keyExtractor={(item) => String(item.id || item._id)}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchMyDonations(); }} colors={['#2e7d32']} />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.foodTitle}>{item.food_name || item.foodName}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{item.status || 'PENDING'}</Text>
              </View>
            </View>
            <Text style={styles.subText}>Quantity: {item.quantity} {item.unit || 'Packs'}</Text>
            <Text style={styles.subText}>Pickup: {item.address}</Text>
          </View>
        )}
      />
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
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  foodTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: '#2e7d32',
    fontWeight: 'bold',
    fontSize: 12,
  },
  subText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});
