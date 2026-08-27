// ReceiverDashboardScreen.js — Fully matches Web Beneficiary Dashboard (Screenshot 4)
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
  Modal,
  Alert,
  Linking,
} from 'react-native';
import { getDonations, claimDonationApi, updateDeliveryStage } from '../services/api';
import LocationMap from '../components/LocationMap';
import { getSocket, joinUserRoom, joinRoleRoom } from '../services/socket';

export default function ReceiverDashboardScreen({ navigation, user, onLogout }) {
  const [allDonations, setAllDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [collectionMethod, setCollectionMethod] = useState('VOLUNTEER_DELIVERY');

  const uid = user?.id || user?._id;
  const receiverAddress =
    user?.roleProfiles?.beneficiary?.address?.formattedAddress ||
    user?.receiverAddress ||
    user?.address ||
    'Proddatur, Kadapa, Andhra Pradesh';

  const fetchDonations = useCallback(async () => {
    try {
      const res = await getDonations();
      if (res.success) setAllDonations(res.donations || []);
    } catch (e) {
      console.warn('Failed to fetch receiver donations:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDonations();
    const socket = getSocket();
    if (uid) {
      joinUserRoom(uid);
      joinRoleRoom('RECEIVER');
    }
    const refresh = () => fetchDonations();
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
  }, [fetchDonations, uid]);

  const availableFood = allDonations.filter(
    (d) =>
      d.status === 'PENDING' &&
      (!d.ngo_id || d.ngo_id === '') &&
      (!d.receiver_id || d.receiver_id === '') &&
      (d.intendedRecipient === 'RECEIVER' || d.intendedRecipient === 'ALL' || !d.intendedRecipient)
  );

  const myRequests = allDonations.filter(
    (d) =>
      (d.receiver_id === uid ||
        (d.claimedBy?.role === 'RECEIVER' && d.claimedBy?.userId === uid) ||
        d.acceptedByReceiver === user?.name) &&
      d.status !== 'COMPLETED'
  );

  const mealsReceived = allDonations.filter(
    (d) =>
      (d.receiver_id === uid ||
        (d.claimedBy?.role === 'RECEIVER' && d.claimedBy?.userId === uid) ||
        d.acceptedByReceiver === user?.name) &&
      d.status === 'COMPLETED'
  );

  const handleConfirmRequest = async () => {
    if (!selectedDonation) return;
    setActionLoading(true);
    try {
      const donId = selectedDonation.id || selectedDonation._id;
      const res = await claimDonationApi(donId, {
        userRole: 'RECEIVER',
        userId: uid,
        userName: user?.name || 'Beneficiary',
        collectionMethod,
        userPhone: user?.mobile || '',
        userAddress: receiverAddress,
      });
      setActionLoading(false);
      setSelectedDonation(null);
      if (res.success) {
        Alert.alert('✅ Success', 'Food request submitted successfully!');
        fetchDonations();
      } else {
        Alert.alert('Error', res.message || 'Failed to submit request.');
      }
    } catch (err) {
      setActionLoading(false);
      Alert.alert('Error', 'Connection error. Please try again.');
    }
  };

  const handleConfirmReceived = async (donationId) => {
    setActionLoading(true);
    try {
      const res = await updateDeliveryStage(donationId, 'COMPLETED');
      setActionLoading(false);
      if (res.success) {
        Alert.alert('🎉 Food Received', 'Thank you! Food receipt has been confirmed.');
        fetchDonations();
      } else {
        Alert.alert('Error', res.message || 'Failed to confirm.');
      }
    } catch (e) {
      setActionLoading(false);
      Alert.alert('Error', 'Failed to confirm.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#e65100" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Header Banner (Screenshot 4) */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <View style={styles.iconBox}>
                <Text style={{ fontSize: 22 }}>🤲</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.headerTitle}>Welcome, Beneficiary {user?.name || 'C sangita'}</Text>
                <Text style={styles.headerSub1}>🤲 {user?.name || 'C sangita'}</Text>
                <Text style={styles.headerSub2}>
                  Browse available food donations & track active requests
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
                <Text style={{ fontSize: 16 }}>🤲</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 3 Top Stat Cards (Screenshot 4) */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{availableFood.length}</Text>
            <Text style={styles.statLabel}>Available Food Items</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{myRequests.length}</Text>
            <Text style={styles.statLabel}>My Active Requests</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{mealsReceived.length}</Text>
            <Text style={styles.statLabel}>Meals Received</Text>
          </View>
        </View>

        {/* Map Section Card (Screenshot 4) */}
        <View style={styles.mapCard}>
          <View style={styles.mapCardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.mapTitle}>📍 Nearby Available Food Supply & Drop-off Points Map</Text>
              <Text style={styles.mapSubTitle}>🚴 Volunteer Pickup & Delivery Route</Text>
            </View>
            <TouchableOpacity
              style={styles.openDirectionsBtn}
              onPress={() => {
                Linking.openURL(
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(receiverAddress)}`
                );
              }}
            >
              <Text style={styles.openDirectionsText}>🗺️ Open Directions</Text>
            </TouchableOpacity>
          </View>

          {/* Destination Banner (Screenshot 4) */}
          <View style={styles.addressBanner}>
            <Text style={styles.addressBannerText}>🏁 Destination: {receiverAddress}</Text>
          </View>

          {/* Map Display */}
          <View style={styles.mapWrapper}>
            <LocationMap
              pickupCoords={{ lat: user?.latitude || 17.3850, lng: user?.longitude || 78.4867, address: receiverAddress }}
              dropoffCoords={{ lat: user?.latitude || 17.3850, lng: user?.longitude || 78.4867, address: receiverAddress }}
              deliveryType="VOLUNTEER_DELIVERY"
              role="RECEIVER"
            />
          </View>
        </View>

        {/* Available Food Listings */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>🍲 Available Nutritious Food Meals ({availableFood.length})</Text>
          {availableFood.length === 0 ? (
            <Text style={styles.emptyText}>No available food donations in your neighborhood right now.</Text>
          ) : (
            availableFood.map((d) => (
              <View key={d.id || d._id} style={styles.foodRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.foodName}>{d.food_name || d.foodName} ({d.quantity} {d.unit || 'Packs'})</Text>
                  <Text style={styles.foodMeta}>👤 Donor: {d.donor_name || d.donorName}</Text>
                  <Text style={styles.foodMeta}>📍 Pickup: {d.address}</Text>
                </View>
                <TouchableOpacity
                  style={styles.requestBtn}
                  onPress={() => {
                    setSelectedDonation(d);
                    const isDonorSelf = d.deliveryPreference === 'DONOR_DELIVERY' || d.deliveryMode === 'DONOR_DELIVERY';
                    setCollectionMethod(isDonorSelf ? 'DONOR_DELIVERY' : 'VOLUNTEER_DELIVERY');
                  }}
                >
                  <Text style={styles.requestBtnText}>Request Food</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* My Active Food Requests */}
        {myRequests.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={[styles.sectionTitle, { color: '#e65100' }]}>
              📦 My Active Food Requests ({myRequests.length})
            </Text>
            {myRequests.map((d) => (
              <View key={d.id || d._id} style={styles.foodRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.foodName}>{d.food_name || d.foodName} ({d.quantity} {d.unit || 'Packs'})</Text>
                  <Text style={styles.foodMeta}>Status: <Text style={{ color: '#e65100', fontWeight: 'bold' }}>{d.status}</Text></Text>
                  <Text style={styles.foodMeta}>📍 Pickup: {d.address}</Text>
                </View>
                {d.status === 'DELIVERED' && (
                  <TouchableOpacity
                    style={[styles.requestBtn, { backgroundColor: '#2e7d32' }]}
                    onPress={() => handleConfirmReceived(d.id || d._id)}
                  >
                    <Text style={styles.requestBtnText}>✓ Confirm Received</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Request Modal */}
        <Modal visible={Boolean(selectedDonation)} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Request Nutritious Food</Text>
              <Text style={{ fontSize: 13, color: '#444', marginBottom: 12 }}>
                {selectedDonation?.food_name || selectedDonation?.foodName} ({selectedDonation?.quantity} {selectedDonation?.unit || 'Packs'})
              </Text>

              <Text style={styles.modalLabel}>Delivery Preference:</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
                <TouchableOpacity
                  style={[styles.methodChip, collectionMethod === 'VOLUNTEER_DELIVERY' && styles.methodChipActive]}
                  onPress={() => setCollectionMethod('VOLUNTEER_DELIVERY')}
                >
                  <Text style={[styles.methodChipText, collectionMethod === 'VOLUNTEER_DELIVERY' && { color: '#fff' }]}>
                    🚴 Volunteer Delivery
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.methodChip, collectionMethod === 'RECEIVER_PICKUP' && styles.methodChipActive]}
                  onPress={() => setCollectionMethod('RECEIVER_PICKUP')}
                >
                  <Text style={[styles.methodChipText, collectionMethod === 'RECEIVER_PICKUP' && { color: '#fff' }]}>
                    🚶 Self Pickup
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  style={[styles.modalActionBtn, { backgroundColor: '#e65100' }]}
                  onPress={handleConfirmRequest}
                  disabled={actionLoading}
                >
                  {actionLoading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.modalActionBtnText}>Confirm Request</Text>}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalActionBtn, { backgroundColor: '#9e9e9e' }]}
                  onPress={() => setSelectedDonation(null)}
                >
                  <Text style={styles.modalActionBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  scrollContent: { paddingBottom: 30 },
  header: {
    backgroundColor: '#e65100',
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
  headerSub1: { fontSize: 12, color: '#ffe0b2', marginTop: 2 },
  headerSub2: { fontSize: 10, color: '#ffcc80', marginTop: 2 },
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
  statNumber: { fontSize: 20, fontWeight: 'bold', color: '#e65100' },
  statLabel: { fontSize: 11, color: '#666666', marginTop: 4, textAlign: 'center' },

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
  mapTitle: { fontSize: 14, fontWeight: 'bold', color: '#e65100' },
  mapSubTitle: { fontSize: 11, color: '#666666', marginTop: 2 },
  openDirectionsBtn: {
    backgroundColor: '#1565c0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 6,
  },
  openDirectionsText: { color: '#ffffff', fontSize: 11, fontWeight: 'bold' },
  addressBanner: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
  },
  addressBannerText: { fontSize: 11, color: '#333333', fontWeight: '600' },
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
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#e65100', marginBottom: 10 },
  emptyText: { fontSize: 12, color: '#888888', textAlign: 'center', paddingVertical: 12 },
  foodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  foodName: { fontSize: 14, fontWeight: 'bold', color: '#263238' },
  foodMeta: { fontSize: 12, color: '#666666', marginTop: 2 },
  requestBtn: {
    backgroundColor: '#e65100',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  requestBtnText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },

  // Modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '100%', maxWidth: 360 },
  modalTitle: { fontSize: 16, fontWeight: 'bold', color: '#263238', marginBottom: 6 },
  modalLabel: { fontSize: 12, fontWeight: '600', color: '#666', marginBottom: 6 },
  methodChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', backgroundColor: '#f9f9f9' },
  methodChipActive: { backgroundColor: '#e65100', borderColor: '#e65100' },
  methodChipText: { fontSize: 12, fontWeight: '600', color: '#333' },
  modalActionBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  modalActionBtnText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
});
