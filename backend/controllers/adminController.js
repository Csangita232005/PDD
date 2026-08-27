const User = require('../models/User');
const Donation = require('../models/Donation');
const Delivery = require('../models/Delivery');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const { broadcastEvent } = require('../socket');

exports.getAdminDashboardStats = async (req, res) => {
  try {
    const users = await User.find();
    const donations = await Donation.find();
    const deliveries = await Delivery.find();
    const reviews = await Review.find();

    const donorsCount = users.filter(
      (u) =>
        u.roleProfiles?.donor?.isRegistered ||
        u.roleProfiles?.donor?.address?.formattedAddress ||
        u.donorAddress ||
        u.role === 'DONOR'
    ).length;

    const ngosCount = users.filter(
      (u) =>
        u.roleProfiles?.ngo?.isRegistered ||
        u.roleProfiles?.ngo?.address?.formattedAddress ||
        u.ngoAddress ||
        u.organizationName ||
        u.role === 'NGO'
    ).length;

    const volunteersCount = users.filter(
      (u) =>
        u.roleProfiles?.volunteer?.isRegistered ||
        u.roleProfiles?.volunteer?.address?.formattedAddress ||
        u.volunteerAddress ||
        u.vehicleType ||
        u.role === 'VOLUNTEER'
    ).length;

    const receiversCount = users.filter(
      (u) =>
        u.roleProfiles?.beneficiary?.isRegistered ||
        u.roleProfiles?.beneficiary?.address?.formattedAddress ||
        u.receiverAddress ||
        u.receiverType ||
        u.role === 'RECEIVER'
    ).length;

    const adminsCount = users.filter((u) => u.isAdmin || u.role === 'ADMIN').length;

    const totalDonations = donations.length;
    const pendingDonations = donations.filter((d) => d.status === 'PENDING' || d.status === 'REQUESTED').length;
    const activeDeliveries = donations.filter((d) =>
      ['ACCEPTED', 'VOLUNTEER_REQUESTED', 'VOLUNTEER_ASSIGNED', 'PICKUP_STARTED', 'PICKED_UP', 'IN_TRANSIT'].includes(d.status)
    ).length;
    const completedList = donations.filter((d) => d.status === 'COMPLETED' || d.status === 'RECEIVED');
    const completedDonations = completedList.length;
    const cancelledCount = donations.filter((d) => d.status === 'CANCELLED').length;
    const pendingVolunteerRequests = donations.filter((d) => d.collectionMethod === 'VOLUNTEER_DELIVERY' && (!d.volunteer_id || d.volunteer_id === '')).length;

    const foodSavedKg = completedList.reduce((sum, d) => sum + (Number(d.quantity) || 0), 0);
    const peopleHelped = completedList.reduce((sum, d) => sum + (Number(d.quantity) || 0) * 2, 0);

    const avgRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0';

    return res.json({
      success: true,
      stats: {
        totalUsers: users.length,
        donorsCount,
        ngosCount,
        volunteersCount,
        receiversCount,
        adminsCount,
        totalDonations,
        pendingDonations,
        activeDeliveries,
        completedDonations,
        cancelledCount,
        pendingVolunteerRequests,
        foodSavedKg,
        peopleHelped,
        avgRating,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });

    const formatted = users.map((u) => {
      const isDonorReg = Boolean(
        u.roleProfiles?.donor?.isRegistered ||
        u.roleProfiles?.donor?.address?.formattedAddress ||
        u.donorAddress ||
        u.role === 'DONOR'
      );
      const isNgoReg = Boolean(
        u.roleProfiles?.ngo?.isRegistered ||
        u.roleProfiles?.ngo?.address?.formattedAddress ||
        u.ngoAddress ||
        u.organizationName ||
        u.role === 'NGO'
      );
      const isBeneficiaryReg = Boolean(
        u.roleProfiles?.beneficiary?.isRegistered ||
        u.roleProfiles?.beneficiary?.address?.formattedAddress ||
        u.receiverAddress ||
        u.receiverType ||
        u.role === 'RECEIVER'
      );
      const isVolunteerReg = Boolean(
        u.roleProfiles?.volunteer?.isRegistered ||
        u.roleProfiles?.volunteer?.address?.formattedAddress ||
        u.volunteerAddress ||
        u.vehicleType ||
        u.role === 'VOLUNTEER'
      );

      const registeredRoles = [];
      if (isDonorReg) registeredRoles.push('DONOR');
      if (isNgoReg) registeredRoles.push('NGO');
      if (isBeneficiaryReg) registeredRoles.push('RECEIVER');
      if (isVolunteerReg) registeredRoles.push('VOLUNTEER');
      if (u.isAdmin && !registeredRoles.includes('ADMIN')) registeredRoles.push('ADMIN');

      return {
        id: u._id,
        _id: u._id,
        name: u.name,
        email: u.email,
        mobile: u.mobile || '',
        role: u.role,
        isAdmin: Boolean(u.isAdmin),
        registeredRoles,
        roleProfiles: u.roleProfiles || {},
        address: u.address || '',
        isActive: u.isActive !== undefined ? u.isActive : true,
        createdAt: u.createdAt,
      };
    });

    return res.json({ success: true, users: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.isActive = !user.isActive;
    await user.save();

    return res.json({
      success: true,
      message: `User status changed to ${user.isActive ? 'Active' : 'Deactivated'}.`,
      isActive: user.isActive,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.cancelFlagDonation = async (req, res) => {
  try {
    const donationId = req.params.id;
    const { reason, action } = req.body;

    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation request not found.' });
    }

    donation.status = 'CANCELLED';
    donation.statusHistory.push({
      status: 'CANCELLED',
      timestamp: new Date(),
      updatedBy: 'Admin',
      notes: `Flagged/Cancelled by Admin: ${reason || 'Invalid or duplicate request'}`,
    });

    await donation.save();

    broadcastEvent('delivery:status_change', { donationId, status: 'CANCELLED' });

    return res.json({
      success: true,
      message: `Donation ${donationId} flagged and set to CANCELLED.`,
      donation,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAuditTrail = async (req, res) => {
  try {
    const donations = await Donation.find().sort({ updatedAt: -1 });

    const auditTrail = [];
    donations.forEach((d) => {
      if (Array.isArray(d.statusHistory)) {
        d.statusHistory.forEach((h, idx) => {
          auditTrail.push({
            id: `${d._id}_${idx}_${h.timestamp ? new Date(h.timestamp).getTime() : Date.now()}`,
            donationId: d._id,
            foodName: d.food_name || d.foodName,
            status: h.status,
            actor: h.updatedBy || 'User',
            notes: h.notes || `Status changed to ${h.status}`,
            timestamp: h.timestamp || d.updatedAt,
            donorName: d.donor_name,
            recipientName: d.recipientName || d.claimedBy?.name || '',
          });
        });
      }
    });

    auditTrail.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return res.json({ success: true, count: auditTrail.length, auditTrail });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getActiveDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find()
      .populate('donationId')
      .populate('donorId', 'name mobile address location')
      .populate('recipientId', 'name mobile address location')
      .populate('volunteerId', 'name mobile address location')
      .sort({ createdAt: -1 });

    return res.json({ success: true, deliveries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMonthlyAnalytics = async (req, res) => {
  try {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();

    const donations = await Donation.find();

    const monthlyData = months.map((month, index) => {
      const monthDonations = donations.filter((d) => {
        const date = new Date(d.createdAt);
        return date.getMonth() === index && date.getFullYear() === currentYear;
      });

      const completed = monthDonations.filter((d) => d.status === 'COMPLETED' || d.status === 'RECEIVED');
      const foodSaved = completed.reduce((sum, d) => sum + (Number(d.quantity) || 0), 0);
      const people = completed.reduce((sum, d) => sum + (Number(d.quantity) || 0) * 2, 0);

      return {
        month,
        totalDonations: monthDonations.length,
        completedDonations: completed.length,
        foodSavedKg: foodSaved,
        peopleHelped: people,
      };
    });

    return res.json({ success: true, monthlyData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const { startDate, endDate, reportType } = req.query;
    const filter = {};

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const donations = await Donation.find(filter).populate('donor_id ngo_id receiver_id volunteer_id');
    const users = await User.find(filter);

    return res.json({
      success: true,
      reportType: reportType || 'SUMMARY',
      totalDonationsCount: donations.length,
      completedCount: donations.filter((d) => d.status === 'COMPLETED' || d.status === 'RECEIVED').length,
      totalUsersCount: users.length,
      donations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
