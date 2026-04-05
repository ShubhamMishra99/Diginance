const Transaction = require('../models/transactionModel');
const { sendError, sendServerError } = require('../utils/apiResponse');
const {
  userObjectIdFilter,
  applyTransactionFilters,
  buildTransactionSort,
} = require('../utils/transactionQuery');

function toClient(row) {
  return {
    id: String(row._id),
    date: new Date(row.date).toISOString().slice(0, 10),
    description: row.description,
    category: row.category,
    type: row.type,
    amount: row.amount,
  };
}

const listTransactions = async (req, res) => {
  try {
    const base = userObjectIdFilter(req.user.userId);
    if (!base) {
      return sendError(res, 400, 'Invalid user id in token');
    }

    if (req.query.type !== undefined && String(req.query.type).trim() !== '') {
      const t = String(req.query.type).toLowerCase();
      if (t !== 'income' && t !== 'expense') {
        return sendError(res, 400, 'Invalid type filter', {
          allowed: ['income', 'expense'],
        });
      }
    }

    if (req.query.sortBy !== undefined && String(req.query.sortBy).trim() !== '') {
      const sb = String(req.query.sortBy).toLowerCase();
      if (sb !== 'date' && sb !== 'amount') {
        return sendError(res, 400, 'Invalid sortBy', { allowed: ['date', 'amount'] });
      }
    }
    if (req.query.sortOrder !== undefined && String(req.query.sortOrder).trim() !== '') {
      const so = String(req.query.sortOrder).toLowerCase();
      if (so !== 'asc' && so !== 'desc') {
        return sendError(res, 400, 'Invalid sortOrder', { allowed: ['asc', 'desc'] });
      }
    }

    const match = applyTransactionFilters(base, req.query);
    const sortSpec = buildTransactionSort(req.query);

    const usePagination =
      req.query.page !== undefined || req.query.limit !== undefined;

    if (usePagination) {
      let page = parseInt(req.query.page, 10);
      let limit = parseInt(req.query.limit, 10);
      if (Number.isNaN(page) || page < 1) page = 1;
      if (Number.isNaN(limit) || limit < 1) limit = 10;
      limit = Math.min(limit, 100);

      const skip = (page - 1) * limit;

      const [total, rows] = await Promise.all([
        Transaction.countDocuments(match),
        Transaction.find(match)
          .sort(sortSpec)
          .skip(skip)
          .limit(limit)
          .lean(),
      ]);

      return res.json({
        success: true,
        data: rows.map((r) => toClient(r)),
        page,
        limit,
        total,
        totalPages: limit > 0 ? Math.ceil(total / limit) : 0,
      });
    }

    const rows = await Transaction.find(match).sort(sortSpec).lean();
    res.json(rows.map((r) => toClient(r)));
  } catch (error) {
    sendServerError(res, error, 'transactions.list');
  }
};

const createTransaction = async (req, res) => {
  try {
    const { date, description, category, type, amount } = req.body;

    if (
      date === undefined ||
      date === null ||
      description === undefined ||
      description === null ||
      category === undefined ||
      category === null ||
      type === undefined ||
      type === null ||
      amount === undefined ||
      amount === null
    ) {
      return sendError(res, 400, 'Missing required fields', {
        required: ['date', 'description', 'category', 'type', 'amount'],
      });
    }

    const descTrim = String(description).trim();
    const catTrim = String(category).trim();
    if (!descTrim) {
      return sendError(res, 400, 'Description cannot be empty');
    }
    if (!catTrim) {
      return sendError(res, 400, 'Category cannot be empty');
    }

    const typeNorm = String(type).toLowerCase();
    if (typeNorm !== 'income' && typeNorm !== 'expense') {
      return sendError(res, 400, 'Invalid type', {
        allowed: ['income', 'expense'],
      });
    }

    const n = Number(amount);
    if (Number.isNaN(n)) {
      return sendError(res, 400, 'Amount must be a number');
    }
    if (n <= 0) {
      return sendError(res, 400, 'Amount must be greater than 0');
    }

    const base = userObjectIdFilter(req.user.userId);
    if (!base) {
      return sendError(res, 400, 'Invalid user id in token');
    }

    const doc = await Transaction.create({
      userId: req.user.userId,
      date: new Date(date),
      description: descTrim,
      category: catTrim,
      type: typeNorm,
      amount: n,
    });
    res.status(201).json(toClient(doc));
  } catch (error) {
    sendServerError(res, error, 'transactions.create');
  }
};

module.exports = {
  listTransactions,
  createTransaction,
  toClient,
};
