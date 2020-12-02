const router = require('express').Router();
const CommentController = require('../controller/comment.controller');

router.post('/comment',CommentController.addComment);
router.put('/comment', CommentController.updateComment);
router.delete('/comment', CommentController.deleteComment);
module.exports = router;
