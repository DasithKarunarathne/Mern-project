import CashBook from "../models/CashBook.js";
import Ledger from "../models/Ledger.js";
import CashBalance from "../models/CashBalance.js";

export const addCashBookEntry = async (req, res) => {
  try {
    const { description, amount, type, category } = req.body;

    // Input validation
    if (!description || !amount || amount <= 0 || !type || !category) {
      return res.status(400).json({ message: "Invalid input: All fields are required" });
    }

    // Get the latest cash balance
    let cashBalanceRecord = await CashBalance.findOne();
    if (!cashBalanceRecord) {
      // Initialize cash balance if it doesn't exist
      cashBalanceRecord = new CashBalance({
        balance: amount && type === "inflow" ? amount : 0,
        initialAmount: amount && type === "inflow" ? amount : 0
      });
      await cashBalanceRecord.save();
    } else {
      // Calculate new balance
      let newBalance = Number(cashBalanceRecord.balance); // Ensure numeric value
      if (type === "inflow") {
        newBalance += Number(amount);
      } else if (type === "outflow") {
        if (newBalance < amount) {
          return res.status(400).json({ message: "Insufficient cash balance" });
        }
        newBalance -= Number(amount);
      } else {
        return res.status(400).json({ message: "Invalid transaction type" });
      }
      
      // Update balance before creating new entry
      cashBalanceRecord.balance = newBalance;
    }

    // Create CashBook entry
    const cashBookEntry = new CashBook({
      description,
      amount,
      type,
      category,
      balance: cashBalanceRecord.balance,
      date: new Date(),
    });
    await cashBookEntry.save();

    // Update CashBalance
    cashBalanceRecord.lastUpdated = Date.now();
    await cashBalanceRecord.save();

    // Create Ledger entry
    const ledgerEntry = new Ledger({
      description,
      amount,
      category,
      source: "Cash Book",
      transactionId: cashBookEntry._id,
      transactiontype: "CashBook",
      
    });
    await ledgerEntry.save();

    res.status(201).json({ message: "Cash book entry added successfully", cashBookEntry });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding cash book entry", error });
  }
};




// Get all cash book entries
export const getCashBookEntries = async (req, res) => {
  try {
    const entries = await CashBook.find();
    res.status(200).json(entries);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cash book entries", error });
  }
};

// Get cash book entries for a specific month and year
export const getcashBookentriesbyMonth = async (req, res) => {
  try {
    const month = parseInt(req.params.month);
    const year = parseInt(req.params.year);

    // Validate month and year
    if (isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({ message: "Invalid month. Must be between 1 and 12." });
    }
    if (isNaN(year) || year < 2000 || year > 9999) {
      return res.status(400).json({ message: "Invalid year. Must be between 2000 and 9999." });
    }

    // Calculate the start and end dates for the given month and year
    const startDate = new Date(year, month - 1, 1); // Month is 0-indexed in JavaScript
    const endDate = new Date(year, month, 0, 23, 59, 59, 999); // Last day of the month

    // Fetch transactions from the database
    const entries = await CashBook.find({
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ date: 1 });

    // Send the response
    res.status(200).json({
      success: true,
      data: entries,
      message: "Cash book entries fetched successfully.",
    });
  } catch (error) {
    console.error("Error fetching cash book entries:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch cash book entries.",
      error: error.message,
    });
  }
};