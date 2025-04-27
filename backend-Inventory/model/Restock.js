const mongoose = require('mongoose');

const restockSchema = new mongoose.Schema({
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Inventory',
        required: true
    },
    itemNo: {
        type: String,
        required: true
    },
    itemName: {
        type: String,
        required: true
    },
    currentQuantity: {
        type: Number,
        required: true
    },
    minimumQuantity: {
        type: Number,
        required: true,
        default: 20
    },
    restockLevel: {
        type: Number,
        required: true
    },
    restockDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'in_transit', 'completed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Restock', restockSchema); 