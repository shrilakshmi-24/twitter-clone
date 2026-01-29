const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

router.get('/:username', userController.getUserProfile);
router.put('/:id/follow', auth, userController.followUser);
router.put('/:id/unfollow', auth, userController.unfollowUser);

module.exports = router;
