const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');

router.get('/available', deliveryController.getAvailableDeliveries);
router.post('/:id/accept', deliveryController.acceptDeliveryTask);
router.post('/:id/start-pickup', deliveryController.startPickup);
router.post('/:id/pickup-proof', deliveryController.uploadPickupProof);
router.post('/:id/start-delivery', deliveryController.startDelivery);
router.post('/:id/delivery-proof', deliveryController.uploadDeliveryProof);
router.post('/:id/location', deliveryController.updateVolunteerLocation);
router.post('/confirm-receipt', deliveryController.confirmReceipt);

module.exports = router;
