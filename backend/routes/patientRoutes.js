const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const auth = require('../middleware/authMiddleware');

router.use(auth.protect);

router.route('/')
    .get(patientController.getAllPatients)
    .post(patientController.createPatient);

router.route('/:id')
    .get(patientController.getPatientById)
    .patch(patientController.updatePatient)
    .delete(auth.restrictTo('admin', 'doctor'), patientController.deletePatient);

module.exports = router;
