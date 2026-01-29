const express = require('express');
const router = express.Router();
const tweetController = require('../controllers/tweetController');
const auth = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', tweetController.getTweets);
router.post('/', auth, upload.single('image'), tweetController.createTweet);
router.post('/:id/like', auth, tweetController.toggleLike);
router.post('/:id/comment', auth, tweetController.addComment);
router.post('/:tweetId/comments/:commentId/like', auth, tweetController.toggleCommentLike);

module.exports = router;
