import express from 'express';
import mongoose from 'mongoose'; // Import mongoose to use ObjectId validation
import Order from '../../models/productmodel/Order.js';
import Product from '../../models/productmodel/Product.js';
import FinancialTransaction from '../../models/productmodel/FinancialTransaction.js';
import sendEmail from '../../util/sendEmail.js';

const router = express.Router();

// Email validation regex
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Mock authentication middleware (replace with real authentication if available)
const authenticateAdmin = (req, res, next) => {
  const isAdmin = req.headers['x-admin-key'] === 'mock-admin-key'; // Replace with real admin check
  if (!isAdmin) {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
  next();
};

// POST /api/orders/send-otp - Send OTP email to customer
router.post('/send-otp', async (req, res) => {
  const { email, name, otp } = req.body;

  if (!email || !name || !otp) {
    return res.status(400).json({ error: 'Email, name, and OTP are required' });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  try {
    await sendEmail(
      email,
      'Your OTP for Payment Verification',
      `Dear ${name},\n\nYour OTP for payment verification is: ${otp}\n\nPlease enter this OTP to complete your payment.\n\nBest regards,\nHandicraft Store Team`
    );
    res.status(200).json({ message: 'OTP email sent successfully' });
  } catch (error) {
    console.error('Error sending OTP email:', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: 'Failed to send OTP email' });
  }
});

// POST /api/orders - Save a new order
router.post('/', async (req, res) => {
  try {
    const { userId, items, deliveryData, subtotal, deliveryCharge, total } = req.body;

    if (!userId || !items || !deliveryData || !subtotal || !deliveryCharge || !total) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items must be a non-empty array' });
    }

    for (const item of items) {
      if (!item.productId || !item.quantity || !item.price || item.price <= 0) {
        return res.status(400).json({ error: 'Each item must have a valid productId, quantity, and price greater than 0' });
      }
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ error: `Product with ID ${item.productId} not found` });
      }
      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for product ${product.name}` });
      }
      product.stockQuantity -= item.quantity;
      await product.save();
    }

    const order = new Order({
      userId,
      items,
      deliveryData,
      subtotal,
      deliveryCharge,
      total,
      status: 'completed',
    });

    const savedOrder = await order.save();

    await FinancialTransaction.create({
      orderId: savedOrder._id,
      type: 'sale',
      amount: savedOrder.total,
      description: `Sale for order #${savedOrder._id}`,
    });

    if (deliveryData.email && validateEmail(deliveryData.email)) {
      sendEmail(
        deliveryData.email,
        'Order Confirmation',
        `Dear ${deliveryData.name},\n\nYour order #${savedOrder._id} has been placed successfully.\nTotal: LKR ${savedOrder.total.toFixed(2)}\n\nThank you for shopping with us!\n\nBest regards,\nHandicraft Store Team`
      ).catch(error => {
        console.error('Failed to send order confirmation email:', error);
      });
    }

    res.status(201).json({ message: 'Order saved successfully', order: savedOrder });
  } catch (err) {
    console.error('Error saving order:', {
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({ error: `Failed to save order: ${err.message}` });
  }
});

// GET /api/orders/pending-refunds - Get all pending refund orders
router.get('/pending-refunds', authenticateAdmin, async (req, res) => {
  try {
    const pendingRefundOrders = await Order.find({ status: 'pending_refund' }).populate({
      path: 'items.productId',
      options: { strictPopulate: false },
    });
    res.json(pendingRefundOrders);
  } catch (err) {
    console.error('Error fetching pending refunds:', {
      message: err.message,
      stack: err.stack,
      request: req.headers,
    });
    res.status(500).json({ error: `Failed to fetch pending refunds: ${err.message}` });
  }
});

// GET /api/orders/financials - Get total income and refunds
router.get('/financials', async (req, res) => {
  try {
    const completedOrders = await Order.find({ status: 'completed' });
    const totalIncome = completedOrders.reduce((sum, order) => sum + order.total, 0);

    const refundedOrders = await Order.find({ status: 'refunded' });
    const totalRefunds = refundedOrders.reduce((sum, order) => sum + order.total, 0);

    const pendingRefundOrders = await Order.find({ status: 'pending_refund' });
    const pendingRefunds = pendingRefundOrders.reduce((sum, order) => sum + order.total, 0);

    const netIncome = totalIncome - totalRefunds;

    res.json({
      totalIncome,
      totalRefunds,
      pendingRefunds,
      netIncome,
      completedOrdersCount: completedOrders.length,
      refundedOrdersCount: refundedOrders.length,
      pendingRefundOrdersCount: pendingRefundOrders.length,
    });
  } catch (err) {
    console.error('Error fetching financials:', {
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({ error: `Failed to fetch financials: ${err.message}` });
  }
});

// GET /api/orders/user/:userId - Get orders for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).populate('items.productId');
    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', {
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({ error: `Failed to fetch orders: ${err.message}` });
  }
});

// GET /api/orders/:id - Get a single order by ID (Moved after specific routes)
router.get('/:id', async (req, res) => {
  try {
    // Validate that the id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid order ID format' });
    }

    const order = await Order.findById(req.params.id).populate('items.productId');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    console.error('Error fetching order:', {
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({ error: `Failed to fetch order: ${err.message}` });
  }
});

// POST /api/orders/:id/request-refund - Customer requests a refund
router.post('/:id/request-refund', async (req, res) => {
  try {
    // Validate that the id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid order ID format' });
    }

    const { refundReason, refundComments } = req.body;
    const order = await Order.findById(req.params.id).populate('items.productId');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'completed') {
      return res.status(400).json({ error: 'Only completed orders can be refunded' });
    }

    if (order.deliveryData.email && !validateEmail(order.deliveryData.email)) {
      return res.status(400).json({ error: 'Cannot be refunded: Invalid email address' });
    }

    const currentDate = new Date();
    const orderDate = new Date(order.createdAt);

    const currentDateUTC = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate()));
    const orderDateUTC = new Date(Date.UTC(orderDate.getUTCFullYear(), orderDate.getUTCMonth(), orderDate.getUTCDate()));

    const daysDifference = Math.floor((currentDateUTC - orderDateUTC) / (1000 * 60 * 60 * 24));
    if (daysDifference > 10) {
      const deadline = new Date(orderDateUTC);
      deadline.setDate(deadline.getDate() + 10);
      return res.status(400).json({
        error: `Cannot be refunded: Refund request must be made within 10 days of order creation (deadline: ${deadline.toISOString()})`,
      });
    }

    order.refundReason = refundReason;
    order.refundComments = refundComments;
    order.status = 'pending_refund';
    order.updatedAt = Date.now();
    const updatedOrder = await order.save();

    if (order.deliveryData.email && validateEmail(order.deliveryData.email)) {
      sendEmail(
        order.deliveryData.email,
        'Refund Request Submitted',
        `Dear ${order.deliveryData.name},\n\nYour refund request for order #${order._id} has been submitted.\nReason: ${refundReason}\nComments: ${refundComments || 'None'}\n\nWe will review your request and notify you of the outcome.\n\nBest regards,\nHandicraft Store Team`
      ).catch(error => {
        console.error('Failed to send refund request email to customer:', error);
      });
    }

    const managerEmail = process.env.MANAGER_EMAIL || 'manager@handicraftstore.com';
    sendEmail(
      managerEmail,
      'New Refund Request Received',
      `Dear Product Manager,\n\nA new refund request has been submitted for order #${order._id}.\nCustomer: ${order.deliveryData.name}\nTotal: LKR ${order.total.toFixed(2)}\nReason: ${refundReason}\nComments: ${refundComments || 'None'}\n\nPlease review the request in the Refund Management section.\n\nBest regards,\nHandicraft Store System`
    ).catch(error => {
      console.error('Failed to send refund request email to manager:', error);
    });

    res.json({ message: 'Refund request submitted', order: updatedOrder });
  } catch (err) {
    console.error('Error requesting refund:', {
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({ error: `Failed to request refund: ${err.message}` });
  }
});

// PUT /api/orders/:id/approve-refund - Product manager approves the refund
router.put('/:id/approve-refund', authenticateAdmin, async (req, res) => {
  try {
    // Validate that the id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid order ID format' });
    }

    const order = await Order.findById(req.params.id).populate('items.productId');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'pending_refund') {
      return res.status(400).json({ error: 'Order must be in pending_refund status to process refund' });
    }

    order.status = 'refunded';
    order.refundedAt = Date.now();
    order.updatedAt = Date.now();
    await order.save();

    for (const item of order.items) {
      const product = item.productId; // Already populated
      if (product) {
        product.stockQuantity += item.quantity;
        await product.save();
      }
    }

    await FinancialTransaction.create({
      orderId: order._id,
      type: 'refund',
      amount: -order.total,
      description: `Refund for order #${order._id}`,
    });

    if (order.deliveryData.email && validateEmail(order.deliveryData.email)) {
      sendEmail(
        order.deliveryData.email,
        'Refund Request Approved',
        `Dear ${order.deliveryData.name},\n\nYour refund request for order #${order._id} has been approved.\nRefund Amount: LKR ${order.total.toFixed(2)}\nThe amount will be credited to your account within 5-7 business days.\n\nBest regards,\nHandicraft Store Team`
      ).catch(error => {
        console.error('Failed to send refund approval email:', error);
      });
    }

    res.json({ message: 'Refund approved and processed', order });
  } catch (err) {
    console.error('Error approving refund:', {
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({ error: `Failed to approve refund: ${err.message}` });
  }
});

// PUT /api/orders/:id/deny-refund - Product manager denies the refund
router.put('/:id/deny-refund', authenticateAdmin, async (req, res) => {
  try {
    // Validate that the id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid order ID format' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'pending_refund') {
      return res.status(400).json({ error: 'Order must be in pending_refund status to deny refund' });
    }

    order.status = 'refund_denied';
    order.updatedAt = Date.now();
    const updatedOrder = await order.save();

    if (order.deliveryData.email && validateEmail(order.deliveryData.email)) {
      sendEmail(
        order.deliveryData.email,
        'Refund Request Denied',
        `Dear ${order.deliveryData.name},\n\nYour refund request for order #${order._id} has been denied.\nReason for Denial: Please contact support for more details.\n\nBest regards,\nHandicraft Store Team`
      ).catch(error => {
        console.error('Failed to send refund denial email:', error);
      });
    }

    res.json({ message: 'Refund request denied', order: updatedOrder });
  } catch (err) {
    console.error('Error denying refund:', {
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({ error: `Failed to deny refund: ${err.message}` });
  }
});

export default router;