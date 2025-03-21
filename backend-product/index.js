// backend/index.js
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
  origin: 'http://localhost:3002',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));
app.use(bodyParser.json());

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

//const orderRouter = require("./routes/orders.js"); // Added: Import order router

app.use("/api/products", productRouter); // Updated: Mount at /api/products
app.use("/api/cart", cartRouter);// Updated: Mount at /api/cart
app.use('/api/deliveries', deliveryRouter);
app.use('/api/delivery-charges', deliveryChargeRouter);


//app.use("/api/orders", orderRouter); // Added: Mount order router

app.listen(PORT, () => {
    console.log(`Server is up and running on port number: ${PORT}`);
});