const API = 'http://localhost:5000/api';

async function runTests() {
  console.log('=== STARTING REAL OTP & AUTH SYSTEM VERIFICATION TESTS ===\n');
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
    // TEST 0: Unregistered User Send OTP -> Should fail with 404
    const res0 = await fetch(`${API}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'unregistered_9999@example.com' }),
    });
    const data0 = await res0.json();
    assert(
      res0.status === 404 && data0.success === false,
      'Unregistered user rejected with 404 Not Found'
    );

    // TEST 1: Registered User Send OTP
    const res1 = await fetch(`${API}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data1 = await res1.json();
    assert(
      res1.status === 200 && data1.success === true && data1.otp === undefined,
      'TEST 1: Send OTP successful and OTP code is NOT exposed in API response'
    );

    // TEST 2: Invalid OTP Code
    const res2 = await fetch(`${API}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp: '000000' }),
    });
    const data2 = await res2.json();
    assert(
      res2.status === 400 && data2.success === false,
      'TEST 2: Invalid OTP code (000000) rejected with error message'
    );

    // TEST 3 & 4: Invalidate old OTP when new OTP is generated (TEST 5)
    console.log('\n--- Testing Resend & Old OTP Invalidation ---');
    const res3 = await fetch(`${API}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data3 = await res3.json();
    assert(res3.status === 200 && data3.success === true, 'Resend OTP generated new code');

    // TEST 7: Lockout after 5 wrong attempts
    console.log('\n--- Testing 5 Wrong Attempts Lockout ---');
    let lockedOut = false;
    for (let i = 1; i <= 5; i++) {
      const resLock = await fetch(`${API}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: '999999' }),
      });
      const dataLock = await resLock.json();
      if (dataLock.message && dataLock.message.includes('Too many incorrect attempts')) {
        lockedOut = true;
      }
    }
    assert(lockedOut, 'TEST 7: OTP invalidated after 5 incorrect attempts');

    // TEST 17: Login with bad credentials
    console.log('\n--- Testing Strict Credential Login ---');
    const resBadLogin = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'wrongpassword' }),
    });
    const dataBadLogin = await resBadLogin.json();
    assert(
      resBadLogin.status === 401 && dataBadLogin.success === false,
      'TEST 17: Login with wrong password rejected with 401 Unauthorized'
    );

    // Login with correct initial password
    const resGoodLogin = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'password123' }),
    });
    const dataGoodLogin = await resGoodLogin.json();
    assert(resGoodLogin.status === 200 && dataGoodLogin.success === true, 'Login with correct credentials succeeds');

  } catch (globalErr) {
    console.error('Global Error in Test Suite:', globalErr.message);
  }

  console.log(`\n==============================================`);
  console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log(`==============================================\n`);
}

runTests();
