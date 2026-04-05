const express = require('express');
const verifyToken = require('../middleware/authMiddleware');
const { exportTransactionsCsv } = require('../controllers/reportController');

const router = express.Router();

router.use(verifyToken);
router.get('/export', exportTransactionsCsv);

module.exports = router;
