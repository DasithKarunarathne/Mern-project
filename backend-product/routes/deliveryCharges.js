// backend/routes/deliveryCharges.js
const router = require('express').Router();
const DeliveryCharge = require('../models/DeliveryCharge');

// GET /api/delivery-charges/:postalCode - Get delivery charge for a postal code
router.get('/:postalCode', async (req, res) => {
  try {
    const postalCode = parseInt(req.params.postalCode, 10);
    const deliveryCharge = await DeliveryCharge.findOne({
      postalCodeStart: { $lte: postalCode },
      postalCodeEnd: { $gte: postalCode },
    });

    if (!deliveryCharge) {
      return res.status(404).json({ error: 'Delivery charge not found for this postal code', defaultCharge: 700 });
    }

    res.json({ deliveryCharge: deliveryCharge.deliveryCharge });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: `Failed to fetch delivery charge: ${err.message}` });
  }
});

module.exports = router;