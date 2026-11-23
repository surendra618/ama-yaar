const mongoose = require('mongoose');
const env = require('../src/config/env');
const authService = require('../src/modules/auth/auth.service');

async function testAuth() {
  await mongoose.connect(env.mongoUri);
  console.log('Connected to DB!');

  console.log('1. Testing sendOtp with email...');
  const sendRes = await authService.sendOtp({ email: 'test_verify_user@example.com' });
  console.log('sendOtp response:', sendRes);

  console.log('2. Testing verifyOtp with email & OTP...');
  const verifyRes = await authService.verifyOtp({
    email: 'test_verify_user@example.com',
    otp: sendRes.otp,
    name: 'Test Verify User',
    password: 'password123'
  });
  console.log('verifyOtp success! User ID:', verifyRes.user._id, 'Token:', verifyRes.accessToken.slice(0, 20) + '...');

  console.log('3. Testing googleLogin...');
  const googleRes = await authService.googleLogin({
    email: 'test_google_user@gmail.com',
    name: 'Test Google User',
    avatar: 'https://example.com/avatar.png',
    googleId: 'google_uid_12345'
  });
  console.log('googleLogin success! User ID:', googleRes.user._id, 'Name:', googleRes.user.name);

  console.log('4. Testing saveFcmToken...');
  const fcmRes = await authService.saveFcmToken(googleRes.user._id, { token: 'sample_fcm_token_123456789' });
  console.log('saveFcmToken response:', fcmRes);

  // Clean up test users from DB
  await mongoose.connection.collection('users').deleteMany({
    email: { $in: ['test_verify_user@example.com', 'test_google_user@gmail.com'] }
  });
  console.log('Cleaned up test users successfully.');

  await mongoose.disconnect();
  console.log('ALL BACKEND AUTH TESTS PASSED!');
}

testAuth().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
