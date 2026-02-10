const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

// No auth protection here!
router.get('/availability', publicController.getAvailability);
router.post('/lead', publicController.createLead);
router.post('/book', publicController.publicBooking);
router.post('/survey', publicController.processSurvey);

module.exports = router;
