const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/foodbridge_test';
const protectedEmail = 'csangita0108@gmail.com';

async function purgeAllRandomData() {
  try {
    console.log('🔍 Connecting to MongoDB to purge all random/seed data...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB:', mongoUri);

    const User = require('./models/User');
    const Donation = require('./models/Donation');
    const Delivery = require('./models/Delivery');
    const Notification = require('./models/Notification');
    const Review = require('./models/Review');
    const Complaint = require('./models/Complaint');
    const ImpactMetric = require('./models/ImpactMetric');

    // 1. Purge all donations, deliveries, notifications, reviews, complaints, metrics
    const resDonations = await Donation.deleteMany({});
    const resDeliveries = await Delivery.deleteMany({});
    const resNotifs = await Notification.deleteMany({});
    const resReviews = await Review.deleteMany({});
    const resComplaints = await Complaint.deleteMany({});
    const resMetrics = await ImpactMetric.deleteMany({});

    console.log(`Deleted ${resDonations.deletedCount} food donations.`);
    console.log(`Deleted ${resDeliveries.deletedCount} delivery records.`);
    console.log(`Deleted ${resNotifs.deletedCount} notification records.`);
    console.log(`Deleted ${resReviews.deletedCount} review records.`);
    console.log(`Deleted ${resComplaints.deletedCount} complaint records.`);
    console.log(`Deleted ${resMetrics.deletedCount} impact metric records.`);

    // 2. Remove all non-protected test/fake users
    const allUsers = await User.find({});
    const unwantedUserIds = allUsers
      .filter((u) => u.email && u.email.toLowerCase().trim() !== protectedEmail.toLowerCase())
      .map((u) => u._id);

    if (unwantedUserIds.length > 0) {
      const resUsers = await User.deleteMany({ _id: { $in: unwantedUserIds } });
      console.log(`Deleted ${resUsers.deletedCount} temporary/test user accounts.`);
    }

    // 3. Verify real protected user
    const protectedUser = await User.findOne({
      email: { $regex: `^${protectedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
    });

    console.log('\n================================================--');
    console.log('✨ DATABASE CLEANUP COMPLETED!');
    if (protectedUser) {
      console.log(`✅ Real User Account Protected: ${protectedUser.name} (${protectedUser.email})`);
    }
    const totalUsersLeft = await User.countDocuments();
    const totalDonationsLeft = await Donation.countDocuments();
    console.log(`Total Users Left: ${totalUsersLeft}`);
    console.log(`Total Active Food Items Left: ${totalDonationsLeft}`);
    console.log('================================================--');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error during purge:', err.message);
    process.exit(1);
  }
}

purgeAllRandomData();
