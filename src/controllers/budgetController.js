const Budget = require('../models/budgetModel');
const Transaction = require('../models/transactionModel');
const { sendError, sendServerError } = require('../utils/apiResponse');
const { userObjectIdFilter } = require('../utils/transactionQuery');
const { monthRangeUTC, currentMonthUTC } = require('../utils/monthRange');

function toClient(doc) {
  return {
    id: String(doc._id),
    category: doc.category,
    month: doc.month,
    limit: doc.limit,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

const listBudgets = async (req, res) => {
  try {
    const base = userObjectIdFilter(req.user.userId);
    if (!base) return sendError(res, 400, 'Invalid user id in token');

    const q = { userId: base.userId };
    if (req.query.month && String(req.query.month).trim()) {
      q.month = String(req.query.month).trim();
    }

    const rows = await Budget.find(q).sort({ month: -1, category: 1 }).lean();
    res.json({
      success: true,
      budgets: rows.map((r) => ({
        id: String(r._id),
        category: r.category,
        month: r.month,
        limit: r.limit,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
    });
  } catch (error) {
    sendServerError(res, error, 'budgets.list');
  }
};

const createBudget = async (req, res) => {
  try {
    const base = userObjectIdFilter(req.user.userId);
    if (!base) return sendError(res, 400, 'Invalid user id in token');

    const { category, month, limit } = req.body;
    if (!category || !month || limit === undefined || limit === null) {
      return sendError(res, 400, 'category, month (YYYY-MM), and limit are required');
    }
    const cat = String(category).trim();
    const mon = String(month).trim();
    if (!/^\d{4}-\d{2}$/.test(mon)) {
      return sendError(res, 400, 'month must be YYYY-MM');
    }
    const lim = Number(limit);
    if (Number.isNaN(lim) || lim < 0) {
      return sendError(res, 400, 'limit must be a non-negative number');
    }

    const doc = await Budget.create({
      userId: req.user.userId,
      category: cat,
      month: mon,
      limit: lim,
    });
    res.status(201).json({ success: true, budget: toClient(doc) });
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, 409, 'A budget for this category and month already exists');
    }
    sendServerError(res, error, 'budgets.create');
  }
};

const updateBudget = async (req, res) => {
  try {
    const base = userObjectIdFilter(req.user.userId);
    if (!base) return sendError(res, 400, 'Invalid user id in token');

    const doc = await Budget.findOne({ _id: req.params.id, userId: base.userId });
    if (!doc) {
      return sendError(res, 404, 'Budget not found');
    }

    const { category, month, limit } = req.body;
    if (category !== undefined) doc.category = String(category).trim();
    if (month !== undefined) {
      const mon = String(month).trim();
      if (!/^\d{4}-\d{2}$/.test(mon)) {
        return sendError(res, 400, 'month must be YYYY-MM');
      }
      doc.month = mon;
    }
    if (limit !== undefined) {
      const lim = Number(limit);
      if (Number.isNaN(lim) || lim < 0) {
        return sendError(res, 400, 'limit must be a non-negative number');
      }
      doc.limit = lim;
    }

    await doc.save();
    res.json({ success: true, budget: toClient(doc) });
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, 409, 'A budget for this category and month already exists');
    }
    sendServerError(res, error, 'budgets.update');
  }
};

const deleteBudget = async (req, res) => {
  try {
    const base = userObjectIdFilter(req.user.userId);
    if (!base) return sendError(res, 400, 'Invalid user id in token');

    const result = await Budget.deleteOne({ _id: req.params.id, userId: base.userId });
    if (result.deletedCount === 0) {
      return sendError(res, 404, 'Budget not found');
    }
    res.json({ success: true, message: 'Budget deleted' });
  } catch (error) {
    sendServerError(res, error, 'budgets.delete');
  }
};

const budgetStatus = async (req, res) => {
  try {
    const base = userObjectIdFilter(req.user.userId);
    if (!base) return sendError(res, 400, 'Invalid user id in token');

    const month = req.query.month && String(req.query.month).trim()
      ? String(req.query.month).trim()
      : currentMonthUTC();

    let start;
    let end;
    try {
      ({ start, end } = monthRangeUTC(month));
    } catch {
      return sendError(res, 400, 'Invalid month, use YYYY-MM');
    }

    const budgets = await Budget.find({ userId: base.userId, month }).lean();

    const status = [];
    for (const b of budgets) {
      const agg = await Transaction.aggregate([
        {
          $match: {
            userId: base.userId,
            type: 'expense',
            category: b.category,
            date: { $gte: start, $lte: end },
          },
        },
        { $group: { _id: null, spent: { $sum: '$amount' } } },
      ]);
      const spent = agg[0]?.spent || 0;
      const limitVal = b.limit;
      status.push({
        id: String(b._id),
        category: b.category,
        limit: limitVal,
        spent,
        remaining: Math.max(0, limitVal - spent),
        month: b.month,
      });
    }

    res.json({ success: true, month, status });
  } catch (error) {
    sendServerError(res, error, 'budgets.status');
  }
};

module.exports = {
  listBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  budgetStatus,
};
