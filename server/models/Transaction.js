const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, 'Transaction type is required'],
    enum: {
      values: ['Income', 'Expense'],
      message: '{VALUE} is not a valid transaction type'
    }
  },
  category: {
    type: String,
    required: [true, 'Transaction category is required'],
    enum: {
      values: [
        'Matchday',
        'Transfer',
        'Wages',
        'Operations',
        'Sponsorship',
        'Sponsorships',
        'Merchandising',
        'Prize Money',
        'Travel',
        'Maintenance'
      ],
      message: '{VALUE} is not a valid transaction category'
    }
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  date: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

TransactionSchema.index({ date: -1 });
TransactionSchema.index({ type: 1, category: 1 });

TransactionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Transaction', TransactionSchema);
