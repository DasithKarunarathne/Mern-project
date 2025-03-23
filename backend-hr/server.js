import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import dbconnection from "./config/db.js";
import employeeRouter from "./routes/Employees.js";
import portfinder from "portfinder";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: ["http://localhost:3000","http://localhost:3001"], credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => res.send("Hello world"));
app.use("/api/employee", employeeRouter);

const startServer = async () => {
  try {
    await dbconnection();
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
