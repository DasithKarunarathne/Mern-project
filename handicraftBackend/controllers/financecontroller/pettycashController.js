import Pettycash from "../../models/financemodel/Pettycash.js";
import pettycashbal from "../../models/financemodel/PettycashBalance.js";
import Ledger from "../../models/financemodel/Ledger.js";
import CashBook from "../../models/financemodel/CashBook.js";



// Add Petty Cash
export const addPettyCash = async (req, res) => {
  try {
    const { description, amount, type, category, month, year } = req.body;

    if (!description || !amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid input: description and positive amount required" });
    }
    if (!["initial", "expense", "reimbursement"].includes(type)) {
      return res.status(400).json({ message: "Invalid transaction type" });
    }
    if (!month || month < 1 || month > 12 || !year || year < 2000 || year > 9999) {
      return res.status(400).json({ message: "Invalid month or year" });
    }

    let balanceRecord = await pettycashbal.findOne({ month, year });

    const transaction = new Pettycash({
      description,
      amount,
      type,
      category,
      date: new Date(),
      month,
      year,
    });

    if (!balanceRecord) {
      if (type !== "initial") {
        return res.status(400).json({ message: "No initial balance set for this month. Add an initial payment first." });
      }

      const latestCashEntry = await CashBook.findOne().sort({ date: -1 });
      const currentCashBalance = latestCashEntry ? latestCashEntry.balance : 0;

      if (currentCashBalance < amount) {
        return res.status(400).json({ message: "Insufficient cash book balance to fund petty cash" });
      }

      const cashBookEntry = new CashBook({
        description: "Initial funding for petty cash",
        amount,
        type: "outflow",
        category: "Petty Cash Initial",
        referenceId: transaction._id,
        balance: currentCashBalance - amount,
      });
      await cashBookEntry.save();

      const ledgerEntry = new Ledger({
        description: "Initial funding for petty cash",
        amount,
        category: "Petty Cash Initial Funding",
        source: "Cash Book",
        transactionId: cashBookEntry._id,
        transactiontype: "CashBook",
      });
      await ledgerEntry.save();

      balanceRecord = new pettycashbal({ balance: amount, initialAmount: amount, month, year });
    } else {
      if (type === "initial") {
        return res.status(400).json({ message: "Initial amount already set for this month." });
      }
    }

    if (type === "expense") {
      if (balanceRecord.balance < amount) {
        return res.status(400).json({ message: "Insufficient balance. Add more funds." });
      }
      balanceRecord.balance -= amount;
    } else if (type === "reimbursement") {
      const totalExpenses = await Pettycash.aggregate([
        { $match: { type: "expense", month, year } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);
      const totalReimbursements = await Pettycash.aggregate([
        { $match: { type: "reimbursement", month, year } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      const totalExpensesAmount = totalExpenses.length > 0 ? totalExpenses[0].total : 0;
      const existingReimbursements = totalReimbursements.length > 0 ? totalReimbursements[0].total : 0;
      const maxReimbursement = totalExpensesAmount - existingReimbursements;

      if (amount > maxReimbursement) {
        return res.status(400).json({
          message: `Reimbursement exceeds allowable amount. Maximum allowed: ${maxReimbursement}`,
        });
      }

      balanceRecord.balance += amount;

      const latestCashEntry = await CashBook.findOne().sort({ date: -1 });
      const currentCashBalance = latestCashEntry ? latestCashEntry.balance : 0;

      if (currentCashBalance < amount) {
        return res.status(400).json({ message: "Insufficient cash book balance for reimbursement" });
      }

      const cashBookEntry = new CashBook({
        description: "Reimbursement for petty cash",
        amount,
        type: "outflow",
        category: "reimbursement",
        referenceId: transaction._id,
        balance: currentCashBalance - amount,
      });
      await cashBookEntry.save();

      const ledgerEntry = new Ledger({
        description: "Reimbursement for petty cash",
        amount,
        category: "Petty Cash Reimbursement",
        source: "Cash Book",
        transactionId: cashBookEntry._id,
        transactiontype: "CashBook",
      });
      await ledgerEntry.save();
    }

    await transaction.save();
    await balanceRecord.save();

    res.status(201).json({ message: "Transaction added successfully", transaction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding transaction", error });
  }
};

export const getPettyCash = async (req, res) => {
  try {
    const { month, year } = req.params;
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);

    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({ message: "Invalid month. Must be between 1 to 12" });
    }
    if (isNaN(yearNum) || yearNum < 2000 || yearNum > 9999) {
      return res.status(400).json({ message: "Invalid year" });
    }

    const transactions = await Pettycash.find({
      month: monthNum,
      year: yearNum,
    }).sort({ date: 1 });

    const balanceRecord = await pettycashbal.findOne({ month: monthNum, year: yearNum });
    const currentBalance = balanceRecord ? balanceRecord.balance : 0;

    res.status(200).json({
      success: true,
      transactions,
      Currentbalance: currentBalance,
      month: monthNum,
      year: yearNum,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching petty cash transactions", error });
  }
};
// Delete Petty Cash
export const deletePettyCash = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Pettycash.findById(id);

    if (!transaction) {
      return res.status(404).json({ message: "No Petty Cash transaction found" });
    }

    const balanceRecord = await pettycashbal.findOne({ month: transaction.month, year: transaction.year });
    if (!balanceRecord) {
      return res.status(400).json({ message: "No balance found for this month" });
    }

    const latestCashEntry = await CashBook.findOne().sort({ date: -1 });
    const currentCashBalance = latestCashEntry ? latestCashEntry.balance : 0;

    if (transaction.type === "initial") {
      const otherTransactionsCount = await Pettycash.countDocuments({
        month: transaction.month,
        year: transaction.year,
        type: { $ne: "initial" },
      });
      if (otherTransactionsCount > 0) {
        return res.status(400).json({
          message: "Cannot delete initial transaction while expenses or reimbursements exist",
        });
      }
      balanceRecord.balance -= transaction.amount;
    } else if (transaction.type === "expense") {
      const newBalance = balanceRecord.balance + transaction.amount;
      if (newBalance > balanceRecord.initialAmount) {
        const excess = newBalance - balanceRecord.initialAmount;
        balanceRecord.balance = balanceRecord.initialAmount;

        const cashBookEntry = new CashBook({
          description: "Excess from deleted petty cash expense",
          amount: excess,
          type: "inflow",
          category: "pettyCashExcess",
          referenceId: transaction._id,
          balance: currentCashBalance + excess,
        });
        await cashBookEntry.save();

        const ledgerEntry = new Ledger({
          description: "Excess from deleted petty cash expense",
          amount: excess,
          category: "Petty Cash Fund Adjustment",
          source: "Petty Cash",
          transactionId: cashBookEntry._id,
          transactiontype: "CashBook",
        });
        await ledgerEntry.save();
      } else {
        balanceRecord.balance = newBalance;
      }
    } else if (transaction.type === "reimbursement") {
      if (balanceRecord.balance < transaction.amount) {
        return res.status(400).json({ message: "Insufficient balance for reimbursement deletion" });
      }
      balanceRecord.balance -= transaction.amount;

      await CashBook.findOneAndDelete({ referenceId: transaction._id });
      await Ledger.findOneAndDelete({ transactionId: { $in: (await CashBook.find({ referenceId: transaction._id })).map(e => e._id) } });
    }

    await balanceRecord.save();
    await Pettycash.findByIdAndDelete(id);

    res.status(200).json({ message: "Transaction deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting transaction", error });
  }
};

// Update Petty Cash
export const updatePettyCash = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, amount, type, category } = req.body;

    if (!description || !amount || amount < 0) {
      return res.status(400).json({ message: "Invalid input: description and positive amount required" });
    }

    const transaction = await Pettycash.findById(id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const balanceRecord = await pettycashbal.findOne({ month: transaction.month, year: transaction.year });
    if (!balanceRecord) {
      return res.status(404).json({ message: "No balance record found for this month" });
    }

    const latestCashEntry = await CashBook.findOne().sort({ date: -1 });
    const currentCashBalance = latestCashEntry ? latestCashEntry.balance : 0;

    if (transaction.type === "initial") {
      if (amount !== transaction.amount || type !== "initial") {
        return res.status(400).json({ message: "Initial transaction amount and type cannot be modified" });
      }
      transaction.description = description;
      transaction.category = category;
    } else {
      const amountDifference = amount - transaction.amount;

      if (transaction.type === "expense" && type === "expense") {
        balanceRecord.balance += transaction.amount; // Reverse old expense
        if (balanceRecord.balance < amount) {
          return res.status(400).json({ message: "Insufficient balance for updated expense" });
        }
        balanceRecord.balance -= amount;
      } else if (transaction.type === "reimbursement" && type === "reimbursement") {
        balanceRecord.balance -= transaction.amount; // Reverse old reimbursement
        const neededReimbursement = balanceRecord.initialAmount - balanceRecord.balance;
        if (amount > neededReimbursement) {
          return res.status(400).json({ message: `Reimbursement exceeds needed amount (${neededReimbursement})` });
        }
        balanceRecord.balance += amount;

        if (amountDifference !== 0) {
          const cashBookEntry = await CashBook.findOne({ referenceId: transaction._id });
          if (cashBookEntry) {
            cashBookEntry.amount = amount;
            cashBookEntry.balance = currentCashBalance - amountDifference;
            await cashBookEntry.save();

            const ledgerEntry = await Ledger.findOne({ transactionId: cashBookEntry._id });
            if (ledgerEntry) {
              ledgerEntry.amount = amount;
              await ledgerEntry.save();
            }
          }
        }
      } else {
        return res.status(400).json({ message: "Cannot change transaction type" });
      }

      transaction.description = description;
      transaction.amount = amount;
      transaction.type = type;
      transaction.category = category;
    }

    await balanceRecord.save();
    await transaction.save();

    res.status(200).json({ message: "Transaction updated", transaction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating transaction", error });
  }
};

// Get Suggested Reimbursement
export const getSuggestedReimbursement = async (req, res) => {
  try {
    const { month, year } = req.query; // Changed to query params to match frontend
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12 || isNaN(yearNum) || yearNum < 2000 || yearNum > 9999) {
      return res.status(400).json({ message: "Invalid month or year" });
    }

    const totalExpenses = await Pettycash.aggregate([
      { $match: { type: "expense", month: monthNum, year: yearNum } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalReimbursements = await Pettycash.aggregate([
      { $match: { type: "reimbursement", month: monthNum, year: yearNum } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalExpensesAmount = totalExpenses.length > 0 ? totalExpenses[0].total : 0;
    const existingReimbursements = totalReimbursements.length > 0 ? totalReimbursements[0].total : 0;
    const suggestedAmount = totalExpensesAmount - existingReimbursements;

    res.status(200).json({ suggestedAmount: suggestedAmount > 0 ? suggestedAmount : 0 });
  } catch (error) {
    console.error("Error calculating suggested reimbursement:", error);
    res.status(500).json({ message: "Error calculating suggested reimbursement", error: error.message });
  }
};

export const DeletePettycash = async (req, res) => {
  try {
    const { id, month, year } = req.params;
    const transaction = await Pettycash.findById(id);

    if (!transaction) {
      return res.status(404).json({ message: "No Petty Cash transaction found" });
    }

    const balanceRecord = await pettycashbal.findOne({ month: parseInt(month), year: parseInt(year) });
    if (!balanceRecord) {
      return res.status(400).json({ message: "No balance found for this month" });
    }

    if (transaction.type === "initial") {
      const otherTransactionsCount = await Pettycash.countDocuments({
        month: parseInt(month),
        year: parseInt(year),
        type: { $ne: "initial" },
      });
      if (otherTransactionsCount > 0) {
        return res.status(400).json({
          message: "Cannot delete initial transaction while expenses or reimbursements exist",
        });
      }
      balanceRecord.balance -= transaction.amount;
    } else if (transaction.type === "expense") {
      balanceRecord.balance += transaction.amount;
    } else if (transaction.type === "reimbursement") {
      balanceRecord.balance -= transaction.amount;
    }

    await balanceRecord.save();
    await Pettycash.findByIdAndDelete(id);

    res.status(200).json({ message: "Transaction deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting transaction", error });
    console.error(error);
  }
};