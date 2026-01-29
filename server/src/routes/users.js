const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

router.get('/search', auth, userController.searchUsers);
router.get('/:username', userController.getUserProfile);
router.put('/privacy', auth, userController.updatePrivacy);
router.put('/:id/follow', auth, userController.followUser);
router.put('/:id/unfollow', auth, userController.unfollowUser);
router.get('/requests/pending', auth, userController.getPendingRequests);
router.put('/requests/:id/accept', auth, userController.acceptFollowRequest);
router.put('/requests/:id/reject', auth, userController.rejectFollowRequest);

module.exports = router;
