const express = require('express');
const router = express.Router();
const ContainerController = require('../controller/container.controller');

router.post('/container',ContainerController.createContainer);
// router.get('/container', ContainerController.getContainer);
// router.put('/container', ContainerController.updateContainer)

module.exports = router;