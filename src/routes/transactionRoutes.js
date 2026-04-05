const express = require('express');
const verifyToken = require('../middleware/authMiddleware');
const {
  listTransactions,
  createTransaction,
} = require('../controllers/transactionController');
const {
  createRecurring,
  listRecurring,
} = require('../controllers/recurringController');

const router = express.Router();

router.use(verifyToken);
router.post('/recurring', createRecurring);
router.get('/recurring', listRecurring);
router.get('/', listTransactions);
router.post('/', createTransaction);

module.exports = router;
