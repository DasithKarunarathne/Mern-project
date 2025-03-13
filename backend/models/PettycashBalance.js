import mongoose, { mongo } from "mongoose";

const PettyCashBalanceSchema = new mongoose.Schema({
    balance: { type: Number, required: true, default: 0 }, // Current balance of petty cash
    initialAmount: { type: Number, required: true }, // Fixed initial amount
    lastUpdated: { type: Date, default: Date.now } // Timestamp of the last update
});

const pettycashbal = mongoose.model('PettyCashBal', PettyCashBalanceSchema);
export default pettycashbal;