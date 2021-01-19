const express = require('express');
const router = express.Router();
const MeasurementController =require('../controller/measurement.controller');

router.post('/measurement',MeasurementController.createMeasurement);

module.exports = router;