import express from "express";
import cors from "cors";
import productRouter from "./routes/productroutes/products.js";
import cartRouter from "./routes/productroutes/cart.js";
import deliveryRouter from "./routes/productroutes/deliveries.js";
import deliveryChargeRouter from "./routes/productroutes/deliveryCharges.js";
import orderRouter from "./routes/productroutes/orders.js";

const router = express.Router();

// Add CORS configuration for product routes
router.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "x-admin-key", "Authorization", "x-auth-token", "Accept", "Origin", "X-Requested-With"],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  maxAge: 600,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Define sub-routes under /api/product
router.use("/products", productRouter);
router.use("/cart", cartRouter);
router.use("/delivery", deliveryRouter);
router.use("/delivery/charge", deliveryChargeRouter);
router.use("/orders", orderRouter);

router.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Product API is running" });
});

export default router;