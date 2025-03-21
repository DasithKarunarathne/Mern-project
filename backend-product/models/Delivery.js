// backend/models/Delivery.js
const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  postalCode: { type: String, required: true },
  deliveryCharge: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Delivery', deliverySchema);