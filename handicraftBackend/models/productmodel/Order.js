import mongoose from 'mongoose';

const { Schema } = mongoose;

const orderSchema = new Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  refundStatus: {
    type: String,
    enum: ['pending', 'approved', 'denied'],
    default: 'pending'
  },
  deliveryDetails: {
    name: String,
    address: String,
    phone: String,
    email: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
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
  remainingBalance: { type: Number, default: function() { return this.totalAmount; } }
});

const Order = mongoose.model('Order', orderSchema);

export default Order;