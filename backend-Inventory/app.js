const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const inventoryRouter = require("./routes/inventories");
const restockRouter = require("./routes/restock");

app.use("/inventories", inventoryRouter);
app.use("/restock", restockRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app; 