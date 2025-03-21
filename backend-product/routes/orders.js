// backend/routes/orders.js
const router = require('express').Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const FinancialTransaction = require('../models/FinancialTransaction');
const nodemailer = require('nodemailer');

// Configure Nodemailer (replace with your email service credentials)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com', // Replace with your email
    pass: 'your-email-password', // Replace with your email password or app-specific password
  },
});

// POST /api/orders - Save a new order and log a sale transaction
router.post('/', async (req, res) => {
  try {
    const { userId, items, deliveryData, subtotal, deliveryCharge, total } = req.body;

    if (!userId || !items || !deliveryData || !subtotal || !deliveryCharge || !total) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const order = new Order({
      userId,
      items,
      deliveryData,
      subtotal,
      deliveryCharge,
      total,
    });

    const savedOrder = await order.save();

    // Log the sale transaction
    const transaction = new FinancialTransaction({
      type: 'sale',
      orderId: savedOrder._id,
      amount: savedOrder.total,
      description: `Sale for order #${savedOrder._id}`,
    });
    await transaction.save();

    res.status(201).json({ message: 'Order saved successfully', order: savedOrder });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: `Failed to save order: ${err.message}` });
  }
});

// POST /api/orders/:id/request-refund - Customer requests a refund
router.post('/:id/request-refund', async (req, res) => {
  try {
    const { refundReason, refundComments } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'completed') {
      return res.status(400).json({ error: 'Only completed orders can be refunded' });
    }

    // Check if the order is within 10 days
    const orderDate = new Date(order.createdAt);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - orderDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 10) {
      return res.status(400).json({ error: 'Refund requests are only allowed within 10 days of the order date' });
    }

    order.refundReason = refundReason;
    order.refundComments = refundComments;
    order.status = 'pending_refund';
    order.updatedAt = Date.now();
    const updatedOrder = await order.save();

    // Notify product manager via email
    const mailOptions = {
      from: 'your-email@gmail.com',
      to: 'product-manager-email@example.com', // Replace with product manager's email
      subject: `New Refund Request for Order #${order._id}`,
      text: `A new refund request has been submitted for Order #${order._id}.\n\nReason: ${refundReason}\nComments: ${refundComments || 'None'}\n\nPlease review the request in the admin panel.`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'Refund request submitted', order: updatedOrder });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: `Failed to request refund: ${err.message}` });
  }
});

// PUT /api/orders/:id/approve-refund - Admin approves the refund
router.put('/:id/approve-refund', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'pending_refund') {
      return res.status(400).json({ error: 'Order must be in pending_refund status to process refund' });
    }

    // Update order status
    order.status = 'refunded';
    order.refundedAt = Date.now();
    order.updatedAt = Date.now();
    await order.save();

    // Update inventory
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.stockQuantity += item.quantity;
        await product.save();
      }
    }

    // Log the refund transaction
    const transaction = new FinancialTransaction({
      type: 'refund',
      orderId: order._id,
      amount: -order.total,
      description: `Refund for order #${order._id}`,
    });
    await transaction.save();

    // Notify customer via email if email is provided
    if (order.deliveryData.email) {
      const mailOptions = {
        from: 'your-email@gmail.com',
        to: order.deliveryData.email,
        subject: `Refund Approved for Order #${order._id}`,
        text: `Dear ${order.deliveryData.name},\n\nYour refund request for Order #${order._id} has been approved.\nThe amount of LKR ${order.total.toFixed(2)} will be refunded to your account.\n\nThank you for shopping with us!`,
      };

      await transporter.sendMail(mailOptions);
    }

    res.json({ message: 'Refund approved and processed', order });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: `Failed to approve refund: ${err.message}` });
  }
});

// PUT /api/orders/:id/deny-refund - Admin denies the refund
router.put('/:id/deny-refund', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'pending_refund') {
      return res.status(400).json({ error: 'Order must be in pending_refund status to deny refund' });
    }

    order.status = 'completed';
    order.refundReason = null;
    order.refundComments = null;
    order.updatedAt = Date.now();
    const updatedOrder = await order.save();

    // Notify customer via email if email is provided
    if (order.deliveryData.email) {
      const mailOptions = {
        from: 'your-email@gmail.com',
        to: order.deliveryData.email,
        subject: `Refund Denied for Order #${order._id}`,
        text: `Dear ${order.deliveryData.name},\n\nYour refund request for Order #${order._id} has been denied.\nIf you have any questions, please contact our support team.\n\nThank you for shopping with us!`,
      };

      await transporter.sendMail(mailOptions);
    }

    res.json({ message: 'Refund request denied', order: updatedOrder });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: `Failed to deny refund: ${err.message}` });
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
    console.log(err);
    res.status(500).json({ error: `Failed to fetch financials: ${err.message}` });
  }
});

// GET /api/orders/user/:userId - Get orders for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).populate('items.productId');
    res.json(orders);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: `Failed to fetch orders: ${err.message}` });
  }
});

// GET /api/orders/pending-refunds - Get all pending refund orders
router.get('/pending-refunds', async (req, res) => {
  try {
    const pendingRefundOrders = await Order.find({ status: 'pending_refund' }).populate('items.productId');
    res.json(pendingRefundOrders);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: `Failed to fetch pending refunds: ${err.message}` });
  }
});

module.exports = router;