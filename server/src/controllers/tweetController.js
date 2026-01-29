const Tweet = require('../models/Tweet');
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

        const tweets = await Tweet.find()
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('author', 'username avatar');

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
