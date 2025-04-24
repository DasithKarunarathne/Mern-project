import express from 'express';
import multer from 'multer';
import path from 'path';
import Product from '../../models/productmodel/Product.js';
import Cart from '../../models/productmodel/Cart.js';

const router = express.Router();

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// POST /api/products - Add a new product
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, stockQuantity, category } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : undefined;

    if (!name || !description || !price || !stockQuantity || !category) {
      return res.status(400).json({ error: 'All fields (name, description, price, stockQuantity, category) are required' });
    }

    const newProduct = new Product({
      name,
      description,
      price: Number(price),
      stockQuantity: Number(stockQuantity),
      category,
      image,
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ error: `Failed to add product: ${err.message}` });
  }
});

// GET /api/products - Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    console.log("Products sent to frontend:", products); // Add this
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/products/:id - Update a product
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, stockQuantity, category } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : undefined;

    const updateProduct = {
      name,
      description,
      price: Number(price),
      stockQuantity: Number(stockQuantity),
      category,
      ...(image && { image }),
    };

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateProduct, { new: true });
    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json({ status: 'Product updated', product: updatedProduct });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: `Failed to update product: ${err.message}` });
  }
});

// DELETE /api/products/:id - Delete a product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    await Cart.updateMany({}, { $pull: { items: { productId: req.params.id } } });
    res.status(200).json({ status: 'Product deleted' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: `Failed to delete product: ${err.message}` });
  }
});

// GET /api/products/:id - Get a product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json({ status: 'Product fetched', product });
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ error: `Failed to fetch product: ${err.message}` });
  }
});

export default router;