// ProfileScreen.js — Rebuilt to match Web Administrator Profile & User Profile modal UI
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { updateUserProfile } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen({ navigation, user, onLogout }) {
  const role = (user?.role || 'DONOR').toUpperCase();
  const isAdmin = Boolean(user?.isAdmin || user?.adminAccess || role === 'ADMIN');

  const getRoleAddress = () => {
    if (role === 'NGO') return user?.ngoAddress || user?.formattedAddress || user?.address || '';
    if (role === 'RECEIVER') return user?.receiverAddress || user?.formattedAddress || user?.address || '';
    if (role === 'VOLUNTEER') return user?.volunteerAddress || user?.formattedAddress || user?.address || '';
    return user?.donorAddress || user?.formattedAddress || user?.address || '';
  };

  const [editingAddress, setEditingAddress] = useState(false);
  const [addressValue, setAddressValue] = useState(getRoleAddress());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setAddressValue(getRoleAddress());
  }, [user, role]);

  const handleRoleSwitch = async (targetRole) => {
    const hasTargetAddress =
      targetRole === 'NGO'
        ? Boolean(user?.ngoAddress || user?.roleProfiles?.ngo?.isRegistered)
        : targetRole === 'RECEIVER'
        ? Boolean(user?.receiverAddress || user?.roleProfiles?.beneficiary?.isRegistered)
        : targetRole === 'VOLUNTEER'
        ? Boolean(user?.volunteerAddress || user?.roleProfiles?.volunteer?.isRegistered)
        : Boolean(user?.donorAddress || user?.address || user?.roleProfiles?.donor?.isRegistered);

    if (user) {
      user.role = targetRole;
    }
    await AsyncStorage.setItem('sharebite_role', targetRole);

    if (!hasTargetAddress) {
      const setupRoutes = {
        DONOR: 'DonorSetup',
        NGO: 'NGOSetup',
        VOLUNTEER: 'VolunteerSetup',
        RECEIVER: 'ReceiverSetup',
      };
      navigation.navigate(setupRoutes[targetRole] || 'DonorSetup', { selectedRole: targetRole, user });
    } else {
      const dashRoutes = {
        DONOR: 'DonorDashboard',
        NGO: 'NGODashboard',
        VOLUNTEER: 'VolunteerDashboard',
        RECEIVER: 'ReceiverDashboard',
        ADMIN: 'AdminDashboard',
      };
      navigation.navigate(dashRoutes[targetRole] || 'DonorDashboard');
    }
  };

  const handleSaveAddress = async () => {
    if (!addressValue.trim()) {
      Alert.alert('Required', 'Please enter a valid address.');
      return;
    }
    setSaving(true);
    try {
      const uid = user?.id || user?._id;
      const res = await updateUserProfile({
        userId: uid,
        email: user?.email,
        activeRole: role,
        role: role,
        address: addressValue.trim(),
        formattedAddress: addressValue.trim(),
        donorAddress: role === 'DONOR' || role === 'ADMIN' ? addressValue.trim() : undefined,
        ngoAddress: role === 'NGO' ? addressValue.trim() : undefined,
        receiverAddress: role === 'RECEIVER' ? addressValue.trim() : undefined,
        volunteerAddress: role === 'VOLUNTEER' ? addressValue.trim() : undefined,
        adminAddress: role === 'ADMIN' ? addressValue.trim() : undefined,
      });
      setSaving(false);
      if (res.success) {
        Alert.alert('✅ Saved', `${role} address updated successfully!`);
        setEditingAddress(false);
      } else {
        Alert.alert('Error', res.message || 'Failed to update address.');
      }
    } catch (e) {
      setSaving(false);
      Alert.alert('Error', 'Connection error. Please try again.');
    }
  };

  const handleLogoutPress = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          if (onLogout) {
            await onLogout();
          }
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f2f5" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Centered Modal Card matching Web layout */}
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={styles.shieldIcon}>
                <Text style={{ fontSize: 18 }}>{isAdmin ? '🛡️' : '👤'}</Text>
              </View>
              <Text style={styles.headerTitle}>
                {isAdmin ? 'Administrator Profile' : 'User Profile'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Info Rows */}
          <View style={styles.modalBody}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{user?.name || 'Administrator'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{user?.email || 'N/A'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Active Role:</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>{role || 'DONOR'}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mobile:</Text>
              <Text style={styles.infoValue}>{user?.mobile || '9493356712'}</Text>
            </View>

            {/* Switch Active Role Section */}
            <View style={styles.sectionDivider}>
              <Text style={styles.sectionHeading}>🔄 Switch Active Role:</Text>
              <View style={styles.roleButtonsRow}>
                {['DONOR', 'NGO', 'VOLUNTEER', 'RECEIVER'].map((r) => {
                  const isActive = role === r;
                  return (
                    <TouchableOpacity
                      key={r}
                      style={[styles.roleBtn, isActive && styles.roleBtnActive]}
                      onPress={() => handleRoleSwitch(r)}
                    >
                      <Text style={[styles.roleBtnText, isActive && styles.roleBtnTextActive]}>
                        {r}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Role Address Section */}
            <View style={styles.sectionDivider}>
              <View style={styles.addressHeaderRow}>
                <Text style={styles.sectionHeading}>📍 {role} Address:</Text>
                {!editingAddress && (
                  <TouchableOpacity
                    style={styles.editAddressBtn}
                    onPress={() => setEditingAddress(true)}
                  >
                    <Text style={styles.editAddressBtnText}>✏️ Edit {role} Address</Text>
                  </TouchableOpacity>
                )}
              </View>

              {!editingAddress ? (
                <Text style={styles.addressText}>
                  {addressValue || `No ${role} address configured yet.`}
                </Text>
              ) : (
                <View style={{ marginTop: 8 }}>
                  <TextInput
                    style={styles.addressInput}
                    placeholder={`Enter ${role} address...`}
                    value={addressValue}
                    onChangeText={setAddressValue}
                    multiline
                    numberOfLines={3}
                  />
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                    <TouchableOpacity
                      style={styles.saveBtn}
                      onPress={handleSaveAddress}
                      disabled={saving}
                    >
                      {saving ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <Text style={styles.saveBtnText}>✓ Save {role} Address</Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={() => setEditingAddress(false)}
                    >
                      <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.modalLogoutBtn} onPress={handleLogoutPress}>
            <Text style={styles.modalLogoutBtnText}>🚪 Sign Out / Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  scrollContent: {
    padding: 16,
    paddingVertical: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 420,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    paddingBottom: 12,
  },
  shieldIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#263238',
  },
  closeBtn: {
    padding: 4,
  },
  closeBtnText: {
    fontSize: 18,
    color: '#888888',
    fontWeight: 'bold',
  },
  modalBody: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222222',
  },
  roleBadge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roleBadgeText: {
    color: '#2e7d32',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sectionDivider: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
    borderStyle: 'dashed',
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#666666',
    marginBottom: 8,
  },
  roleButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 4,
  },
  roleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cccccc',
    backgroundColor: '#f9f9f9',
  },
  roleBtnActive: {
    borderColor: '#2e7d32',
    backgroundColor: '#e8f5e9',
  },
  roleBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333333',
  },
  roleBtnTextActive: {
    color: '#2e7d32',
  },
  addressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  editAddressBtn: {
    backgroundColor: '#e8f5e9',
    borderWidth: 1,
    borderColor: '#c8e6c9',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editAddressBtnText: {
    color: '#2e7d32',
    fontSize: 11,
    fontWeight: 'bold',
  },
  addressText: {
    fontSize: 13,
    color: '#333333',
    fontWeight: '600',
    lineHeight: 18,
    marginTop: 2,
  },
  addressInput: {
    borderWidth: 1.5,
    borderColor: '#2e7d32',
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    color: '#222222',
    backgroundColor: '#fafafa',
    minHeight: 70,
    textAlignVertical: 'top',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#2e7d32',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cancelBtn: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#666666',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalLogoutBtn: {
    width: '100%',
    paddingVertical: 13,
    backgroundColor: '#c62828',
    borderRadius: 10,
    alignItems: 'center',
    elevation: 1,
  },
  modalLogoutBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
