const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// Helper function to generate reference number
const generateReferenceNumber = (date) => {
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `HH-${year}${month}${day}-${random}`;
};

// Create a new transaction
router.post('/create', async (req, res) => {
  try {
    const transaction = new Transaction({
      ...req.body,
      referenceNumber: generateReferenceNumber(new Date())
    });
    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get transactions by month and year
router.get('/fetchLedger/:month/:year', async (req, res) => {
  try {
    const { month, year } = req.params;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const transactions = await Transaction.find({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update transaction status
router.patch('/:id/status', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    transaction.status = req.body.status;
    await transaction.save();
    res.json(transaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update transaction reference number
router.patch('/:id/reference', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    transaction.referenceNumber = req.body.referenceNumber;
    await transaction.save();
    res.json(transaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 