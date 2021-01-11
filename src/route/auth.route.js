const router = require('express').Router();
const AuthController = require('../controller/auth.controller');

router.get('/authGoogle', AuthController.authGoogle);
router.post('/refreshToken',AuthController.refreshToken);

module.exports = router;
