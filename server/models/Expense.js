import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Expense title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD']
  },
  category: {
    type: String,
    enum: ['food', 'transport', 'accommodation', 'entertainment', 'shopping', 'utilities', 'salary', 'investment', 'other'],
    default: 'other'
  },
  transactionType: {
    type: String,
    enum: ['income', 'expense', 'investment'],
    default: 'expense'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'upi', 'wallet', 'other'],
    default: 'cash'
  },
  tags: [{
    type: String,
    trim: true
  }],
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    default: null
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  splitType: {
    type: String,
    enum: ['equal', 'exact', 'percentage'],
    default: 'equal'
  },
  splits: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100
    },
    paid: {
      type: Boolean,
      default: false
    }
  }],
  receipt: {
    type: String,
    default: null
  },
  date: {
    type: Date,
    default: Date.now
  },
  isSettled: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
expenseSchema.index({ group: 1, date: -1 });
expenseSchema.index({ paidBy: 1 });
expenseSchema.index({ 'splits.user': 1 });

// Validate that splits add up to total amount
expenseSchema.pre('save', function(next) {
  if (this.splitType === 'exact') {
    const totalSplits = this.splits.reduce((sum, split) => sum + split.amount, 0);
    if (Math.abs(totalSplits - this.amount) > 0.01) {
      return next(new Error('Split amounts must add up to total expense amount'));
    }
  }
  
  if (this.splitType === 'percentage') {
    const totalPercentage = this.splits.reduce((sum, split) => sum + (split.percentage || 0), 0);
    if (Math.abs(totalPercentage - 100) > 0.01) {
      return next(new Error('Split percentages must add up to 100%'));
    }
  }
  
  next();
});

export default mongoose.model('Expense', expenseSchema);
