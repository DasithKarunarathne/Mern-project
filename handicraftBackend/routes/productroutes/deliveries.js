import { Router } from 'express';
import Delivery from '../../models/productmodel/Delivery.js';

const router = Router();

// POST /api/delivery - Save delivery details
router.post('/', async (req, res) => {
  try {
    const { userId, name, address, phone, postalCode, deliveryCharge, email } = req.body;

    if (!userId || !name || !address || !phone || !postalCode || deliveryCharge === undefined) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    const delivery = new Delivery({
      userId,
      name,
      address,
      phone,
      postalCode,
      email,
      deliveryCharge,
    });

    const savedDelivery = await delivery.save();
    res.status(201).json({ message: 'Delivery details saved successfully', delivery: savedDelivery });
  } catch (err) {
    console.error('Error saving delivery details:', err);
    res.status(500).json({ error: `Failed to save delivery details: ${err.message}` });
  }
});

export default router;