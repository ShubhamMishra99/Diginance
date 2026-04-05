const express = require('express');
const verifyToken = require('../middleware/authMiddleware');
const { getInsights } = require('../controllers/insightsController');

const router = express.Router();

router.use(verifyToken);
router.get('/', getInsights);

module.exports = router;
