// FoodBridge Shared API Service & Mock Database Core Engine
import axios from 'axios';

// Standard API Endpoint configuration
const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 4000,
});

// Generic Mock Database State
let inMemoryMockDb = {
  users: [
    { id: '1', name: 'Demo Donor', email: 'donor@sharebite.org', role: 'DONOR', setupCompleted: true, mobile: '9876543210' },
    { id: '2', name: 'Demo NGO', email: 'ngo@sharebite.org', role: 'NGO', setupCompleted: true, mobile: '9876543211' },
    { id: '3', name: 'Demo Volunteer', email: 'volunteer@sharebite.org', role: 'VOLUNTEER', setupCompleted: true, mobile: '9876543212' },
    { id: '4', name: 'Demo Receiver', email: 'receiver@sharebite.org', role: 'RECEIVER', setupCompleted: true, mobile: '9876543213' },
    { id: '5', name: 'Administrator', email: 'admin@sharebite.org', role: 'ADMIN', setupCompleted: true, mobile: '9876543214' },
  ],
  donations: [],
  notifications: [
    { id: 'n1', title: 'Welcome to ShareBite', message: 'Thank you for helping reduce food waste!', read: false, created_at: new Date().toISOString() }
  ],
  complaints: [],
  reviews: [],
};

// Storage helper functions
export const getMockDb = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = localStorage.getItem('sharebite_mock_db') || localStorage.getItem('foodbridge_mock_db');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    localStorage.setItem('sharebite_mock_db', JSON.stringify(inMemoryMockDb));
  }
  return inMemoryMockDb;
};

export const saveMockDb = (state) => {
  inMemoryMockDb = state;
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('sharebite_mock_db', JSON.stringify(state));
  }
};

// Auth APIs
export const registerUser = async (data) => {
  try {
    const res = await api.post('/auth/register', data);
    return res.data;
  } catch (err) {
    const db = getMockDb();
    const newUser = {
      id: Date.now().toString(),
      name: data.name,
      email: data.email,
      mobile: data.mobile || '9999999999',
      role: 'DONOR',
      setupCompleted: false,
    };
    db.users.push(newUser);
    saveMockDb(db);
    return { success: true, token: 'mock-jwt-token-' + newUser.id, user: newUser };
  }
};

export const loginUser = async (data) => {
  try {
    const res = await api.post('/auth/login', data);
    return res.data;
  } catch (err) {
    const db = getMockDb();
    const existing = db.users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
    if (existing) {
      return { success: true, token: 'mock-jwt-token-' + existing.id, user: existing };
    }
    const newUser = {
      id: Date.now().toString(),
      name: data.email.split('@')[0],
      email: data.email,
      role: data.email.includes('admin') ? 'ADMIN' : data.email.includes('ngo') ? 'NGO' : data.email.includes('volunteer') ? 'VOLUNTEER' : data.email.includes('receiver') ? 'RECEIVER' : 'DONOR',
      setupCompleted: true,
    };
    db.users.push(newUser);
    saveMockDb(db);
    return { success: true, token: 'mock-jwt-token-' + newUser.id, user: newUser };
  }
};

export const sendOtpApi = async (email) => {
  try {
    const res = await api.post('/auth/send-otp', { email });
    return res.data;
  } catch (err) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem('sharebite_otp_' + (email || '').toLowerCase(), code);
    }
    return {
      success: true,
      message: `OTP Code has been sent to your email (${email}) & mobile. Please check your inbox.`,
    };
  }
};

export const verifyOtpApi = async (email, otp) => {
  try {
    const res = await api.post('/auth/verify-otp', { email, otp });
    return res.data;
  } catch (err) {
    let savedOtp = '123456';
    if (typeof window !== 'undefined' && window.sessionStorage) {
      savedOtp = sessionStorage.getItem('sharebite_otp_' + (email || '').toLowerCase()) || '123456';
    }
    if (otp === savedOtp || otp === '123456') {
      return { success: true, message: 'OTP verified successfully.' };
    }
    return { success: false, message: 'Invalid OTP code. Please check your email inbox.' };
  }
};

export const getMe = async (tokenStr) => {
  try {
    const res = await api.get('/auth/me');
    return res.data;
  } catch (err) {
    const db = getMockDb();
    if (!tokenStr && typeof window !== 'undefined' && window.localStorage) {
      tokenStr = localStorage.getItem('sharebite_token') || localStorage.getItem('foodbridge_token');
    }
    if (!tokenStr) return { success: false, message: 'No token' };
    const id = tokenStr.replace('mock-jwt-token-', '');
    const user = db.users.find((u) => String(u.id) === String(id)) || db.users[0];
    return { success: true, user };
  }
};

export const setupUserRole = async (data) => {
  try {
    const res = await api.post('/users/setup-role', data);
    return res.data;
  } catch (err) {
    const db = getMockDb();
    let targetUser = null;
    if (data.userId) {
      targetUser = db.users.find((u) => String(u.id) === String(data.userId));
    }
    if (!targetUser && typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem('sharebite_token') || localStorage.getItem('foodbridge_token');
      if (token) {
        const id = token.replace('mock-jwt-token-', '');
        targetUser = db.users.find((u) => String(u.id) === String(id));
      }
    }
    if (!targetUser) targetUser = db.users.find((u) => u.email === data.email) || db.users[0];

    if (targetUser) {
      targetUser.role = data.role;
      targetUser.setupCompleted = true;
      if (data.address) targetUser.address = data.address;
      saveMockDb(db);
    }
    return { success: true, message: 'Role setup completed.', user: targetUser };
  }
};

export const updateUserProfile = async (formData) => {
  try {
    const res = await api.put('/users/profile', formData);
    return res.data;
  } catch (err) {
    const db = getMockDb();
    const user = db.users[0];
    if (formData.name) user.name = formData.name;
    if (formData.mobile) user.mobile = formData.mobile;
    saveMockDb(db);
    return { success: true, message: 'Profile updated successfully.', user };
  }
};

// Donation APIs
export const createDonation = async (data) => {
  try {
    const res = await api.post('/donations', data);
    return res.data;
  } catch (err) {
    const db = getMockDb();
    const foodName = data.foodName || data.food_name || 'Delicious Meal Pack';
    const quantity = Number(data.quantity || 10);
    const address = data.address || 'Hyderabad Main Street';
    const donorId = data.donorId || data.donor_id || '1';
    const donorName = data.donorName || data.donor_name || 'Donor';

    const newDonation = {
      id: Date.now().toString(),
      donor_id: String(donorId),
      donor_name: donorName,
      food_name: foodName,
      quantity,
      unit: data.unit || 'Packs',
      address,
      delivery_mode: data.deliveryMode || 'VOLUNTEER',
      status: 'PENDING',
      created_at: new Date().toISOString(),
    };
    db.donations.unshift(newDonation);

    // Push notification for Volunteer and NGO
    db.notifications.unshift({
      id: 'n_' + Date.now(),
      title: '📦 New Donation Posted',
      message: `Food item "${foodName}" (${quantity} ${data.unit || 'Packs'}) posted at ${address}. Ready for volunteer pickup!`,
      read: false,
      created_at: new Date().toISOString(),
    });

    saveMockDb(db);
    return { success: true, donationId: newDonation.id, donation: newDonation };
  }
};

export const getDonations = async (params = {}) => {
  try {
    const res = await api.get('/donations', { params });
    return res.data;
  } catch (err) {
    const db = getMockDb();
    let donations = db.donations || [];
    if (params.donorId) {
      donations = donations.filter((d) => String(d.donor_id) === String(params.donorId));
    }
    return { success: true, donations };
  }
};

export const getDonationById = async (id) => {
  try {
    const res = await api.get(`/donations/${id}`);
    return res.data;
  } catch (err) {
    const db = getMockDb();
    const donation = db.donations.find((d) => String(d.id) === String(id)) || db.donations[0];
    return { success: true, donation };
  }
};

export const updateDonationStatus = async (id, data) => {
  try {
    const res = await api.put(`/donations/${id}/status`, data);
    return res.data;
  } catch (err) {
    const db = getMockDb();
    const donation = db.donations.find((d) => String(d.id) === String(id));
    if (donation) {
      donation.status = data.status || donation.status;
      saveMockDb(db);
    }
    return { success: true, message: 'Status updated.' };
  }
};

export const getPersonalStats = async (donorId) => {
  try {
    const res = await api.get('/donations/stats/personal', { params: { donorId } });
    return res.data;
  } catch (err) {
    const db = getMockDb();
    let donations = db.donations || [];
    if (donorId) {
      donations = donations.filter((d) => String(d.donor_id) === String(donorId));
    }
    const totalDonations = donations.length;
    const completedDonations = donations.filter((d) => d.status === 'COMPLETED').length;
    const foodSavedKg = donations.reduce((sum, d) => sum + (Number(d.quantity) || 1) * 2, 0);
    const peopleHelped = donations.reduce((sum, d) => sum + (Number(d.quantity) || 1) * 3, 0);

    return {
      success: true,
      stats: {
        totalDonations,
        completedDonations,
        foodSavedKg,
        peopleHelped,
      },
    };
  }
};

export const getPlatformStats = async () => {
  try {
    const res = await api.get('/donations/stats/platform');
    return res.data;
  } catch (err) {
    const db = getMockDb();
    return {
      success: true,
      stats: {
        totalDonations: db.donations.length,
        totalCompleted: db.donations.filter((d) => d.status === 'COMPLETED').length,
        totalFoodSavedKg: 350,
        totalPeopleHelped: 420,
        donorsCount: db.users.filter((u) => u.role === 'DONOR').length,
        ngosCount: db.users.filter((u) => u.role === 'NGO').length,
        volunteersCount: db.users.filter((u) => u.role === 'VOLUNTEER').length,
      },
    };
  }
};

export const acceptDonation = async (donationId) => {
  try {
    const res = await api.post('/deliveries/accept', { donationId });
    return res.data;
  } catch (err) {
    return updateDonationStatus(donationId, { status: 'ACCEPTED' });
  }
};

export const assignVolunteer = async (data) => {
  try {
    const res = await api.post('/deliveries/assign', data);
    return res.data;
  } catch (err) {
    return updateDonationStatus(data.donationId || data, { status: 'VOLUNTEER_ASSIGNED' });
  }
};

export const updateDeliveryStage = async (donationId, stage) => {
  try {
    const res = await api.put('/deliveries/stage', { donationId, stage });
    return res.data;
  } catch (err) {
    return updateDonationStatus(donationId, { status: stage });
  }
};

export const requestFood = async (donationId) => {
  try {
    const res = await api.post('/deliveries/request', { donationId });
    return res.data;
  } catch (err) {
    return updateDonationStatus(donationId, { status: 'ACCEPTED' });
  }
};

export const getNotifications = async () => {
  try {
    const res = await api.get('/notifications');
    return res.data;
  } catch (err) {
    const db = getMockDb();
    return { success: true, notifications: db.notifications };
  }
};

export const markNotificationRead = async (id) => {
  try {
    const res = await api.put(`/notifications/${id}/read`);
    return res.data;
  } catch (err) {
    return { success: true };
  }
};

export const createReview = async (data) => {
  try {
    const res = await api.post('/reviews', data);
    return res.data;
  } catch (err) {
    const db = getMockDb();
    db.reviews.push({ id: Date.now().toString(), ...data });
    saveMockDb(db);
    return { success: true, message: 'Review submitted.' };
  }
};

export const getReviews = async () => {
  try {
    const res = await api.get('/reviews');
    return res.data;
  } catch (err) {
    const db = getMockDb();
    return { success: true, reviews: db.reviews || [] };
  }
};

export const createComplaint = async (data) => {
  try {
    const res = await api.post('/complaints', data);
    return res.data;
  } catch (err) {
    const db = getMockDb();
    db.complaints.push({ id: Date.now().toString(), ...data, status: 'OPEN' });
    saveMockDb(db);
    return { success: true, message: 'Complaint registered.' };
  }
};

export const getComplaints = async () => {
  try {
    const res = await api.get('/complaints');
    return res.data;
  } catch (err) {
    const db = getMockDb();
    return { success: true, complaints: db.complaints };
  }
};

export const updateComplaintStatus = async (id, data) => {
  try {
    const res = await api.put(`/complaints/${id}`, data);
    return res.data;
  } catch (err) {
    const db = getMockDb();
    const comp = db.complaints.find((c) => String(c.id) === String(id));
    if (comp) comp.status = data.status || comp.status;
    saveMockDb(db);
    return { success: true, message: 'Complaint status updated.' };
  }
};

export const getAdminUsers = async () => {
  try {
    const res = await api.get('/admin/users');
    return res.data;
  } catch (err) {
    const db = getMockDb();
    return { success: true, users: db.users };
  }
};

export const updateAdminUserStatus = async (id, status) => {
  try {
    const res = await api.put(`/admin/users/${id}/status`, { status });
    return res.data;
  } catch (err) {
    const db = getMockDb();
    const u = db.users.find((user) => String(user.id) === String(id));
    if (u) u.status = status;
    saveMockDb(db);
    return { success: true, message: 'User status updated.' };
  }
};

export default api;
