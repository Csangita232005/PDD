const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/stats', adminController.getAdminDashboardStats);
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/toggle-status', adminController.toggleUserStatus);
router.put('/donations/:id/cancel-flag', adminController.cancelFlagDonation);
router.get('/audit-trail', adminController.getAuditTrail);
router.get('/deliveries', adminController.getActiveDeliveries);
router.get('/monthly-analytics', adminController.getMonthlyAnalytics);
router.get('/reports', adminController.getReports);

module.exports = router;
