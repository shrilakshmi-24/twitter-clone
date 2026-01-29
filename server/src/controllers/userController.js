const User = require('../models/User');

exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username })
            .select('-password')
            .populate('followers', 'username avatar')
            .populate('following', 'username avatar');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.followUser = async (req, res) => {
    try {
        const userToFollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user.id);

        if (!userToFollow) return res.status(404).json({ error: 'User not found' });

        if (req.user.id === req.params.id) {
            return res.status(400).json({ error: 'You cannot follow yourself' });
        }

        // Check if already following
        if (userToFollow.followers.includes(req.user.id)) {
            return res.status(400).json({ error: 'You are already following this user' });
        }

        // Check if request already sent
        if (userToFollow.followRequests.includes(req.user.id)) {
            return res.status(400).json({ error: 'Follow request already sent' });
        }

        if (userToFollow.isPrivate) {
            userToFollow.followRequests.push(req.user.id);
            await userToFollow.save();
            return res.json({ message: 'Follow request sent', status: 'requested' });
        } else {
            userToFollow.followers.push(req.user.id);
            currentUser.following.push(req.params.id);
            await userToFollow.save();
            await currentUser.save();
            return res.json(currentUser.following);
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.acceptFollowRequest = async (req, res) => {
    try {
        const userIdToAccept = req.params.id;
        const currentUser = await User.findById(req.user.id);
        const userToAccept = await User.findById(userIdToAccept);

        if (!currentUser.followRequests.includes(userIdToAccept)) {
            return res.status(400).json({ error: 'No follow request found' });
        }

        // Remove from requests
        currentUser.followRequests = currentUser.followRequests.filter(id => id.toString() !== userIdToAccept);

        // Add to followers
        currentUser.followers.push(userIdToAccept);
        await currentUser.save();

        // Add to user's following
        if (userToAccept) {
            userToAccept.following.push(currentUser._id);
            await userToAccept.save();
        }

        res.json(currentUser.followRequests);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.rejectFollowRequest = async (req, res) => {
    try {
        const userIdToReject = req.params.id;
        const currentUser = await User.findById(req.user.id);

        if (!currentUser.followRequests.includes(userIdToReject)) {
            return res.status(400).json({ error: 'No follow request found' });
        }

        currentUser.followRequests = currentUser.followRequests.filter(id => id.toString() !== userIdToReject);
        await currentUser.save();

        res.json(currentUser.followRequests);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updatePrivacy = async (req, res) => {
    try {
        const { isPrivate } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { isPrivate },
            { new: true }
        ).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPendingRequests = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id).populate('followRequests', 'username avatar');
        res.json(currentUser.followRequests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.unfollowUser = async (req, res) => {
    try {
        const userToUnfollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user.id);

        if (!userToUnfollow) return res.status(404).json({ error: 'User not found' });

        if (userToUnfollow.followers.includes(req.user.id)) {
            userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== req.user.id);
            currentUser.following = currentUser.following.filter(id => id.toString() !== req.params.id);
            await userToUnfollow.save();
            await currentUser.save();
        }

        res.json(currentUser.following);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.searchUsers = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json([]);

        const users = await User.find({
            username: { $regex: q, $options: 'i' }
        }).select('username avatar bio').limit(10);

        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
