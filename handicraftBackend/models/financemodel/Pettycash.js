import mongoose from "mongoose"; // Simplified import, no need for { mongo }

const PettycashSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ["initial", "expense", "reimbursement"], required: true },
  category: { type: String },
  month: { type: Number, required: true, min: 1, max: 12 }, // Added for monthly scoping
  year: { type: Number, required: true, min: 2000, max: 9999 }, // Added for monthly scoping
});

// Optional: Add an index for faster queries by month and year
PettycashSchema.index({ month: 1, year: 1 });

const PettyCash = mongoose.model("Pettycash", PettycashSchema);
export default PettyCash;