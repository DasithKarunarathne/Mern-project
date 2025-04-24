const router = require('express').Router();
const DeliveryCharge = require('../models/DeliveryCharge');

router.get('/:postalCode', async (req, res) => {
  try {
    const postalCode = parseInt(req.params.postalCode, 10);
    if (isNaN(postalCode)) {
      return res.status(400).json({ error: 'Invalid postal code' });
    }

    const deliveryCharge = await DeliveryCharge.findOne({
      postalCodeStart: { $lte: postalCode },
      postalCodeEnd: { $gte: postalCode },
    });

    if (!deliveryCharge) {
      // Return a default charge instead of a 404 error
      return res.json({
        province: 'Unknown',
        deliveryCharge: 700,
      });
    }

    res.json({
      province: deliveryCharge.province,
      deliveryCharge: deliveryCharge.deliveryCharge,
    });
  } catch (err) {
    console.error('Error fetching delivery charge:', {
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({ error: 'Failed to fetch delivery charge' });
  }
});

module.exports = router;