const express = require('express');
const verifyToken = require('../middleware/authMiddleware');
const {
  listBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  budgetStatus,
} = require('../controllers/budgetController');

const router = express.Router();

router.use(verifyToken);

router.get('/status', budgetStatus);
router.get('/', listBudgets);
router.post('/', createBudget);
router.put('/:id', updateBudget);
router.delete('/:id', deleteBudget);

module.exports = router;
