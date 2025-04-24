import express from 'express';
import Cart from '../../models/productmodel/Cart.js';
import Product from '../../models/productmodel/Product.js';

const router = express.Router();


// GET /api/cart/user/:userId - Get cart items for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    let cart = await Cart.findOne({ userId }).populate('items.productId');
    
    if (!cart) {
      return res.status(200).json({ cart: { items: [] } });
    }

    cart.items = cart.items.filter(item => item.productId !== null);
    await cart.save();

    if (cart.items.length === 0) {
      await Cart.deleteOne({ userId });
      return res.status(200).json({ cart: { items: [] } });
    }

    res.status(200).json({ cart });
  } catch (err) {
    console.error('Error fetching cart:', err);
    res.status(500).json({ error: `Failed to fetch cart: ${err.message}` });
  }
});

// POST /api/cart - Add to cart
router.post('/', async (req, res) => {
  const { productId, quantity, userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    if (product.stockQuantity < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingItem = cart.items.find(item => item.productId.toString() === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.price = product.price;
    } else {
      cart.items.push({ productId, quantity, price: product.price });
    }

    await cart.save();
    const populatedCart = await Cart.findOne({ userId }).populate('items.productId');
    res.status(201).json({ message: 'Product added to cart', cart: populatedCart });
  } catch (err) {
    console.error('Error adding to cart:', err);
    res.status(500).json({ error: `Failed to add to cart: ${err.message}` });
  }
});

// PUT /api/cart/:id - Update cart quantity
router.put('/:id', async (req, res) => {
  const { quantity, userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const cartItem = cart.items.find(item => item._id.toString() === req.params.id);
    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    const product = await Product.findById(cartItem.productId);
    if (!product) {
      cart.items = cart.items.filter(item => item._id.toString() !== req.params.id);
      await cart.save();
      return res.status(404).json({ error: 'Product not found, cart item removed' });
    }
    if (product.stockQuantity < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    cartItem.quantity = quantity;
    cartItem.price = product.price;
    await cart.save();

    const populatedCart = await Cart.findOne({ userId }).populate('items.productId');
    res.status(200).json({ cart: populatedCart });
  } catch (err) {
    console.error('Error updating cart:', err);
    res.status(500).json({ error: `Failed to update cart: ${err.message}` });
  }
});

// DELETE /api/cart/:id - Remove from cart
router.delete('/:id', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => item._id.toString() === req.params.id);
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    if (cart.items.length === 0) {
      await Cart.deleteOne({ userId });
      return res.status(200).json({ message: 'Removed from cart', cart: { items: [] } });
    }

    const populatedCart = await Cart.findOne({ userId }).populate('items.productId');
    res.status(200).json({ message: 'Removed from cart', cart: populatedCart });
  } catch (err) {
    console.error('Error removing from cart:', err);
    res.status(500).json({ error: `Failed to remove from cart: ${err.message}` });
  }
});

export default router;