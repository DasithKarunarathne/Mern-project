// backend/routes/deliveries.js
const router = require('express').Router();
const Delivery = require('../models/Delivery');

// POST /api/deliveries - Save delivery details
router.post('/', async (req, res) => {
  try {
    const { name, address, phone, postalCode, deliveryCharge } = req.body;

    // Validate the request
    if (!name || !address || !phone || !postalCode || deliveryCharge === undefined) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Create a new delivery record
    const delivery = new Delivery({
      name,
      address,
      phone,
      postalCode,
      deliveryCharge,
    });

    // Save to the database
    const savedDelivery = await delivery.save();

    res.status(201).json({ message: 'Delivery details saved successfully', delivery: savedDelivery });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: `Failed to save delivery details: ${err.message}` });
  }
});

module.exports = router;