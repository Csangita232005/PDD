const User = require('../models/User');
const Donation = require('../models/Donation');
const Delivery = require('../models/Delivery');
const Notification = require('../models/Notification');
const Review = require('../models/Review');

exports.resetDemoData = async (req, res) => {
  try {
    // Clear operational collections (donations, deliveries, notifications, reviews)
    await Donation.deleteMany({});
    await Delivery.deleteMany({});
    await Notification.deleteMany({});
    await Review.deleteMany({});

    return res.json({
      success: true,
      message: 'Operational collections reset successfully! All food requests, deliveries, and notifications purged.',
    });
  } catch (error) {
    console.error('Reset Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
