const router = require('express').Router();
const ThreadController = require('../controller/thread.controller');

router.post('/thread',ThreadController.createThread);
router.put('/thread', ThreadController.updateThread);
router.get('/thread', ThreadController.getThread);
router.delete('/thread', ThreadController.deleteThread);

module.exports = router;
