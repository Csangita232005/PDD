const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/.env' });

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sharebite';

async function migrateRoleProfiles() {
  try {
    console.log('🔍 Connecting to MongoDB to migrate role profiles for existing user accounts...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB:', mongoUri);

    const User = require('./models/User');

    const users = await User.find({});
    console.log(`Inspecting ${users.length} user accounts in MongoDB...`);

    for (const user of users) {
      if (!user.roleProfiles) {
        user.roleProfiles = { donor: {}, ngo: {}, beneficiary: {}, volunteer: {} };
      }

      let updated = false;

      // Donor profile check
      const hasDonorData = Boolean(
        user.roleProfiles.donor?.address?.formattedAddress ||
        user.donorAddress ||
        user.role === 'DONOR'
      );
      if (hasDonorData && !user.roleProfiles.donor?.isRegistered) {
        user.roleProfiles.donor.isRegistered = true;
        if (!user.roleProfiles.donor.completedAt) user.roleProfiles.donor.completedAt = new Date();
        updated = true;
      }

      // NGO profile check
      const hasNgoData = Boolean(
        user.roleProfiles.ngo?.address?.formattedAddress ||
        user.ngoAddress ||
        user.organizationName ||
        user.role === 'NGO'
      );
      if (hasNgoData && !user.roleProfiles.ngo?.isRegistered) {
        user.roleProfiles.ngo.isRegistered = true;
        if (!user.roleProfiles.ngo.completedAt) user.roleProfiles.ngo.completedAt = new Date();
        updated = true;
      }

      // Volunteer profile check
      const hasVolData = Boolean(
        user.roleProfiles.volunteer?.address?.formattedAddress ||
        user.volunteerAddress ||
        user.vehicleType ||
        user.role === 'VOLUNTEER'
      );
      if (hasVolData && !user.roleProfiles.volunteer?.isRegistered) {
        user.roleProfiles.volunteer.isRegistered = true;
        if (!user.roleProfiles.volunteer.completedAt) user.roleProfiles.volunteer.completedAt = new Date();
        updated = true;
      }

      // Beneficiary / Receiver profile check
      const hasRecData = Boolean(
        user.roleProfiles.beneficiary?.address?.formattedAddress ||
        user.receiverAddress ||
        user.receiverType ||
        user.role === 'RECEIVER'
      );
      if (hasRecData && !user.roleProfiles.beneficiary?.isRegistered) {
        user.roleProfiles.beneficiary.isRegistered = true;
        if (!user.roleProfiles.beneficiary.completedAt) user.roleProfiles.beneficiary.completedAt = new Date();
        updated = true;
      }

      if (updated) {
        user.markModified('roleProfiles');
        await user.save();
        console.log(`✅ Migrated role profiles for user: ${user.email}`);
        console.log(`   Registered Roles: Donor=${user.roleProfiles.donor?.isRegistered}, NGO=${user.roleProfiles.ngo?.isRegistered}, Vol=${user.roleProfiles.volunteer?.isRegistered}, Rec=${user.roleProfiles.beneficiary?.isRegistered}`);
      }
    }

    console.log('\n✅ Role profiles migration finished successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during role profiles migration:', error);
    process.exit(1);
  }
}

migrateRoleProfiles();
