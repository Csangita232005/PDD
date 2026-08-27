const User = require('./models/User');

/**
 * Seed or verify the initial Administrator account and demo admin access in MongoDB.
 */
const seedAdminUser = async () => {
  try {
    const demoEmail = 'csangita0108@gmail.com'.toLowerCase().trim();
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@sharebite.org').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    // Grant isAdmin: true permission to csangita0108@gmail.com without altering role, password, or profiles
    let demoUser = await User.findOne({
      email: { $regex: new RegExp(`^${demoEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
    });

    if (demoUser) {
      if (!demoUser.isAdmin) {
        demoUser.isAdmin = true;
        await demoUser.save();
        console.log(`✅ [ADMIN DEMO SEED] Granted isAdmin: true to existing demo account: ${demoEmail}`);
      } else {
        console.log(`ℹ️  [ADMIN DEMO SEED] Demo account ${demoEmail} already has isAdmin: true`);
      }
    } else {
      console.warn(`⚠️ [ADMIN DEMO SEED NOTICE] Account ${demoEmail} not found in database.`);
    }

    let admin = await User.findOne({
      email: { $regex: new RegExp(`^${adminEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
    });

    if (!admin) {
      admin = await User.create({
        name: 'Administrator',
        email: adminEmail,
        password: adminPassword,
        mobile: '9000000000',
        role: 'ADMIN',
        isAdmin: true,
        setupCompleted: true,
        address: 'Headquarters, Chennai',
      });
      console.log(`✅ [ADMIN SEED] Initial Admin user seeded: ${adminEmail}`);
    } else {
      if (!admin.isAdmin || (admin.role || '').toUpperCase() !== 'ADMIN') {
        admin.isAdmin = true;
        admin.role = 'ADMIN';
        await admin.save();
        console.log(`ℹ️  [ADMIN SEED] Verified & granted ADMIN access to: ${adminEmail}`);
      } else {
        console.log(`ℹ️  [ADMIN SEED] Verified existing Admin account: ${adminEmail}`);
      }
    }
    return admin;
  } catch (err) {
    console.warn('⚠️ [ADMIN SEED NOTICE]:', err.message);
  }
};

module.exports = seedAdminUser;
