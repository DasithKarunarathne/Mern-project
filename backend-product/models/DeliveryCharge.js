// backend/models/DeliveryCharge.js
const mongoose = require('mongoose');

const deliveryChargeSchema = new mongoose.Schema({
  province: { type: String, required: true },
  postalCodeStart: { type: Number, required: true },
  postalCodeEnd: { type: Number, required: true },
  deliveryCharge: { type: Number, required: true },
});

module.exports = mongoose.model('DeliveryCharge', deliveryChargeSchema);