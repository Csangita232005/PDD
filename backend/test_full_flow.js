const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const API = 'http://localhost:5000/api';

async function runFullE2ETests() {
  console.log('=== STARTING SIMPLIFIED AUTH & DIRECT PASSWORD RESET TESTS ===\n');
  let passed = 0;
  let failed = 0;

  const email = 'donor@sharebite.org';

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sharebite');

    // TEST 1: Direct Password Reset with Non-Existent Email (Should Fail)
    console.log('--- Testing Non-Existent Email ---');
    const resBadEmail = await fetch(`${API}/auth/reset-password-direct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent999@sharebite.org', newPassword: 'newPassword123' }),
    });
    const dataBadEmail = await resBadEmail.json();
    assert(resBadEmail.status === 404 && dataBadEmail.success === false, 'Non-existent email password reset rejected with 404');

    // TEST 2: Direct Password Reset with Valid Registered Email
    console.log('\n--- Testing Direct Password Reset ---');
    const newPassword = 'newPassword@2026';
    const resReset = await fetch(`${API}/auth/reset-password-direct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, newPassword }),
    });
    const dataReset = await resReset.json();
    assert(resReset.status === 200 && dataReset.success === true, 'Direct password reset for registered email succeeded');

    // TEST 3: Login with Old Password Fails
    const resOldLogin = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'password123' }),
    });
    assert(resOldLogin.status === 401, 'Old password fails after reset');

    // TEST 4: Login with New Password Succeeds
    const resNewLogin = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: newPassword }),
    });
    const dataNewLogin = await resNewLogin.json();
    assert(resNewLogin.status === 200 && dataNewLogin.success === true && dataNewLogin.user.role === 'DONOR', 'Login with new password succeeds & role detected as DONOR!');

    // Restore default password for demo convenience
    await fetch(`${API}/auth/reset-password-direct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, newPassword: 'password123' }),
    });

    // TEST 5: Create Account Flow with Single Role Selection
    console.log('\n--- Testing New User Registration Flow ---');
    const regEmail = `newuser_${Date.now()}@sharebite.org`;
    const resReg = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'New Registered Receiver',
        email: regEmail,
        password: 'password123',
        mobile: '9876543210',
        role: 'RECEIVER',
      }),
    });
    const dataReg = await resReg.json();
    assert(resReg.status === 201 && dataReg.success === true && dataReg.user.role === 'RECEIVER', 'User registered with single role selection (RECEIVER) & token issued');

    await User.deleteMany({ email: regEmail });
    console.log(`🧹 Cleaned up temporary test user: ${regEmail}`);
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error during E2E test:', err);
  }

  console.log(`\n==============================================`);
  console.log(`E2E TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log(`==============================================\n`);
}

runFullE2ETests();
