import express from 'express';
import Order from '../../models/productmodel/Order.js';

const router = express.Router();

// Approve refund
router.patch('/:orderId/approve-refund', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.refundStatus = 'approved';
    await order.save();

    res.status(200).json({ 
      message: 'Refund approved successfully',
      order 
    });
  } catch (error) {
    console.error('Error approving refund:', error);
    res.status(500).json({ error: 'Failed to approve refund' });
  }
});

// Deny refund
router.patch('/:orderId/deny-refund', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.refundStatus = 'denied';
    await order.save();

    res.status(200).json({ 
      message: 'Refund denied successfully',
      order 
    });
  } catch (error) {
    console.error('Error denying refund:', error);
    res.status(500).json({ error: 'Failed to deny refund' });
  }
});

export default router; 