const router = require('express').Router();
const AuthController = require('../controller/auth.controller');

router.get('/authGoogle', AuthController.authGoogle);
router.post('/refreshToken',AuthController.refresh);

module.exports = router;
