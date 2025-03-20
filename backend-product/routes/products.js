// backend/routes/products.js
const router = require("express").Router();
const Product = require("../models/Product.js");
const Cart = require("../models/Cart.js");
const multer = require('multer');
const path = require('path');

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Log the schema to verify its fields
console.log(Product.schema.obj);

// POST /api/products - Add a new product
router.route("/").post(upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, stockQuantity, category } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : undefined;

    // Validate required fields
    if (!name || !description || !price || !stockQuantity || !category) {
      return res.status(400).json({ error: 'All fields (name, description, price, stockQuantity, category) are required' });
    }

    const newProduct = new Product({
      name,
      description,
      price: Number(price),
      stockQuantity: Number(stockQuantity),
      category,
      image
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: `Failed to add product: ${err.message}` });
  }
});

// GET /api/products - Get all products
router.route("/").get(async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/products/:id - Update a product
router.route("/:id").put(upload.single('image'), async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, description, price, stockQuantity, category } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : undefined;

    const updateProduct = {
      name,
      description,
      price: Number(price),
      stockQuantity: Number(stockQuantity),
      category,
      ...(image && { image }) // Only update image if a new one is uploaded
    };

    const updatedProduct = await Product.findByIdAndUpdate(userId, updateProduct, { new: true });
    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json({ status: "Product updated", product: updatedProduct });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: `Failed to update product: ${err.message}` });
  }
});

// DELETE /api/products/:id - Delete a product
router.route("/:id").delete(async (req, res) => {
  try {
    const userId = req.params.id;
    const product = await Product.findByIdAndDelete(userId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    // Remove all cart items referencing this product
    await Cart.deleteMany({ productId: userId });
    res.status(200).json({ status: "Product deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: `Failed to delete product: ${err.message}` });
  }
});

// GET /api/products/:id - Get a product by ID
router.route("/:id").get(async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json({ status: "Product fetched", product });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: `Failed to fetch product: ${err.message}` });
  }
});

module.exports = router;