const express = require('express');
const router = express.Router();
const Restock = require('../model/restock');
const Inventory = require('../model/inventory');
const mongoose = require('mongoose');

// Create a new restock order
router.post('/create', async (req, res) => {
    try {
        const { itemId, minimumQuantity, restockLevel, restockDate } = req.body;
        
        if (!mongoose.Types.ObjectId.isValid(itemId)) {
            return res.status(400).json({ 
                success: false,
                error: 'Invalid inventory ID' 
            });
        }

        const inventory = await Inventory.findById(itemId);
        if (!inventory) {
            return res.status(404).json({ 
                success: false,
                error: 'Inventory item not found' 
            });
        }

        // Check if there's already a pending restock order for this item
        const existingRestock = await Restock.findOne({
            itemId,
            status: 'pending'
        });

        if (existingRestock) {
            return res.status(400).json({
                success: false,
                error: 'A pending restock order already exists for this item'
            });
        }

        const restock = new Restock({
            itemId,
            itemNo: inventory.itemno,
            itemName: inventory.itemname,
            currentQuantity: inventory.qty,
            minimumQuantity,
            restockLevel,
            restockDate,
            status: 'pending'
        });

        await restock.save();
        res.status(201).json({
            success: true,
            message: 'Restock order created successfully',
            restock
        });
    } catch (error) {
        console.error('Error creating restock order:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error creating restock order',
            details: error.message 
        });
    }
});

// Get all restock orders
router.get('/', async (req, res) => {
    try {
        const restocks = await Restock.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            restocks
        });
    } catch (error) {
        console.error('Error fetching restock orders:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error fetching restock orders',
            details: error.message 
        });
    }
});

// Get restock order by ID
router.get('/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ 
                success: false,
                error: 'Invalid restock order ID' 
            });
        }

        const restock = await Restock.findById(req.params.id);
        if (!restock) {
            return res.status(404).json({
                success: false,
                error: 'Restock order not found'
            });
        }

        res.status(200).json({
            success: true,
            restock
        });
    } catch (error) {
        console.error('Error fetching restock order:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error fetching restock order',
            details: error.message 
        });
    }
});

// Update restock status
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ 
                success: false,
                error: 'Invalid restock order ID' 
            });
        }

        if (!['pending', 'in_transit', 'completed'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status value'
            });
        }

        const restock = await Restock.findById(req.params.id);
        if (!restock) {
            return res.status(404).json({
                success: false,
                error: 'Restock order not found'
            });
        }

        // If status is being changed to completed, update inventory quantity
        if (status === 'completed' && restock.status !== 'completed') {
            const inventory = await Inventory.findById(restock.itemId);
            if (inventory) {
                inventory.qty += restock.restockLevel;
                await inventory.save();
            }
        }

        restock.status = status;
        await restock.save();

        res.status(200).json({
            success: true,
            message: 'Restock status updated successfully',
            restock
        });
    } catch (error) {
        console.error('Error updating restock status:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error updating restock status',
            details: error.message 
        });
    }
});

// Delete restock order
router.delete('/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ 
                success: false,
                error: 'Invalid restock order ID' 
            });
        }

        const restock = await Restock.findByIdAndDelete(req.params.id);
        if (!restock) {
            return res.status(404).json({
                success: false,
                error: 'Restock order not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Restock order deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting restock order:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error deleting restock order',
            details: error.message 
        });
    }
});

module.exports = router; 