const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Donation = require('../models/Donation');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Delivery = require('../models/Delivery');
const { notifyUser, notifyRole, broadcastEvent } = require('../socket');

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

// Helper distance calculation in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 2.5;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

exports.createDonation = async (req, res) => {
  try {
    const {
      foodName,
      food_name,
      category,
      description,
      quantity,
      unit,
      prepDate,
      expiryTime,
      imageUrl,
      address,
      latitude,
      longitude,
      contactNumber,
      deliveryPreference,
      deliveryMode,
      intendedRecipient,
      targetRole,
      donorId,
      donor_id,
      donorName,
      donor_name,
    } = req.body;

    const finalFoodName = (foodName || food_name || '').trim();
    const finalDeliveryPref = deliveryPreference || deliveryMode || 'VOLUNTEER_DELIVERY';
    const finalRecipient = intendedRecipient || targetRole || 'ALL';

    if (!finalFoodName || !quantity) {
      return res.status(400).json({ success: false, message: 'Please provide food name and quantity.' });
    }

    let donorUser = await getUserFromReq(req);
    const reqDonorId = donorId || donor_id;
    if (!donorUser && reqDonorId && mongoose.isValidObjectId(reqDonorId)) {
      donorUser = await User.findById(reqDonorId);
    }

    if (!donorUser) {
      return res.status(401).json({ success: false, message: 'Valid donor account required to post donations.' });
    }

    const finalDonorId = donorUser._id;
    const finalDonorName = donorUser.name || donorName || donor_name || 'Donor';
    const finalPhone = donorUser.mobile || contactNumber || '';

    const finalPickupAddr = (address || donorUser.formattedAddress || donorUser.address || '').trim();
    if (!finalPickupAddr) {
      return res.status(400).json({ success: false, message: 'Pickup address is required.' });
    }

    const lat = Number(latitude) || donorUser.latitude || 17.3850;
    const lng = Number(longitude) || donorUser.longitude || 78.4867;

    const donation = await Donation.create({
      donor: finalDonorName,
      donor_id: finalDonorId,
      donor_name: finalDonorName,
      donor_phone: finalPhone,
      food_name: finalFoodName,
      category: category || 'Cooked Meals',
      description: description || '',
      quantity: Number(quantity),
      unit: unit || 'Kg',
      prepDate: prepDate || '',
      expiryTime: expiryTime || '4 Hours',
      imageUrl: imageUrl || '',
      address: finalPickupAddr,
      pickupFormattedAddress: finalPickupAddr,
      pickupLatitude: lat,
      pickupLongitude: lng,
      pickupPlaceId: donorUser.placeId || '',
      pickupLocation: {
        type: 'Point',
        coordinates: [lng, lat],
      },
      deliveryPreference: finalDeliveryPref,
      intendedRecipient: finalRecipient,
      collectionMethod: finalDeliveryPref === 'SELF_DELIVERY' ? 'DONOR_DELIVERY' : 'VOLUNTEER_DELIVERY',
      status: 'PENDING',
      statusHistory: [
        {
          status: 'PENDING',
          timestamp: new Date(),
          updatedBy: finalDonorName,
          notes: `Donation created by donor (${finalDeliveryPref === 'SELF_DELIVERY' ? 'Self Delivery' : 'Volunteer Pickup'})`,
        },
      ],
    });

    try {
      const nearbyUsers = await User.find({
        role: { $in: ['NGO', 'RECEIVER'] },
        isActive: true,
      });

      for (const u of nearbyUsers) {
        const uLng = u.location?.coordinates?.[0] || u.longitude || 78.4867;
        const uLat = u.location?.coordinates?.[1] || u.latitude || 17.3850;
        const dist = calculateDistance(lat, lng, uLat, uLng);

        if (dist <= 15) {
          const notif = await Notification.create({
            userId: u._id,
            title: 'New Food Donation Available Nearby 📍',
            message: `${finalFoodName} (${quantity} ${unit || 'Kg'}) posted near your location (${dist} km away).`,
            relatedDonationId: donation._id,
            type: 'DONATION_NEARBY',
          });

          notifyUser(u._id.toString(), 'notification:new', notif);
          notifyUser(u._id.toString(), 'donation:nearby_alert', { donation, distanceKm: dist });
        }
      }
    } catch (notifErr) {
      console.warn('Notification broadcast notice:', notifErr.message);
    }

    broadcastEvent('donation:created', { donationId: donation._id, foodName: finalFoodName });
    notifyRole('ADMIN', 'admin:donation_new', { donationId: donation._id, foodName: finalFoodName });

    return res.status(201).json({
      success: true,
      message: 'Donation created successfully.',
      donationId: donation._id,
      donation,
    });
  } catch (error) {
    console.error('Error creating donation:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDonations = async (req, res) => {
  try {
    const { donorId, status, userLat, userLng } = req.query;
    const filter = {};

    if (donorId) {
      filter.donor_id = donorId;
    }

    if (status) {
      if (status.includes(',')) {
        filter.status = { $in: status.split(',') };
      } else {
        filter.status = status;
      }
    }

    const donations = await Donation.find(filter)
      .populate('donor_id', 'name email mobile address formattedAddress latitude longitude')
      .populate('ngo_id', 'name email mobile address formattedAddress latitude longitude organizationName')
      .populate('receiver_id', 'name email mobile address formattedAddress latitude longitude')
      .populate('volunteer_id', 'name email mobile address formattedAddress latitude longitude')
      .sort({ createdAt: -1 });

    const formatted = donations.map((d) => {
      const lat = d.pickupLatitude || d.pickupLocation?.coordinates?.[1] || 17.3850;
      const lng = d.pickupLongitude || d.pickupLocation?.coordinates?.[0] || 78.4867;
      const dist = calculateDistance(
        Number(userLat) || 17.3850,
        Number(userLng) || 78.4867,
        lat,
        lng
      );

      const recipientObj = d.ngo_id || d.receiver_id;
      const recipientAddr = d.recipientFormattedAddress || d.recipientAddress || recipientObj?.formattedAddress || recipientObj?.address || '';

      return {
        id: d._id,
        _id: d._id,
        donor_id: d.donor_id?._id || d.donor_id,
        donor_name: d.donor_name || d.donor_id?.name || 'Donor',
        donor_phone: d.donor_phone || d.donor_id?.mobile || '',
        food_name: d.food_name,
        foodName: d.food_name,
        category: d.category,
        description: d.description,
        quantity: d.quantity,
        unit: d.unit,
        prepDate: d.prepDate,
        expiryTime: d.expiryTime,
        imageUrl: d.imageUrl,
        address: d.pickupFormattedAddress || d.address,
        pickupLocation: d.pickupLocation,
        latitude: lat,
        longitude: lng,
        distanceKm: dist,
        deliveryPreference: d.deliveryPreference,
        deliveryMode: d.deliveryPreference,
        intendedRecipient: d.intendedRecipient || 'ALL',
        collectionMethod: d.collectionMethod || d.deliveryPreference || 'VOLUNTEER_DELIVERY',
        status: d.status,
        requestsCount: d.requests ? d.requests.length : 0,
        requests: d.requests || [],
        claimedBy: d.claimedBy,
        recipientName: d.claimedBy?.name || recipientObj?.organizationName || recipientObj?.name || d.acceptedByNGO || d.acceptedByReceiver || '',
        recipientRole: d.claimedBy?.role || (d.ngo_id ? 'NGO' : d.receiver_id ? 'RECEIVER' : ''),
        recipientPhone: d.recipientPhone || d.claimedBy?.phone || recipientObj?.mobile || '',
        recipientAddress: recipientAddr,
        recipientLatitude: d.recipientLatitude || recipientObj?.latitude || 17.3850,
        recipientLongitude: d.recipientLongitude || recipientObj?.longitude || 78.4867,
        ngo_id: d.ngo_id?._id ? d.ngo_id._id.toString() : (d.ngo_id ? d.ngo_id.toString() : null),
        ngoDetails: d.ngo_id,
        receiver_id: d.receiver_id?._id ? d.receiver_id._id.toString() : (d.receiver_id ? d.receiver_id.toString() : null),
        receiverDetails: d.receiver_id,
        volunteer_id: d.volunteer_id?._id ? d.volunteer_id._id.toString() : (d.volunteer_id ? d.volunteer_id.toString() : null),
        volunteerDetails: d.volunteer_id,
        assignedVolunteer: d.assignedVolunteer,
        volunteerPhone: d.volunteerPhone || d.volunteer_id?.mobile || '',
        pickupProofImage: d.pickupProofImage,
        deliveryProofImage: d.deliveryProofImage,
        rating: d.rating,
        reviewComment: d.reviewComment,
        statusHistory: d.statusHistory || [],
        createdAt: d.createdAt,
      };
    });

    return res.json({ success: true, donations: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getNearbyDonations = async (req, res) => {
  try {
    const lat = Number(req.query.lat) || 17.3850;
    const lng = Number(req.query.lng) || 78.4867;
    const maxRadiusKm = Number(req.query.radius) || 30;

    const donations = await Donation.find({
      status: { $in: ['PENDING', 'REQUESTED'] },
    }).sort({ createdAt: -1 });

    const nearby = [];

    for (const d of donations) {
      const dLat = d.pickupLatitude || d.pickupLocation?.coordinates?.[1] || 17.3850;
      const dLng = d.pickupLongitude || d.pickupLocation?.coordinates?.[0] || 78.4867;
      const dist = calculateDistance(lat, lng, dLat, dLng);

      if (dist <= maxRadiusKm) {
        nearby.push({
          id: d._id,
          _id: d._id,
          donor_name: d.donor_name,
          donor_phone: d.donor_phone,
          food_name: d.food_name,
          foodName: d.food_name,
          category: d.category,
          description: d.description,
          quantity: d.quantity,
          unit: d.unit,
          expiryTime: d.expiryTime,
          imageUrl: d.imageUrl,
          address: d.pickupFormattedAddress || d.address,
          latitude: dLat,
          longitude: dLng,
          distanceKm: dist,
          deliveryPreference: d.deliveryPreference,
          status: d.status,
          createdAt: d.createdAt,
        });
      }
    }

    return res.json({ success: true, count: nearby.length, donations: nearby });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donor_id', 'name email mobile address formattedAddress latitude longitude')
      .populate('ngo_id', 'name email mobile address formattedAddress latitude longitude organizationName')
      .populate('receiver_id', 'name email mobile address formattedAddress latitude longitude')
      .populate('volunteer_id', 'name email mobile address formattedAddress latitude longitude');

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found.' });
    }

    return res.json({ success: true, donation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.requestDonation = async (req, res) => {
  try {
    const donationId = req.params.id;
    const { userId, userName, userRole, distanceKm, collectionMethod, userAddress } = req.body;

    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found.' });
    }

    let reqUser = await getUserFromReq(req);
    const reqUserId = userId || (reqUser ? reqUser._id : null);
    if (!reqUser && reqUserId && mongoose.isValidObjectId(reqUserId)) {
      reqUser = await User.findById(reqUserId);
    }

    if (!reqUser) {
      return res.status(401).json({ success: false, message: 'Authenticated user profile required to request food.' });
    }

    const validReqUserId = reqUser._id;
    const reqUserName = reqUser.organizationName || reqUser.name || userName || 'Recipient';
    const reqUserRole = (reqUser.role || userRole || 'NGO').toUpperCase();

    const existingReq = donation.requests.find((r) => r.userId && r.userId.toString() === validReqUserId.toString());
    if (existingReq) {
      return res.status(400).json({ success: false, message: 'You have already requested this food donation.' });
    }

    // Set recipient destination address directly from authenticated user's own database profile
    const destAddr = (userAddress || reqUser.formattedAddress || reqUser.address || '').trim();
    const destLat = reqUser.latitude || 17.3850;
    const destLng = reqUser.longitude || 78.4867;

    donation.requests.push({
      userId: validReqUserId,
      userName: reqUserName,
      userRole: reqUserRole,
      distanceKm: Number(distanceKm) || calculateDistance(donation.pickupLatitude, donation.pickupLongitude, destLat, destLng),
      requestTime: new Date(),
      status: 'PENDING',
    });

    donation.status = 'ACCEPTED';
    donation.claimedBy = {
      userId: validReqUserId,
      name: reqUserName,
      role: reqUserRole,
      phone: reqUser.mobile || '',
      address: destAddr,
    };
    donation.recipientPhone = reqUser.mobile || '';
    donation.recipientAddress = destAddr;
    donation.recipientFormattedAddress = destAddr;
    donation.recipientLatitude = destLat;
    donation.recipientLongitude = destLng;
    donation.recipientPlaceId = reqUser.placeId || '';

    const rawMode = collectionMethod || req.body.deliveryMode || req.body.deliveryPreference || 'BENEFICIARY_SELF_PICKUP';
    const isSelfCollection = [
      'BENEFICIARY_SELF_PICKUP',
      'SELF_COLLECTION',
      'DONOR_DELIVERY',
      'SELF_DELIVERY',
      'RECEIVER_PICKUP',
    ].includes(rawMode);

    if (isSelfCollection) {
      donation.collectionMethod = rawMode === 'DONOR_DELIVERY' ? 'DONOR_DELIVERY' : 'BENEFICIARY_SELF_PICKUP';
      donation.deliveryMode = 'SELF_COLLECTION';
      donation.deliveryPreference = 'SELF_COLLECTION';
      donation.volunteerRequired = false;
      donation.volunteerStatus = 'NOT_REQUIRED';
      donation.volunteer_id = null;
      donation.assignedVolunteer = null;
      donation.status = 'ACCEPTED_SELF_COLLECTION';

      // Remove any incorrectly created volunteer delivery tasks & notifications for this donation
      await Delivery.deleteMany({ donationId: donation._id });
      await Notification.deleteMany({
        relatedDonationId: donation._id,
        type: { $in: ['VOLUNTEER_ASSIGNED', 'delivery:new_available'] },
      });
    } else {
      donation.collectionMethod = 'VOLUNTEER_DELIVERY';
      donation.deliveryMode = 'VOLUNTEER_DELIVERY';
      donation.deliveryPreference = 'VOLUNTEER_DELIVERY';
      donation.volunteerRequired = true;
      donation.volunteerStatus = 'PENDING';
      donation.status = 'ACCEPTED';
    }

    if (reqUserRole === 'NGO') {
      donation.ngo_id = validReqUserId;
      donation.acceptedByNGO = reqUserName;
    } else if (reqUserRole === 'RECEIVER') {
      donation.receiver_id = validReqUserId;
      donation.acceptedByReceiver = reqUserName;
    }

    donation.statusHistory.push({
      status: isSelfCollection ? 'ACCEPTED_SELF_COLLECTION' : 'ACCEPTED',
      timestamp: new Date(),
      updatedBy: reqUserName,
      notes: isSelfCollection
        ? `${reqUserRole} "${reqUserName}" accepted food for Self Collection. Volunteer not required.`
        : `${reqUserRole} "${reqUserName}" accepted food donation. Destination address: ${destAddr}`,
    });

    await donation.save();

    const notif = await Notification.create({
      userId: donation.donor_id,
      title: 'New Food Donation Claim / Request 📥',
      message: `${reqUserRole} "${reqUserName}" claimed your donation "${donation.food_name}" (${isSelfCollection ? 'Self Collection' : 'Volunteer Pickup'}).`,
      relatedDonationId: donation._id,
      type: 'DONATION_REQUESTED',
    });

    notifyUser(donation.donor_id.toString(), 'notification:new', notif);
    notifyUser(donation.donor_id.toString(), 'donation:claimed', { donationId: donation._id, requestedBy: reqUserName });
    notifyRole('ADMIN', 'admin:donation_requested', { donationId: donation._id });

    return res.json({
      success: true,
      message: 'Donation accepted/claimed successfully.',
      donation,
    });
  } catch (error) {
    console.error('Error claiming donation:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.claimDonation = exports.requestDonation;

exports.approveRequest = async (req, res) => {
  try {
    const donationId = req.params.id;
    const { requestId, targetUserId, deliveryPreference } = req.body;

    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found.' });
    }

    let selectedReq = null;
    if (requestId) {
      selectedReq = donation.requests.id(requestId);
    } else if (targetUserId) {
      selectedReq = donation.requests.find((r) => r.userId.toString() === targetUserId.toString());
    } else if (donation.requests.length > 0) {
      selectedReq = donation.requests[0];
    }

    if (!selectedReq) {
      return res.status(400).json({ success: false, message: 'Invalid or missing request selection.' });
    }

    const recipientUser = await User.findById(selectedReq.userId);
    const destAddr = (donation.recipientAddress || recipientUser?.formattedAddress || recipientUser?.address || 'Recipient Location').trim();
    const destLat = donation.recipientLatitude || recipientUser?.latitude || 17.3850;
    const destLng = donation.recipientLongitude || recipientUser?.longitude || 78.4867;

    selectedReq.status = 'ACCEPTED';
    donation.claimedBy = {
      userId: selectedReq.userId,
      name: selectedReq.userName,
      role: selectedReq.userRole,
      phone: recipientUser?.mobile || donation.recipientPhone || '',
      address: destAddr,
    };

    if (selectedReq.userRole === 'NGO') {
      donation.ngo_id = selectedReq.userId;
      donation.acceptedByNGO = selectedReq.userName;
    } else {
      donation.receiver_id = selectedReq.userId;
      donation.acceptedByReceiver = selectedReq.userName;
    }

    const chosenMode = deliveryPreference || donation.deliveryPreference || 'VOLUNTEER_DELIVERY';
    donation.deliveryPreference = chosenMode;
    donation.status = 'APPROVED';

    donation.statusHistory.push({
      status: 'APPROVED',
      timestamp: new Date(),
      updatedBy: donation.donor_name,
      notes: `Donor approved request from ${selectedReq.userName} with delivery mode: ${chosenMode}`,
    });

    await donation.save();

    const deliveryTask = await Delivery.create({
      donationId: donation._id,
      donorId: donation.donor_id,
      recipientId: selectedReq.userId,
      recipientRole: selectedReq.userRole,
      deliveryType: chosenMode,
      status: chosenMode === 'VOLUNTEER_DELIVERY' ? 'VOLUNTEER_ASSIGNED' : 'PICKUP_STARTED',
      pickupAddress: donation.pickupFormattedAddress || donation.address,
      deliveryAddress: destAddr,
      pickupLocation: donation.pickupLocation,
      deliveryLocation: {
        type: 'Point',
        coordinates: [destLng, destLat],
      },
    });

    if (chosenMode === 'VOLUNTEER_DELIVERY') {
      donation.status = 'VOLUNTEER_ASSIGNED';
      await donation.save();

      notifyRole('VOLUNTEER', 'delivery:new_available', {
        deliveryId: deliveryTask._id,
        donationId: donation._id,
        foodName: donation.food_name,
        pickupAddress: donation.address,
        deliveryAddress: destAddr,
      });

      const recNotif = await Notification.create({
        userId: selectedReq.userId,
        title: 'Donation Approved! 🚚',
        message: `Donor approved your request for "${donation.food_name}". A volunteer is being dispatched.`,
        relatedDonationId: donation._id,
        type: 'REQUEST_APPROVED',
      });
      notifyUser(selectedReq.userId.toString(), 'notification:new', recNotif);
    } else {
      const recNotif = await Notification.create({
        userId: selectedReq.userId,
        title: 'Donation Approved! 🎉',
        message: `Donor approved your request for "${donation.food_name}" (${chosenMode.replace('_', ' ')}).`,
        relatedDonationId: donation._id,
        type: 'REQUEST_APPROVED',
      });
      notifyUser(selectedReq.userId.toString(), 'notification:new', recNotif);
    }

    notifyRole('ADMIN', 'admin:donation_approved', { donationId: donation._id });

    return res.json({
      success: true,
      message: 'Request approved successfully.',
      donation,
      deliveryTask,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPersonalStats = async (req, res) => {
  try {
    const { donorId, userId } = req.query;
    const uid = userId || donorId;

    const filter = uid ? { $or: [{ donor_id: uid }, { donor: uid }, { ngo_id: uid }, { receiver_id: uid }, { volunteer_id: uid }] } : {};
    const donations = await Donation.find(filter);

    const totalDonations = donations.length;
    const completedList = donations.filter((d) => d.status === 'COMPLETED');
    const completedDonations = completedList.length;
    const foodSavedKg = completedList.reduce((sum, d) => sum + (Number(d.quantity) || 0), 0);
    const peopleHelped = completedList.reduce((sum, d) => sum + (Number(d.quantity) || 0) * 2, 0);

    return res.json({
      success: true,
      stats: {
        totalDonations,
        completedDonations,
        foodSavedKg,
        peopleHelped,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPlatformStats = async (req, res) => {
  try {
    const donations = await Donation.find();
    const users = await User.find();

    const donorsCount = users.filter((u) => u.role === 'DONOR').length;
    const ngosCount = users.filter((u) => u.role === 'NGO').length;
    const volunteersCount = users.filter((u) => u.role === 'VOLUNTEER').length;
    const receiversCount = users.filter((u) => u.role === 'RECEIVER').length;

    const totalCount = donations.length;
    const pendingCount = donations.filter((d) => d.status === 'PENDING' || d.status === 'REQUESTED').length;
    const activeCount = donations.filter((d) => ['APPROVED', 'VOLUNTEER_ASSIGNED', 'PICKUP_STARTED', 'PICKED_UP', 'IN_TRANSIT'].includes(d.status)).length;
    const completedList = donations.filter((d) => d.status === 'COMPLETED');
    const completedCount = completedList.length;

    return res.json({
      success: true,
      stats: {
        totalUsers: users.length,
        donorsCount,
        ngosCount,
        volunteersCount,
        receiversCount,
        totalDonations: totalCount,
        pendingDonations: pendingCount,
        activeDonations: activeCount,
        completedDonations: completedCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
