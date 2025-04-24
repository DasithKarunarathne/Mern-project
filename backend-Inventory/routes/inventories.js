import express from "express";
import mongoose from "mongoose";
import Inventory from "../model/inventory.js";

const router = express.Router();

// Create Inventory Item
router.post("/add", async (req, res) => {
    try {
        const { itemno, itemname, price, qty, itemdescription, inventorydate } = req.body;

        const newInventory = new Inventory({
            itemno,
            itemname,
            price,
            qty,
            itemdescription,
            inventorydate: inventorydate || new Date()
        });

        await newInventory.save();
        res.status(201).json({ 
            success: true,
            message: "Inventory added successfully", 
            inventory: newInventory 
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ 
                success: false,
                error: "Item number must be unique" 
            });
        }
        res.status(500).json({ 
            success: false,
            error: "Error adding inventory", 
            details: err.message 
        });
    }
});

// Read All Inventory Items
router.get("/", async (req, res) => {
    try {
        const inventories = await Inventory.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            inventories 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false,
            error: "Error fetching inventories", 
            details: err.message 
        });
    }
});

// Get Single Inventory Item
router.get("/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ 
                success: false,
                error: "Invalid inventory ID" 
            });
        }

        const inventory = await Inventory.findById(req.params.id);
        if (!inventory) {
            return res.status(404).json({ 
                success: false,
                error: "Inventory item not found" 
            });
        }

        res.status(200).json({
            success: true,
            inventory
        });
    } catch (err) {
        console.error("Error fetching inventory:", err);
        res.status(500).json({
            success: false,
            error: "Error fetching inventory",
            details: err.message
        });
    }
});

// Update Inventory Item
router.put("/update/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ 
                success: false,
                error: "Invalid inventory ID" 
            });
        }

        const updatedInventory = await Inventory.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedInventory) {
            return res.status(404).json({ 
                success: false,
                error: "Inventory item not found" 
            });
        }

        res.status(200).json({
            success: true,
            message: "Inventory updated successfully",
            inventory: updatedInventory
        });
    } catch (err) {
        console.error("Error updating inventory:", err);

        if (err.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                error: "Validation failed",
                details: Object.values(err.errors).map(e => e.message)
            });
        }

        res.status(500).json({
            success: false,
            error: "Error updating inventory",
            details: err.message
        });
    }
});

// Delete Inventory Item
router.delete("/delete/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ 
                success: false,
                error: "Invalid inventory ID" 
            });
        }

        const deletedInventory = await Inventory.findByIdAndDelete(req.params.id);
        if (!deletedInventory) {
            return res.status(404).json({ 
                success: false,
                error: "Inventory item not found" 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: "Inventory deleted successfully" 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false,
            error: "Error deleting inventory", 
            details: err.message 
        });
    }
});

// Add this route before module.exports
router.get("/restock/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ 
                success: false,
                error: "Invalid inventory ID" 
            });
        }

        const inventory = await Inventory.findById(req.params.id);
        if (!inventory) {
            return res.status(404).json({ 
                success: false,
                error: "Inventory item not found" 
            });
        }

        res.status(200).json({
            success: true,
            inventory
        });
    } catch (err) {
        console.error("Error fetching inventory for restock:", err);
        res.status(500).json({
            success: false,
            error: "Error fetching inventory",
            details: err.message
        });
    }
});

// Keep the existing PUT /restock/:id endpoint
router.put("/restock/:id", async (req, res) => {
    console.log(`PUT /inventory/restock/${req.params.id} received with body:`, req.body);
    try {
        const { id } = req.params;
        const { quantity } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.log(`Invalid ID: ${id}`);
            return res.status(400).json({ success: false, error: "Invalid inventory ID" });
        }

        if (!quantity || isNaN(quantity) || quantity <= 0) {
            return res.status(400).json({ success: false, error: "Invalid restock quantity" });
        }

        const inventory = await Inventory.findById(id);
        if (!inventory) {
            return res.status(404).json({ success: false, error: "Inventory item not found" });
        }

        inventory.qty += parseInt(quantity);
        await inventory.save();

        res.status(200).json({
            success: true,
            message: "Inventory restocked successfully",
            inventory
        });
    } catch (err) {
        console.error("Error restocking inventory:", err);
        res.status(500).json({
            success: false,
            error: "Error restocking inventory",
            details: err.message
        });
    }
});

export default router;