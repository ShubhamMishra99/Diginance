const express = require('express');
const verifyToken = require('../middleware/authMiddleware');
const {
  getSummary,
  getCategoryBreakdown,
  getTrends,
  getRecent,
} = require('../controllers/dashboardController');

const router = express.Router();

router.use(verifyToken);

router.get('/summary', getSummary);
router.get('/category', getCategoryBreakdown);
router.get('/trends', getTrends);
router.get('/recent', getRecent);

module.exports = router;
