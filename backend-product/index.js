const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const app = express();
const path = require('path');

require("dotenv").config();
console.log("MongoDB URL:", process.env.MONGO_URL);

const PORT = process.env.PORT || 8080;

// Enable CORS for the frontend
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-admin-key'], // Add x-admin-key to allowed headers
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const URL = process.env.MONGO_URL;

mongoose.connect(URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDB connection success");
}).on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

const productRouter = require("./routes/products.js");
const cartRouter = require("./routes/cart.js");
const deliveryRouter = require('./routes/deliveries.js');
const deliveryChargeRouter = require('./routes/deliveryCharges.js');
const orderRouter = require("./routes/orders.js");

app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);
app.use('/api/delivery', deliveryRouter);
app.use('/api/delivery/charge', deliveryChargeRouter);
app.use("/api/orders", orderRouter);

// Add a basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is up and running on port number: ${PORT}`);
});