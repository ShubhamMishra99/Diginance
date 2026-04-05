/**
 * @param {string} monthStr - YYYY-MM
 * @returns {{ start: Date, end: Date }}
 */
function monthRangeUTC(monthStr) {
  const [y, m] = monthStr.split('-').map(Number);
  if (!y || !m || m < 1 || m > 12) {
    throw new Error('Invalid month format, expected YYYY-MM');
  }
  const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));
  return { start, end };
}

/**
 * Current month as YYYY-MM in UTC
 */
function currentMonthUTC() {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

module.exports = {
  monthRangeUTC,
  currentMonthUTC,
};
