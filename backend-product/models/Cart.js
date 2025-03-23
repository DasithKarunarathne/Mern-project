const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Associate the cart with a user
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }, // Store the price at the time of addition
    },
  ],
});

module.exports = mongoose.model('Cart', cartSchema);