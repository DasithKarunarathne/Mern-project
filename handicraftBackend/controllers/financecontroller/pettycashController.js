import Pettycash from "../../models/financemodel/Pettycash.js";
import PettyCashBalance from "../../models/financemodel/PettycashBalance.js";
import Ledger from "../../models/financemodel/Ledger.js";
import CashBook from "../../models/financemodel/CashBook.js";



// Add Petty Cash
export const addPettyCash = async (req, res) => {
  try {
    const { description, amount: rawAmount, type, category, month, year } = req.body;
    const amount = Number(rawAmount); // Explicit conversion to number

    if (!description || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: "Invalid input: description and positive amount required" });
    }
    if (!["initial", "expense", "reimbursement"].includes(type)) {
      return res.status(400).json({ message: "Invalid transaction type" });
    }
    if (!month || month < 1 || month > 12 || !year || year < 2000 || year > 9999) {
      return res.status(400).json({ message: "Invalid month or year" });
    }

    let balanceRecord = await PettyCashBalance.findOne({ month, year });

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
      const currentCashBalance = latestCashEntry ? Number(latestCashEntry.balance) : 0;

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

      balanceRecord = new PettyCashBalance({ 
        balance: Number(amount), 
        initialAmount: Number(amount), 
        month, 
        year 
      });
    } else {
      if (type === "initial") {
        return res.status(400).json({ message: "Initial amount already set for this month." });
      }
    }

    if (type === "expense") {
      const { remainingBalance } = await calculateReimbursementDetails(month, year);
      if (remainingBalance < amount) {
        return res.status(400).json({ 
          message: "Insufficient balance. Add more funds.",
          details: {
            currentBalance: remainingBalance,
            requestedAmount: amount,
            deficit: Number(amount) - Number(remainingBalance)
          }
        });
      }
      balanceRecord.balance = Number(balanceRecord.balance) - Number(amount);
    } else if (type === "reimbursement") {
      const { availableForReimbursement } = await calculateReimbursementDetails(month, year);
      if (amount > availableForReimbursement) {
        return res.status(400).json({
          message: `Reimbursement exceeds allowable amount.`,
          details: {
            maximumAllowed: availableForReimbursement,
            requestedAmount: amount,
            excess: Number(amount) - Number(availableForReimbursement)
          }
        });
      }
      balanceRecord.balance = Number(balanceRecord.balance) + Number(amount);

      const latestCashEntry = await CashBook.findOne().sort({ date: -1 });
      const currentCashBalance = latestCashEntry ? Number(latestCashEntry.balance) : 0;

      if (currentCashBalance < amount) {
        return res.status(400).json({ message: "Insufficient cash book balance for reimbursement" });
      }

      const cashBookEntry = new CashBook({
        description: "Reimbursement for petty cash",
        amount,
        type: "outflow",
        category: "reimbursement",
        referenceId: transaction._id,
        balance: Number(currentCashBalance) - Number(amount),
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

    res.status(201).json({ 
      message: "Transaction added successfully", 
      transaction,
      currentBalance: Number(balanceRecord.balance)
    });
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

    const balanceRecord = await PettyCashBalance.findOne({ month: monthNum, year: yearNum });
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

    const balanceRecord = await PettyCashBalance.findOne({ 
      month: transaction.month, 
      year: transaction.year 
    });
    
    if (!balanceRecord) {
      return res.status(400).json({ message: "No balance record found for this month" });
    }

    const latestCashEntry = await CashBook.findOne().sort({ date: -1 });
    const currentCashBalance = latestCashEntry ? Number(latestCashEntry.balance) : 0;

    // Check if deleting initial transaction
    if (transaction.type === "initial") {
      // First check if this is the only initial transaction for this month/year
      const initialTransactionsCount = await Pettycash.countDocuments({
        month: transaction.month,
        year: transaction.year,
        type: "initial"
      });

      const otherTransactionsCount = await Pettycash.countDocuments({
        month: transaction.month,
        year: transaction.year,
        type: { $ne: "initial" }
      });
      
      // Cannot delete if it's the only initial transaction and there are other transactions
      if (initialTransactionsCount === 1 && otherTransactionsCount > 0) {
        const expensesCount = await Pettycash.countDocuments({ 
          month: transaction.month, 
          year: transaction.year, 
          type: "expense" 
        });
        const reimbursementsCount = await Pettycash.countDocuments({ 
          month: transaction.month, 
          year: transaction.year, 
          type: "reimbursement" 
        });

        return res.status(400).json({
          message: "Cannot delete the initial transaction while expenses or reimbursements exist",
          details: {
            expensesCount,
            reimbursementsCount,
            totalTransactions: otherTransactionsCount,
            reason: "You must first delete all expenses and reimbursements before deleting the initial transaction"
          }
        });
      }

      // Check if deleting would result in insufficient balance
      if (balanceRecord.balance < transaction.amount) {
        return res.status(400).json({ 
          message: "Cannot delete initial transaction: insufficient balance",
          details: {
            currentBalance: balanceRecord.balance,
            initialAmount: transaction.amount,
            deficit: transaction.amount - balanceRecord.balance,
            reason: "The current balance is less than the initial amount, suggesting there are unresolved transactions"
          }
        });
      }

      // If we can delete, handle the deletion of initial transaction
      balanceRecord.balance = Number(balanceRecord.balance) - Number(transaction.amount);
      balanceRecord.initialAmount = Number(balanceRecord.initialAmount) - Number(transaction.amount);
      
      // Delete associated CashBook and Ledger entries
      await CashBook.findOneAndDelete({ referenceId: transaction._id });
      await Ledger.findOneAndDelete({ 
        transactionId: { 
          $in: (await CashBook.find({ referenceId: transaction._id })).map(e => e._id) 
        } 
      });
    } else if (transaction.type === "expense") {
      const newBalance = Number(balanceRecord.balance) + Number(transaction.amount);
      
      // Check if the new balance would exceed initial amount
      if (newBalance > balanceRecord.initialAmount) {
        const excess = newBalance - balanceRecord.initialAmount;
        balanceRecord.balance = Number(balanceRecord.initialAmount);

        // Create CashBook entry for excess amount
        const cashBookEntry = new CashBook({
          description: "Excess from deleted petty cash expense",
          amount: excess,
          type: "inflow",
          category: "pettyCashExcess",
          referenceId: transaction._id,
          balance: Number(currentCashBalance) + Number(excess),
          date: new Date()
        });
        await cashBookEntry.save();

        // Create corresponding Ledger entry
        const ledgerEntry = new Ledger({
          description: "Excess from deleted petty cash expense",
          amount: excess,
          category: "Petty Cash Fund Adjustment",
          source: "Petty Cash",
          transactionId: cashBookEntry._id,
          transactiontype: "CashBook",
          date: new Date()
        });
        await ledgerEntry.save();
      } else {
        balanceRecord.balance = newBalance;
      }
    } else if (transaction.type === "reimbursement") {
      if (balanceRecord.balance < transaction.amount) {
        return res.status(400).json({ 
          message: "Cannot delete reimbursement: would result in negative balance",
          details: {
            currentBalance: balanceRecord.balance,
            reimbursementAmount: transaction.amount,
            deficit: transaction.amount - balanceRecord.balance,
            reason: "Deleting this reimbursement would make the balance negative"
          }
        });
      }
      
      balanceRecord.balance = Number(balanceRecord.balance) - Number(transaction.amount);

      // Delete associated CashBook and Ledger entries
      await CashBook.findOneAndDelete({ referenceId: transaction._id });
      await Ledger.findOneAndDelete({ 
        transactionId: { 
          $in: (await CashBook.find({ referenceId: transaction._id })).map(e => e._id) 
        } 
      });
    }

    // Save balance changes and delete the transaction
    await balanceRecord.save();
    await Pettycash.findByIdAndDelete(id);

    // Return success with updated balance information
    res.status(200).json({ 
      message: "Transaction deleted successfully",
      updatedBalance: Number(balanceRecord.balance),
      initialAmount: Number(balanceRecord.initialAmount),
      transactionType: transaction.type,
      details: {
        transactionDeleted: true,
        balanceUpdated: true,
        type: transaction.type
      }
    });
  } catch (error) {
    console.error("Error in deletePettyCash:", error);
    res.status(500).json({ 
      message: "Error deleting transaction", 
      error: error.message,
      details: {
        errorType: error.name,
        errorMessage: error.message
      }
    });
  }
};

// Update Petty Cash
export const updatePettyCash = async (req, res) => {
  try {
    const { id } = req.params;
    const { description: newDescription, amount: rawAmount, type: newType, category: newCategory } = req.body;
    const amount = Number(rawAmount);

    if (!newDescription || isNaN(amount) || amount < 0) {
      return res.status(400).json({ message: "Invalid input: description and positive amount required" });
    }

    const transaction = await Pettycash.findById(id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const balanceRecord = await PettyCashBalance.findOne({ month: transaction.month, year: transaction.year });
    if (!balanceRecord) {
      return res.status(404).json({ message: "No balance record found for this month" });
    }

    const latestCashEntry = await CashBook.findOne().sort({ date: -1 });
    const currentCashBalance = latestCashEntry ? Number(latestCashEntry.balance) : 0;

    if (transaction.type === "initial") {
      if (amount !== Number(transaction.amount) || newType !== "initial") {
        return res.status(400).json({ message: "Initial transaction amount and type cannot be modified" });
      }
      transaction.description = newDescription;
      transaction.category = newCategory;
    } else {
      const amountDifference = Number(amount) - Number(transaction.amount);

      if (transaction.type === "expense" && newType === "expense") {
        balanceRecord.balance = Number(balanceRecord.balance) + Number(transaction.amount); // Reverse old expense
        if (balanceRecord.balance < amount) {
          return res.status(400).json({ 
            message: "Insufficient balance for updated expense",
            details: {
              currentBalance: balanceRecord.balance,
              requestedAmount: amount,
              deficit: amount - balanceRecord.balance
            }
          });
        }
        balanceRecord.balance = Number(balanceRecord.balance) - Number(amount);
      } else if (transaction.type === "reimbursement" && newType === "reimbursement") {
        balanceRecord.balance = Number(balanceRecord.balance) - Number(transaction.amount); // Reverse old reimbursement
        const neededReimbursement = Number(balanceRecord.initialAmount) - Number(balanceRecord.balance);
        if (amount > neededReimbursement) {
          return res.status(400).json({ 
            message: `Reimbursement exceeds needed amount`,
            details: {
              maximumAllowed: neededReimbursement,
              requestedAmount: amount,
              excess: amount - neededReimbursement
            }
          });
        }
        balanceRecord.balance = Number(balanceRecord.balance) + Number(amount);

        if (amountDifference !== 0) {
          const cashBookEntry = await CashBook.findOne({ referenceId: transaction._id });
          if (cashBookEntry) {
            cashBookEntry.amount = amount;
            cashBookEntry.balance = Number(currentCashBalance) - Number(amountDifference);
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

      transaction.description = newDescription;
      transaction.amount = amount;
      transaction.type = newType;
      transaction.category = newCategory;
    }

    await balanceRecord.save();
    await transaction.save();

    res.status(200).json({ 
      message: "Transaction updated successfully", 
      transaction,
      currentBalance: Number(balanceRecord.balance)
    });
  } catch (error) {
    console.error("Error in updatePettyCash:", error);
    res.status(500).json({ 
      message: "Error updating transaction", 
      error: error.message 
    });
  }
};

// Add this function to handle reimbursement calculations
const calculateReimbursementDetails = async (month, year) => {
  const balanceRecord = await PettyCashBalance.findOne({ month, year });
  if (!balanceRecord) {
    throw new Error('No petty cash record found for this period');
  }

  // Get all expenses for the month
  const expenses = await Pettycash.find({
    month,
    year,
    type: 'expense'
  }).sort({ date: 1 });

  // Get all reimbursements for the month
  const reimbursements = await Pettycash.find({
    month,
    year,
    type: 'reimbursement'
  }).sort({ date: 1 });

  const totalExpenses = expenses.reduce((sum, exp) => Number(sum) + Number(exp.amount), 0);
  const totalReimbursements = reimbursements.reduce((sum, reim) => Number(sum) + Number(reim.amount), 0);
  
  // Calculate remaining balance from initial amount
  const remainingFromInitial = Number(balanceRecord.initialAmount) - Number(totalExpenses) + Number(totalReimbursements);
  
  // Calculate how much more can be reimbursed
  const availableForReimbursement = Number(totalExpenses) - Number(totalReimbursements);

  return {
    initialAmount: Number(balanceRecord.initialAmount),
    totalExpenses: Number(totalExpenses),
    totalReimbursements: Number(totalReimbursements),
    remainingBalance: Number(remainingFromInitial),
    availableForReimbursement: availableForReimbursement > 0 ? Number(availableForReimbursement) : 0,
    expenses,
    reimbursements
  };
};

// Update the getSuggestedReimbursement endpoint
export const getSuggestedReimbursement = async (req, res) => {
  try {
    const { month, year } = req.query;
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12 || 
        isNaN(yearNum) || yearNum < 2000 || yearNum > 9999) {
      return res.status(400).json({ message: "Invalid month or year" });
    }

    const reimbursementDetails = await calculateReimbursementDetails(monthNum, yearNum);
    
    res.status(200).json({
      suggestedAmount: reimbursementDetails.availableForReimbursement,
      details: {
        initialAmount: reimbursementDetails.initialAmount,
        totalExpenses: reimbursementDetails.totalExpenses,
        totalReimbursements: reimbursementDetails.totalReimbursements,
        remainingBalance: reimbursementDetails.remainingBalance
      }
    });
  } catch (error) {
    console.error("Error calculating suggested reimbursement:", error);
    res.status(500).json({ 
      message: "Error calculating suggested reimbursement", 
      error: error.message 
    });
  }
};

// Add this function to track running balance
const calculateRunningBalance = async (month, year) => {
  const balanceRecord = await PettyCashBalance.findOne({ month, year });
  if (!balanceRecord) return 0;

  const transactions = await Pettycash.find({ 
    month, 
    year 
  }).sort({ date: 1 });

  let runningBalance = balanceRecord.initialAmount;
  const balanceHistory = transactions.map(trans => {
    if (trans.type === 'expense') {
      runningBalance -= trans.amount;
    } else if (trans.type === 'reimbursement') {
      runningBalance += trans.amount;
    }
    return {
      transactionId: trans._id,
      date: trans.date,
      type: trans.type,
      amount: trans.amount,
      balance: runningBalance
    };
  });

  return {
    initialAmount: balanceRecord.initialAmount,
    currentBalance: runningBalance,
    balanceHistory
  };
};