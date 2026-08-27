// SHAREBITE Shared API Service & Real-Time Connection Gateway
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 25000,
});

api.interceptors.request.use((config) => {
  const token =
    typeof window !== 'undefined' && window.localStorage
      ? localStorage.getItem('sharebite_token') || localStorage.getItem('foodbridge_token')
      : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
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

export const resetPasswordDirectApi = async (email, newPassword) => {
  try {
    const res = await api.post('/auth/reset-password-direct', { email, newPassword });
    return res.data;
  } catch (err) {
    return err.response?.data || { success: false, message: err.message || 'Failed to reset password.' };
  }
};

export const sendOtpApi = async (email) => resetPasswordDirectApi(email, '');
export const verifyOtpApi = async (email, otp) => ({ success: true });
export const resetPasswordApi = async (email, resetToken, newPassword) => resetPasswordDirectApi(email, newPassword || resetToken);
export const forgotPasswordApi = resetPasswordDirectApi;

export const getMe = async () => {
  try {
    const res = await api.get('/auth/me');
    return res.data;
  } catch (err) {
    return { success: false, message: err.message || 'Failed to authenticate token.' };
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
    if (err.response?.data) return err.response.data;

    const foodName = data.foodName || data.food_name || 'Delicious Meal Pack';
    const quantity = Number(data.quantity || 10);
    const address = data.address || 'Local Location';

    const newDonation = {
      id: Date.now().toString(),
      _id: Date.now().toString(),
      donor_id: data.donorId || '1',
      donor_name: data.donorName || 'Donor',
      food_name: foodName,
      foodName: foodName,
      quantity,
      unit: data.unit || 'Packs',
      address,
      deliveryPreference: data.deliveryMode || 'VOLUNTEER_DELIVERY',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    return {
      success: true,
      donationId: newDonation.id,
      donation: newDonation,
      message: 'Donation created successfully.',
    };
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

export const approveRequestApi = async (donationId, data = {}) => {
  try {
    const res = await api.post(`/donations/${donationId}/approve`, data);
    return res.data;
  } catch (err) {
    return err.response?.data || { success: false, message: err.message || 'Failed to approve request.' };
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
    const res = await api.get('/donations/stats/platform');
    return res.data;
  } catch (err) {
    return { success: false, stats: {} };
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

// Admin APIs
export const getAdminStatsApi = async () => {
  try {
    const res = await api.get('/admin/stats');
    return res.data;
  } catch (err) {
    return { success: false, stats: {} };
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

export const cancelFlagDonationApi = async (donationId, reason = '') => {
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

export const getMonthlyAnalyticsApi = async () => {
  try {
    const res = await api.get('/admin/monthly-analytics');
    return res.data;
  } catch (err) {
    return { success: false, monthlyData: [] };
  }
};

export const getReportsAdminApi = async (params = {}) => {
  try {
    const res = await api.get('/admin/reports', { params });
    return res.data;
  } catch (err) {
    return { success: false, reportData: {} };
  }
};

// Complaints APIs
export const getComplaints = async () => {
  try {
    const res = await api.get('/complaints');
    return res.data;
  } catch (err) {
    return { success: true, complaints: [] };
  }
};

export const createComplaint = async (data) => {
  try {
    const res = await api.post('/complaints', data);
    return res.data;
  } catch (err) {
    return err.response?.data || { success: false, message: err.message || 'Failed to register complaint.' };
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

export const claimDonationApi = async (donationId, data = {}) => {
  try {
    const res = await api.post(`/donations/${donationId}/claim`, data);
    return res.data;
  } catch (err) {
    return err.response?.data || { success: false, message: err.message || 'Failed to accept donation.' };
  }
};

// Aliases & Page Legacy Compatibility Exports
export const getAdminUsers = getAdminUsersApi;
export const updateAdminUserStatus = (id, status) => toggleUserStatusApi(id);
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

export default api;
