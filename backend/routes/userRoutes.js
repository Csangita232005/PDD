const express = require('express');
const router = express.Router();
const { setupRole, updateProfile, getAdminUsers } = require('../controllers/userController');

router.post('/setup-role', setupRole);
router.put('/profile', updateProfile);
router.get('/admin/users', getAdminUsers);

module.exports = router;
