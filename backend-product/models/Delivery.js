const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Add userId to associate with the user
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  postalCode: { type: String, required: true },
  email: { type: String, required: false },
  deliveryCharge: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Delivery', deliverySchema);