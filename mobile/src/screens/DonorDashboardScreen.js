// DonorDashboardScreen.js — Fully matches Web Donor Dashboard (Screenshot 1)
import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { getDonations, getPersonalStats } from '../services/api';
import LocationMap from '../components/LocationMap';
import { getSocket, joinUserRoom, joinRoleRoom } from '../services/socket';

export default function DonorDashboardScreen({ navigation, user, onLogout }) {
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({
    totalDonations: 0,
    completedDonations: 0,
    foodSavedKg: 0,
    peopleHelped: 0,
  });
  const [loading, setLoading] = useState(true);

  const uid = user?.id || user?._id;
  const donorAddress =
    user?.roleProfiles?.donor?.address?.formattedAddress ||
    user?.donorAddress ||
    user?.address ||
    'Proddatur, Kadapa, Andhra Pradesh';

  const fetchData = useCallback(async () => {
    if (!uid) return;
    try {
      const resD = await getDonations({ donorId: uid });
      if (resD.success) setDonations(resD.donations || []);

      const resS = await getPersonalStats(uid);
      if (resS.success && resS.stats) setStats(resS.stats);
    } catch (e) {
      console.warn('Failed to fetch donor data:', e);
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    fetchData();
    const socket = getSocket();
    if (uid) {
      joinUserRoom(uid);
      joinRoleRoom('DONOR');
    }
    const refresh = () => fetchData();
    socket.on('donation:created', refresh);
    socket.on('donation:claimed', refresh);
    socket.on('delivery:status_change', refresh);
    socket.on('donation:completed', refresh);
    socket.on('notification:new', refresh);
    return () => {
      socket.off('donation:created', refresh);
      socket.off('donation:claimed', refresh);
      socket.off('delivery:status_change', refresh);
      socket.off('donation:completed', refresh);
      socket.off('notification:new', refresh);
    };
  }, [fetchData, uid]);

  const activeDonationsList = donations.filter((d) => d.status !== 'COMPLETED');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2e7d32" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Header Banner (Screenshot 1) */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <View style={styles.iconBox}>
                <Text style={{ fontSize: 22 }}>🍱</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.headerTitle}>Welcome, Donor {user?.name || 'C sangita'}</Text>
                <Text style={styles.headerSub1}>Welcome, {user?.name || 'C sangita'}</Text>
                <Text style={styles.headerSub2}>
                  Manage your food donations & track rescue progress
                </Text>
              </View>
            </View>

            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.circleBtn}
                onPress={() => navigation.navigate('Notifications')}
              >
                <Text style={{ fontSize: 16 }}>🔔</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.circleBtn, { marginLeft: 8 }]}
                onPress={() => navigation.navigate('Profile')}
              >
                <Text style={{ fontSize: 16 }}>👤</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 3 Top Stat Cards (Screenshot 1) */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalDonations || 0}</Text>
            <Text style={styles.statLabel}>Total Donations</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.foodSavedKg || 0} Kg</Text>
            <Text style={styles.statLabel}>Food Saved (Kg)</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.peopleHelped || 0}</Text>
            <Text style={styles.statLabel}>People Helped</Text>
          </View>
        </View>

        {/* Big Full-Width "+ + Donate Food Now" Button */}
        <TouchableOpacity
          style={styles.donateNowBtn}
          onPress={() => navigation.navigate('DonateFood')}
        >
          <Text style={styles.donateNowBtnText}>+ + Donate Food Now</Text>
        </TouchableOpacity>

        {/* 4 Action Cards Row */}
        <View style={styles.quickGrid}>
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => navigation.navigate('ActiveDonations')}
          >
            <Text style={{ fontSize: 20, marginBottom: 4 }}>📦</Text>
            <Text style={styles.quickCardText}>Active Donations ({activeDonationsList.length})</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => navigation.navigate('LiveTracking')}
          >
            <Text style={{ fontSize: 20, marginBottom: 4 }}>📍</Text>
            <Text style={styles.quickCardText}>Live Tracking</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => navigation.navigate('MyDonations')}
          >
            <Text style={{ fontSize: 20, marginBottom: 4 }}>📜</Text>
            <Text style={styles.quickCardText}>Donation History</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => navigation.navigate('Impact')}
          >
            <Text style={{ fontSize: 20, marginBottom: 4 }}>📊</Text>
            <Text style={styles.quickCardText}>Community Impact</Text>
          </TouchableOpacity>
        </View>

        {/* Map Section Card (Screenshot 1) */}
        <View style={styles.mapCard}>
          <View style={styles.mapCardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.mapTitle}>📍 My Donor Location & Nearby Food Rescue Points</Text>
              <Text style={styles.mapSubTitle}>🚴 Volunteer Pickup & Delivery Route</Text>
            </View>
            <TouchableOpacity
              style={styles.openDirectionsBtn}
              onPress={() => {
                Linking.openURL(
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(donorAddress)}`
                );
              }}
            >
              <Text style={styles.openDirectionsText}>🗺️ Open Directions</Text>
            </TouchableOpacity>
          </View>

          {/* Pickup Address Pill */}
          <View style={styles.pickupPill}>
            <Text style={styles.pickupPillText}>📦 Pickup: {donorAddress}</Text>
          </View>

          {/* Map Display */}
          <View style={styles.mapWrapper}>
            <LocationMap
              pickupCoords={{
                lat: user?.latitude || 14.7526,
                lng: user?.longitude || 78.5541,
                address: donorAddress,
              }}
              deliveryType="VOLUNTEER_DELIVERY"
              role="DONOR"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  scrollContent: { paddingBottom: 30 },
  header: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headerLeft: { flex: 1, flexDirection: 'row', alignItems: 'flex-start' },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#ffffff' },
  headerSub1: { fontSize: 12, color: '#e8f5e9', marginTop: 2 },
  headerSub2: { fontSize: 10, color: '#c8e6c9', marginTop: 2 },
  headerRight: { flexDirection: 'row', marginLeft: 8, marginTop: 2 },
  circleBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // 3 Stats
  statsContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    marginTop: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: '#263238' },
  statLabel: { fontSize: 11, color: '#666666', marginTop: 4, textAlign: 'center' },

  // Big Button
  donateNowBtn: {
    backgroundColor: '#2e7d32',
    marginHorizontal: 14,
    marginTop: 14,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  donateNowBtnText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },

  // Quick 4 cards
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 14,
    marginTop: 14,
  },
  quickCard: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  quickCardText: { fontSize: 12, fontWeight: 'bold', color: '#333333', textAlign: 'center' },

  // Map Card
  mapCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 14,
    marginTop: 14,
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  mapCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  mapTitle: { fontSize: 14, fontWeight: 'bold', color: '#2e7d32' },
  mapSubTitle: { fontSize: 11, color: '#666666', marginTop: 2 },
  openDirectionsBtn: {
    backgroundColor: '#1565c0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 6,
  },
  openDirectionsText: { color: '#ffffff', fontSize: 11, fontWeight: 'bold' },
  pickupPill: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
  },
  pickupPillText: { fontSize: 12, color: '#333333', fontWeight: '600' },
  mapWrapper: { height: 260, borderRadius: 12, overflow: 'hidden' },
});
