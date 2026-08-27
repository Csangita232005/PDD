const API = 'http://localhost:5000/api';

async function testSingleAccountMultiRoleAddresses() {
  console.log('===================================================');
  console.log('🧪 TESTING SINGLE ACCOUNT MULTI-ROLE ADDRESS ISOLATION');
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
  const testEmail = `single.account.${timestamp}@foodbridge.org`;
  const password = 'password123';

  try {
    // 1. REGISTER SINGLE ACCOUNT
    console.log('--- 1. REGISTER SINGLE ACCOUNT ---');
    const regRes = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Sangita MultiRole',
        email: testEmail,
        password,
        mobile: '9493356712',
      }),
    });
    const regData = await regRes.json();
    assert(regData.success && regData.token, `Registered single account: ${testEmail}`);
    const token = regData.token;

    // 2. SETUP DONOR ADDRESS -> CHENNAI
    console.log('\n--- 2. SETUP DONOR ADDRESS -> CHENNAI ---');
    const donorRes = await fetch(`${API}/users/setup-role`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        role: 'DONOR',
        address: 'Jubilee Road, Chennai',
        city: 'Chennai',
        state: 'Tamil Nadu',
        latitude: 13.0827,
        longitude: 80.2707,
      }),
    });
    const donorData = await donorRes.json();
    console.log('donorData response:', JSON.stringify(donorData, null, 2));
    assert(donorData.success, 'Donor setup completed with Chennai address');
    assert(
      donorData.user.roleProfiles.donor.address.formattedAddress.includes('Chennai'),
      'Donor roleProfile address saved as Chennai'
    );

    // 3. SETUP NGO ADDRESS -> HYDERABAD
    console.log('\n--- 3. SETUP NGO ADDRESS -> HYDERABAD ---');
    const ngoRes = await fetch(`${API}/users/setup-role`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        role: 'NGO',
        ngoName: 'Helping Hands Foundation',
        address: 'Banjara Hills, Hyderabad',
        city: 'Hyderabad',
        state: 'Telangana',
        latitude: 17.3850,
        longitude: 78.4867,
      }),
    });
    const ngoData = await ngoRes.json();
    assert(ngoData.success, 'NGO setup completed with Hyderabad address');
    assert(
      ngoData.user.roleProfiles.ngo.address.formattedAddress.includes('Hyderabad'),
      'NGO roleProfile address saved as Hyderabad'
    );

    // 4. SETUP VOLUNTEER ADDRESS -> BENGALURU
    console.log('\n--- 4. SETUP VOLUNTEER ADDRESS -> BENGALURU ---');
    const volRes = await fetch(`${API}/users/setup-role`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        role: 'VOLUNTEER',
        preferredZone: 'MG Road, Bengaluru',
        address: 'MG Road, Bengaluru',
        city: 'Bengaluru',
        state: 'Karnataka',
        latitude: 12.9716,
        longitude: 77.5946,
      }),
    });
    const volData = await volRes.json();
    assert(volData.success, 'Volunteer setup completed with Bengaluru address');
    assert(
      volData.user.roleProfiles.volunteer.address.formattedAddress.includes('Bengaluru'),
      'Volunteer roleProfile address saved as Bengaluru'
    );

    // 5. SETUP BENEFICIARY (RECEIVER) ADDRESS -> VIJAYAWADA
    console.log('\n--- 5. SETUP BENEFICIARY ADDRESS -> VIJAYAWADA ---');
    const recRes = await fetch(`${API}/users/setup-role`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        role: 'RECEIVER',
        receiverType: 'Individual',
        address: 'Benz Circle, Vijayawada',
        city: 'Vijayawada',
        state: 'Andhra Pradesh',
        latitude: 16.5062,
        longitude: 80.6480,
      }),
    });
    const recData = await recRes.json();
    assert(recData.success, 'Beneficiary setup completed with Vijayawada address');
    assert(
      recData.user.roleProfiles.beneficiary.address.formattedAddress.includes('Vijayawada'),
      'Beneficiary roleProfile address saved as Vijayawada'
    );

    // 6. EDIT DONOR ADDRESS -> COIMBATORE
    console.log('\n--- 6. EDIT DONOR ADDRESS -> COIMBATORE ---');
    const editRes = await fetch(`${API}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        role: 'DONOR',
        address: 'Gandhipuram, Coimbatore',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        latitude: 11.0168,
        longitude: 76.9558,
      }),
    });
    const editData = await editRes.json();
    assert(editData.success, 'Edited Donor address to Coimbatore');

    // 7. VERIFY ALL 4 ROLE ADDRESSES REMAIN ISOLATED IN THE USER PROFILE
    console.log('\n--- 7. VERIFY ALL 4 ROLE ADDRESSES IN SINGLE USER ACCOUNT ---');
    const meRes = await fetch(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const meData = await meRes.json();
    const userProfiles = meData.user.roleProfiles;

    console.log('Role Addresses in Account:');
    console.log('  Donor:', userProfiles.donor.address.formattedAddress);
    console.log('  NGO:', userProfiles.ngo.address.formattedAddress);
    console.log('  Volunteer:', userProfiles.volunteer.address.formattedAddress);
    console.log('  Beneficiary:', userProfiles.beneficiary.address.formattedAddress);

    assert(
      userProfiles.donor.address.formattedAddress.includes('Coimbatore'),
      'Donor address updated to Coimbatore'
    );
    assert(
      userProfiles.ngo.address.formattedAddress.includes('Hyderabad'),
      'NGO address unchanged (still Hyderabad)'
    );
    assert(
      userProfiles.volunteer.address.formattedAddress.includes('Bengaluru'),
      'Volunteer address unchanged (still Bengaluru)'
    );
    assert(
      userProfiles.beneficiary.address.formattedAddress.includes('Vijayawada'),
      'Beneficiary address unchanged (still Vijayawada)'
    );

  } catch (err) {
    console.error('❌ Test error:', err);
    failed++;
  } finally {
    try {
      const mongoose = require('mongoose');
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sharebite');
      const User = require('./models/User');
      await User.deleteMany({ email: testEmail });
      await mongoose.disconnect();
      console.log(`🧹 Cleaned up temporary test user: ${testEmail}`);
    } catch (cleanErr) {}
  }

  console.log('\n===================================================');
  console.log(`MULTI-ROLE ADDRESS TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('===================================================\n');
}

testSingleAccountMultiRoleAddresses();
