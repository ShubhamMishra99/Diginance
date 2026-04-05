const mongoose = require('mongoose');

/**
 * Build a MongoDB filter for transactions belonging to the JWT user.
 * Returns null if userId is not a valid ObjectId string.
 */
function userObjectIdFilter(userId) {
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return null;
  }
  return { userId: new mongoose.Types.ObjectId(userId) };
}

/**
 * Apply optional query filters: type, category, startDate, endDate (inclusive on calendar dates),
 * search (description), minAmount, maxAmount.
 */
function applyTransactionFilters(baseMatch, query) {
  const match = { ...baseMatch };

  if (query.type) {
    const t = String(query.type).toLowerCase();
    if (t === 'income' || t === 'expense') {
      match.type = t;
    }
  }

  if (query.category && String(query.category).trim()) {
    match.category = String(query.category).trim();
  }

  if (query.startDate || query.endDate) {
    match.date = {};
    if (query.startDate) {
      const start = new Date(String(query.startDate));
      if (!Number.isNaN(start.getTime())) {
        match.date.$gte = start;
      }
    }
    if (query.endDate) {
      const end = new Date(String(query.endDate));
      if (!Number.isNaN(end.getTime())) {
        const endDay = new Date(end);
        endDay.setHours(23, 59, 59, 999);
        match.date.$lte = endDay;
      }
    }
    if (Object.keys(match.date).length === 0) {
      delete match.date;
    }
  }

  if (query.search !== undefined && String(query.search).trim() !== '') {
    const raw = String(query.search).trim();
    const escaped = raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    match.description = { $regex: escaped, $options: 'i' };
  }

  const minA = query.minAmount;
  const maxA = query.maxAmount;
  if (
    (minA !== undefined && minA !== null && String(minA).trim() !== '') ||
    (maxA !== undefined && maxA !== null && String(maxA).trim() !== '')
  ) {
    match.amount = {};
    if (minA !== undefined && minA !== null && String(minA).trim() !== '') {
      const v = Number(minA);
      if (!Number.isNaN(v)) {
        match.amount.$gte = v;
      }
    }
    if (maxA !== undefined && maxA !== null && String(maxA).trim() !== '') {
      const v = Number(maxA);
      if (!Number.isNaN(v)) {
        match.amount.$lte = v;
      }
    }
    if (Object.keys(match.amount).length === 0) {
      delete match.amount;
    }
  }

  return match;
}

/**
 * sortBy: date | amount, sortOrder: asc | desc
 */
function buildTransactionSort(query) {
  const sortBy = query.sortBy === 'amount' ? 'amount' : 'date';
  const asc = String(query.sortOrder || 'desc').toLowerCase() === 'asc';
  const primary = asc ? 1 : -1;
  return { [sortBy]: primary, createdAt: asc ? 1 : -1 };
}

module.exports = {
  userObjectIdFilter,
  applyTransactionFilters,
  buildTransactionSort,
};
