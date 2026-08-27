const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/.env' });

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sharebite';

async function repairAffectedRequests() {
  try {
    console.log('🔧 Connecting to MongoDB to repair self-collection requests...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB:', mongoUri);

    const Donation = require('./models/Donation');
    const Delivery = require('./models/Delivery');
    const Notification = require('./models/Notification');

    const selfModes = ['BENEFICIARY_SELF_PICKUP', 'SELF_COLLECTION', 'DONOR_DELIVERY', 'SELF_DELIVERY', 'RECEIVER_PICKUP'];

    const affectedDonations = await Donation.find({
      $or: [
        { collectionMethod: { $in: selfModes } },
        { deliveryPreference: { $in: selfModes } },
        { deliveryMode: { $in: selfModes } },
        { status: 'ACCEPTED_SELF_COLLECTION' },
      ],
    });

    console.log(`Found ${affectedDonations.length} self-collection / self-pickup donation records in MongoDB.`);

    for (const donation of affectedDonations) {
      console.log(`\nRepairing Donation ID: ${donation._id} ("${donation.food_name}")`);
      console.log(` Previous status: ${donation.status}, collectionMethod: ${donation.collectionMethod}, volunteer_id: ${donation.volunteer_id}`);

      donation.deliveryMode = 'SELF_COLLECTION';
      donation.deliveryPreference = 'SELF_COLLECTION';
      if (!donation.collectionMethod || donation.collectionMethod === 'VOLUNTEER_DELIVERY') {
        donation.collectionMethod = 'BENEFICIARY_SELF_PICKUP';
      }
      donation.volunteerRequired = false;
      donation.volunteerStatus = 'NOT_REQUIRED';
      donation.volunteer_id = null;
      donation.assignedVolunteer = null;
      if (['ACCEPTED', 'VOLUNTEER_ASSIGNED', 'PENDING', 'APPROVED'].includes(donation.status)) {
        donation.status = 'ACCEPTED_SELF_COLLECTION';
      }

      await donation.save();

      const deletedDeliveries = await Delivery.deleteMany({ donationId: donation._id });
      console.log(` Deleted ${deletedDeliveries.deletedCount} legacy volunteer delivery tasks for this donation.`);

      const deletedNotifs = await Notification.deleteMany({
        relatedDonationId: donation._id,
        type: { $in: ['VOLUNTEER_ASSIGNED', 'delivery:new_available'] },
      });
      console.log(` Deleted ${deletedNotifs.deletedCount} legacy volunteer notifications for this donation.`);

      console.log(` ✅ Donation ${donation._id} successfully repaired to ACCEPTED_SELF_COLLECTION (Volunteer Required: false).`);
    }

    console.log('\n✅ All affected requests repaired successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during repair:', error);
    process.exit(1);
  }
}

repairAffectedRequests();
