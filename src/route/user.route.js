const express = require('express');
const router = express.Router();
const UserController = require('../controller/user.controller');

router.post('/user', UserController.createUser);
router.put('/user', UserController.updateUser);
router.get('/user/:userId', UserController.getUser);
//router.delete('/user', UserController.deleteUser);

module.exports = router;