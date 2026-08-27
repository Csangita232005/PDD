const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');

router.post('/', donationController.createDonation);
router.get('/', donationController.getDonations);
router.get('/nearby', donationController.getNearbyDonations);
router.get('/stats/personal', donationController.getPersonalStats);
router.get('/stats/platform', donationController.getPlatformStats);
router.get('/:id', donationController.getDonationById);
router.post('/:id/request', donationController.requestDonation);
router.post('/:id/approve', donationController.approveRequest);
router.post('/:id/claim', donationController.claimDonation);
router.post('/:id/accept', donationController.claimDonation);

module.exports = router;
