const router = require('express').Router();
const VoiceController = require('../controller/voice.controller');

router.post('/voice/googleAsssistent',VoiceController.googleAsssistent);

module.exports = router;
