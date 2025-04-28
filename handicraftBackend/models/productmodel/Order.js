import mongoose from 'mongoose';

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
    email: { type: String, required: false },
    postalCode: { type: String, required: true },
    deliveryCharge: { type: Number, required: true },
  },
  subtotal: { type: Number, required: true },
  deliveryCharge: { type: Number, required: true },
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'completed', 'pending_refund', 'refunded', 'canceled', 'refund_denied'],
    default: 'pending',
  },
  refundReason: { type: String },
  refundComments: { type: String },
  refundedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  dueDate: { type: Date, default: function() { 
    // Default due date is 30 days from creation
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date;
  }},
  paymentStatus: { 
    type: String, 
    enum: ['unpaid', 'partially_paid', 'paid'], 
    default: 'unpaid' 
  },
  amountPaid: { type: Number, default: 0 },
  remainingBalance: { type: Number, default: function() { return this.total; } }
});

const Order = mongoose.model('Order', orderSchema);

export default Order;