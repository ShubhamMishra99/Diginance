const Transaction = require('../models/transactionModel');
const { toClient } = require('./transactionController');
const { sendError, sendServerError } = require('../utils/apiResponse');
const { userObjectIdFilter } = require('../utils/transactionQuery');

/**
 * All dashboard metrics are scoped to req.user.userId (JWT payload).
 */
function getUserMatch(req, res) {
  const match = userObjectIdFilter(req.user.userId);
  if (!match) {
    sendError(res, 400, 'Invalid user id in token');
    return null;
  }
  return match;
}

const getSummary = async (req, res) => {
  try {
    const base = getUserMatch(req, res);
    if (!base) return;

    const rows = await Transaction.aggregate([
      { $match: base },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    let totalIncome = 0;
    let totalExpense = 0;
    for (const row of rows) {
      if (row._id === 'income') totalIncome = row.total;
      if (row._id === 'expense') totalExpense = row.total;
    }

    res.json({
      success: true,
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
    });
  } catch (error) {
    sendServerError(res, error, 'dashboard.summary');
  }
};

const getCategoryBreakdown = async (req, res) => {
  try {
    const base = getUserMatch(req, res);
    if (!base) return;

    const rows = await Transaction.aggregate([
      { $match: base },
      {
        $group: {
          _id: { category: '$category', type: '$type' },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.category': 1 } },
    ]);

    const byCategory = new Map();
    for (const row of rows) {
      const cat = row._id.category;
      if (!byCategory.has(cat)) {
        byCategory.set(cat, { category: cat, income: 0, expense: 0 });
      }
      const entry = byCategory.get(cat);
      if (row._id.type === 'income') entry.income = row.total;
      if (row._id.type === 'expense') entry.expense = row.total;
    }

    res.json({
      success: true,
      categories: Array.from(byCategory.values()),
    });
  } catch (error) {
    sendServerError(res, error, 'dashboard.category');
  }
};

const getTrends = async (req, res) => {
  try {
    const base = getUserMatch(req, res);
    if (!base) return;

    const rows = await Transaction.aggregate([
      { $match: base },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m', date: '$date' },
          },
          income: {
            $sum: {
              $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0],
            },
          },
          expense: {
            $sum: {
              $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          month: '$_id',
          income: 1,
          expense: 1,
        },
      },
    ]);

    res.json({
      success: true,
      trends: rows,
    });
  } catch (error) {
    sendServerError(res, error, 'dashboard.trends');
  }
};

const getRecent = async (req, res) => {
  try {
    const base = getUserMatch(req, res);
    if (!base) return;

    const rows = await Transaction.find(base)
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const transactions = rows.map((r) => ({
      ...toClient(r),
      createdAt: r.createdAt,
    }));

    res.json({
      success: true,
      transactions,
    });
  } catch (error) {
    sendServerError(res, error, 'dashboard.recent');
  }
};

module.exports = {
  getSummary,
  getCategoryBreakdown,
  getTrends,
  getRecent,
};
