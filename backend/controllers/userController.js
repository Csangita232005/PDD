const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const getUserFromReq = async (req) => {
  if (req.user) return req.user;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'foodbridge_super_secret_jwt_key_2026');
      if (decoded && decoded.id) {
        return await User.findById(decoded.id);
      }
    } catch (e) {}
  }
  if (req.body && req.body.email) {
    return await User.findOne({ email: req.body.email.toLowerCase().trim() });
  }
  if (req.body && req.body.userId && mongoose.isValidObjectId(req.body.userId)) {
    return await User.findById(req.body.userId);
  }
  return null;
};

const ensureRoleProfiles = (user) => {
  if (!user.roleProfiles) user.roleProfiles = {};
  if (!user.roleProfiles.donor) user.roleProfiles.donor = { address: {} };
  if (!user.roleProfiles.ngo) user.roleProfiles.ngo = { address: {} };
  if (!user.roleProfiles.beneficiary) user.roleProfiles.beneficiary = { address: {} };
  if (!user.roleProfiles.volunteer) user.roleProfiles.volunteer = { address: {} };
  if (!user.roleProfiles.donor.address) user.roleProfiles.donor.address = {};
  if (!user.roleProfiles.ngo.address) user.roleProfiles.ngo.address = {};
  if (!user.roleProfiles.beneficiary.address) user.roleProfiles.beneficiary.address = {};
  if (!user.roleProfiles.volunteer.address) user.roleProfiles.volunteer.address = {};

  if (!user.roleProfiles.donor.address.formattedAddress && user.donorAddress) {
    user.roleProfiles.donor.address.formattedAddress = user.donorAddress;
  }
  if (!user.roleProfiles.ngo.address.formattedAddress && user.ngoAddress) {
    user.roleProfiles.ngo.address.formattedAddress = user.ngoAddress;
  }
  if (!user.roleProfiles.beneficiary.address.formattedAddress && user.receiverAddress) {
    user.roleProfiles.beneficiary.address.formattedAddress = user.receiverAddress;
  }
  if (!user.roleProfiles.volunteer.address.formattedAddress && user.volunteerAddress) {
    user.roleProfiles.volunteer.address.formattedAddress = user.volunteerAddress;
  }
};

const formatUserObj = (userDoc, reqRole) => {
  if (!userDoc) return null;
  const user = userDoc.toObject ? userDoc.toObject() : userDoc;
  ensureRoleProfiles(user);

  const uRole = (reqRole || user.activeRole || user.role || 'DONOR').toUpperCase();
  const roleKey = (uRole === 'RECEIVER' || uRole === 'BENEFICIARY') ? 'beneficiary' : uRole.toLowerCase();

  const currentRoleProfile = user.roleProfiles[roleKey] || user.roleProfiles.donor;
  const currentRoleAddr = currentRoleProfile?.address || {};

  const isDonorReg = Boolean(
    user.roleProfiles?.donor?.isRegistered ||
    user.roleProfiles?.donor?.address?.formattedAddress ||
    user.donorAddress ||
    user.role === 'DONOR'
  );
  const isNgoReg = Boolean(
    user.roleProfiles?.ngo?.isRegistered ||
    user.roleProfiles?.ngo?.address?.formattedAddress ||
    user.ngoAddress ||
    user.organizationName ||
    user.role === 'NGO'
  );
  const isBeneficiaryReg = Boolean(
    user.roleProfiles?.beneficiary?.isRegistered ||
    user.roleProfiles?.beneficiary?.address?.formattedAddress ||
    user.receiverAddress ||
    user.role === 'RECEIVER'
  );
  const isVolunteerReg = Boolean(
    user.roleProfiles?.volunteer?.isRegistered ||
    user.roleProfiles?.volunteer?.address?.formattedAddress ||
    user.volunteerAddress ||
    user.role === 'VOLUNTEER'
  );

  const registeredRoles = [];
  if (isDonorReg) registeredRoles.push('DONOR');
  if (isNgoReg) registeredRoles.push('NGO');
  if (isBeneficiaryReg) registeredRoles.push('RECEIVER');
  if (isVolunteerReg) registeredRoles.push('VOLUNTEER');
  if (user.isAdmin && !registeredRoles.includes('ADMIN')) registeredRoles.push('ADMIN');

  return {
    id: user._id ? user._id.toString() : user.id,
    _id: user._id ? user._id.toString() : user.id,
    name: user.name,
    email: user.email,
    mobile: user.mobile || '',
    isAdmin: Boolean(user.isAdmin),
    registeredRoles,
    roleProfiles: {
      donor: {
        isRegistered: isDonorReg,
        donorType: user.roleProfiles.donor?.donorType || user.donorType || 'Individual',
        address: {
          formattedAddress: user.roleProfiles.donor?.address?.formattedAddress || user.donorAddress || '',
          addressLine: user.roleProfiles.donor?.address?.addressLine || '',
          city: user.roleProfiles.donor?.address?.city || '',
          state: user.roleProfiles.donor?.address?.state || '',
          pinCode: user.roleProfiles.donor?.address?.pinCode || '',
          country: user.roleProfiles.donor?.address?.country || 'India',
          latitude: user.roleProfiles.donor?.address?.latitude ?? 17.3850,
          longitude: user.roleProfiles.donor?.address?.longitude ?? 78.4867,
        },
      },
      ngo: {
        isRegistered: isNgoReg,
        organizationName: user.roleProfiles.ngo?.organizationName || user.organizationName || '',
        registrationNo: user.roleProfiles.ngo?.registrationNo || user.registrationNo || '',
        serviceArea: user.roleProfiles.ngo?.serviceArea || user.serviceArea || '',
        capacity: user.roleProfiles.ngo?.capacity || user.capacity || 100,
        address: {
          formattedAddress: user.roleProfiles.ngo?.address?.formattedAddress || user.ngoAddress || '',
          addressLine: user.roleProfiles.ngo?.address?.addressLine || '',
          city: user.roleProfiles.ngo?.address?.city || '',
          state: user.roleProfiles.ngo?.address?.state || '',
          pinCode: user.roleProfiles.ngo?.address?.pinCode || '',
          country: user.roleProfiles.ngo?.address?.country || 'India',
          latitude: user.roleProfiles.ngo?.address?.latitude ?? 17.3850,
          longitude: user.roleProfiles.ngo?.address?.longitude ?? 78.4867,
        },
      },
      beneficiary: {
        isRegistered: isBeneficiaryReg,
        householdSize: user.roleProfiles.beneficiary?.householdSize || user.householdSize || 1,
        receiverType: user.roleProfiles.beneficiary?.receiverType || user.receiverType || 'Individual',
        address: {
          formattedAddress: user.roleProfiles.beneficiary?.address?.formattedAddress || user.receiverAddress || '',
          addressLine: user.roleProfiles.beneficiary?.address?.addressLine || '',
          city: user.roleProfiles.beneficiary?.address?.city || '',
          state: user.roleProfiles.beneficiary?.address?.state || '',
          pinCode: user.roleProfiles.beneficiary?.address?.pinCode || '',
          country: user.roleProfiles.beneficiary?.address?.country || 'India',
          latitude: user.roleProfiles.beneficiary?.address?.latitude ?? 17.3850,
          longitude: user.roleProfiles.beneficiary?.address?.longitude ?? 78.4867,
        },
      },
      volunteer: {
        isRegistered: isVolunteerReg,
        vehicleType: user.roleProfiles.volunteer?.vehicleType || user.vehicleType || 'Bike',
        availability: user.roleProfiles.volunteer?.availability || user.availability || 'Full-time',
        address: {
          formattedAddress: user.roleProfiles.volunteer?.address?.formattedAddress || user.volunteerAddress || '',
          addressLine: user.roleProfiles.volunteer?.address?.addressLine || '',
          city: user.roleProfiles.volunteer?.address?.city || '',
          state: user.roleProfiles.volunteer?.address?.state || '',
          pinCode: user.roleProfiles.volunteer?.address?.pinCode || '',
          country: user.roleProfiles.volunteer?.address?.country || 'India',
          latitude: user.roleProfiles.volunteer?.address?.latitude ?? 17.3850,
          longitude: user.roleProfiles.volunteer?.address?.longitude ?? 78.4867,
        },
      },
    },
    donorAddress: user.roleProfiles.donor?.address?.formattedAddress || user.donorAddress || '',
    ngoAddress: user.roleProfiles.ngo?.address?.formattedAddress || user.ngoAddress || '',
    receiverAddress: user.roleProfiles.beneficiary?.address?.formattedAddress || user.receiverAddress || '',
    volunteerAddress: user.roleProfiles.volunteer?.address?.formattedAddress || user.volunteerAddress || '',
    address: currentRoleAddr.formattedAddress || '',
    formattedAddress: currentRoleAddr.formattedAddress || '',
    addressLine: currentRoleAddr.addressLine || '',
    city: currentRoleAddr.city || '',
    state: currentRoleAddr.state || '',
    pinCode: currentRoleAddr.pinCode || '',
    country: currentRoleAddr.country || 'India',
    latitude: currentRoleAddr.latitude ?? 17.3850,
    longitude: currentRoleAddr.longitude ?? 78.4867,
    placeId: currentRoleAddr.placeId || '',
    donorType: user.roleProfiles.donor?.donorType || user.donorType || 'Individual',
    organizationName: user.roleProfiles.ngo?.organizationName || user.organizationName || '',
    registrationNo: user.roleProfiles.ngo?.registrationNo || user.registrationNo || '',
    serviceArea: user.roleProfiles.ngo?.serviceArea || user.serviceArea || '',
    capacity: user.roleProfiles.ngo?.capacity || user.capacity || 100,
    householdSize: user.roleProfiles.beneficiary?.householdSize || user.householdSize || 1,
    receiverType: user.roleProfiles.beneficiary?.receiverType || user.receiverType || '',
    vehicleType: user.roleProfiles.volunteer?.vehicleType || user.vehicleType || '',
    availability: user.roleProfiles.volunteer?.availability || user.availability || 'Full-time',
    role: uRole,
    setupCompleted: true,
  };
};

const updateRoleSpecificProfile = (user, targetRole, data) => {
  ensureRoleProfiles(user);

  const roleStr = (targetRole || user.role || 'DONOR').toUpperCase();
  const roleKey = (roleStr === 'RECEIVER' || roleStr === 'BENEFICIARY') ? 'beneficiary' : roleStr.toLowerCase();

  const finalAddr = (data.formattedAddress || data.address || data.addressLine || data.preferredZone || '').trim();

  if (finalAddr) {
    user.roleProfiles[roleKey].address = {
      formattedAddress: finalAddr,
      addressLine: data.addressLine ? data.addressLine.trim() : finalAddr,
      city: data.city ? data.city.trim() : '',
      state: data.state ? data.state.trim() : '',
      pinCode: data.pinCode ? data.pinCode.trim() : '',
      country: data.country ? data.country.trim() : 'India',
      latitude: data.latitude !== undefined && data.latitude !== null ? Number(data.latitude) : 17.3850,
      longitude: data.longitude !== undefined && data.longitude !== null ? Number(data.longitude) : 78.4867,
      placeId: data.placeId ? data.placeId.trim() : '',
    };

    if (roleKey === 'donor') user.donorAddress = finalAddr;
    if (roleKey === 'ngo') user.ngoAddress = finalAddr;
    if (roleKey === 'beneficiary') user.receiverAddress = finalAddr;
    if (roleKey === 'volunteer') user.volunteerAddress = finalAddr;
  }

  if (roleKey === 'donor' && data.donorType) user.roleProfiles.donor.donorType = data.donorType.trim();
  if (roleKey === 'ngo') {
    if (data.organizationName || data.ngoName) user.roleProfiles.ngo.organizationName = (data.organizationName || data.ngoName).trim();
    if (data.registrationNo) user.roleProfiles.ngo.registrationNo = data.registrationNo.trim();
    if (data.serviceArea) user.roleProfiles.ngo.serviceArea = data.serviceArea.trim();
    if (data.capacity) user.roleProfiles.ngo.capacity = Number(data.capacity);
  }
  if (roleKey === 'beneficiary') {
    if (data.householdSize || data.peopleCount) user.roleProfiles.beneficiary.householdSize = Number(data.householdSize || data.peopleCount);
    if (data.receiverType) user.roleProfiles.beneficiary.receiverType = data.receiverType.trim();
  }
  if (roleKey === 'volunteer') {
    if (data.vehicleType) user.roleProfiles.volunteer.vehicleType = data.vehicleType.trim();
    if (data.availability) user.roleProfiles.volunteer.availability = data.availability.trim();
  }

  if (roleKey && user.roleProfiles && user.roleProfiles[roleKey]) {
    user.roleProfiles[roleKey].isRegistered = true;
    if (!user.roleProfiles[roleKey].completedAt) {
      user.roleProfiles[roleKey].completedAt = new Date();
    }
  }

  if (user.markModified) user.markModified('roleProfiles');
};

exports.setupRole = async (req, res) => {
  try {
    const targetUser = await getUserFromReq(req);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    const { role, activeRole, name, mobile } = req.body;
    const currentRole = (activeRole || role || targetUser.role || 'DONOR').toUpperCase();

    if (name && name.trim()) targetUser.name = name.trim();
    if (mobile && mobile.trim()) targetUser.mobile = mobile.trim();

    updateRoleSpecificProfile(targetUser, currentRole, req.body);
    targetUser.setupCompleted = true;

    if (targetUser.save) {
      await targetUser.save();
    }

    return res.json({
      success: true,
      message: 'Profile details saved successfully',
      user: formatUserObj(targetUser, currentRole),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const targetUser = await getUserFromReq(req);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    const { name, mobile, role, activeRole } = req.body;
    const currentRole = (activeRole || role || targetUser.role || 'DONOR').toUpperCase();

    if (name) targetUser.name = name.trim();
    if (mobile) targetUser.mobile = mobile.trim();

    updateRoleSpecificProfile(targetUser, currentRole, req.body);

    if (targetUser.save) {
      await targetUser.save();
    }

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: formatUserObj(targetUser, currentRole),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAdminUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    const formatted = users.map((u) => formatUserObj(u));
    return res.json({ success: true, users: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
