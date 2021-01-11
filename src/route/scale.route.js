const express = require('express');
const router = express.Router();
const ScaleController = require('../controller/scale.controller');

router.post('/scale', ScaleController.createScale);
router.put('/scale', ScaleController.updateScale);
//router.get('/scale', ScaleController.getScale);
//router.delete('/scale', ScaleController.deleteController);

module.exports = router;