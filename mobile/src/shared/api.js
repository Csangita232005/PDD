import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Dynamic API Endpoint configuration supporting Physical Phone, Expo Go, Emulator, and Local Network IP
const getApiBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.developer?.tool || Constants.manifest?.debuggerHost || '';
  let hostIp = hostUri ? hostUri.split(':')[0] : '172.23.20.218';
  if (!hostIp || hostIp === 'localhost' || hostIp === '127.0.0.1' || hostIp === '10.0.2.2') {
    hostIp = '127.0.0.1';
  }
  return `http://${hostIp}:5000/api`;
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 25000,
});

api.interceptors.request.use(async (config) => {
  try {
    let token = null;
    if (typeof window !== 'undefined' && window.localStorage) {
      token = localStorage.getItem('sharebite_token') || localStorage.getItem('foodbridge_token');
    }
    if (!token && AsyncStorage) {
      token = (await AsyncStorage.getItem('sharebite_token')) || (await AsyncStorage.getItem('foodbridge_token'));
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {}
  return config;
});

// Auth APIs
export const registerUser = async (data) => {
  try {
    const res = await api.post('/auth/register', data);
    return res.data;
  } catch (err) {
    return err.response?.data || { success: false, message: err.message || 'Registration failed.' };
  }
};

export const loginUser = async (data) => {
  try {
    const res = await api.post('/auth/login', data);
    return res.data;
  } catch (err) {
    return err.response?.data || { success: false, message: err.message || 'Login failed. Invalid credentials.' };
  }
};

export const adminLoginUser = async (data) => {
  try {
    const res = await api.post('/auth/admin-login', data);
    return res.data;
  } catch (err) {
    return err.response?.data || { success: false, message: err.message || 'Invalid admin email or password.' };
  }
};

export const resetDemoDataApi = async () => {
  try {
    const res = await api.post('/reset-demo-data');
    return res.data;
  } catch (err) {
    return err.response?.data || { success: false, message: err.message || 'Failed to reset demo data.' };
  }
};

export const sendOtpApi = async (email) => {
  try {
    const res = await api.post('/auth/send-otp', { email });
    return res.data;
  } catch (err) {
    return err.response?.data || { success: false, message: err.message || 'Unable to send OTP email.' };
  }
};

export const verifyOtpApi = async (email, otp) => {
  try {
    const res = await api.post('/auth/verify-otp', { email, otp });
    return res.data;
  } catch (err) {
    return err.response?.data || { success: false, message: err.message || 'Invalid or expired OTP code.' };
  }
};

export const resetPasswordDirectApi = async (email, newPassword) => {
  try {
    const res = await api.post('/auth/reset-password-direct', { email, newPassword });
    return res.data;
  } catch (err) {
    return err.response?.data || { success: false, message: err.message || 'Failed to reset password.' };
  }
};

export const resetPasswordApi = async (email, resetToken, newPassword) => resetPasswordDirectApi(email, newPassword || resetToken);
export const forgotPasswordApi = resetPasswordDirectApi;

export const getMe = async (tokenStr) => {
  try {
    const headers = tokenStr ? { Authorization: `Bearer ${tokenStr}` } : undefined;
    const res = await api.get('/auth/me', { headers });
    return res.data;
  } catch (err) {
    return err.response?.data || { success: false, message: err.message || 'Failed to authenticate token.' };
  }
};

export const setupUserRole = async (data) => {
  try {
    const res = await api.post('/users/setup-role', data);
    return res.data;
  } catch (err) {
    return err.response?.data || { success: false, message: err.message || 'Role setup failed.' };
  }
};

export const updateUserProfile = async (data) => {
  try {
    const res = await api.put('/users/profile', data);
    return res.data;
  } catch (err) {
    return err.response?.data || { success: false, message: err.message || 'Failed to update profile.' };
  }
};

// Donation APIs
export const createDonation = async (data) => {
  try {
    const res = await api.post('/donations', data);
    return res.data;
  } catch (err) {
    return err.response?.data || { success: false, message: err.message || 'Failed to post food donation.' };
  }
};

export const getDonations = async (params = {}) => {
  try {
    const res = await api.get('/donations', { params });
    return res.data;
  } catch (err) {
    return { success: false, donations: [], message: err.message };
  }
};

export const getNearbyDonationsApi = async (lat, lng, radius = 20) => {
  try {
    const res = await api.get('/donations/nearby', { params: { lat, lng, radius } });
    return res.data;
  } catch (err) {
    return { success: false, donations: [], message: err.message };
  }
};

export const getDonationById = async (id) => {
  try {
    const res = await api.get(`/donations/${id}`);
    return res.data;
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const requestDonationApi = async (donationId, data = {}) => {
  try {
    const res = await api.post(`/donations/${donationId}/request`, data);
    return res.data;
  } catch (err) {
    return err.response?.data || { success: false, message: err.message || 'Failed to submit food request.' };
  }
};

export const claimDonationApi = async (donationId, data = {}) => {
  try {
    const res = await api.post(`/donations/${donationId}/claim`, data);
    return res.data;
  } catch (err) {
    return err.response?.data || { success: false, message: err.message || 'Failed to accept donation.' };
  }
};

export const updateDonationStatus = async (id, data) => {
  try {
    const res = await api.put(`/donations/${id}/status`, data);
    return res.data;
  } catch (err) {
    return err.response?.data || { success: false, message: err.message };
  }
};

export const getPersonalStats = async (donorId) => {
  try {
    const res = await api.get('/donations/stats/personal', { params: { donorId } });
    return res.data;
  } catch (err) {
    return { success: false, stats: { totalDonations: 0, completedDonations: 0, foodSavedKg: 0, peopleHelped: 0 } };
  }
};

export const getPlatformStats = async () => {
  try {
    const res = await api.get('/admin/stats');
    if (res.data?.success) return res.data;
    const resFallback = await api.get('/donations/stats/platform');
    return resFallback.data;
  } catch (err) {
    return { success: false, stats: { totalUsers: 1, donorsCount: 1, ngosCount: 1, volunteersCount: 1, receiversCount: 1, totalDonations: 0, activeDeliveries: 0, completedDonations: 0, foodSavedKg: 0, peopleHelped: 0 } };
  }
};

// Delivery APIs
export const getAvailableDeliveriesApi = async () => {
  try {
    const res = await api.get('/deliveries/available');
    return res.data;
  } catch (err) {
    return { success: false, deliveries: [] };
  }
};

export const acceptDeliveryTaskApi = async (deliveryId, data = {}) => {
  try {
    const res = await api.post(`/deliveries/${deliveryId}/accept`, data);
    return res.data;
  } catch (err) {
    return err.response?.data || { success: false, message: err.message };
  }
};

export const startPickupApi = async (deliveryId) => {
  try {
    const res = await api.post(`/deliveries/${deliveryId}/start-pickup`);
    return res.data;
  } catch (err) {
    return err.response?.data || { success: false, message: err.message };
  }
};

export const uploadPickupProofApi = async (deliveryId, pickupProofImage) => {
  try {
    const res = await api.post(`/deliveries/${deliveryId}/pickup-proof`, { pickupProofImage });
    return res.data;
  } catch (err) {
    return err.response?.data || { success: false, message: err.message };
  }
};

export const startDeliveryApi = async (deliveryId) => {
  try {
    const res = await api.post(`/deliveries/${deliveryId}/start-delivery`);
    return res.data;
  } catch (err) {
    return err.response?.data || { success: false, message: err.message };
  }
};

export const uploadDeliveryProofApi = async (deliveryId, deliveryProofImage) => {
  try {
    const res = await api.post(`/deliveries/${deliveryId}/delivery-proof`, { deliveryProofImage });
    return res.data;
  } catch (err) {
    return err.response?.data || { success: false, message: err.message };
  }
};

export const updateVolunteerLocationApi = async (deliveryId, locationData) => {
  try {
    const res = await api.post(`/deliveries/${deliveryId}/location`, locationData);
    return res.data;
  } catch (err) {
    return err.response?.data || { success: false, message: err.message };
  }
};

export const confirmReceiptApi = async (donationId, rating, reviewComment) => {
  try {
    const res = await api.post('/deliveries/confirm-receipt', { donationId, rating, reviewComment });
    return res.data;
  } catch (err) {
    return err.response?.data || { success: false, message: err.message };
  }
};

// Aliases & Compatibility Exports
export const acceptDonation = (donationId, data = {}) => claimDonationApi(donationId, { ...data, userRole: 'NGO' });
export const requestFood = (donationId, data = {}) => claimDonationApi(donationId, { ...data, userRole: 'RECEIVER' });
export const assignVolunteer = (data) => acceptDeliveryTaskApi(data?.deliveryId || data?.donationId || data, data);
export const updateDeliveryStage = (donationId, stage) => {
  if (stage === 'PICKUP_STARTED') return startPickupApi(donationId);
  if (stage === 'PICKED_UP') return uploadPickupProofApi(donationId, '');
  if (stage === 'IN_TRANSIT') return startDeliveryApi(donationId);
  if (stage === 'DELIVERED') return uploadDeliveryProofApi(donationId, '');
  if (stage === 'COMPLETED' || stage === 'RECEIVED') return confirmReceiptApi(donationId, 5, 'Food received');
  return Promise.resolve({ success: true, message: 'Stage updated' });
};

// Notification APIs
export const getNotifications = async (userId) => {
  try {
    const res = await api.get('/notifications', { params: { userId } });
    return res.data;
  } catch (err) {
    return { success: false, notifications: [] };
  }
};

export const markNotificationRead = async (id) => {
  try {
    const res = await api.put(`/notifications/${id}/read`);
    return res.data;
  } catch (err) {
    return { success: false };
  }
};

// Reviews APIs
export const createReview = async (data) => {
  try {
    const res = await api.post('/reviews', data);
    return res.data;
  } catch (err) {
    return err.response?.data || { success: false, message: err.message };
  }
};

export const getReviews = async () => {
  try {
    const res = await api.get('/reviews');
    return res.data;
  } catch (err) {
    return { success: false, reviews: [] };
  }
};

// Complaints APIs
export const createComplaint = async (data) => {
  try {
    const res = await api.post('/complaints', data);
    return res.data;
  } catch (err) {
    return err.response?.data || { success: false, message: err.message || 'Failed to register complaint.' };
  }
};

export const getComplaints = async () => {
  try {
    const res = await api.get('/complaints');
    return res.data;
  } catch (err) {
    return { success: true, complaints: [] };
  }
};

export const updateComplaintStatus = async (id, data) => {
  try {
    const res = await api.put(`/complaints/${id}`, data);
    return res.data;
  } catch (err) {
    return err.response?.data || { success: false, message: err.message || 'Failed to update complaint status.' };
  }
};

// Admin APIs
export const getAdminStatsApi = async () => {
  try {
    const res = await api.get('/admin/stats');
    return res.data;
  } catch (err) {
    return { success: false, stats: {} };
  }
};

export const getAdminUsers = async (role = 'ALL', search = '') => {
  try {
    const res = await api.get('/admin/users', { params: { role, search } });
    return res.data;
  } catch (err) {
    return { success: false, users: [] };
  }
};

export const updateAdminUserStatus = async (id, status) => {
  try {
    const res = await api.put(`/admin/users/${id}/toggle-status`);
    return res.data;
  } catch (err) {
    return err.response?.data || { success: false, message: err.message };
  }
};

export const getAdminUsersApi = async (role = 'ALL', search = '') => {
  try {
    const res = await api.get('/admin/users', { params: { role, search } });
    return res.data;
  } catch (err) {
    return { success: false, users: [] };
  }
};

export const toggleUserStatusApi = async (userId) => {
  try {
    const res = await api.put(`/admin/users/${userId}/toggle-status`);
    return res.data;
  } catch (err) {
    return err.response?.data || { success: false, message: err.message };
  }
};

export const cancelFlagDonationApi = async (donationId, reason) => {
  try {
    const res = await api.put(`/admin/donations/${donationId}/cancel-flag`, { reason });
    return res.data;
  } catch (err) {
    return err.response?.data || { success: false, message: err.message };
  }
};

export const getAuditTrailApi = async () => {
  try {
    const res = await api.get('/admin/audit-trail');
    return res.data;
  } catch (err) {
    return { success: false, auditTrail: [] };
  }
};

export const getActiveDeliveriesAdminApi = async () => {
  try {
    const res = await api.get('/admin/deliveries');
    return res.data;
  } catch (err) {
    return { success: false, deliveries: [] };
  }
};

export const updateUserAddressApi = async (userId, addressData) => {
  try {
    const res = await api.put(`/users/profile`, { userId, ...addressData });
    return res.data;
  } catch (err) {
    return err.response?.data || { success: false, message: err.message };
  }
};

export default api;

