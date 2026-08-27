const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/foodbridge';

async function runClean() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB at:', mongoUri);

    const db = mongoose.connection.db;
    
    await db.collection('donations').deleteMany({});
    await db.collection('deliveries').deleteMany({});
    await db.collection('notifications').deleteMany({});
    await db.collection('reviews').deleteMany({});
    await db.collection('users').deleteMany({});

    console.log('Successfully purged all fake/random collections!');

    const usersCol = db.collection('users');
    await usersCol.insertMany([
      {
        name: 'Secondary Admin',
        email: 'admin2@sharebite.org',
        password: 'password123',
        mobile: '9000000001',
        role: 'ADMIN',
        setupCompleted: true,
        address: 'Admin Headquarters, Hyderabad',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'System Admin',
        email: 'admin@sharebite.org',
        password: 'password123',
        mobile: '9000000000',
        role: 'ADMIN',
        setupCompleted: true,
        address: 'Headquarters, Hyderabad',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Demo Donor',
        email: 'donor@sharebite.org',
        password: 'password123',
        mobile: '9876543210',
        role: 'DONOR',
        setupCompleted: true,
        address: 'Banjara Hills, Hyderabad',
        donorAddress: 'Banjara Hills, Hyderabad',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Demo NGO Foundation',
        email: 'ngo@sharebite.org',
        password: 'password123',
        mobile: '9123456789',
        role: 'NGO',
        setupCompleted: true,
        address: 'Jubilee Hills, Hyderabad',
        ngoAddress: 'Jubilee Hills, Hyderabad',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Demo Receiver Family',
        email: 'receiver@sharebite.org',
        password: 'password123',
        mobile: '9988776655',
        role: 'RECEIVER',
        setupCompleted: true,
        address: 'Ameerpet, Hyderabad',
        receiverAddress: 'Ameerpet, Hyderabad',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Demo Volunteer Hero',
        email: 'volunteer@sharebite.org',
        password: 'password123',
        mobile: '9849012345',
        role: 'VOLUNTEER',
        setupCompleted: true,
        address: 'Madhapur, Hyderabad',
        volunteerAddress: 'Madhapur, Hyderabad',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    console.log('Clean core user accounts seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Clean DB Error:', err.message);
    process.exit(1);
  }
}

runClean();
