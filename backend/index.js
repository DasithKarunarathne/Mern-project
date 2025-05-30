import express from "express";
import dbconnection from "./config/db.js"; // Correct import with .js extension
import feedbackroutes from "./routes/feedback.js"; // Correct import with .js extension
//import employeeroute from "./routes/employee.js";
import salaryCalc from "./routes/salaryRoutes.js";
import CashBookroutes from "./routes/CashBookroutes.js";
import pettycash from "./routes/PettyCashRoute.js";
import dotenv from "dotenv";
import cors from "cors";
import CashBook from "./models/CashBook.js";
import { addCashBookEntry } from "./controllers/cashBook.js";
import { createProxyMiddleware } from "http-proxy-middleware"; // Add this

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
//app.use("/api/employee",employeeroute);
app.use("/api/Salary",salaryCalc);
app.use("/api/Pettycash", pettycash);
app.use("/api/cashbook", CashBookroutes);



app.use(
    "/api/employee",
    createProxyMiddleware({
      target: "http://localhost:5000", // Your friend's backend
      changeOrigin: true,
      pathRewrite: { "^/api/employee": "/api/employee" }, // Keep path as is
      onError: (err, req, res) => {
        console.error("Proxy error:", err);
        res.status(500).send("Proxy error");
      }
    })
);


// Start server
app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));