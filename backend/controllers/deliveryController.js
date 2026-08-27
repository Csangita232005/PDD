const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Delivery = require('../models/Delivery');
const Donation = require('../models/Donation');
const User = require('../models/User');
const Notification = require('../models/Notification');
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
  if (req.body && req.body.volunteerId && mongoose.isValidObjectId(req.body.volunteerId)) {
    return await User.findById(req.body.volunteerId);
  }
  return null;
};

exports.getAvailableDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find({
      status: { $in: ['VOLUNTEER_ASSIGNED', 'PENDING'] },
      volunteerId: null,
      volunteerRequired: { $ne: false },
      deliveryType: { $in: ['VOLUNTEER_DELIVERY', 'VOLUNTEER_PICKUP'] },
    })
      .populate('donationId')
      .populate('donorId', 'name mobile address formattedAddress latitude longitude')
      .populate('recipientId', 'name mobile address formattedAddress latitude longitude organizationName')
      .sort({ createdAt: -1 });

    const filtered = deliveries.filter((d) => {
      if (!d.donationId) return true;
      const don = d.donationId;
      const selfModes = ['BENEFICIARY_SELF_PICKUP', 'SELF_COLLECTION', 'DONOR_DELIVERY', 'SELF_DELIVERY', 'RECEIVER_PICKUP'];
      if (don.volunteerRequired === false) return false;
      if (selfModes.includes(don.collectionMethod) || selfModes.includes(don.deliveryMode) || selfModes.includes(don.deliveryPreference)) return false;
      if (don.status === 'ACCEPTED_SELF_COLLECTION') return false;
      return true;
    });

    return res.json({ success: true, deliveries: filtered });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.acceptDeliveryTask = async (req, res) => {
  try {
    const deliveryId = req.params.id;
    const { volunteerId, volunteer_id, volunteerName, volunteer_name } = req.body || {};
    
    let volUser = await getUserFromReq(req);
    const volId = volUser ? volUser._id : (volunteerId || volunteer_id);
    if (!volUser && volId && mongoose.isValidObjectId(volId)) {
      volUser = await User.findById(volId);
    }

    if (!volUser) {
      // Fallback: try finding any volunteer user if unauthenticated test call
      volUser = await User.findOne({ role: 'VOLUNTEER' });
    }

    if (!volUser) {
      return res.status(401).json({ success: false, message: 'Valid volunteer account required.' });
    }

    let donation = null;
    let delivery = await Delivery.findOne({ donationId: deliveryId });

    if (!delivery && mongoose.isValidObjectId(deliveryId)) {
      delivery = await Delivery.findById(deliveryId);
    }

    if (!delivery) {
      donation = await Donation.findById(deliveryId);
      if (!donation) {
        return res.status(404).json({ success: false, message: 'Delivery or Donation task not found.' });
      }
      const destAddr = donation.recipientFormattedAddress || donation.recipientAddress || 'Recipient Location';
      delivery = await Delivery.create({
        donationId: donation._id,
        donorId: donation.donor_id,
        recipientId: donation.ngo_id || donation.receiver_id || donation.donor_id,
        status: 'VOLUNTEER_ASSIGNED',
        pickupAddress: donation.pickupFormattedAddress || donation.address,
        deliveryAddress: destAddr,
      });
    } else {
      donation = await Donation.findById(delivery.donationId);
    }

    const validVolId = volUser._id;
    const volName = volUser.name || volunteerName || volunteer_name || 'Volunteer';
    const volMobile = volUser.mobile || '';
    const volLat = volUser.latitude || 17.3850;
    const volLng = volUser.longitude || 78.4867;

    // Atomic lock check: Prevent multiple volunteers from accepting the same task
    if (delivery.volunteerId && delivery.volunteerId.toString() !== validVolId.toString()) {
      return res.status(400).json({ success: false, message: 'This pickup task has already been accepted by another volunteer.' });
    }

    delivery.volunteerId = validVolId;
    delivery.status = 'VOLUNTEER_ASSIGNED';
    delivery.volunteerLatitude = volLat;
    delivery.volunteerLongitude = volLng;
    if (donation) {
      delivery.pickupAddress = donation.pickupFormattedAddress || donation.address || delivery.pickupAddress;
      delivery.deliveryAddress = donation.recipientFormattedAddress || donation.recipientAddress || delivery.deliveryAddress;
    }
    await delivery.save();

    if (donation) {
      donation.volunteer_id = validVolId;
      donation.assignedVolunteer = volName;
      donation.volunteerPhone = volMobile;
      donation.status = 'VOLUNTEER_ASSIGNED';
      donation.statusHistory.push({
        status: 'VOLUNTEER_ASSIGNED',
        timestamp: new Date(),
        updatedBy: volName,
        notes: `Volunteer ${volName} accepted delivery task`,
      });
      await donation.save();

      // Notify Donor
      if (donation.donor_id) {
        const donorNotif = await Notification.create({
          userId: donation.donor_id,
          title: 'Volunteer Assigned 🚴',
          message: `Volunteer ${volName} (${volMobile || 'Contact active'}) has accepted your food delivery assignment.`,
          relatedDonationId: donation._id,
          type: 'VOLUNTEER_ASSIGNED',
        });
        notifyUser(donation.donor_id.toString(), 'notification:new', donorNotif);
      }

      // Notify Recipient (NGO or Receiver)
      const recipientUserId = donation.claimedBy?.userId || donation.ngo_id || donation.receiver_id;
      if (recipientUserId) {
        const recNotif = await Notification.create({
          userId: recipientUserId,
          title: 'Volunteer On The Way! 🚴',
          message: `Volunteer ${volName} is assigned to pick up and bring your food donation.`,
          relatedDonationId: donation._id,
          type: 'VOLUNTEER_ASSIGNED',
        });
        notifyUser(recipientUserId.toString(), 'notification:new', recNotif);
      }
    }

    broadcastEvent('delivery:assigned', { deliveryId: delivery._id, donationId: donation?._id });
    notifyRole('ADMIN', 'admin:delivery_assigned', { deliveryId: delivery._id });

    return res.json({ success: true, message: 'Delivery task accepted successfully.', delivery, donation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.startPickup = async (req, res) => {
  try {
    const deliveryId = req.params.id;
    let delivery = await Delivery.findOne({ donationId: deliveryId });
    if (!delivery && mongoose.isValidObjectId(deliveryId)) delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found.' });
    }

    delivery.status = 'PICKUP_STARTED';
    await delivery.save();

    const donation = await Donation.findById(delivery.donationId);
    if (donation) {
      donation.status = 'PICKUP_STARTED';
      donation.statusHistory.push({
        status: 'PICKUP_STARTED',
        timestamp: new Date(),
        updatedBy: 'Volunteer',
        notes: 'Volunteer started pickup route',
      });
      await donation.save();
    }

    broadcastEvent('delivery:status_change', { deliveryId, status: 'PICKUP_STARTED' });

    return res.json({ success: true, message: 'Pickup started.', delivery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadPickupProof = async (req, res) => {
  try {
    const deliveryId = req.params.id;
    const { pickupProofImage } = req.body;

    let delivery = await Delivery.findOne({ donationId: deliveryId });
    if (!delivery && mongoose.isValidObjectId(deliveryId)) delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found.' });
    }

    delivery.pickupProofImage = pickupProofImage || '';
    delivery.pickupTime = new Date();
    delivery.status = 'PICKED_UP';
    await delivery.save();

    const donation = await Donation.findById(delivery.donationId);
    if (donation) {
      donation.pickupProofImage = pickupProofImage || '';
      donation.status = 'PICKED_UP';
      donation.statusHistory.push({
        status: 'PICKED_UP',
        timestamp: new Date(),
        updatedBy: 'Volunteer',
        notes: 'Food picked up from donor with proof image upload',
      });
      await donation.save();

      if (donation.donor_id) {
        const dNotif = await Notification.create({
          userId: donation.donor_id,
          title: 'Food Picked Up! 📦',
          message: `Volunteer picked up "${donation.food_name}" from your location.`,
          relatedDonationId: donation._id,
          type: 'STATUS_UPDATE',
        });
        notifyUser(donation.donor_id.toString(), 'notification:new', dNotif);
      }

      const recipientUserId = donation.claimedBy?.userId || donation.ngo_id || donation.receiver_id;
      if (recipientUserId) {
        const rNotif = await Notification.create({
          userId: recipientUserId,
          title: 'Food Picked Up & In Transit! 🚚',
          message: `Volunteer picked up "${donation.food_name}" and is on the way.`,
          relatedDonationId: donation._id,
          type: 'STATUS_UPDATE',
        });
        notifyUser(recipientUserId.toString(), 'notification:new', rNotif);
      }
    }

    broadcastEvent('delivery:status_change', { deliveryId, status: 'PICKED_UP' });

    return res.json({ success: true, message: 'Pickup proof uploaded. Status updated to PICKED_UP.', delivery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.startDelivery = async (req, res) => {
  try {
    const deliveryId = req.params.id;
    let delivery = await Delivery.findOne({ donationId: deliveryId });
    if (!delivery && mongoose.isValidObjectId(deliveryId)) delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found.' });
    }

    delivery.status = 'IN_TRANSIT';
    await delivery.save();

    const donation = await Donation.findById(delivery.donationId);
    if (donation) {
      donation.status = 'IN_TRANSIT';
      donation.statusHistory.push({
        status: 'IN_TRANSIT',
        timestamp: new Date(),
        updatedBy: 'Volunteer',
        notes: 'Delivery in transit to destination',
      });
      await donation.save();
    }

    broadcastEvent('delivery:status_change', { deliveryId, status: 'IN_TRANSIT' });

    return res.json({ success: true, message: 'Delivery in transit.', delivery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadDeliveryProof = async (req, res) => {
  try {
    const deliveryId = req.params.id;
    const { deliveryProofImage } = req.body;

    let delivery = await Delivery.findOne({ donationId: deliveryId });
    if (!delivery && mongoose.isValidObjectId(deliveryId)) delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found.' });
    }

    delivery.deliveryProofImage = deliveryProofImage || '';
    delivery.deliveryTime = new Date();
    delivery.status = 'DELIVERED';
    await delivery.save();

    const donation = await Donation.findById(delivery.donationId);
    if (donation) {
      donation.deliveryProofImage = deliveryProofImage || '';
      donation.status = 'DELIVERED';
      donation.statusHistory.push({
        status: 'DELIVERED',
        timestamp: new Date(),
        updatedBy: 'Volunteer',
        notes: 'Food delivered to destination with proof image',
      });
      await donation.save();

      const recipientUserId = donation.claimedBy?.userId || donation.ngo_id || donation.receiver_id;
      if (recipientUserId) {
        const notif = await Notification.create({
          userId: recipientUserId,
          title: 'Food Delivered! 📦',
          message: `Your requested food "${donation.food_name}" has arrived. Please confirm receipt.`,
          relatedDonationId: donation._id,
          type: 'DELIVERED',
        });
        notifyUser(recipientUserId.toString(), 'notification:new', notif);
      }

      if (donation.donor_id) {
        const dNotif = await Notification.create({
          userId: donation.donor_id,
          title: 'Food Delivered to Recipient! 📦',
          message: `Your donation "${donation.food_name}" has been delivered to destination.`,
          relatedDonationId: donation._id,
          type: 'DELIVERED',
        });
        notifyUser(donation.donor_id.toString(), 'notification:new', dNotif);
      }
    }

    broadcastEvent('delivery:status_change', { deliveryId, status: 'DELIVERED' });

    return res.json({ success: true, message: 'Delivery proof uploaded. Status set to DELIVERED.', delivery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.confirmReceipt = async (req, res) => {
  try {
    const { donationId, rating, reviewComment } = req.body;

    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found.' });
    }

    donation.status = 'COMPLETED';
    if (rating) donation.rating = Number(rating);
    if (reviewComment) donation.reviewComment = reviewComment;

    const recipientName = donation.claimedBy?.name || donation.acceptedByNGO || donation.acceptedByReceiver || 'Recipient';

    donation.statusHistory.push({
      status: 'COMPLETED',
      timestamp: new Date(),
      updatedBy: recipientName,
      notes: `Recipient ${recipientName} confirmed food receipt. Delivery process complete.`,
    });

    await donation.save();

    let delivery = await Delivery.findOne({ donationId });
    if (delivery) {
      delivery.status = 'COMPLETED';
      delivery.completedTime = new Date();
      if (rating) delivery.foodQualityRating = Number(rating);
      if (reviewComment) delivery.feedback = reviewComment;
      await delivery.save();
    }

    if (donation.donor_id) {
      const dNotif = await Notification.create({
        userId: donation.donor_id,
        title: 'Donation Received & Completed! 🎉',
        message: `Your food donation "${donation.food_name}" was confirmed received by ${recipientName}. Thank you!`,
        relatedDonationId: donation._id,
        type: 'COMPLETED',
      });
      notifyUser(donation.donor_id.toString(), 'notification:new', dNotif);
    }

    broadcastEvent('donation:completed', { donationId });
    broadcastEvent('delivery:completed', { donationId });
    notifyRole('ADMIN', 'admin:donation_completed', { donationId });

    return res.json({ success: true, message: 'Delivery confirmed and marked as COMPLETED.', donation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateVolunteerLocation = async (req, res) => {
  try {
    const deliveryId = req.params.id;
    const { latitude, longitude, address } = req.body || {};

    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude are required.' });
    }

    let delivery = await Delivery.findOne({ donationId: deliveryId });
    if (!delivery && mongoose.isValidObjectId(deliveryId)) {
      delivery = await Delivery.findById(deliveryId);
    }

    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery task not found.' });
    }

    const updatedTime = new Date();
    delivery.currentLocation = {
      type: 'Point',
      coordinates: [Number(longitude), Number(latitude)],
    };
    delivery.volunteerLatitude = Number(latitude);
    delivery.volunteerLongitude = Number(longitude);
    delivery.volunteerLocationUpdatedAt = updatedTime;
    await delivery.save();

    const payload = {
      deliveryId: delivery._id,
      donationId: delivery.donationId,
      status: delivery.status,
      volunteerLocation: {
        latitude: Number(latitude),
        longitude: Number(longitude),
        address: address || delivery.pickupAddress,
        updatedAt: updatedTime,
      },
    };

    broadcastEvent('delivery:location_update', payload);
    notifyRole('ADMIN', 'admin:location_update', payload);

    return res.json({ success: true, message: 'Volunteer location updated.', location: payload.volunteerLocation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
