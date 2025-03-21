// backend/models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],
  deliveryData: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    postalCode: { type: String, required: true },
    deliveryCharge: { type: Number, required: true },
    email: { type: String }, // New field for customer email
  },
  subtotal: { type: Number, required: true },
  deliveryCharge: { type: Number, required: true },
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'completed', 'pending_refund', 'refunded', 'canceled'],
    default: 'pending',
  },
  refundReason: { type: String },
  refundComments: { type: String },
  refundedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);