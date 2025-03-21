// backend/models/FinancialTransaction.js
const mongoose = require('mongoose');

const financialTransactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['sale', 'refund'],
    required: true,
  },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('FinancialTransaction', financialTransactionSchema);