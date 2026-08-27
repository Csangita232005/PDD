// migrate_admin_access.js - Sets isAdmin=true, adminAccess=true for csangita0108@gmail.com
const mongoose = require('mongoose');

async function migrateAdminAccess() {
  await mongoose.connect('mongodb://127.0.0.1:27017/sharebite');
  console.log('✅ Connected to MongoDB: sharebite');

  const User = require('./models/User');

  const result = await User.updateMany(
    {
      $or: [
        { email: 'csangita0108@gmail.com' },
        { isAdmin: true },
      ],
    },
    {
      $set: {
        isAdmin: true,
        adminAccess: true,
      },
    }
  );

  console.log(`✅ Updated ${result.modifiedCount} user(s) — isAdmin: true, adminAccess: true`);

  const user = await User.findOne({ email: 'csangita0108@gmail.com' });
  if (user) {
    console.log(`\n✅ Confirmed user: ${user.name} <${user.email}>`);
    console.log(`   isAdmin: ${user.isAdmin}`);
    console.log(`   adminAccess: ${user.adminAccess}`);
    console.log(`   role: ${user.role}`);
  }

  await mongoose.disconnect();
  console.log('\n✅ Migration complete. Admin access permanently granted to csangita0108@gmail.com');
  process.exit(0);
}

migrateAdminAccess().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
