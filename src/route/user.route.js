const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');

router.post('/user', UserController.createUser);
router.put('/user', UserController.updateUser);
//router.get('/user', UserController.getUser);
//router.delete('/user', UserController.deleteUser);

module.exports = router;