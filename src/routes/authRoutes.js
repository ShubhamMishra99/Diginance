const express = require('express');
const verifyToken = require('../middleware/authMiddleware');
const { register, login, me } = require('../controllers/authController');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyToken, me);

module.exports = router;