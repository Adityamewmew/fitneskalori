const express = require('express');
const { register, login, getProfile, updateProfileSettings } = require('../Controllers/authController');
const { verifyToken } = require('../Middlewares/authMiddleware');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', verifyToken, getProfile);
router.put('/profile/update', verifyToken, updateProfileSettings);

module.exports = router;
