import express from "express";
import productRouter from "./routes/productroutes/products.js";
import cartRouter from "./routes/productroutes/cart.js";
import deliveryRouter from "./routes/productroutes/deliveries.js";
import deliveryChargeRouter from "./routes/productroutes/deliveryCharges.js";
import orderRouter from "./routes/productroutes/orders.js";

const router = express.Router();

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