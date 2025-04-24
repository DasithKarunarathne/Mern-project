import mongoose from 'mongoose';

const deliveryChargeSchema = new mongoose.Schema({
  province: { type: String, required: true },
  postalCodeStart: { type: Number, required: true },
  postalCodeEnd: { type: Number, required: true },
  deliveryCharge: { type: Number, required: true },
});

const DeliveryCharge = mongoose.model('DeliveryCharge', deliveryChargeSchema);

export default DeliveryCharge;