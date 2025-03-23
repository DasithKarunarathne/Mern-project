import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

// Import routes
//import feedbackRoutes from "./routes/feedback.js";
import salaryRoutes from "./routes/financeroutes/salaryRoutes.js";
import cashBookRoutes from "./routes/financeroutes/CashBookroutes.js";
import pettyCashRoutes from "./routes/financeroutes/PettyCashRoute.js";
import employeeRoutes from "./routes/hrroutes/Employees.js";
import ledgerRoutes from "./routes/financeroutes/LedgerRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: ["http://localhost:3000", "http://localhost:3001"], credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Routes
app.get("/", (req, res) => res.send("Hello world"));

// Finance routes
//app.use("/api/feedback", feedbackRoutes);
app.use("/api/Salary", salaryRoutes);
app.use("/api/Pettycash", pettyCashRoutes);
app.use("/api/cashbook", cashBookRoutes);
app.use("/api/ledger", ledgerRoutes);	

// HR routes
app.use("/api/employee", employeeRoutes);

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