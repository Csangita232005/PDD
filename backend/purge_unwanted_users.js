const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/.env' });

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sharebite';

const protectedEmail = 'csangita0108@gmail.com';

const emailRegexPatterns = [
  /.*@foodbridge\.org$/i,
  /single\.account\..*@foodbridge\.org$/i,
  /sangita\.donor\..*@foodbridge\.org$/i,
  /helpinghands\.ngo\..*@foodbridge\.org$/i,
  /priya\.volunteer\..*@foodbridge\.org$/i,
  /ravi\.receiver\..*@foodbridge\.org$/i,
  /newuser_.*@sharebite\.org$/i,
  /^user[ab]@gmail\.com$/i,
  /^(donor|ngo|volunteer|receiver|admin|admin2|secondary\.admin|demo\.donor)@sharebite\.org$/i,
];

const namePatterns = [
  'Sangita MultiRole',
  'Sangita Donor',
  'Demo Donor',
  'Demo NGO Foundation',
  'Demo Receiver Family',
  'Demo Volunteer Hero',
  'Secondary Admin',
];

async function runPurge() {
  try {
    console.log('🔍 Connecting to MongoDB for unwanted test user backup and purge...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB:', mongoUri);

    const User = require('./models/User');
    const Donation = require('./models/Donation');
    const Delivery = require('./models/Delivery');
    const Notification = require('./models/Notification');
    const Review = require('./models/Review');

    // 1. Find all users in MongoDB
    const allUsers = await User.find({});
    console.log(`Inspecting ${allUsers.length} total user records in MongoDB...`);

    const unwantedUsers = allUsers.filter((u) => {
      if (!u.email) return false;
      const lowerEmail = u.email.toLowerCase().trim();

      // NEVER match protected real account
      if (lowerEmail === protectedEmail.toLowerCase()) return false;

      // Check regex email patterns
      const matchEmailPattern = emailRegexPatterns.some((pattern) => pattern.test(lowerEmail));
      // Check name patterns
      const matchNamePattern = namePatterns.some((name) => u.name && u.name.trim().toLowerCase() === name.toLowerCase());

      return matchEmailPattern || matchNamePattern || u.isDemo === true || u.seeded === true;
    });

    console.log(`Matched ${unwantedUsers.length} unwanted fake/test user records.`);

    const unwantedUserIds = unwantedUsers.map((u) => u._id);
    const unwantedEmails = unwantedUsers.map((u) => u.email);

    // 2. Export Backup JSON file before deletion
    const backupPath = path.join(__dirname, 'backup_deleted_unwanted_users.json');
    const backupData = {
      exportedAt: new Date().toISOString(),
      count: unwantedUsers.length,
      users: unwantedUsers,
    };
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2), 'utf8');
    console.log(`📦 BACKUP CREATED: Saved ${unwantedUsers.length} user records to ${backupPath}`);

    if (unwantedUsers.length === 0) {
      console.log('✨ No unwanted users to delete.');
      process.exit(0);
    }

    // 3. Delete related fake data for these user IDs
    const delDelivery = await Delivery.deleteMany({
      $or: [
        { donorId: { $in: unwantedUserIds } },
        { recipientId: { $in: unwantedUserIds } },
        { volunteerId: { $in: unwantedUserIds } },
      ],
    });
    console.log(`Deleted ${delDelivery.deletedCount} related delivery records.`);

    const delNotif = await Notification.deleteMany({
      $or: [
        { userId: { $in: unwantedUserIds } },
      ],
    });
    console.log(`Deleted ${delNotif.deletedCount} related notification records.`);

    const delReview = await Review.deleteMany({
      $or: [
        { reviewer_id: { $in: unwantedUserIds } },
      ],
    });
    console.log(`Deleted ${delReview.deletedCount} related review records.`);

    const delDonation = await Donation.deleteMany({
      $or: [
        { donor_id: { $in: unwantedUserIds } },
        { ngo_id: { $in: unwantedUserIds } },
        { receiver_id: { $in: unwantedUserIds } },
        { volunteer_id: { $in: unwantedUserIds } },
      ],
    });
    console.log(`Deleted ${delDonation.deletedCount} related donation records.`);

    // 4. Delete the unwanted User records
    const delUser = await User.deleteMany({ _id: { $in: unwantedUserIds } });
    console.log(`✅ Deleted ${delUser.deletedCount} unwanted fake user records from MongoDB.`);

    // 5. Verify Protected Real Account
    const protectedUser = await User.findOne({
      email: { $regex: `^${protectedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
    });

    if (protectedUser) {
      console.log(`\n✅ PROTECTED ACCOUNT VERIFICATION:`);
      console.log(`   User: ${protectedUser.name}`);
      console.log(`   Email: ${protectedUser.email}`);
      console.log(`   Role: ${protectedUser.role}`);
      console.log(`   isAdmin: ${protectedUser.isAdmin}`);
      console.log(`   Status: Intact and active in MongoDB!`);
    } else {
      console.warn(`⚠️ WARNING: Protected account ${protectedEmail} not found in database.`);
    }

    const remainingUsers = await User.countDocuments();
    console.log(`\nRemaining Real Users in MongoDB: ${remainingUsers}`);
    console.log('Deleted Emails Summary:');
    unwantedEmails.forEach((e) => console.log(` - ${e}`));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during purge:', error);
    process.exit(1);
  }
}

runPurge();
