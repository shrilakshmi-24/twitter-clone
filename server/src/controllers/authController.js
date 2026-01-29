const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 8);

        const user = new User({
            username,
            email,
            password: hashedPassword
        });

        await user.save();

        const token = generateToken(user._id);

        res.status(201).json({ user, token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ error: 'Invalid login credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid login credentials' });
        }

        const token = generateToken(user._id);
        res.json({ user, token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { username, bio, dob, gender } = req.body;
        let avatarUrl;

        // Check if username is taken by another user
        if (username) {
            const existingUser = await User.findOne({ username, _id: { $ne: req.user.id } });
            if (existingUser) {
                return res.status(400).json({ error: 'Username already taken' });
            }
        }

        const updates = { username, bio, dob, gender };

        if (req.file) {
            const { uploadImage } = require('../utils/cloudinary');
            const result = await uploadImage(req.file.buffer, 'tuweeter_profiles'); // Separate folder
            console.log("Avatar upload result:", result);
            avatarUrl = result.secure_url;
            updates.avatar = avatarUrl;
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        res.json(user);
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(400).json({ error: error.message });
    }
};
