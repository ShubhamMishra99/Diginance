const Transaction = require('../models/transactionModel');
const { sendError, sendServerError } = require('../utils/apiResponse');
const { userObjectIdFilter } = require('../utils/transactionQuery');
const { monthRangeUTC, currentMonthUTC } = require('../utils/monthRange');

function prevMonthStr(yyyyMm) {
  const [y, m] = yyyyMm.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1, 1));
  d.setUTCMonth(d.getUTCMonth() - 1);
  const py = d.getUTCFullYear();
  const pm = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${py}-${pm}`;
}

const getInsights = async (req, res) => {
  try {
    const base = userObjectIdFilter(req.user.userId);
    if (!base) return sendError(res, 400, 'Invalid user id in token');

    const currentMonth = currentMonthUTC();
    const previousMonth = prevMonthStr(currentMonth);

    const { start: cStart, end: cEnd } = monthRangeUTC(currentMonth);
    const { start: pStart, end: pEnd } = monthRangeUTC(previousMonth);

    const [currentAgg, previousAgg, topCatAgg] = await Promise.all([
      Transaction.aggregate([
        {
          $match: {
            userId: base.userId,
            type: 'expense',
            date: { $gte: cStart, $lte: cEnd },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Transaction.aggregate([
        {
          $match: {
            userId: base.userId,
            type: 'expense',
            date: { $gte: pStart, $lte: pEnd },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Transaction.aggregate([
        {
          $match: {
            userId: base.userId,
            type: 'expense',
            date: { $gte: cStart, $lte: cEnd },
          },
        },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } },
        { $limit: 1 },
      ]),
    ]);

    const currentExpenses = currentAgg[0]?.total || 0;
    const previousExpenses = previousAgg[0]?.total || 0;

    let expenseChangePercent = null;
    if (previousExpenses > 0) {
      expenseChangePercent = Math.round(
        ((currentExpenses - previousExpenses) / previousExpenses) * 100,
      );
    } else if (currentExpenses > 0) {
      expenseChangePercent = 100;
    } else {
      expenseChangePercent = 0;
    }

    const topCategory = topCatAgg[0]
      ? { category: topCatAgg[0]._id, amount: topCatAgg[0].total }
      : null;

    const messages = [];

    if (previousExpenses === 0 && currentExpenses === 0) {
      messages.push({
        type: 'neutral',
        text: 'No expense data for this month or last month yet.',
      });
    } else if (expenseChangePercent > 0) {
      messages.push({
        type: 'warning',
        text: `Your expenses increased by ${expenseChangePercent}% compared to last month.`,
      });
    } else if (expenseChangePercent < 0) {
      messages.push({
        type: 'positive',
        text: `Your expenses decreased by ${Math.abs(expenseChangePercent)}% compared to last month.`,
      });
    } else {
      messages.push({
        type: 'neutral',
        text: 'Your spending is flat compared to last month.',
      });
    }

    if (topCategory && topCategory.amount > 0) {
      messages.push({
        type: 'info',
        text: `Top spending category: ${topCategory.category} (${topCategory.amount.toFixed(2)}).`,
      });
    } else {
      messages.push({
        type: 'neutral',
        text: 'No expense categories recorded for this month.',
      });
    }

    res.json({
      success: true,
      messages,
      metrics: {
        currentMonth,
        previousMonth,
        currentMonthExpenses: currentExpenses,
        previousMonthExpenses: previousExpenses,
        expenseChangePercent,
        topCategory,
      },
    });
  } catch (error) {
    sendServerError(res, error, 'insights.get');
  }
};

module.exports = {
  getInsights,
};
