const router = require('express').Router();
const FriendshipController = require('../controller/friendship.controller');

router.post('/friendship',FriendshipController.createFriendship);
router.delete('/friendship',FriendshipController.deleteFriendship);

module.exports = router;
