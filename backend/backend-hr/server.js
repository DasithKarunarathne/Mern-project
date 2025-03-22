import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import dbconnection from "./config/db.js";
import employeeRouter from "./routes/Employees.js";
import portfinder from "portfinder";

dotenv.config();
const app = express();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"], // Allow both frontends
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => res.send("Hello world"));
app.use("/api/employee", employeeRouter);

const startServer = async () => {
  try {
    await dbconnection(); // Ensure DB is connected

    // Find an available port if the default one is in use
    const PORT = await portfinder.getPortPromise({ port: process.env.PORT || 5000 });

    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on PORT ${PORT}`);
    });

    server.on("error", (error) => {
      console.error("Server error:", error);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
