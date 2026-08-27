const API = 'http://localhost:5000/api';

async function testRoleAndAddressIsolation() {
  console.log('===================================================');
  console.log('🧪 TESTING 4 SEPARATE ROLE ACCOUNTS & ADDRESS ISOLATION');
  console.log('===================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(cond, msg) {
    if (cond) {
      console.log(`✅ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${msg}`);
      failed++;
    }
  }

  const timestamp = Date.now();
  const testAccounts = {
    donor: {
      name: 'Sangita Donor',
      email: `sangita.donor.${timestamp}@foodbridge.org`,
      password: 'password123',
      mobile: '9876543210',
      role: 'DONOR',
      address: 'Plot 12, Jubilee Hills, Hyderabad',
      city: 'Hyderabad',
      state: 'Telangana',
      pinCode: '500033',
      latitude: 17.4319,
      longitude: 78.4071,
      donorType: 'Restaurant',
    },
    ngo: {
      name: 'Helping Hands Officer',
      organizationName: 'Helping Hands Foundation NGO',
      email: `helpinghands.ngo.${timestamp}@foodbridge.org`,
      password: 'password123',
      mobile: '9123456789',
      role: 'NGO',
      address: 'Road No 10, Banjara Hills, Hyderabad',
      city: 'Hyderabad',
      state: 'Telangana',
      pinCode: '500034',
      latitude: 17.4156,
      longitude: 78.4487,
      registrationNo: 'NGO-HYD-2026-88',
    },
    volunteer: {
      name: 'Priya Volunteer',
      email: `priya.volunteer.${timestamp}@foodbridge.org`,
      password: 'password123',
      mobile: '9988776655',
      role: 'VOLUNTEER',
      address: 'Cyber Towers, Hitech City, Hyderabad',
      city: 'Hyderabad',
      state: 'Telangana',
      pinCode: '500081',
      latitude: 17.4435,
      longitude: 78.3772,
      vehicleType: 'Bike',
    },
    receiver: {
      name: 'Ravi Receiver',
      email: `ravi.receiver.${timestamp}@foodbridge.org`,
      password: 'password123',
      mobile: '9000112233',
      role: 'RECEIVER',
      address: 'Ameerpet Metro Station, Hyderabad',
      city: 'Hyderabad',
      state: 'Telangana',
      pinCode: '500016',
      latitude: 17.4375,
      longitude: 78.4482,
      householdSize: 4,
    },
  };

  const tokens = {};
  const userObjects = {};

  try {
    // 1. REGISTER ALL 4 ACCOUNTS
    console.log('--- 1. REGISTERING 4 DISTINCT ROLE ACCOUNTS ---');
    for (const key of ['donor', 'ngo', 'volunteer', 'receiver']) {
      const acc = testAccounts[key];
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(acc),
      });
      const data = await res.json();
      assert(data.success && data.token && data.user, `Registration successful for ${acc.role}: ${acc.email}`);
      assert(data.user.role === acc.role, `Account role matches ${acc.role}`);
      assert(data.user.address.includes(acc.city), `Account address matches saved MongoDB address`);

      tokens[key] = data.token;
      userObjects[key] = data.user;
    }

    // 2. VERIFY LOGIN & PROFILE ISOLATION
    console.log('\n--- 2. VERIFYING LOGIN & PROFILE ISOLATION ---');
    for (const key of ['donor', 'ngo', 'volunteer', 'receiver']) {
      const acc = testAccounts[key];
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: acc.email, password: acc.password }),
      });
      const data = await res.json();
      assert(data.success && data.user.email === acc.email, `Login returned correct profile for ${acc.email}`);
      assert(data.user.role === acc.role, `Login user role is permanently set to ${acc.role}`);
    }

    // 3. EDIT DONOR ADDRESS & VERIFY NO CROSS-CONTAMINATION
    console.log('\n--- 3. EDITING DONOR ADDRESS & VERIFYING ISOLATION ---');
    const updatedDonorAddr = 'Updated Donor Venue, Gachibowli, Hyderabad';
    const editRes = await fetch(`${API}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.donor}`,
      },
      body: JSON.stringify({
        address: updatedDonorAddr,
        latitude: 17.4401,
        longitude: 78.3489,
      }),
    });
    const editData = await editRes.json();
    assert(editData.success && editData.user.address === updatedDonorAddr, 'Donor address updated in MongoDB successfully');

    // Re-check NGO address to verify it was NOT modified
    const ngoCheckRes = await fetch(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${tokens.ngo}` },
    });
    const ngoCheckData = await ngoCheckRes.json();
    assert(ngoCheckData.user.address === testAccounts.ngo.address, 'NGO address remained unaffected by Donor address update');

    // 4. CREATE DONATION (USES DONOR'S REGISTERED ADDRESS)
    console.log('\n--- 4. POSTING DONATION (USES DONOR PICKUP ADDRESS) ---');
    const donRes = await fetch(`${API}/donations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.donor}`,
      },
      body: JSON.stringify({
        foodName: 'Special Veg Thali Meal',
        quantity: 25,
        unit: 'Packs',
        address: updatedDonorAddr,
        latitude: 17.4401,
        longitude: 78.3489,
        deliveryMode: 'VOLUNTEER_DELIVERY',
        intendedRecipient: 'NGO',
      }),
    });
    const donData = await donRes.json();
    assert(donData.success && donData.donationId, 'Food donation posted by Donor');
    const donationId = donData.donationId;

    // 5. NGO CLAIMS DONATION (USES NGO'S REGISTERED DESTINATION ADDRESS)
    console.log('\n--- 5. NGO CLAIMING DONATION (USES NGO DESTINATION ADDRESS) ---');
    const claimRes = await fetch(`${API}/donations/${donationId}/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.ngo}`,
      },
      body: JSON.stringify({
        collectionMethod: 'VOLUNTEER_DELIVERY',
      }),
    });
    const claimData = await claimRes.json();
    assert(claimData.success && claimData.donation.recipientAddress === testAccounts.ngo.address, 'Donation recipient address set to NGO registered address');

    // 6. VOLUNTEER ACCEPTS DELIVERY TASK
    console.log('\n--- 6. VOLUNTEER ACCEPTING DELIVERY TASK ---');
    const volRes = await fetch(`${API}/deliveries/${donationId}/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.volunteer}`,
      },
    });
    const volData = await volRes.json();
    assert(volData.success && volData.delivery, 'Volunteer accepted delivery task');
    assert(volData.delivery.pickupAddress === updatedDonorAddr, 'Delivery pickup address matches Donor pickup address');
    assert(volData.delivery.deliveryAddress === testAccounts.ngo.address, 'Delivery destination address matches NGO registered address');

    // 7. CONFIRM RECEIPT
    console.log('\n--- 7. NGO CONFIRMING FOOD RECEIPT ---');
    const confirmRes = await fetch(`${API}/deliveries/confirm-receipt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.ngo}`,
      },
      body: JSON.stringify({ donationId, rating: 5, reviewComment: 'Excellent food donation flow!' }),
    });
    const confirmData = await confirmRes.json();
    assert(confirmData.success && confirmData.donation.status === 'COMPLETED', 'Donation successfully marked as COMPLETED');

  } catch (err) {
    console.error('❌ Test error:', err);
    failed++;
  } finally {
    try {
      const mongoose = require('mongoose');
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sharebite');
      const User = require('./models/User');
      const Donation = require('./models/Donation');
      const Delivery = require('./models/Delivery');
      const testEmails = Object.values(testAccounts).map((acc) => acc.email);
      const testUsers = await User.find({ email: { $in: testEmails } });
      const testUserIds = testUsers.map((u) => u._id);
      await Delivery.deleteMany({ $or: [{ donorId: { $in: testUserIds } }, { recipientId: { $in: testUserIds } }, { volunteerId: { $in: testUserIds } }] });
      await Donation.deleteMany({ donor_id: { $in: testUserIds } });
      await User.deleteMany({ _id: { $in: testUserIds } });
      await mongoose.disconnect();
      console.log(`🧹 Cleaned up temporary test users: ${testEmails.join(', ')}`);
    } catch (cleanErr) {}
  }

  console.log('\n===================================================');
  console.log(`END-TO-END TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('===================================================\n');
}

testRoleAndAddressIsolation();
