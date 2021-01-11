const express = require('express');
const router = express.Router();
const ContainerController =require('../controllers/container.controller');

router.post('/container',ContainerController.createContainer);
router.get('/container', ContainerController.getContainer);
router.delete('/container', ContainerController.deleteContainer);
router.put

module.exports = router;