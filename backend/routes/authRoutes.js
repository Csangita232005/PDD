const express = require('express');
const router = express.Router();
const { register, login, adminLogin, getMe, resetPasswordDirect } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/admin-login', adminLogin);
router.get('/me', getMe);
router.post('/forgot-password', resetPasswordDirect);
router.post('/reset-password-direct', resetPasswordDirect);
router.post('/reset-password', resetPasswordDirect);

module.exports = router;
