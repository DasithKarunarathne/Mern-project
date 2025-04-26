import mongoose from "mongoose";

const PettyCashBalanceSchema = new mongoose.Schema({
  balance: { type: Number, required: true, default: 0 }, // Current balance of petty cash for the month
  initialAmount: { type: Number, required: true }, // Fixed initial amount for the month
  month: { type: Number, required: true, min: 1, max: 12 }, // Month (1-12)
  year: { type: Number, required: true, min: 2000, max: 9999 }, // Year
  lastUpdated: { type: Date, default: Date.now }, // Timestamp of the last update
});

// Optional: Add a unique index to prevent duplicate records for the same month/year
PettyCashBalanceSchema.index({ month: 1, year: 1 }, { unique: true });

const PettyCashBalance = mongoose.model("PettyCashBalance", PettyCashBalanceSchema);
export default PettyCashBalance;