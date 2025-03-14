import express from "express";
import dbconnection from "./config/db.js"; // Correct import with .js extension
import feedbackroutes from "./routes/feedback.js"; // Correct import with .js extension
import employeeroute from "./routes/employee.js";
import salaryCalc from "./routes/salaryRoutes.js";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json()); // Use express.json() instead of body-parser
app.use(express.urlencoded({ extended: true }));

// Database connection
dbconnection();

// Routes
app.get("/", (req, res) => res.send("Hello world"));

app.use("/api/feedback", feedbackroutes); // Feedback route
app.use("/api/employee",employeeroute);
app.use("/api/Salary",salaryCalc);


// Start server
app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));