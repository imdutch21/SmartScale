const router = require('express').Router();
const UserController = require('../controller/user.controller');

router.post('/user',UserController.createUser);
router.put('/user', UserController.changePassword);
router.delete('/user', UserController.deleteUser);

module.exports = router;
