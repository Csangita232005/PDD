// AdminDashboardScreen.js — Fully matches Web Admin Dashboard (Image 3 & Image 4)
// Tabs: Overview | Users | Food Requests | Deliveries | System Notifications | Audit Trail
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
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import {
  getAdminStatsApi,
  getAdminUsersApi,
  toggleUserStatusApi,
  getDonations,
  cancelFlagDonationApi,
  getAuditTrailApi,
  getNotifications,
  getActiveDeliveriesAdminApi,
  updateUserAddressApi,
} from '../services/api';
import { getSocket, joinUserRoom, joinRoleRoom } from '../services/socket';

// ─── Colors matching Web Admin Dashboard Exactly ──────────────────────────────
const C = {
  headerBg: '#263238',
  headerSub: '#90a4ae',
  headerDesc: '#78909c',
  blue: '#1565c0',
  green: '#2e7d32',
  darkGreen: '#1b5e20',
  orange: '#e65100',
  red: '#c62828',
  darkText: '#333333',
  bg: '#f0f2f5',
  cardBg: '#ffffff',
  border: '#e0e0e0',
  badge: {
    DONOR: '#e8f5e9',
    NGO: '#e3f2fd',
    RECEIVER: '#fff3e0',
    VOLUNTEER: '#f3e5f5',
    ADMIN: '#e8f5e9',
  },
  badgeText: {
    DONOR: '#2e7d32',
    NGO: '#1565c0',
    RECEIVER: '#e65100',
    VOLUNTEER: '#7b1fa2',
    ADMIN: '#2e7d32',
  },
};

const TABS = [
  { id: 'overview', label: '📊 Overview' },
  { id: 'users', label: '👤 Users' },
  { id: 'donations', label: '📦 Food Requests' },
  { id: 'deliveries', label: '🚴 Deliveries' },
  { id: 'notifications', label: '🔔 System Notifications' },
  { id: 'audit', label: '📜 Audit Trail' },
];

export default function AdminDashboardScreen({ navigation, user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    donorsCount: 2,
    ngosCount: 1,
    receiversCount: 1,
    volunteersCount: 1,
    totalDonations: 0,
    activeDeliveries: 0,
    completedDonations: 0,
    cancelledCount: 0,
  });
  const [users, setUsers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [auditTrail, setAuditTrail] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filter state
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [donationSearch, setDonationSearch] = useState('');
  const [donationStatusFilter, setDonationStatusFilter] = useState('ALL');

  // Administrator Profile Modal Popup (Image 3)
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [adminAddress, setAdminAddress] = useState(
    user?.donorAddress || user?.address || user?.adminAddress || 'Proddatur, Kadapa, Andhra Pradesh'
  );
  const [newAddressInput, setNewAddressInput] = useState('');
  const [savingAddress, setSavingAddress] = useState(false);

  const fetchAdminData = useCallback(async () => {
    try {
      const [rStats, rUsers, rDonations, rAudit, rNotif, rDeliv] = await Promise.all([
        getAdminStatsApi(),
        getAdminUsersApi(),
        getDonations(),
        getAuditTrailApi(),
        getNotifications(),
        getActiveDeliveriesAdminApi(),
      ]);

      if (rStats.success && rStats.stats) setStats((prev) => ({ ...prev, ...rStats.stats }));
      if (rUsers.success) setUsers(rUsers.users || []);
      if (rDonations.success) setDonations(rDonations.donations || []);
      if (rAudit.success) setAuditTrail(rAudit.auditTrail || []);
      if (rNotif.success) setNotifications(rNotif.notifications || []);
      if (rDeliv.success) setDeliveries(rDeliv.deliveries || []);
    } catch (e) {
      console.warn('Admin fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
    const socket = getSocket();
    const uid = user?.id || user?._id;
    if (uid) {
      joinUserRoom(uid);
      joinRoleRoom('ADMIN');
    }
    const refresh = () => fetchAdminData();
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
  }, [fetchAdminData, user]);

  // ─── Filter Logic ─────────────────────────────────────────────────────────
  const filteredUsers = users.filter((u) => {
    const roles = u.registeredRoles || [u.role];
    const matchRole = userRoleFilter === 'ALL' || roles.includes(userRoleFilter) || u.role === userRoleFilter;
    const q = userSearch.toLowerCase().trim();
    const matchSearch =
      !q ||
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.mobile || '').includes(q);
    return matchRole && matchSearch;
  });

  const filteredDonations = donations.filter((d) => {
    const matchStatus = donationStatusFilter === 'ALL' || d.status === donationStatusFilter;
    const q = donationSearch.toLowerCase().trim();
    const matchSearch =
      !q ||
      (d.food_name || d.foodName || '').toLowerCase().includes(q) ||
      (d.donor_name || d.donorName || '').toLowerCase().includes(q) ||
      (d.address || '').toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const activeDeliveriesList = donations.filter((d) =>
    ['VOLUNTEER_ASSIGNED', 'PICKUP_STARTED', 'PICKED_UP', 'IN_TRANSIT'].includes(d.status)
  );

  // ─── Actions ───────────────────────────────────────────────────────────────
  const handleToggleUser = async (userId, isActive) => {
    Alert.alert(
      isActive ? 'Deactivate User' : 'Activate User',
      `Are you sure you want to ${isActive ? 'deactivate' : 'activate'} this user account?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isActive ? 'Deactivate' : 'Activate',
          style: isActive ? 'destructive' : 'default',
          onPress: async () => {
            setActionLoading(true);
            const res = await toggleUserStatusApi(userId);
            setActionLoading(false);
            Alert.alert(res.success ? '✅ Success' : '❌ Error', res.message || 'Status updated');
            if (res.success) fetchAdminData();
          },
        },
      ]
    );
  };

  const handleFlagDonation = (donId) => {
    Alert.prompt(
      '⚠️ Flag / Cancel Request',
      'Enter reason for cancelling / flagging this donation request:',
      async (reason) => {
        if (reason === null || reason === undefined) return;
        setActionLoading(true);
        const res = await cancelFlagDonationApi(donId, reason || 'Invalid or duplicate request');
        setActionLoading(false);
        Alert.alert(res.success ? '✅ Flagged' : '❌ Error', res.message || 'Donation flagged');
        if (res.success) fetchAdminData();
      },
      'plain-text',
      'Invalid or duplicate request'
    );
  };

  const handleSaveAdminAddress = async () => {
    if (!newAddressInput.trim()) {
      Alert.alert('Required', 'Please enter a valid address.');
      return;
    }
    setSavingAddress(true);
    try {
      const uid = user?.id || user?._id;
      const res = await updateUserAddressApi(uid, {
        address: newAddressInput.trim(),
        donorAddress: newAddressInput.trim(),
        adminAddress: newAddressInput.trim(),
        formattedAddress: newAddressInput.trim(),
      });
      setSavingAddress(false);
      if (res.success) {
        setAdminAddress(newAddressInput.trim());
        setEditingAddress(false);
        Alert.alert('✅ Saved', 'ADMIN address updated successfully! 📍');
      } else {
        Alert.alert('Error', res.message || 'Failed to update address.');
      }
    } catch (e) {
      setSavingAddress(false);
      Alert.alert('Error', 'Connection error. Please try again.');
    }
  };

  const handleRoleSwitch = (targetRole) => {
    setProfileModalVisible(false);
    const routes = {
      DONOR: 'DonorDashboard',
      NGO: 'NGODashboard',
      VOLUNTEER: 'VolunteerDashboard',
      RECEIVER: 'ReceiverDashboard',
      ADMIN: 'AdminDashboard',
    };
    navigation.navigate(routes[targetRole] || 'DonorDashboard');
  };

  const handleLogout = () => {
    setProfileModalVisible(false);
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

  // ─── ADMIN HEADER (Pixel-match with Web Image 4) ───────────────────────────
  const AdminHeader = () => (
    <View style={s.headerContainer}>
      <View style={s.headerTop}>
        {/* Left: Shield icon + Title */}
        <View style={s.headerLeft}>
          <View style={s.shieldLogoBox}>
            <Text style={{ fontSize: 20 }}>🛡️</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={s.headerWelcome}>Welcome, Admin {user?.name || 'C sangita'}</Text>
            <Text style={s.headerSub}>Admin Control Center & Monitoring System</Text>
            <Text style={s.headerDesc}>
              Full visibility over users, donations, deliveries & system audit trail
            </Text>
          </View>
        </View>

        {/* Right: Bell & Profile Icons */}
        <View style={s.headerRight}>
          <TouchableOpacity
            style={s.headerCircleBtn}
            onPress={() => setActiveTab('notifications')}
          >
            <Text style={{ fontSize: 16 }}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.headerCircleBtn, { marginLeft: 8 }]}
            onPress={() => setProfileModalVisible(true)}
          >
            <Text style={{ fontSize: 16 }}>🛡️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // ─── TABS BAR (Pixel-match with Web Image 4) ──────────────────────────────
  const TabsBar = () => (
    <View style={s.tabsContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12 }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const count =
            tab.id === 'users'
              ? users.length
              : tab.id === 'donations'
              ? donations.length
              : tab.id === 'deliveries'
              ? deliveries.length
              : tab.id === 'notifications'
              ? notifications.length
              : tab.id === 'audit'
              ? auditTrail.length
              : null;
          const label = count !== null ? `${tab.label} (${count})` : tab.label;

          return (
            <TouchableOpacity
              key={tab.id}
              style={[s.tabPill, isActive && s.tabPillActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[s.tabPillText, isActive && s.tabPillTextActive]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  // ─── OVERVIEW TAB (Pixel-match with Web Image 4) ───────────────────────────
  const OverviewTab = () => {
    const statCards = [
      { count: stats.donorsCount || 2, label: 'Donors 🍱', color: C.green, role: 'DONOR' },
      { count: stats.ngosCount || 1, label: 'NGOs 🏛️', color: C.darkGreen, role: 'NGO' },
      { count: stats.receiversCount || 1, label: 'Receivers 🤲', color: C.orange, role: 'RECEIVER' },
      { count: stats.volunteersCount || 1, label: 'Volunteers 🚴', color: C.blue, role: 'VOLUNTEER' },
      { count: stats.totalDonations || 0, label: 'Total Food Requests 📦', color: C.darkText, tab: 'donations' },
      { count: stats.activeDeliveries || 0, label: 'Active Deliveries 🚚', color: C.blue, tab: 'deliveries' },
      { count: stats.completedDonations || 0, label: 'Food Received / Completed ✅', color: C.green, tab: 'donations' },
      { count: stats.cancelledCount || 0, label: 'Cancelled Requests 🚫', color: C.red, tab: 'donations' },
    ];

    return (
      <View style={{ paddingBottom: 24 }}>
        {/* 8 Stats Grid */}
        <View style={s.statsGrid}>
          {statCards.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={s.statCard}
              onPress={() => {
                if (item.role) {
                  setUserRoleFilter(item.role);
                  setActiveTab('users');
                } else if (item.tab) {
                  setActiveTab(item.tab);
                }
              }}
            >
              <Text style={[s.statCountText, { color: item.color }]}>{item.count}</Text>
              <Text style={s.statLabelText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Live Delivery Monitoring System Card (Image 4) */}
        <View style={s.sectionCard}>
          <Text style={s.sectionCardTitle}>📡 Live Delivery Monitoring System</Text>
          <Text style={s.sectionCardSub}>
            Real-time fleet tracking, active routes & live telemetry pings
          </Text>

          <View style={s.liveMapInnerBox}>
            <Text style={{ fontSize: 28, marginBottom: 6 }}>📍</Text>
            <Text style={s.locationNotAvailTitle}>Location Not Available</Text>
            <Text style={s.locationNotAvailDesc}>
              No active delivery route or location coordinates to monitor.
            </Text>
          </View>
        </View>

        {/* Recent Real-Time Activity Feed Card (Image 4) */}
        <View style={s.sectionCard}>
          <Text style={s.sectionCardTitle}>⚡ Recent Real-Time Activity Feed</Text>
          {auditTrail.length === 0 ? (
            <Text style={[s.emptyMutedText, { paddingVertical: 14 }]}>
              No recent real-time activity recorded.
            </Text>
          ) : (
            auditTrail.slice(0, 8).map((item) => (
              <View key={item.id} style={s.activityRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.activityActor}>
                    {item.actor}{' '}
                    <Text style={{ fontWeight: 'normal', color: '#666' }}>({item.status}) — </Text>
                    <Text style={{ color: C.blue }}>{item.foodName}</Text>
                  </Text>
                  <Text style={s.activityNotes}>{item.notes}</Text>
                </View>
                <Text style={s.activityTime}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
              </View>
            ))
          )}
        </View>
      </View>
    );
  };

  // ─── USERS TAB ────────────────────────────────────────────────────────────
  const UsersTab = () => (
    <View style={s.sectionCard}>
      <TextInput
        style={s.searchInput}
        placeholder="Search user name, email, or mobile..."
        value={userSearch}
        onChangeText={setUserSearch}
        placeholderTextColor="#999"
      />
      {/* Role filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
        {['ALL', 'DONOR', 'NGO', 'RECEIVER', 'VOLUNTEER', 'ADMIN'].map((r) => (
          <TouchableOpacity
            key={r}
            style={[s.filterChip, userRoleFilter === r && s.filterChipActive]}
            onPress={() => setUserRoleFilter(r)}
          >
            <Text style={[s.filterChipText, userRoleFilter === r && { color: '#fff' }]}>{r}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filteredUsers.length === 0 ? (
        <Text style={[s.emptyMutedText, { paddingVertical: 20 }]}>No users found.</Text>
      ) : (
        filteredUsers.map((u) => (
          <View key={u.id || u._id} style={s.userRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.userNameText}>{u.name}</Text>
              <Text style={s.userEmailText}>{u.email}</Text>
              <Text style={s.userMobileText}>{u.mobile || 'No mobile'}</Text>
              <View style={s.rolesTagsRow}>
                {(u.registeredRoles || [u.role]).map((r) => (
                  <View key={r} style={[s.roleTagBox, { backgroundColor: C.badge[r] || '#f5f5f5' }]}>
                    <Text style={[s.roleTagText, { color: C.badgeText[r] || '#555' }]}>{r}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
              <Text style={[s.userStatusText, { color: u.isActive ? C.green : C.red }]}>
                {u.isActive ? 'ACTIVE' : 'INACTIVE'}
              </Text>
              <TouchableOpacity
                style={[s.deactivateBtn, { backgroundColor: u.isActive ? C.red : C.green }]}
                onPress={() => handleToggleUser(u.id || u._id, u.isActive)}
                disabled={actionLoading}
              >
                <Text style={s.deactivateBtnText}>{u.isActive ? 'Deactivate' : 'Activate'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </View>
  );

  // ─── FOOD REQUESTS TAB ────────────────────────────────────────────────────
  const DonationsTab = () => (
    <View style={s.sectionCard}>
      <TextInput
        style={s.searchInput}
        placeholder="Search food item, donor, or location..."
        value={donationSearch}
        onChangeText={setDonationSearch}
        placeholderTextColor="#999"
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
        {['ALL', 'PENDING', 'ACCEPTED', 'VOLUNTEER_ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED', 'CANCELLED'].map((st) => (
          <TouchableOpacity
            key={st}
            style={[s.filterChip, donationStatusFilter === st && s.filterChipActive]}
            onPress={() => setDonationStatusFilter(st)}
          >
            <Text style={[s.filterChipText, donationStatusFilter === st && { color: '#fff' }]}>
              {st.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filteredDonations.length === 0 ? (
        <Text style={[s.emptyMutedText, { paddingVertical: 20 }]}>No food requests found.</Text>
      ) : (
        filteredDonations.map((item) => {
          const donId = item.id || item._id;
          const isDone = item.status === 'COMPLETED' || item.status === 'CANCELLED';
          return (
            <View key={donId} style={s.foodCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={s.foodCardTitle}>
                    {item.food_name || item.foodName} ({item.quantity} {item.unit || 'Packs'})
                  </Text>
                  <Text style={s.foodCardMeta}>👤 Donor: {item.donor_name || item.donorName}</Text>
                  <Text style={s.foodCardMeta}>📍 Pickup: {item.address}</Text>
                  {item.assignedVolunteer && (
                    <Text style={[s.foodCardMeta, { color: C.blue }]}>🚴 Volunteer: {item.assignedVolunteer}</Text>
                  )}
                  <Text style={s.foodCardDate}>{new Date(item.createdAt).toLocaleString()}</Text>
                </View>

                <View style={{ alignItems: 'flex-end', gap: 6 }}>
                  <View style={[s.statusBadge, { backgroundColor: item.status === 'COMPLETED' ? '#e8f5e9' : item.status === 'CANCELLED' ? '#ffebee' : '#e3f2fd' }]}>
                    <Text style={[s.statusBadgeText, { color: item.status === 'COMPLETED' ? C.green : item.status === 'CANCELLED' ? C.red : C.blue }]}>
                      {item.status.replace('_', ' ')}
                    </Text>
                  </View>
                  {!isDone && (
                    <TouchableOpacity
                      style={s.flagBtn}
                      onPress={() => handleFlagDonation(donId)}
                      disabled={actionLoading}
                    >
                      <Text style={s.flagBtnText}>⚠️ Flag</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          );
        })
      )}
    </View>
  );

  // ─── DELIVERIES TAB ───────────────────────────────────────────────────────
  const DeliveriesTab = () => (
    <View style={s.sectionCard}>
      <Text style={s.sectionCardTitle}>🚴 Active Volunteer Deliveries ({activeDeliveriesList.length})</Text>
      {activeDeliveriesList.length === 0 ? (
        <Text style={[s.emptyMutedText, { paddingVertical: 20 }]}>
          No active volunteer delivery tasks in progress.
        </Text>
      ) : (
        activeDeliveriesList.map((del, idx) => (
          <View key={del.id || del._id} style={s.foodCard}>
            <Text style={[s.foodCardTitle, { color: C.blue }]}>
              Delivery Task #{idx + 1}: {del.food_name || del.foodName}
            </Text>
            <Text style={s.foodCardMeta}>
              Volunteer: <Text style={{ fontWeight: 'bold' }}>{del.assignedVolunteer || 'Assigned'}</Text> •{' '}
              <Text style={{ color: C.green, fontWeight: 'bold' }}>{del.status.replace('_', ' ')}</Text>
            </Text>
            <Text style={s.foodCardMeta}>📍 Pickup: {del.address || 'Donor Location'}</Text>
            <Text style={s.foodCardMeta}>🏁 Drop-off: {del.recipientAddress || 'Recipient Location'}</Text>
          </View>
        ))
      )}
    </View>
  );

  // ─── SYSTEM NOTIFICATIONS TAB ─────────────────────────────────────────────
  const NotificationsTab = () => (
    <View style={s.sectionCard}>
      <Text style={s.sectionCardTitle}>🔔 System Notifications Audit Log ({notifications.length})</Text>
      {notifications.length === 0 ? (
        <Text style={[s.emptyMutedText, { paddingVertical: 20 }]}>
          No system notifications yet. New activity notifications will appear here in real-time.
        </Text>
      ) : (
        notifications.map((n) => (
          <View key={n._id || n.id} style={s.activityRow}>
            <View style={{ flex: 1 }}>
              <Text style={[s.foodCardTitle, { color: C.blue }]}>{n.title}</Text>
              <Text style={{ fontSize: 13, color: '#333', marginTop: 2 }}>{n.message}</Text>
              {n.userRole && (
                <View style={[s.roleTagBox, { backgroundColor: '#e8f5e9', alignSelf: 'flex-start', marginTop: 4 }]}>
                  <Text style={[s.roleTagText, { color: C.green }]}>Target: {n.userRole}</Text>
                </View>
              )}
            </View>
            <Text style={s.activityTime}>{new Date(n.createdAt || Date.now()).toLocaleTimeString()}</Text>
          </View>
        ))
      )}
    </View>
  );

  // ─── AUDIT TRAIL TAB ──────────────────────────────────────────────────────
  const AuditTrailTab = () => (
    <View style={s.sectionCard}>
      <Text style={s.sectionCardTitle}>📜 Complete Platform Audit Trail & History</Text>
      {auditTrail.length === 0 ? (
        <Text style={[s.emptyMutedText, { paddingVertical: 20 }]}>
          No platform audit history yet. Activity logs will be recorded here live.
        </Text>
      ) : (
        auditTrail.map((item) => (
          <View key={item.id} style={s.activityRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.activityActor}>
                {item.actor}{' '}
                <Text style={{ fontWeight: 'normal', color: '#666' }}>changed status to </Text>
                <Text style={{ color: C.green, fontWeight: 'bold' }}>{item.status}</Text>
                <Text style={{ fontWeight: 'normal', color: '#666' }}> for "{item.foodName}"</Text>
              </Text>
              <Text style={s.activityNotes}>{item.notes}</Text>
            </View>
            <Text style={s.activityTime}>{new Date(item.timestamp).toLocaleString()}</Text>
          </View>
        ))
      )}
    </View>
  );

  // ─── ADMINISTRATOR PROFILE MODAL POPUP (Image 3) ───────────────────────────
  const AdministratorProfileModal = () => (
    <Modal
      visible={profileModalVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setProfileModalVisible(false)}
    >
      <TouchableOpacity
        style={s.modalBackdrop}
        activeOpacity={1}
        onPress={() => setProfileModalVisible(false)}
      >
        <View style={s.modalCard} onStartShouldSetResponder={() => true}>
          {/* Header */}
          <View style={s.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={s.modalShieldIcon}>
                <Text style={{ fontSize: 18 }}>🛡️</Text>
              </View>
              <Text style={s.modalTitle}>Administrator Profile</Text>
            </View>
            <TouchableOpacity onPress={() => setProfileModalVisible(false)} style={{ padding: 4 }}>
              <Text style={s.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Body Info */}
          <View style={s.modalBody}>
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Name:</Text>
              <Text style={s.infoValue}>{user?.name || 'C sangita'}</Text>
            </View>

            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Email:</Text>
              <Text style={s.infoValue}>{user?.email || 'csangita0108@gmail.com'}</Text>
            </View>

            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Active Role:</Text>
              <View style={s.roleBadge}>
                <Text style={s.roleBadgeText}>ADMIN</Text>
              </View>
            </View>

            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Mobile:</Text>
              <Text style={s.infoValue}>{user?.mobile || '9493356712'}</Text>
            </View>

            {/* Switch Active Role */}
            <View style={s.sectionDivider}>
              <Text style={s.sectionHeading}>🔄 Switch Active Role:</Text>
              <View style={s.roleButtonsRow}>
                {['DONOR', 'NGO', 'VOLUNTEER', 'RECEIVER'].map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={s.roleBtn}
                    onPress={() => handleRoleSwitch(r)}
                  >
                    <Text style={s.roleBtnText}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* ADMIN Address */}
            <View style={s.sectionDivider}>
              <View style={s.addressHeaderRow}>
                <Text style={s.sectionHeading}>📍 ADMIN Address:</Text>
                {!editingAddress && (
                  <TouchableOpacity
                    style={s.editAddressBtn}
                    onPress={() => {
                      setNewAddressInput(adminAddress);
                      setEditingAddress(true);
                    }}
                  >
                    <Text style={s.editAddressBtnText}>✏️ Edit ADMIN Address</Text>
                  </TouchableOpacity>
                )}
              </View>

              {!editingAddress ? (
                <Text style={s.addressText}>{adminAddress}</Text>
              ) : (
                <View style={{ marginTop: 8 }}>
                  <TextInput
                    style={s.addressInput}
                    placeholder="Enter admin address..."
                    value={newAddressInput}
                    onChangeText={setNewAddressInput}
                    multiline
                  />
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                    <TouchableOpacity
                      style={s.saveBtn}
                      onPress={handleSaveAdminAddress}
                      disabled={savingAddress}
                    >
                      {savingAddress ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <Text style={s.saveBtnText}>✓ Save Address</Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={s.cancelBtn}
                      onPress={() => setEditingAddress(false)}
                    >
                      <Text style={s.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={s.modalLogoutBtn} onPress={handleLogout}>
            <Text style={s.modalLogoutBtnText}>🚪 Sign Out / Logout</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.headerBg} />
      <AdminHeader />
      <TabsBar />

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={C.blue} />
          <Text style={{ marginTop: 10, color: '#666' }}>Loading ShareBite Admin...</Text>
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={s.content}>
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'donations' && <DonationsTab />}
          {activeTab === 'deliveries' && <DeliveriesTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'audit' && <AuditTrailTab />}
        </ScrollView>
      )}

      <AdministratorProfileModal />
    </SafeAreaView>
  );
}

// ─── STYLES (Pixel-aligned with Web Images 3 & 4) ──────────────────────────────
const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  // Header (Dark Charcoal, Image 4)
  headerContainer: {
    backgroundColor: '#263238',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  shieldLogoBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#1565c0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerWelcome: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSub: {
    fontSize: 12,
    color: '#90a4ae',
    marginTop: 2,
  },
  headerDesc: {
    fontSize: 10,
    color: '#78909c',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    marginLeft: 8,
    marginTop: 2,
  },
  headerCircleBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Tabs Bar
  tabsContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#dddddd',
  },
  tabPillActive: {
    backgroundColor: '#263238',
    borderColor: '#263238',
  },
  tabPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555555',
  },
  tabPillTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },

  // Content
  content: {
    padding: 14,
    paddingBottom: 30,
  },

  // Overview 8 Stats Grid (Image 4)
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  statCard: {
    width: '23%',
    minWidth: 80,
    flexGrow: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  statCountText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabelText: {
    fontSize: 11,
    color: '#444444',
    marginTop: 4,
    textAlign: 'center',
  },

  // Section Cards (White boxes)
  sectionCard: {
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 16,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  sectionCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1565c0',
    marginBottom: 4,
  },
  sectionCardSub: {
    fontSize: 11,
    color: '#666666',
    marginBottom: 12,
  },

  // Live Map Box (Image 4)
  liveMapInnerBox: {
    backgroundColor: '#f8fafd',
    borderWidth: 1,
    borderColor: '#e3f2fd',
    borderRadius: 14,
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationNotAvailTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 4,
  },
  locationNotAvailDesc: {
    fontSize: 11,
    color: '#777777',
    textAlign: 'center',
  },

  // Activity Feed
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityActor: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#263238',
  },
  activityNotes: {
    fontSize: 11,
    color: '#777777',
    marginTop: 2,
  },
  activityTime: {
    fontSize: 10,
    color: '#999999',
    marginLeft: 8,
  },

  // Search & Filter
  searchInput: {
    borderWidth: 1.5,
    borderColor: '#dddddd',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#222222',
    backgroundColor: '#fafafa',
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#cccccc',
    backgroundColor: '#f5f5f5',
    marginRight: 6,
  },
  filterChipActive: {
    backgroundColor: '#263238',
    borderColor: '#263238',
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#555555',
  },

  // User Row
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userNameText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#263238',
  },
  userEmailText: {
    fontSize: 12,
    color: '#555555',
    marginTop: 1,
  },
  userMobileText: {
    fontSize: 11,
    color: '#888888',
    marginTop: 1,
  },
  rolesTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 6,
  },
  roleTagBox: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleTagText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  userStatusText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  deactivateBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deactivateBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },

  // Food card
  foodCard: {
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#eeeeee',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  foodCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  foodCardMeta: {
    fontSize: 12,
    color: '#555555',
    marginTop: 3,
  },
  foodCardDate: {
    fontSize: 10,
    color: '#999999',
    marginTop: 3,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  flagBtn: {
    backgroundColor: '#c62828',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  flagBtnText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyMutedText: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
  },

  // ─── Modal Popup Styles (Image 3) ───────────────────────────────────────────
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    paddingBottom: 10,
  },
  modalShieldIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#263238',
  },
  modalCloseText: {
    fontSize: 18,
    color: '#888888',
    fontWeight: 'bold',
  },
  modalBody: {
    marginBottom: 18,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666666',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#222222',
  },
  roleBadge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleBadgeText: {
    color: '#2e7d32',
    fontSize: 11,
    fontWeight: 'bold',
  },
  sectionDivider: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
    borderStyle: 'dashed',
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666666',
    marginBottom: 6,
  },
  roleButtonsRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginTop: 4,
  },
  roleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cccccc',
    backgroundColor: '#f9f9f9',
  },
  roleBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333333',
  },
  addressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  editAddressBtn: {
    backgroundColor: '#e8f5e9',
    borderWidth: 1,
    borderColor: '#c8e6c9',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  editAddressBtnText: {
    color: '#2e7d32',
    fontSize: 10,
    fontWeight: 'bold',
  },
  addressText: {
    fontSize: 12,
    color: '#333333',
    fontWeight: '600',
    marginTop: 2,
  },
  addressInput: {
    borderWidth: 1.5,
    borderColor: '#2e7d32',
    borderRadius: 8,
    padding: 8,
    fontSize: 12,
    color: '#222222',
    backgroundColor: '#fafafa',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#2e7d32',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  cancelBtn: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#666666',
    fontSize: 11,
    fontWeight: 'bold',
  },
  modalLogoutBtn: {
    width: '100%',
    paddingVertical: 12,
    backgroundColor: '#c62828',
    borderRadius: 10,
    alignItems: 'center',
    elevation: 1,
  },
  modalLogoutBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
