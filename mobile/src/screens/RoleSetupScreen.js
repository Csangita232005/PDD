// RoleSetupScreen.js — Handles Donor/NGO/Volunteer/Receiver setup on mobile
// Mirrors the same backend API calls as the web setup pages
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { updateUserProfile } from '../services/api';
import { COLORS } from '../shared/theme';

const ROLE_CONFIG = {
  DONOR: {
    title: '🍱 Donor Setup',
    subtitle: 'Set up your Donor profile to start donating food',
    color: '#2e7d32',
    bg: '#e8f5e9',
    dashboardRoute: 'DonorDashboard',
    fields: ['address'],
  },
  NGO: {
    title: '🏛️ NGO Setup',
    subtitle: 'Set up your NGO profile to receive and distribute food',
    color: '#1565c0',
    bg: '#e3f2fd',
    dashboardRoute: 'NGODashboard',
    fields: ['organizationName', 'address'],
  },
  VOLUNTEER: {
    title: '🚴 Volunteer Setup',
    subtitle: 'Set up your Volunteer profile to deliver food',
    color: '#7b1fa2',
    bg: '#f3e5f5',
    dashboardRoute: 'VolunteerDashboard',
    fields: ['vehicleType', 'address'],
  },
  RECEIVER: {
    title: '🤲 Beneficiary Setup',
    subtitle: 'Set up your Beneficiary profile to receive food',
    color: '#ef6c00',
    bg: '#fff3e0',
    dashboardRoute: 'ReceiverDashboard',
    fields: ['householdSize', 'address'],
  },
};

export default function RoleSetupScreen({ navigation, route }) {
  const { selectedRole = 'DONOR', user } = route.params || {};
  const config = ROLE_CONFIG[selectedRole] || ROLE_CONFIG.DONOR;

  const [address, setAddress] = useState(
    selectedRole === 'DONOR' ? (user?.donorAddress || user?.address || '') :
    selectedRole === 'NGO' ? (user?.ngoAddress || '') :
    selectedRole === 'VOLUNTEER' ? (user?.volunteerAddress || '') :
    (user?.receiverAddress || '')
  );
  const [organizationName, setOrganizationName] = useState(user?.organizationName || '');
  const [vehicleType, setVehicleType] = useState(user?.vehicleType || 'Bike');
  const [householdSize, setHouseholdSize] = useState(String(user?.householdSize || '1'));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!address.trim()) {
      Alert.alert('Required', 'Please enter your address to continue.');
      return;
    }
    if (selectedRole === 'NGO' && !organizationName.trim()) {
      Alert.alert('Required', 'Please enter your organization name.');
      return;
    }

    setSaving(true);
    try {
      const uid = user?.id || user?._id;
      const roleKey = selectedRole === 'RECEIVER' ? 'beneficiary' : selectedRole.toLowerCase();

      const payload = {
        userId: uid,
        email: user?.email,
        activeRole: selectedRole,
        role: selectedRole,
        address: address.trim(),
        formattedAddress: address.trim(),
        latitude: 17.3850,
        longitude: 78.4867,
      };

      if (selectedRole === 'NGO') {
        payload.organizationName = organizationName.trim();
      }
      if (selectedRole === 'VOLUNTEER') {
        payload.vehicleType = vehicleType;
      }
      if (selectedRole === 'RECEIVER') {
        payload.householdSize = parseInt(householdSize) || 1;
      }

      const res = await updateUserProfile(payload);
      setSaving(false);

      if (res.success) {
        Alert.alert(
          '✅ Profile Saved',
          `${selectedRole} profile setup complete!`,
          [
            {
              text: 'Open Dashboard',
              onPress: () => navigation.navigate(config.dashboardRoute, { user: { ...user, ...payload } }),
            },
          ]
        );
      } else {
        Alert.alert('Error', res.message || 'Failed to save profile. Please try again.');
      }
    } catch (e) {
      setSaving(false);
      Alert.alert('Error', 'Connection error. Please check your internet connection.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={config.color} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: config.color }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{config.title}</Text>
          <Text style={styles.headerSubtitle}>{config.subtitle}</Text>
        </View>

        <View style={styles.card}>
          {/* Organization Name (NGO only) */}
          {selectedRole === 'NGO' && (
            <>
              <Text style={styles.label}>Organization Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Child Orphanage Trust"
                value={organizationName}
                onChangeText={setOrganizationName}
              />
            </>
          )}

          {/* Vehicle Type (Volunteer only) */}
          {selectedRole === 'VOLUNTEER' && (
            <>
              <Text style={styles.label}>Vehicle Type</Text>
              <View style={styles.chipRow}>
                {['Bike', 'Car', 'Cycle', 'Walk'].map((v) => (
                  <TouchableOpacity
                    key={v}
                    style={[styles.chip, vehicleType === v && styles.chipActive]}
                    onPress={() => setVehicleType(v)}
                  >
                    <Text style={[styles.chipText, vehicleType === v && styles.chipTextActive]}>{v}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Household Size (Receiver only) */}
          {selectedRole === 'RECEIVER' && (
            <>
              <Text style={styles.label}>Household Size (no. of people)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 4"
                keyboardType="numeric"
                value={householdSize}
                onChangeText={setHouseholdSize}
              />
            </>
          )}

          {/* Address (All roles) */}
          <Text style={styles.label}>
            {selectedRole === 'DONOR' ? 'Pickup Address' :
             selectedRole === 'NGO' ? 'Organization Address' :
             selectedRole === 'VOLUNTEER' ? 'Your Address / Area' :
             'Delivery Address'} *
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter your full address, landmark, city, state..."
            value={address}
            onChangeText={setAddress}
            multiline
            numberOfLines={3}
          />

          <Text style={{ fontSize: 12, color: '#888', marginBottom: 16, lineHeight: 18 }}>
            💡 Tip: Enter your full address with landmark for accurate food tracking.
          </Text>

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: config.color }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>✓ Save & Open Dashboard</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipBtn} onPress={() => navigation.navigate(config.dashboardRoute)}>
            <Text style={styles.skipText}>Skip for now → Open Dashboard</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollContent: { paddingBottom: 40 },
  header: {
    padding: 20,
    paddingTop: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backBtn: { marginBottom: 8 },
  backText: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600' },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  headerSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 13 },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: -10,
    padding: 20,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  label: { fontSize: 13, fontWeight: '700', color: '#333', marginBottom: 6, marginTop: 14 },
  input: {
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#fafafa',
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 4 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#ccc',
    backgroundColor: '#f9f9f9',
  },
  chipActive: { backgroundColor: '#2e7d32', borderColor: '#2e7d32' },
  chipText: { fontSize: 14, color: '#555', fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  saveBtn: {
    marginTop: 20,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  skipBtn: { marginTop: 12, alignItems: 'center', paddingVertical: 10 },
  skipText: { color: '#888', fontSize: 13 },
});
