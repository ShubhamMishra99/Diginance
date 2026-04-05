const Transaction = require('../models/transactionModel');
const { sendError, sendServerError } = require('../utils/apiResponse');
const {
  userObjectIdFilter,
  applyTransactionFilters,
} = require('../utils/transactionQuery');

function escapeCsvCell(value) {
  const str = String(value ?? '');
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const exportTransactionsCsv = async (req, res) => {
  try {
    const format = String(req.query.format || 'csv').toLowerCase();
    if (format !== 'csv') {
      return sendError(res, 400, 'Unsupported export format', { useQuery: 'format=csv' });
    }

    const base = userObjectIdFilter(req.user.userId);
    if (!base) return sendError(res, 400, 'Invalid user id in token');

    const match = applyTransactionFilters(base, req.query);
    const rows = await Transaction.find(match).sort({ date: -1, createdAt: -1 }).lean();

    const header = ['date', 'description', 'category', 'type', 'amount'];
    const lines = [header.join(',')];

    for (const r of rows) {
      const dateStr = new Date(r.date).toISOString().slice(0, 10);
      lines.push(
        [
          escapeCsvCell(dateStr),
          escapeCsvCell(r.description),
          escapeCsvCell(r.category),
          escapeCsvCell(r.type),
          escapeCsvCell(r.amount),
        ].join(','),
      );
    }

    const csv = lines.join('\r\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="diginance-transactions.csv"');
    res.send(csv);
  } catch (error) {
    sendServerError(res, error, 'reports.export');
  }
};

module.exports = {
  exportTransactionsCsv,
};
