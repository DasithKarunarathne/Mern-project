import mongoose from 'mongoose';

const pettyCashSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['income', 'expense'],
        required: true
    },
    category: {
        type: String,
        required: true
    },
    reference: {
        type: String,
        required: true,
        unique: true
    },
    notes: {
        type: String
    },
    approvedBy: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
}, {
    timestamps: true
});

// Add index for efficient querying by date
pettyCashSchema.index({ date: 1 });

const PettyCash = mongoose.model('PettyCash', pettyCashSchema);
export default PettyCash; 