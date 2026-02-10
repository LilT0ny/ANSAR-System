const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/authMiddleware');

router.use(auth.protect);

router.get('/dashboard', analyticsController.getDashboardStats);
router.get('/trends', analyticsController.getTreatmentTrends);

module.exports = router;
