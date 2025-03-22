import mongoose from "mongoose";

const CashBalanceSchema = new mongoose.Schema({
  balance: { type: Number, required: true, default: 0 }, // Current cash balance
  initialAmount: { type: Number, required: true }, // Fixed initial cash amount
  lastUpdated: { type: Date, default: Date.now }, // Timestamp of last update
});

const CashBalance = mongoose.model("CashBalance", CashBalanceSchema);
export default CashBalance;