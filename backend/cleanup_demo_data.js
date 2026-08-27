const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/.env' });

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sharebite';

const protectedEmails = ['csangita0108@gmail.com'];

const demoUserEmails = [
  'donor@sharebite.org',
  'ngo@sharebite.org',
  'volunteer@sharebite.org',
  'receiver@sharebite.org',
  'admin@sharebite.org',
  'admin2@sharebite.org',
  'secondary.admin@sharebite.org',
  'demo.donor@sharebite.org',
];

const demoFoodNameKeywords = [
  'veg biryani',
  'chapati',
  'mixed fruit',
  'special veg thali',
  'thali',
];

async function runCleanup() {
  try {
    console.log('🔍 Connecting to MongoDB for targeted demo data cleanup...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB:', mongoUri);

    const User = require('./models/User');
    const Donation = require('./models/Donation');
    const Delivery = require('./models/Delivery');
    const Notification = require('./models/Notification');
    const Review = require('./models/Review');

    // 1. Identify Demo Users to remove (excluding protected emails)
    const demoUsers = await User.find({
      email: {
        $in: demoUserEmails.map((e) => new RegExp(`^${e}$`, 'i')),
        $nin: protectedEmails.map((e) => new RegExp(`^${e}$`, 'i')),
      },
    });

    const demoUserIds = demoUsers.map((u) => u._id);
    console.log(`Found ${demoUsers.length} demo user records to remove.`);

    // 2. Identify Demo Donations
    const demoDonationQuery = {
      $or: [
        { donor_id: { $in: demoUserIds } },
        { ngo_id: { $in: demoUserIds } },
        { receiver_id: { $in: demoUserIds } },
        { volunteer_id: { $in: demoUserIds } },
        { food_name: { $regex: demoFoodNameKeywords.join('|'), $options: 'i' } },
        { donor: { $regex: 'Demo', $options: 'i' } },
      ],
    };

    const demoDonations = await Donation.find(demoDonationQuery);
    const demoDonationIds = demoDonations.map((d) => d._id);
    console.log(`Found ${demoDonations.length} demo donation records to remove.`);

    // 3. Delete Demo Deliveries, Notifications, Reviews
    const delDeliveryRes = await Delivery.deleteMany({
      $or: [
        { donationId: { $in: demoDonationIds } },
        { donorId: { $in: demoUserIds } },
        { recipientId: { $in: demoUserIds } },
        { volunteerId: { $in: demoUserIds } },
      ],
    });
    console.log(`Deleted ${delDeliveryRes.deletedCount} demo delivery records.`);

    const delNotifRes = await Notification.deleteMany({
      $or: [
        { userId: { $in: demoUserIds } },
        { relatedDonationId: { $in: demoDonationIds } },
        { title: { $regex: 'Demo|Sample|Test', $options: 'i' } },
      ],
    });
    console.log(`Deleted ${delNotifRes.deletedCount} demo notification records.`);

    const delReviewRes = await Review.deleteMany({
      $or: [
        { reviewer_id: { $in: demoUserIds } },
        { donation_id: { $in: demoDonationIds } },
      ],
    });
    console.log(`Deleted ${delReviewRes.deletedCount} demo review records.`);

    // 4. Delete Demo Donations
    const delDonationRes = await Donation.deleteMany({ _id: { $in: demoDonationIds } });
    console.log(`Deleted ${delDonationRes.deletedCount} demo donation records.`);

    // 5. Delete Demo Users
    const delUserRes = await User.deleteMany({ _id: { $in: demoUserIds } });
    console.log(`Deleted ${delUserRes.deletedCount} demo user records.`);

    // 6. Verify Protected Real User Account
    const protectedUser = await User.findOne({
      email: { $regex: '^csangita0108@gmail.com$', $options: 'i' },
    });

    if (protectedUser) {
      console.log(`✅ VERIFIED: Protected real user account exists intact: ${protectedUser.email} (Role: ${protectedUser.role}, isAdmin: ${protectedUser.isAdmin})`);
    } else {
      console.warn(`⚠️ NOTICE: Protected user account csangita0108@gmail.com is not yet registered in MongoDB.`);
    }

    const remainingUsersCount = await User.countDocuments();
    const remainingDonationsCount = await Donation.countDocuments();
    const remainingDeliveriesCount = await Delivery.countDocuments();

    console.log('\n--- CLEANUP SUMMARY ---');
    console.log(`Remaining Users in MongoDB: ${remainingUsersCount}`);
    console.log(`Remaining Food Donations: ${remainingDonationsCount}`);
    console.log(`Remaining Deliveries: ${remainingDeliveriesCount}`);
    console.log('✅ Targeted cleanup finished successfully!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Cleanup script error:', error);
    process.exit(1);
  }
}

runCleanup();
