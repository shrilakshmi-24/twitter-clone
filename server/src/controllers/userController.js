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

        if (!userToFollow.followers.includes(req.user.id)) {
            userToFollow.followers.push(req.user.id);
            currentUser.following.push(req.params.id);
            await userToFollow.save();
            await currentUser.save();
        }

        res.json(currentUser.following);
    } catch (error) {
        res.status(400).json({ error: error.message });
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
