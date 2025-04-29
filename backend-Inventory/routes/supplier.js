const express = require('express');
const router = express.Router();
const Supplier = require('../model/Supplier');

// Get all suppliers
router.get('/', async (req, res) => {
    console.log('GET /api/suppliers - Fetching all suppliers');
    try {
        const suppliers = await Supplier.find();
        console.log('Found suppliers:', suppliers);
        res.json(suppliers);
    } catch (error) {
        console.error('Error fetching suppliers:', error);
        res.status(500).json({ message: error.message });
    }
});

// Create a new supplier
router.post('/', async (req, res) => {
    console.log('POST /api/suppliers - Creating new supplier:', req.body);
    try {
        const supplier = new Supplier({
            name: req.body.name,
            address: req.body.address,
            email: req.body.email
        });

        const newSupplier = await supplier.save();
        console.log('Created new supplier:', newSupplier);
        res.status(201).json(newSupplier);
    } catch (error) {
        console.error('Error creating supplier:', error);
        res.status(400).json({ message: error.message });
    }
});

// Update supplier approval status
router.patch('/:id', async (req, res) => {
    console.log(`PATCH /api/suppliers/${req.params.id} - Updating supplier:`, req.body);
    try {
        const supplier = await Supplier.findById(req.params.id);
        if (!supplier) {
            console.log('Supplier not found');
            return res.status(404).json({ message: 'Supplier not found' });
        }

        if (req.body.approvalStatus) {
            supplier.approvalStatus = req.body.approvalStatus;
        }
        if (req.body.isChecked !== undefined) {
            supplier.isChecked = req.body.isChecked;
        }

        const updatedSupplier = await supplier.save();
        console.log('Updated supplier:', updatedSupplier);
        res.json(updatedSupplier);
    } catch (error) {
        console.error('Error updating supplier:', error);
        res.status(400).json({ message: error.message });
    }
});

module.exports = router; 