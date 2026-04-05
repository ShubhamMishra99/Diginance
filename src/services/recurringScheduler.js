const Transaction = require('../models/transactionModel');
const RecurringTransaction = require('../models/recurringTransactionModel');

function addFrequency(date, frequency) {
  const d = new Date(date.getTime());
  if (frequency === 'daily') {
    d.setUTCDate(d.getUTCDate() + 1);
  } else if (frequency === 'weekly') {
    d.setUTCDate(d.getUTCDate() + 7);
  } else if (frequency === 'monthly') {
    d.setUTCMonth(d.getUTCMonth() + 1);
  }
  return d;
}

/**
 * Creates posted transactions for any recurring rules that are due (nextRunAt <= now).
 */
async function processDueRecurringTransactions() {
  const now = new Date();
  const due = await RecurringTransaction.find({
    active: true,
    nextRunAt: { $lte: now },
  });

  for (const rule of due) {
    try {
      await Transaction.create({
        userId: rule.userId,
        date: rule.nextRunAt,
        description: `[Recurring] ${rule.description}`,
        category: rule.category,
        type: rule.type,
        amount: rule.amount,
      });

      rule.nextRunAt = addFrequency(rule.nextRunAt, rule.frequency);
      await rule.save();
    } catch (err) {
      console.error('[recurring] Failed to process rule', rule._id, err.message);
    }
  }
}

module.exports = {
  processDueRecurringTransactions,
  addFrequency,
};
