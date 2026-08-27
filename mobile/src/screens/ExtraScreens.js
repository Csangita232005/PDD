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
  ActivityIndicator,
  Alert,
  BackHandler,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getDonations,
  getNotifications,
  getComplaints,
  getAdminUsers,
  updateAdminUserStatus,
  loginUser,
  adminLoginUser,
  resetPasswordDirectApi,
} from '../services/api';
import { COLORS } from '../shared/theme';
import LocationMap from '../components/LocationMap';

export function RoleSelectionScreen({ navigation, user }) {
  useEffect(() => {
    const onBackPress = () => {
      navigation.navigate('Login');
      return true;
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [navigation]);

  const roles = [
    { id: 'DONOR', title: '🍱 Donor', desc: 'Donate surplus cooked meals or groceries', color: '#2e7d32', bg: '#e8f5e9' },
    { id: 'NGO', title: '🏛️ NGO Organization', desc: 'Accept food & distribute to communities', color: '#1565c0', bg: '#e3f2fd' },
    { id: 'VOLUNTEER', title: '🚴 Volunteer', desc: 'Deliver food from donors to receivers', color: '#7b1fa2', bg: '#f3e5f5' },
    { id: 'RECEIVER', title: '🤲 Beneficiary', desc: 'Request nutritious food for shelter & community', color: '#ef6c00', bg: '#fff3e0' },
  ];

  const userRole = (user?.role || 'DONOR').toUpperCase();
  const roleNameMap = {
    DONOR: 'Donor',
    NGO: 'NGO',
    VOLUNTEER: 'Volunteer',
    RECEIVER: 'Beneficiary',
    ADMIN: 'Admin',
  };
  const registeredRoleLabel = roleNameMap[userRole] || 'Donor';

  const handleSelectRole = (targetRoleId) => {
    if (user) user.role = targetRoleId;

    const isDonorCompleted = Boolean(user?.roleProfiles?.donor?.isRegistered || user?.donorAddress || user?.address);
    const isNgoCompleted = Boolean(user?.roleProfiles?.ngo?.isRegistered || user?.ngoAddress || user?.organizationName);
    const isVolCompleted = Boolean(user?.roleProfiles?.volunteer?.isRegistered || user?.volunteerAddress || user?.vehicleType);
    const isRecCompleted = Boolean(user?.roleProfiles?.beneficiary?.isRegistered || user?.receiverAddress || user?.receiverType);

    const isCompleted =
      targetRoleId === 'DONOR'
        ? isDonorCompleted
        : targetRoleId === 'NGO'
        ? isNgoCompleted
        : targetRoleId === 'VOLUNTEER'
        ? isVolCompleted
        : isRecCompleted;

    if (isCompleted) {
      // Profile complete — go directly to that role's dashboard
      const dashRoutes = {
        DONOR: 'DonorDashboard',
        NGO: 'NGODashboard',
        VOLUNTEER: 'VolunteerDashboard',
        RECEIVER: 'ReceiverDashboard',
      };
      navigation.navigate(dashRoutes[targetRoleId] || 'DonorDashboard');
    } else {
      // Profile incomplete — go to that role's setup screen
      const setupRoutes = {
        DONOR: 'DonorSetup',
        NGO: 'NGOSetup',
        VOLUNTEER: 'VolunteerSetup',
        RECEIVER: 'ReceiverSetup',
      };
      navigation.navigate(setupRoutes[targetRoleId] || 'DonorSetup', { selectedRole: targetRoleId, user });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Select Your Role</Text>
          <Text style={{ color: '#a5d6a7', fontSize: 13, marginTop: 4 }}>
            Registered as: {registeredRoleLabel}
          </Text>
        </View>

        <View style={{ margin: 18 }}>
          {roles.map((r) => (
            <TouchableOpacity
              key={r.id}
              style={[styles.card, { backgroundColor: r.bg, borderColor: r.color, borderWidth: 2 }]}
              onPress={() => handleSelectRole(r.id)}
            >
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: r.color }}>{r.title}</Text>
              <Text style={{ fontSize: 13, color: '#555', marginTop: 4 }}>{r.desc}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={{
              marginTop: 16,
              padding: 14,
              borderRadius: 10,
              backgroundColor: '#ffffff',
              borderWidth: 1.5,
              borderColor: COLORS.primary,
              alignItems: 'center',
            }}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={{ fontWeight: 'bold', color: COLORS.primary, fontSize: 15 }}>← Back to Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function AdminLoginScreen({ navigation, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAdminLogin = async () => {
    setErrorMsg('');
    const targetEmail = email.trim().toLowerCase();
    const targetPass = password;

    if (!targetEmail || !targetPass) {
      setErrorMsg('Invalid admin email or password.');
      return;
    }

    setLoading(true);
    try {
      const res = await adminLoginUser({ email: targetEmail, password: targetPass });
      setLoading(false);

      if (res.success && res.user && (res.user.role?.toUpperCase() === 'ADMIN' || res.isAdmin)) {
        const adminUser = { ...res.user, role: 'ADMIN' };
        await AsyncStorage.setItem('sharebite_token', res.token);
        await AsyncStorage.setItem('sharebite_session_mode', 'admin');
        onLoginSuccess(adminUser, res.token, { sessionMode: 'admin', role: 'ADMIN' });
        navigation.navigate('AdminDashboard');
      } else {
        setErrorMsg('Invalid admin email or password.');
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg('Invalid admin email or password.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.admin.primary} />
      <View style={[styles.header, { backgroundColor: COLORS.admin.primary }]}>
        <Text style={styles.headerTitle}>🛡️ Admin Control Center</Text>
      </View>
      <View style={[styles.card, { margin: 18 }]}>
        {errorMsg !== '' && (
          <View style={[styles.errorBox, { backgroundColor: '#ffebee', padding: 10, borderRadius: 8, marginBottom: 12 }]}>
            <Text style={{ color: '#c62828', fontSize: 13, textAlign: 'center' }}>{errorMsg}</Text>
          </View>
        )}

        <Text style={styles.label}>Admin Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="admin@sharebite.org"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Admin Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter admin password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: COLORS.admin.primary, marginTop: 10 }]}
          onPress={handleAdminLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.btnText}>Login to Admin Dashboard</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={{ marginTop: 14, alignItems: 'center' }} onPress={() => navigation.navigate('Login')}>
          <Text style={{ color: '#555', fontWeight: 'bold' }}>← Back to User Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleResetPassword = async () => {
    setErrorMsg('');
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !newPassword || !confirmPassword) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Confirm password does not match new password.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPasswordDirectApi(trimmedEmail, newPassword);
      setLoading(false);

      if (res && res.success) {
        Alert.alert('Success ✅', 'Password reset successfully. Please login with your new password.');
        navigation.navigate('Login');
      } else {
        setErrorMsg(res?.message || 'Failed to reset password. Please check registered email address.');
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.response?.data?.message || 'No account found with this email address.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔑 Reset Password</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 18 }}>
        <View style={styles.card}>
          {errorMsg !== '' && (
            <View style={[styles.errorBox, { backgroundColor: '#ffebee', padding: 10, borderRadius: 8, marginBottom: 12 }]}>
              <Text style={{ color: '#c62828', fontSize: 13, textAlign: 'center' }}>{errorMsg}</Text>
            </View>
          )}

          <Text style={styles.label}>Registered Email Address *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. user@domain.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>New Password * (min 6 chars)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter new password"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />

          <Text style={styles.label}>Confirm New Password *</Text>
          <TextInput
            style={styles.input}
            placeholder="Re-enter new password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: COLORS.primary, marginTop: 10 }]}
            onPress={handleResetPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.btnText}>Reset Password & Login</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={{ marginTop: 14, alignItems: 'center' }} onPress={() => navigation.navigate('Login')}>
            <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>← Back to Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


export function OTPVerificationScreen({ navigation, route }) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [expiryTimer, setExpiryTimer] = useState(300);

  const userEmail = route?.params?.email || '';

  useEffect(() => {
    if (!userEmail) {
      navigation.navigate('ForgotPassword');
    }
  }, [userEmail, navigation]);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  useEffect(() => {
    let timer;
    if (expiryTimer > 0) {
      timer = setInterval(() => setExpiryTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [expiryTimer]);

  const handleResend = async () => {
    if (resendTimer > 0 || loading) return;
    setLoading(true);
    setOtp('');

    try {
      const res = await sendOtpApi(userEmail);
      setLoading(false);
      if (res && res.success) {
        Alert.alert('New OTP Sent 📩', res.message || 'OTP sent successfully to your email.');
        setResendTimer(60);
        setExpiryTimer(300);
      } else {
        Alert.alert('Error ❌', res?.message || 'Unable to resend OTP.');
      }
    } catch (e) {
      setLoading(false);
      Alert.alert('Error ❌', e.response?.data?.message || 'Unable to resend OTP.');
    }
  };

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Required', 'Please enter the exact 6-digit OTP code received in your email.');
      return;
    }

    if (expiryTimer <= 0) {
      Alert.alert('Expired ❌', 'OTP expired. Please request a new OTP.');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOtpApi(userEmail, otp.trim());
      setLoading(false);

      if (res && res.success) {
        Alert.alert('Verified 🎉', 'OTP verified successfully!');
        navigation.navigate('ResetPassword', { email: userEmail, resetToken: res.resetToken });
      } else {
        Alert.alert('Verification Failed ❌', res?.message || 'Invalid OTP code. Please check your email.');
      }
    } catch (e) {
      setLoading(false);
      Alert.alert('Verification Failed ❌', e.response?.data?.message || 'Invalid OTP code.');
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔐 Verify OTP</Text>
      </View>
      <View style={[styles.card, { margin: 18 }]}>
        <Text style={{ fontSize: 14, color: '#333', marginBottom: 14, lineHeight: 20 }}>
          Enter the 6-digit OTP sent to your registered email:<br />
          <Text style={{ fontWeight: 'bold', color: COLORS.primary }}>{userEmail}</Text>
        </Text>

        <TextInput
          style={[styles.input, { textAlign: 'center', fontSize: 22, letterSpacing: 6, fontWeight: 'bold' }]}
          placeholder="Enter 6-digit OTP"
          keyboardType="number-pad"
          maxLength={6}
          value={otp}
          onChangeText={(val) => setOtp(val.replace(/[^0-9]/g, ''))}
          disabled={loading || expiryTimer <= 0}
        />

        <TouchableOpacity style={styles.primaryBtn} onPress={handleVerify} disabled={loading || expiryTimer <= 0}>
          {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.btnText}>Verify OTP</Text>}
        </TouchableOpacity>

        <View style={{ marginTop: 16, alignItems: 'center' }}>
          {resendTimer > 0 ? (
            <Text style={{ color: '#777', fontSize: 13 }}>Resend OTP in <Text style={{ fontWeight: 'bold' }}>{resendTimer}s</Text></Text>
          ) : (
            <TouchableOpacity onPress={handleResend} disabled={loading}>
              <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>🔄 Resend OTP</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={{ marginTop: 12, textAlign: 'center', fontSize: 12, color: expiryTimer < 60 ? COLORS.error : '#666' }}>
          OTP expires in: {formatTime(expiryTimer)}
        </Text>

        <TouchableOpacity style={{ marginTop: 16, alignItems: 'center' }} onPress={() => navigation.navigate('Login')}>
          <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>← Back to Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export function ResetPasswordScreen({ navigation, route }) {
  const email = route?.params?.email || '';
  const resetToken = route?.params?.resetToken || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email || !resetToken) {
      navigation.navigate('ForgotPassword');
    }
  }, [email, resetToken, navigation]);

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Required', 'Please enter both password fields.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Validation Error', 'New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPasswordApi(email, resetToken, newPassword);
      setLoading(false);

      if (res && res.success) {
        Alert.alert('Success 🎉', res.message || 'Password reset successfully!', [
          {
            text: 'Login Now',
            onPress: () => navigation.navigate('Login'),
          },
        ]);
      } else {
        Alert.alert('Error ❌', res?.message || 'Failed to reset password.');
      }
    } catch (e) {
      setLoading(false);
      Alert.alert('Error ❌', e.response?.data?.message || 'Failed to reset password.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔑 Reset Password</Text>
      </View>
      <View style={[styles.card, { margin: 18 }]}>
        <Text style={styles.label}>New Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Min 6 characters"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />

        <Text style={styles.label}>Confirm New Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Re-enter new password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity style={styles.primaryBtn} onPress={handleResetPassword} disabled={loading}>
          {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.btnText}>Reset Password</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={{ marginTop: 16, alignItems: 'center' }} onPress={() => navigation.navigate('Login')}>
          <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>← Back to Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  useEffect(() => {
    getNotifications().then((res) => {
      if (res.success) setNotifications(res.notifications);
    });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 18 }}>
        <Text style={styles.sectionTitle}>🔔 Notifications</Text>
        {notifications.length === 0 ? (
          <View style={styles.card}><Text style={{ color: '#666' }}>No new notifications.</Text></View>
        ) : (
          notifications.map((n) => (
            <View key={n.id} style={styles.card}>
              <Text style={{ fontWeight: 'bold', fontSize: 15 }}>{n.title}</Text>
              <Text style={{ color: '#555', marginTop: 4 }}>{n.message}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export function LiveTrackingScreen({ navigation }) {
  const [activeDonation, setActiveDonation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDonations().then((res) => {
      if (res.success && res.donations.length > 0) {
        const active = res.donations.find((d) => d.status !== 'COMPLETED') || res.donations[0];
        setActiveDonation(active);
      }
      setLoading(false);
    });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 18 }}>
        <Text style={styles.sectionTitle}>📍 Live Delivery Tracking</Text>
        {!activeDonation ? (
          <View style={styles.card}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, color: COLORS.primary, textAlign: 'center' }}>
              No Active Created Donation Found
            </Text>
            <Text style={{ color: '#666', marginTop: 6, textAlign: 'center' }}>
              Live tracking runs on real food donations. Create a new donation to track delivery in real-time!
            </Text>
          </View>
        ) : (
          <>
            <LocationMap title={`Tracking: ${activeDonation.food_name || activeDonation.foodName}`} />
            <View style={styles.card}>
              <Text style={{ fontWeight: 'bold', fontSize: 16, color: COLORS.primary }}>
                Item: {activeDonation.food_name || activeDonation.foodName}
              </Text>
              <Text style={{ color: '#555', marginTop: 6 }}>
                Quantity: {activeDonation.quantity} {activeDonation.unit || 'Packs'}
              </Text>
              <Text style={{ color: '#555', marginTop: 4 }}>
                Pickup Address: {activeDonation.address}
              </Text>
              <Text style={{ color: COLORS.primary, fontWeight: 'bold', marginTop: 6 }}>
                Status: {activeDonation.status}
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export function ImpactScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 18 }}>
        <Text style={styles.sectionTitle}>🌍 Community Impact Dashboard</Text>
        <View style={styles.card}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: COLORS.primary }}>350 Kg</Text>
          <Text style={{ color: '#666' }}>Total Food Saved from Waste</Text>
          <View style={{ height: 1, backgroundColor: '#eee', marginVertical: 12 }} />
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: COLORS.primary }}>420</Text>
          <Text style={{ color: '#666' }}>Nutritious Meals Served</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function UserManagementScreen() {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    getAdminUsers().then((res) => {
      if (res.success) setUsers(res.users);
    });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 18 }}>
        <Text style={styles.sectionTitle}>👥 User Management</Text>
        {users.map((u) => (
          <View key={u.id} style={styles.card}>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{u.name}</Text>
            <Text style={{ color: '#666' }}>{u.email} • Role: {u.role}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

export function AssignVolunteerScreen({ route, navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={{ padding: 18 }}>
        <Text style={styles.sectionTitle}>🚚 Assign Volunteer</Text>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => {
            Alert.alert('Success', 'Volunteer assigned successfully!');
            navigation.goBack();
          }}
        >
          <Text style={styles.btnText}>Assign Available Volunteer</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingVertical: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    marginTop: 6,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    marginBottom: 12,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 14,
  },
});
