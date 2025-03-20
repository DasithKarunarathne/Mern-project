// backend/routes/cart.js
const router = require('express').Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// GET /api/cart - Get cart items
router.get('/', async (req, res) => {
  try {
    let cartItems = await Cart.find().populate('productId');
    // Filter out cart items where productId is null
    cartItems = cartItems.filter(item => item.productId !== null);
    // Remove invalid cart items from the database
    await Cart.deleteMany({ productId: { $exists: true, $eq: null } });
    res.json(cartItems);
  } catch (err) {
    res.status(500).json({ error: `Failed to fetch cart: ${err.message}` });
  }
});

// POST /api/cart - Add to cart
router.post('/', async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (product.stockQuantity < quantity) return res.status(400).json({ error: 'Insufficient stock' });

    let cartItem = await Cart.findOne({ productId });
    if (cartItem) {
      cartItem.quantity += quantity;
    } else {
      cartItem = new Cart({ productId, quantity });
    }
    await cartItem.save();
    res.status(201).json(cartItem);
  } catch (err) {
    res.status(500).json({ error: `Failed to add to cart: ${err.message}` });
  }
});

// PUT /api/cart/:id - Update cart quantity
router.put('/:id', async (req, res) => {
  const { quantity } = req.body;

  try {
    const cartItem = await Cart.findById(req.params.id);
    if (!cartItem) return res.status(404).json({ error: 'Cart item not found' });

    const product = await Product.findById(cartItem.productId);
    if (!product) {
      await Cart.findByIdAndDelete(req.params.id);
      return res.status(404).json({ error: 'Product not found, cart item removed' });
    }
    if (product.stockQuantity < quantity) return res.status(400).json({ error: 'Insufficient stock' });

    cartItem.quantity = quantity;
    await cartItem.save();
    res.json(cartItem);
  } catch (err) {
    res.status(500).json({ error: `Failed to update cart: ${err.message}` });
  }
});

// DELETE /api/cart/:id - Remove from cart
router.delete('/:id', async (req, res) => {
  try {
    const cartItem = await Cart.findByIdAndDelete(req.params.id);
    if (!cartItem) return res.status(404).json({ error: 'Cart item not found' });
    res.json({ message: 'Removed from cart' });
  } catch (err) {
    res.status(500).json({ error: `Failed to remove from cart: ${err.message}` });
  }
});

module.exports = router;