import Pettycash from "../../models/financemodel/Pettycash.js";
import pettycashbal from "../../models/financemodel/PettycashBalance.js";
import Ledger from "../../models/financemodel/Ledger.js";
import CashBook from "../../models/financemodel/CashBook.js";

export const addPettyCash = async (req, res) => {
  try {
    const { description, amount, type, category } = req.body;

    // Validate input
    if (!description || !amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid input: description and positive amount required" });
    }
    if (!["initial", "expense", "reimbursement"].includes(type)) {
      return res.status(400).json({ message: "Invalid transaction type" });
    }

    let balanceRecord = await pettycashbal.findOne();

    // Create Pettycash transaction
    const transaction = new Pettycash({
      description,
      amount,
      type,
      category,
      date: new Date(),
    });

    // Handle Initial Transaction
    if (!balanceRecord) {
      if (type !== "initial") {
        return res.status(400).json({ message: "No initial balance set. Add an initial payment first." });
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

      balanceRecord = new pettycashbal({ balance: amount, initialAmount: amount });
    } else {
      if (type === "initial") {
        return res.status(400).json({ message: "Initial amount already set. Cannot insert again." });
      }
    }

    // Save the transaction to Pettycash
    await transaction.save();

    // Handle Expense
    if (type === "expense") {
      if (balanceRecord.balance < amount) {
        return res.status(400).json({ message: "Insufficient balance. Add more funds." });
      }
      balanceRecord.balance -= amount;
    }

    // Handle Reimbursement
    else if (type === "reimbursement") {
      const totalExpenses = await Pettycash.aggregate([
        { $match: { type: "expense" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);
      const totalReimbursements = await Pettycash.aggregate([
        { $match: { type: "reimbursement" } },
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

    await balanceRecord.save();

    res.status(201).json({ message: "Transaction added successfully", transaction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding transaction", error });
  }
};

export const GetPettyCash =async (req,res)=>{

    try {
        
        const {month, year} = req.params;

        const currentDate = new Date();
        const monthNum = month ? parseInt(month, 10) : currentDate.getMonth()+1; //months are starting from 0
        const YearNum = year ? parseInt(year, 10) : currentDate.getFullYear();

        //validation
        if (isNaN(monthNum) || monthNum<1 || monthNum>12){
            return res.status(400).json({message:'Invalid month. Must be between 1 to 12'});
        }

        if(year && (isNaN(YearNum)||YearNum<2000 || YearNum>9999)){
            return res.status(400).json({message:'Invalid Year'});


        }

        const startDate = new Date(YearNum, monthNum-1,1);//month idexing from 0 so if march comes as 3 in the indexing it is shown as 3-1 =2 0,1,2 jaan,feb,march
        const EndDate = new Date(YearNum, monthNum, 0, 23,59,59,999);//date is 0 as 1 is the beginning of the month. 0 is the previous last date


        const transactions = await Pettycash.find({//filtering by date
            date:{
                $gte:startDate,
                $lte:EndDate,
            },
        }).sort({date:1});

        const BalanceRecord = await pettycashbal.findOne();
        const Currentbalance  = BalanceRecord ? BalanceRecord.balance :0;

        return res.status(200).json({
            success:true,
            transactions,
            Currentbalance,
            month:monthNum,
            year:YearNum,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error fetching petty cash transactions", error });
    console.error(error);//anith ewatath dapan
    }
    


}

export const UpdatepettyCash = async (req, res) => {
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

    const balanceRecord = await pettycashbal.findOne();
    if (!balanceRecord) {
      return res.status(404).json({ message: "No balance record found" });
    }

    const latestCashEntry = await CashBook.findOne().sort({ date: -1 });
    const currentCashBalance = latestCashEntry ? latestCashEntry.balance : 0;

    if (transaction.type === "initial") {
      if (amount !== transaction.amount || type !== "initial") {
        return res.status(400).json({ message: "Initial transaction amount and type cannot be modified" });
      }
      // Update only description and category in Pettycash
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

        // Update CashBook if amount changes
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

      // Update Pettycash transaction
      transaction.description = description;
      transaction.amount = amount;
      transaction.type = type;
      transaction.category = category;
    }

    await balanceRecord.save();
    await transaction.save();

    res.status(200).json({ message: "Transaction updated", transaction });
  } catch (error) {
    res.status(500).json({ message: "Error updating transaction", error });
    console.error(error);
  }
};

export const DeletePettycash = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Pettycash.findById(id);

    if (!transaction) {
      return res.status(404).json({ message: "No Petty Cash transaction found" });
    }

    const balanceRecord = await pettycashbal.findOne();
    if (!balanceRecord) {
      return res.status(400).json({ message: "No balance found" });
    }

    const latestCashEntry = await CashBook.findOne().sort({ date: -1 });
    const currentCashBalance = latestCashEntry ? latestCashEntry.balance : 0;

    if (transaction.type === "initial") {
      const initialCount = await Pettycash.countDocuments({ type: "initial" });
      if (initialCount <= 1 && (await Pettycash.countDocuments({ type: { $ne: "initial" } })) > 0) {
        return res.status(400).json({ message: "Cannot delete the only initial transaction with existing expenses/reimbursements" });
      }
      if (balanceRecord.balance < transaction.amount) {
        return res.status(400).json({ message: "Insufficient balance for initial transaction deletion" });
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

      // Optionally delete related CashBook entry
      await CashBook.findOneAndDelete({ referenceId: transaction._id });
      await Ledger.findOneAndDelete({ transactionId: { $in: (await CashBook.find({ referenceId: transaction._id })).map(e => e._id) } });
    }

    await balanceRecord.save();
    await Pettycash.findByIdAndDelete(id);

    res.status(200).json({ message: "Transaction deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting transaction", error });
    console.error(error);
  }
};