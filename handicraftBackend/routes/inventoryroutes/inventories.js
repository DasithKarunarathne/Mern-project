import express from "express";
import Inventory from "../../models/inventorymodel/inventory.js";
import Restock from "../../models/inventorymodel/Restock.js";
import { Types } from "mongoose";


const router = express.Router();

// Helper function for calculating statistics
const calculateInventoryStats = (inventories) => {
    const stats = {
        totalItems: inventories.length,
        totalValue: 0,
        lowStockItems: 0,
        priceRanges: {
            '0-500': 0,
            '501-1000': 0,
            '1001-1500': 0,
            '1501-2000': 0,
            '2000+': 0
        },
        topItemsByQuantity: [],
        stockStatus: {
            lowStock: 0,
            inStock: 0
        },
        restockStatus: {
            pending: 0,
            inTransit: 0,
            completed: 0
        },
        monthlyTrend: [],
        inventories // Include inventories in stats for frontend
    };

    // Calculate monthly trend (last 6 months)
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = {};
    inventories.forEach(item => {
        const createdAt = new Date(item.createdAt);
        if (createdAt >= sixMonthsAgo) {
            const monthYear = createdAt.toLocaleString('default', { month: 'short', year: 'numeric' });
            monthlyData[monthYear] = (monthlyData[monthYear] || 0) + 1;
        }
    });

    stats.monthlyTrend = Object.entries(monthlyData)
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => new Date(a.month) - new Date(b.month));

    inventories.forEach(item => {
        // Calculate total inventory value
        stats.totalValue += item.price * item.qty;

        // Check for low stock
        if (item.qty <= 10) {
            stats.lowStockItems++;
            stats.stockStatus.lowStock++;
        } else {
            stats.stockStatus.inStock++;
        }

        // Categorize by price range
        const price = Number(item.price);
        if (price <= 500) stats.priceRanges['0-500']++;
        else if (price <= 1000) stats.priceRanges['501-1000']++;
        else if (price <= 1500) stats.priceRanges['1001-1500']++;
        else if (price <= 2000) stats.priceRanges['1501-2000']++;
        else stats.priceRanges['2000+']++;
    });

    // Get top 10 items by quantity
    stats.topItemsByQuantity = [...inventories]
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 10)
        .map(item => ({
            itemname: item.itemname,
            quantity: item.qty
        }));

    return stats;
};

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
        
        // Check if client wants statistics (for reports)
        if (req.query.withStats === "true") {
            const stats = calculateInventoryStats(inventories);
            return res.status(200).json({
                success: true,
                inventories,
                stats
            });
        }

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

// Report data endpoint
router.get("/report-data", async (req, res) => {
    try {
        const inventories = await Inventory.find().sort({ createdAt: -1 });
        const stats = calculateInventoryStats(inventories);

        // Get restock status counts from Restock model
        const restockCounts = await Restock.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Update restock status counts
        restockCounts.forEach(({ _id, count }) => {
            if (stats.restockStatus.hasOwnProperty(_id)) {
                stats.restockStatus[_id] = count;
            }
        });

        // Prepare data specifically for charts
        const chartData = {
            stockStatus: {
                labels: ['Low Stock', 'In Stock'],
                data: [stats.stockStatus.lowStock, stats.stockStatus.inStock]
            },
            priceDistribution: {
                labels: Object.keys(stats.priceRanges),
                data: Object.values(stats.priceRanges)
            },
            topItems: stats.topItemsByQuantity
        };

        res.status(200).json({
            success: true,
            stats,
            chartData
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: "Error generating report data",
            details: err.message
        });
    }
});

// Get Single Inventory Item
router.get("/item/:id", async (req, res) => {
    try {
        if (!Types.ObjectId.isValid(req.params.id)) {
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
        if (!Types.ObjectId.isValid(req.params.id)) {
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
        if (!Types.ObjectId.isValid(req.params.id)) {
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

// Inventory Statistics
router.get("/stats/summary", async (req, res) => {
    try {
        const inventories = await Inventory.find();
        const stats = calculateInventoryStats(inventories);

        res.status(200).json({
            success: true,
            stats
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: "Error calculating statistics",
            details: err.message
        });
    }
});

// Restock endpoints
router.get("/restock/:id", async (req, res) => {
    try {
        if (!Types.ObjectId.isValid(req.params.id)) {
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

router.put("/restock/:id", async (req, res) => {
    console.log(`PUT /inventory/restock/${req.params.id} received with body:`, req.body);
    try {
        const { id } = req.params;
        const { quantity } = req.body;

        if (!Types.ObjectId.isValid(id)) {
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