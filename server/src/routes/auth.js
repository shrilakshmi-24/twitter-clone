const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const multer = require('multer');

// Multer setup for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/me', auth, authController.getMe);
router.put('/profile', auth, upload.single('avatar'), authController.updateProfile);

module.exports = router;
