const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Donation = require('./models/Donation');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sharebite');
    console.log('Connected to MongoDB for seeding...');

    await User.deleteMany();
    await Donation.deleteMany();

    const donorUser = await User.create({
      name: 'Demo Donor',
      email: 'donor@sharebite.org',
      password: 'password123',
      mobile: '9876543210',
      role: 'DONOR',
      setupCompleted: true,
      address: 'Banjara Hills, Hyderabad',
      donorAddress: 'Banjara Hills, Hyderabad',
    });

    const ngoUser = await User.create({
      name: 'Demo NGO Foundation',
      email: 'ngo@sharebite.org',
      password: 'password123',
      mobile: '9123456789',
      role: 'NGO',
      setupCompleted: true,
      address: 'Jubilee Hills, Hyderabad',
      ngoAddress: 'Jubilee Hills, Hyderabad',
    });

    const receiverUser = await User.create({
      name: 'Demo Receiver Family',
      email: 'receiver@sharebite.org',
      password: 'password123',
      mobile: '9988776655',
      role: 'RECEIVER',
      setupCompleted: true,
      address: 'Ameerpet, Hyderabad',
      receiverAddress: 'Ameerpet, Hyderabad',
    });

    const volunteerUser = await User.create({
      name: 'Demo Volunteer Hero',
      email: 'volunteer@sharebite.org',
      password: 'password123',
      mobile: '9849012345',
      role: 'VOLUNTEER',
      setupCompleted: true,
      address: 'Madhapur, Hyderabad',
      volunteerAddress: 'Madhapur, Hyderabad',
    });

    const adminUser = await User.create({
      name: 'Administrator',
      email: 'admin@sharebite.org',
      password: 'password123',
      mobile: '9000000000',
      role: 'ADMIN',
      setupCompleted: true,
      address: 'Headquarters, Hyderabad',
    });

    await Donation.create([
      {
        donor: donorUser.name,
        donor_id: donorUser._id,
        donor_name: donorUser.name,
        donor_phone: donorUser.mobile,
        food_name: 'Veg Biryani & Curry Packs',
        category: 'Cooked Meals',
        quantity: 25,
        unit: 'Packs',
        address: 'Banjara Hills, Hyderabad',
        intendedRecipient: 'NGO',
        deliveryPreference: 'VOLUNTEER_DELIVERY',
        status: 'PENDING',
      },
      {
        donor: donorUser.name,
        donor_id: donorUser._id,
        donor_name: donorUser.name,
        donor_phone: donorUser.mobile,
        food_name: 'Fresh Chapati & Paneer Dal',
        category: 'Cooked Meals',
        quantity: 15,
        unit: 'Packs',
        address: 'Hitech City, Hyderabad',
        intendedRecipient: 'RECEIVER',
        deliveryPreference: 'VOLUNTEER_DELIVERY',
        status: 'PENDING',
      },
      {
        donor: donorUser.name,
        donor_id: donorUser._id,
        donor_name: donorUser.name,
        donor_phone: donorUser.mobile,
        food_name: 'Mixed Fruit & Bread Baskets',
        category: 'Raw Groceries',
        quantity: 10,
        unit: 'Kg',
        address: 'Gachibowli, Hyderabad',
        intendedRecipient: 'ALL',
        deliveryPreference: 'SELF_DELIVERY',
        status: 'PENDING',
      },
    ]);

    console.log('Database seeded successfully with all 4 User Roles & sample Donations!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
};

seedData();
