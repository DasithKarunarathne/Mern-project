import express from "express";
import dbconnection from "./config/db.js";
import employeeRouter from "./routes/Employees.js";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config(); // Load environment variables

// Debug: Log the MONGO_URI
console.log("MONGO_URI:", process.env.MONGO_URI);

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
dbconnection();

// Routes
app.get("/", (req, res) => res.send("Hello world"));


app.use("/api/employee", employeeRouter);
// Start server
app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));