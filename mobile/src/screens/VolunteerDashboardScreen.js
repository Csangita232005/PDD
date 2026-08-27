// VolunteerDashboardScreen.js — Fully matches Web Volunteer Dashboard (Screenshot 3)
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
  Alert,
  Linking,
} from 'react-native';
import { getDonations, assignVolunteer, updateDeliveryStage } from '../services/api';
import LocationMap from '../components/LocationMap';
import { getSocket, joinUserRoom, joinRoleRoom } from '../services/socket';

export default function VolunteerDashboardScreen({ navigation, user, onLogout }) {
  const [allDonations, setAllDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const uid = user?.id || user?._id;
  const volunteerAddress =
    user?.roleProfiles?.volunteer?.address?.formattedAddress ||
    user?.volunteerAddress ||
    user?.address ||
    'Proddatur, Kadapa, Andhra Pradesh';

  const fetchDonations = useCallback(async () => {
    try {
      const res = await getDonations();
      if (res.success) setAllDonations(res.donations || []);
    } catch (e) {
      console.warn('Failed to fetch volunteer donations:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDonations();
    const socket = getSocket();
    if (uid) {
      joinUserRoom(uid);
      joinRoleRoom('VOLUNTEER');
    }
    const refresh = () => fetchDonations();
    socket.on('donation:created', refresh);
    socket.on('donation:claimed', refresh);
    socket.on('delivery:new_available', refresh);
    socket.on('delivery:status_change', refresh);
    socket.on('donation:completed', refresh);
    return () => {
      socket.off('donation:created', refresh);
      socket.off('donation:claimed', refresh);
      socket.off('delivery:new_available', refresh);
      socket.off('delivery:status_change', refresh);
      socket.off('donation:completed', refresh);
    };
  }, [fetchDonations, uid]);

  const availablePickups = allDonations.filter(
    (d) =>
      d.status === 'PENDING' ||
      d.status === 'ACCEPTED' ||
      d.status === 'VOLUNTEER_ASSIGNED'
  );

  const myTasks = allDonations.filter(
    (d) =>
      (d.volunteer_id === uid || d.assignedVolunteer === user?.name) &&
      d.status !== 'COMPLETED'
  );

  const completedDeliveries = allDonations.filter(
    (d) =>
      (d.volunteer_id === uid || d.assignedVolunteer === user?.name) &&
      d.status === 'COMPLETED'
  );

  const handleAcceptTask = async (donationId) => {
    setActionLoading(true);
    try {
      const res = await assignVolunteer({
        donationId,
        volunteerId: uid,
        volunteerName: user?.name || 'Volunteer Hero',
        volunteerPhone: user?.mobile || '',
      });
      setActionLoading(false);
      if (res.success) {
        Alert.alert('✅ Task Assigned', 'You are now assigned to this delivery task!');
        fetchDonations();
      } else {
        Alert.alert('Error', res.message || 'Failed to accept task.');
      }
    } catch (e) {
      setActionLoading(false);
      Alert.alert('Error', 'Connection error.');
    }
  };

  const handleUpdateStatus = async (donationId, stage) => {
    setActionLoading(true);
    try {
      const res = await updateDeliveryStage(donationId, stage);
      setActionLoading(false);
      if (res.success) {
        Alert.alert('✅ Status Updated', `Delivery status is now ${stage.replace('_', ' ')}`);
        fetchDonations();
      } else {
        Alert.alert('Error', res.message || 'Failed to update status.');
      }
    } catch (e) {
      setActionLoading(false);
      Alert.alert('Error', 'Connection error.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1565c0" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Header Banner (Screenshot 3) */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <View style={styles.iconBox}>
                <Text style={{ fontSize: 22 }}>🚴</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.headerTitle}>Welcome, Volunteer {user?.name || 'C sangita'}</Text>
                <Text style={styles.headerSub1}>🚴 {user?.name || 'C sangita'}</Text>
                <Text style={styles.headerSub2}>
                  Rescue surplus food & deliver to local communities
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
                <Text style={{ fontSize: 16 }}>🚴</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 3 Top Stat Cards (Screenshot 3) */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{availablePickups.length}</Text>
            <Text style={styles.statLabel}>Pickup Requests</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{myTasks.length}</Text>
            <Text style={styles.statLabel}>Accepted Pickups</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{completedDeliveries.length}</Text>
            <Text style={styles.statLabel}>Completed Deliveries</Text>
          </View>
        </View>

        {/* Telemetry Status Box (Screenshot 3) */}
        <View style={styles.telemetryBox}>
          <Text style={styles.telemetryTitle}>📡 LIVE VOLUNTEER GPS TELEMETRY STATUS:</Text>
          <Text style={styles.telemetryDesc}>Idle (No Active Task in Progress)</Text>
        </View>

        {/* Map Section Card (Screenshot 3) */}
        <View style={styles.mapCard}>
          <View style={styles.mapCardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.mapTitle}>📍 Volunteer Live Route Navigation Map</Text>
              <Text style={styles.mapSubTitle}>🚴 Volunteer Pickup & Delivery Route</Text>
            </View>
            <TouchableOpacity
              style={styles.openDirectionsBtn}
              onPress={() => {
                Linking.openURL(
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(volunteerAddress)}`
                );
              }}
            >
              <Text style={styles.openDirectionsText}>🗺️ Open Directions</Text>
            </TouchableOpacity>
          </View>

          {/* Volunteer Coordinates Banner (Screenshot 3) */}
          <View style={styles.coordsBanner}>
            <Text style={styles.coordsBannerText}>
              🚴 Volunteer: {user?.name || 'C sangita'} ({user?.latitude || 17.385}, {user?.longitude || 78.487})
            </Text>
          </View>

          {/* Map Display */}
          <View style={styles.mapWrapper}>
            <LocationMap
              pickupCoords={{ lat: user?.latitude || 17.3850, lng: user?.longitude || 78.4867, address: volunteerAddress }}
              deliveryType="VOLUNTEER_DELIVERY"
              role="VOLUNTEER"
            />
          </View>
        </View>

        {/* Active Tasks & Pickups */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>📦 Available Delivery Pickups ({availablePickups.length})</Text>
          {availablePickups.length === 0 ? (
            <Text style={styles.emptyText}>No available pickups in your area right now.</Text>
          ) : (
            availablePickups.map((d) => (
              <View key={d.id || d._id} style={styles.taskRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.taskName}>{d.food_name || d.foodName} ({d.quantity} {d.unit || 'Packs'})</Text>
                  <Text style={styles.taskMeta}>📍 Pickup: {d.address}</Text>
                  <Text style={styles.taskMeta}>🏁 Drop-off: {d.recipientAddress || 'Pending Recipient'}</Text>
                </View>
                <TouchableOpacity
                  style={styles.acceptBtn}
                  onPress={() => handleAcceptTask(d.id || d._id)}
                  disabled={actionLoading}
                >
                  <Text style={styles.acceptBtnText}>✓ Accept</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  scrollContent: { paddingBottom: 30 },
  header: {
    backgroundColor: '#1565c0',
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
  headerSub1: { fontSize: 12, color: '#e3f2fd', marginTop: 2 },
  headerSub2: { fontSize: 10, color: '#bbdefb', marginTop: 2 },
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
  statNumber: { fontSize: 20, fontWeight: 'bold', color: '#1565c0' },
  statLabel: { fontSize: 11, color: '#666666', marginTop: 4, textAlign: 'center' },

  // Telemetry Box
  telemetryBox: {
    backgroundColor: '#ffffff',
    marginHorizontal: 14,
    marginTop: 14,
    padding: 14,
    borderRadius: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#1565c0',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  telemetryTitle: { fontSize: 11, fontWeight: 'bold', color: '#1565c0' },
  telemetryDesc: { fontSize: 13, color: '#333333', fontWeight: '600', marginTop: 4 },

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
  mapTitle: { fontSize: 14, fontWeight: 'bold', color: '#1565c0' },
  mapSubTitle: { fontSize: 11, color: '#666666', marginTop: 2 },
  openDirectionsBtn: {
    backgroundColor: '#1565c0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 6,
  },
  openDirectionsText: { color: '#ffffff', fontSize: 11, fontWeight: 'bold' },
  coordsBanner: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
  },
  coordsBannerText: { fontSize: 11, color: '#333333', fontWeight: '600' },
  mapWrapper: { height: 260, borderRadius: 12, overflow: 'hidden' },

  // Sections
  sectionCard: {
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
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#1565c0', marginBottom: 10 },
  emptyText: { fontSize: 12, color: '#888888', textAlign: 'center', paddingVertical: 12 },
  taskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  taskName: { fontSize: 14, fontWeight: 'bold', color: '#263238' },
  taskMeta: { fontSize: 12, color: '#666666', marginTop: 2 },
  acceptBtn: {
    backgroundColor: '#1565c0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  acceptBtnText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
});
