const express = require('express');
const router = express.Router();
const MeasurementController =require('../controllers/measurement.controller');

router.post('/measurement',MeasurementController.createMeasurement);
router.get('/measurement', MeasurementController.getMeasurement);
router.delete('/measurement', MeasurementController.deleteMeasurement);

module.exports = router;