import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import productRoutes from "./productServer.js";

// Import routes
import salaryRoutes from "./routes/financeroutes/salaryRoutes.js";
import cashBookRoutes from "./routes/financeroutes/CashBookroutes.js";
import pettyCashRoutes from "./routes/financeroutes/PettyCashRoute.js";
import employeeRoutes from "./routes/hrroutes/Employees.js";
import ledgerRoutes from "./routes/financeroutes/ledgerRoutes.js";
import financialsRoutes from "./routes/financeroutes/financialstatementsRoutes.js";

// Customer
import authRoutes from "./routes/customerroutes/auth.js";

// Inventory routes
import inventoryRoutes from "./routes/inventoryroutes/inventories.js";
import restockRoutes from "./routes/inventoryroutes/restock.js";

// Chatbot routes
import chatbotRoutes from "./routes/customerroutes/chat.js";

dotenv.config();

const app = express();
app.use(express.json());

// Define __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "Uploads")));

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"], // Added for chatbot frontend
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "x-admin-key", "Authorization", "x-auth-token"],
}));

// Database connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Routes
app.get("/", (req, res) => res.send("Hello world"));

// Finance routes
app.use("/api/Salary", salaryRoutes);
app.use("/api/Pettycash", pettyCashRoutes);
app.use("/api/cashbook", cashBookRoutes);
app.use("/api/ledger", ledgerRoutes);
app.use("/api/financialStatements", financialsRoutes);

// HR routes
app.use("/api/employee", employeeRoutes);

// Product routes
app.use("/api/product", productRoutes);

// Customer
app.use("/api/customer/auth", authRoutes);
app.use("/api/customer/chat", chatbotRoutes);

// Inventory routes
app.use("/inventory", inventoryRoutes);
app.use("/inventory/restock", restockRoutes);

// Start server
const startServer = async () => {
  try {
    const server = app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(`Port ${PORT} is already in use. Trying another port...`);
        app.listen(0, () => console.log("Server running on a different available port"));
      } else {
        console.error("Server error:", error);
      }
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();