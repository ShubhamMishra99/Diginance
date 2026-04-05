const RecurringTransaction = require('../models/recurringTransactionModel');
const { sendError, sendServerError } = require('../utils/apiResponse');
const { userObjectIdFilter } = require('../utils/transactionQuery');
const { addFrequency } = require('../services/recurringScheduler');

function toClient(doc) {
  return {
    id: String(doc._id),
    description: doc.description,
    category: doc.category,
    type: doc.type,
    amount: doc.amount,
    frequency: doc.frequency,
    nextRunAt: doc.nextRunAt,
    active: doc.active,
  };
}

const createRecurring = async (req, res) => {
  try {
    const base = userObjectIdFilter(req.user.userId);
    if (!base) return sendError(res, 400, 'Invalid user id in token');

    const { description, category, type, amount, frequency, startDate } = req.body;

    if (
      description === undefined ||
      category === undefined ||
      type === undefined ||
      amount === undefined ||
      frequency === undefined
    ) {
      return sendError(res, 400, 'Missing required fields', {
        required: ['description', 'category', 'type', 'amount', 'frequency'],
      });
    }

    const desc = String(description).trim();
    const cat = String(category).trim();
    if (!desc || !cat) {
      return sendError(res, 400, 'Description and category cannot be empty');
    }

    const typeNorm = String(type).toLowerCase();
    if (typeNorm !== 'income' && typeNorm !== 'expense') {
      return sendError(res, 400, 'Invalid type', { allowed: ['income', 'expense'] });
    }

    const freq = String(frequency).toLowerCase();
    if (!['daily', 'weekly', 'monthly'].includes(freq)) {
      return sendError(res, 400, 'Invalid frequency', {
        allowed: ['daily', 'weekly', 'monthly'],
      });
    }

    const n = Number(amount);
    if (Number.isNaN(n) || n <= 0) {
      return sendError(res, 400, 'Amount must be greater than 0');
    }

    let nextRunAt;
    if (startDate) {
      nextRunAt = new Date(startDate);
      if (Number.isNaN(nextRunAt.getTime())) {
        return sendError(res, 400, 'Invalid startDate');
      }
    } else {
      nextRunAt = new Date();
    }

    if (nextRunAt > new Date()) {
      // First run at scheduled start
    } else {
      // Backfill next run from now so scheduler picks up soon
      while (nextRunAt <= new Date()) {
        nextRunAt = addFrequency(nextRunAt, freq);
      }
    }

    const doc = await RecurringTransaction.create({
      userId: req.user.userId,
      description: desc,
      category: cat,
      type: typeNorm,
      amount: n,
      frequency: freq,
      nextRunAt,
      active: true,
    });

    res.status(201).json({ success: true, recurring: toClient(doc) });
  } catch (error) {
    sendServerError(res, error, 'recurring.create');
  }
};

const listRecurring = async (req, res) => {
  try {
    const base = userObjectIdFilter(req.user.userId);
    if (!base) return sendError(res, 400, 'Invalid user id in token');

    const rows = await RecurringTransaction.find({ userId: base.userId })
      .sort({ nextRunAt: 1 })
      .lean();

    res.json({
      success: true,
      recurring: rows.map((r) =>
        toClient({
          ...r,
          _id: r._id,
          nextRunAt: r.nextRunAt,
        }),
      ),
    });
  } catch (error) {
    sendServerError(res, error, 'recurring.list');
  }
};

module.exports = {
  createRecurring,
  listRecurring,
  toClient,
};
