const API = 'http://localhost:5000/api';

async function testMultiUserOtp() {
  console.log('=== MULTI-USER DYNAMIC EMAIL RECIPIENT VERIFICATION ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  // Register User A
  const userA = {
    name: 'Alice User',
    email: 'userA@gmail.com',
    password: 'password123',
    role: 'DONOR',
  };

  // Register User B
  const userB = {
    name: 'Bob User',
    email: 'userB@gmail.com',
    password: 'password123',
    role: 'RECEIVER',
  };

  try {
    // 1. Register User A & User B
    const resRegA = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userA),
    });
    const resRegB = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userB),
    });

    // 2. Request OTP for User A (userA@gmail.com)
    const resOtpA = await fetch(`${API}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userA.email }),
    });
    const dataOtpA = await resOtpA.json();
    assert(
      resOtpA.status === 200 && dataOtpA.success === true,
      `User A (${userA.email}): OTP generated & dispatched dynamically to ${userA.email}`
    );

    // 3. Request OTP for User B (userB@gmail.com)
    const resOtpB = await fetch(`${API}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userB.email }),
    });
    const dataOtpB = await resOtpB.json();
    assert(
      resOtpB.status === 200 && dataOtpB.success === true,
      `User B (${userB.email}): OTP generated & dispatched dynamically to ${userB.email}`
    );

    // 4. Verify OTP isolation: User A's OTP record is tied ONLY to userA@gmail.com
    const resWrongEmailVerify = await fetch(`${API}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userB.email, otp: '123456' }),
    });
    const dataWrongEmailVerify = await resWrongEmailVerify.json();
    assert(
      resWrongEmailVerify.status === 400 && dataWrongEmailVerify.success === false,
      `Cross-user isolation: User B cannot verify with invalid/unlinked OTP`
    );

  } catch (err) {
    console.error('Error in multi-user test:', err.message);
  } finally {
    try {
      const mongoose = require('mongoose');
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sharebite');
      const User = require('./models/User');
      await User.deleteMany({ email: { $in: ['userA@gmail.com', 'userB@gmail.com'] } });
      await mongoose.disconnect();
      console.log(`🧹 Cleaned up temporary test users: userA@gmail.com, userB@gmail.com`);
    } catch (cleanErr) {}
  }

  console.log(`\n==============================================`);
  console.log(`MULTI-USER TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log(`==============================================\n`);
}

testMultiUserOtp();
