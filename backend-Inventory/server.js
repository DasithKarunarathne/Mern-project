const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const inventoryRouter = require("./routes/inventories");
const restockRouter = require("./routes/restock");
const supplierRouter = require("./routes/supplier");

dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
}));

// Middleware
app.use(bodyParser.json());

const PORT = process.env.PORT || 8070;
const URL = process.env.MONGO_URI;

// MongoDB connection
mongoose.connect(URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("MongoDB Connection success!"))
.catch(err => console.error("MongoDB Connection Error:", err));

// Routes
app.use("/api/inventories", inventoryRouter);
app.use("/api/restock", restockRouter);
app.use("/api/suppliers", supplierRouter);

// Debug middleware to log all requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Server is up and running on port number: ${PORT}`);
});
