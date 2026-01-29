const Tweet = require('../models/Tweet');
const User = require('../models/User');
const { uploadImage } = require('../utils/cloudinary');

exports.createTweet = async (req, res) => {
    try {
        const { content } = req.body;
        let imageUrl = '';

        if (req.file) {
            const result = await uploadImage(req.file.buffer);
            imageUrl = result.secure_url;
        }

        const tweet = new Tweet({
            content,
            image: imageUrl,
            author: req.user.id
        });
        await tweet.save();

        // Populate author details for the frontend
        await tweet.populate('author', 'username avatar');

        // Socket.io emit
        const io = req.app.get('io');
        io.emit('new_tweet', tweet);

        res.status(201).json(tweet);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getTweets = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const type = req.query.type; // 'all' or 'following'

        let filter = {};

        if (type === 'following') {
            const currentUser = await User.findById(req.user.id);
            // Check if user has following, otherwise return empty or just self
            const followingIds = currentUser.following || [];
            // Includes tweets from following AND self
            filter = { author: { $in: [...followingIds, req.user.id] } };
        }

        const tweets = await Tweet.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('author', 'username avatar')
            .populate('comments.user', 'username avatar'); // Populate comment authors

        res.json(tweets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.toggleLike = async (req, res) => {
    try {
        const tweet = await Tweet.findById(req.params.id);
        if (!tweet) {
            return res.status(404).json({ error: 'Tweet not found' });
        }

        const userId = req.user.id;
        const index = tweet.likes.indexOf(userId);

        if (index === -1) {
            tweet.likes.push(userId);
        } else {
            tweet.likes.splice(index, 1);
        }

        await tweet.save();

        // Emit event
        const io = req.app.get('io');
        io.emit('tweet_liked', { tweetId: tweet._id, likes: tweet.likes });

        res.json(tweet);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.addComment = async (req, res) => {
    try {
        const { text } = req.body;
        const tweet = await Tweet.findById(req.params.id);

        if (!tweet) {
            return res.status(404).json({ error: 'Tweet not found' });
        }

        const user = await require('../models/User').findById(req.user.id);

        const comment = {
            text,
            user: req.user.id,
            username: user.username,
            avatar: user.avatar
        };

        tweet.comments.unshift(comment);
        await tweet.save();

        // Repopulate for immediate return
        await tweet.populate('comments.user', 'username avatar');

        res.json(tweet.comments);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.toggleCommentLike = async (req, res) => {
    try {
        const { tweetId, commentId } = req.params;
        const tweet = await Tweet.findById(tweetId);

        if (!tweet) return res.status(404).json({ error: 'Tweet not found' });

        const comment = tweet.comments.id(commentId);
        if (!comment) return res.status(404).json({ error: 'Comment not found' });

        const userId = req.user.id;
        const index = comment.likes.indexOf(userId);

        if (index === -1) {
            comment.likes.push(userId);
        } else {
            comment.likes.splice(index, 1);
        }

        await tweet.save();
        await tweet.populate('comments.user', 'username avatar');
        res.json(tweet.comments);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
