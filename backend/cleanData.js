const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');

async function inspectAndNormalizeUsers() {
  try {
    console.log('🔍 Connecting to MongoDB to inspect user database records...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sharebite');
    console.log('✅ Connected to MongoDB database:', process.env.MONGODB_URI || 'sharebite');

    const users = await User.find({});
    console.log(`Found ${users.length} total user records in MongoDB.`);

    let updatedUsers = 0;
    for (const u of users) {
      if (u.role && u.role !== u.role.toUpperCase()) {
        u.role = u.role.toUpperCase();
        await u.save();
        updatedUsers++;
      }
    }
    console.log(`Normalized ${updatedUsers} user roles to standard uppercase format without deleting any records.`);
    process.exit(0);
  } catch (err) {
    console.error('Inspection error:', err.message);
    process.exit(1);
  }
}

inspectAndNormalizeUsers();
