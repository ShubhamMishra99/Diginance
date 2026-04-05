const mongoose = require('mongoose');

const recurringTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: ['income', 'expense'],
    },
    amount: { type: Number, required: true, min: 0 },
    frequency: {
      type: String,
      required: true,
      enum: ['daily', 'weekly', 'monthly'],
    },
    nextRunAt: { type: Date, required: true, index: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model('RecurringTransaction', recurringTransactionSchema);
