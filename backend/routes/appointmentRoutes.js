const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const auth = require('../middleware/authMiddleware');

router.use(auth.protect);

router.route('/')
    .get(appointmentController.getAppointments)
    .post(appointmentController.createAppointment);

router.route('/:id/status')
    .patch(appointmentController.updateAppointmentStatus);

// Add delete route if needed, for now focusing on status updates

module.exports = router;
