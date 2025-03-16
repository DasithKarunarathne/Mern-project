import Pettycash from "../models/Pettycash.js";
import pettycashbal from "../models/PettycashBalance.js";
import Ledger from "../models/Ledger.js";
import CashBook from "../models/CashBook.js";


export const addPettyCash = async(req,res)=>{
        try {
            
            const{description,amount, type,category} = req.body;

            if(!description || !amount || amount<0){
                return res.status(400).json({message:'Invalid input: description and positive amount required'});
            }

             let balanceRecord =await pettycashbal.findOne();

             if (!balanceRecord) {
                if (type !== "initial") {
                  return res
                    .status(400)
                    .json({ message: "No initial Balance set. Add an initial Payment" });
                }
                // Create a new balance record for initial transaction
                balanceRecord = new pettycashbal({ balance: amount, initialAmount: amount });
              } else {
                // If balanceRecord exists, prevent re-setting initial amount
                if (type === "initial") {
                  return res
                    .status(400)
                    .json({ message: "Initial Amount already set. Cannot insert again" });
                }
              }
          
              // Handle expense transaction
              if (type === "expense") {
                if (balanceRecord.balance < amount) {
                  return res
                    .status(400)
                    .json({ message: "Insufficient balance. Add more funds" });
                }
                balanceRecord.balance -= amount;
              } else if(type=="reimbursement"){
                const neededReimbursement = balanceRecord.initialAmount - balanceRecord.balance;
                 if(amount>neededReimbursement){
                    res.status(400).json({message:'Reimbursement exceeds initial amount'});
                 }
                 balanceRecord.balance+=amount;
              }
              else if (type !== "initial") {
                // If type is neither "initial" nor "expense", it’s invalid
                return res.status(400).json({ message: "Invalid transaction type" });
              }
            //updating the lastupdated time of the intial amount
            balanceRecord.lastUpdated = Date.now();
            
            //saving the transaction in the db in the PettyCashBalance
            await balanceRecord.save();

            const transaction = new Pettycash({description,amount,type,category});
            await transaction.save();

            //add to ledger part methanta danna

            const LedgerEntry = new Ledger({description,
                 amount,
                 category,
                 source:'Petty Cash',
                 transactionId:transaction._id,
                 transactiontype:'Pettycash'  
            });
            await LedgerEntry.save();

            res.status(201).json({message: 'Transaction Added', transaction});


        } catch (error) {
            res.status(500).json({message:'Error Adding Transaction', error});
            console.error(error);
        }
}

export const GetPettyCash =async (req,res)=>{

    try {
        
        const {month, year} = req.params;

        const currentDate = new Date();
        const monthNum = month ? parseInt(month, 10) : currentDate.getMonth()+1; //months are starting from 0
        const YearNum = year ? parseInt(year, 10) : currentDate.getFullYear();

        //validation
        if (isNaN(monthNum) || monthNum<1 || monthNum>12){
            res.status(400).json({message:'Invalid month. Must be between 1 to 12'});
        }

        if(year && (isNaN(YearNum)||YearNum<2000 || YearNum>9999)){
            res.status(400).json({message:'Invalid Year'});


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

        res.status(400).json({
            success:true,
            transactions,
            Currentbalance,
            month:monthNum,
            year:YearNum,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching petty cash transactions", error });
    console.error(error);//anith ewatath dapan
    }
    


}

export const UpdatepettyCash = async (req, res) => {
    try {
      const { id } = req.params;
      const { description, amount, type, category } = req.body;
  
      // Validation
      if (!description || !amount || amount < 0) {
        return res.status(400).json({ message: "Invalid input: description and positive amount required" });
      }

      const validTypes = ["initial", "expense", "reimbursement"];
      if (!validTypes.includes(type)) {
       return res.status(400).json({ message: "Invalid transaction type" });
      }
  
      // Find the transaction
      const transaction = await Pettycash.findById(id); // Corrected: findById takes a string, not an object
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
  
      // Find the balance record
      const balanceRecord = await pettycashbal.findOne();
      if (!balanceRecord) {
        return res.status(404).json({ message: "No balance record found" });
      }
  
      // Get latest CashBook balance
      const latestCashEntry = await CashBook.findOne().sort({ date: -1 });
      const currentCashBalance = latestCashEntry ? latestCashEntry.balance : 0;
  
      const amountDifference = amount - transaction.amount;
  
      // Handle transaction types
      if (transaction.type === "initial") {
        if (type !== "initial") {
          return res.status(400).json({ message: "Cannot change initial transaction to another type" });
        }
  
        // Increase initialAmount
        if (amountDifference > 0) {
          if (currentCashBalance < amountDifference) {
            return res.status(400).json({ message: "Insufficient cash book balance to fund increase" });
          }
          balanceRecord.balance += amountDifference;
          balanceRecord.initialAmount = amount;
  
          const cashBookEntry = new CashBook({
            description: "Funding for increased petty cash initial amount",
            amount: amountDifference,
            type: "outflow",
            category: "reimbursement",
            referenceId: transaction._id,
            balance: currentCashBalance - amountDifference,
          });
          await cashBookEntry.save();
  
          const ledgerEntry = new Ledger({
            description: "Funding for increased petty cash initial amount",
            amount: amountDifference,
            category: "Fund Adjustment",
            source: "Cash Book",
            transactionId: cashBookEntry._id,
            transactiontype: "CashBook",
          });
          await ledgerEntry.save();
        }
        // Decrease initialAmount
        else if (amountDifference < 0) {
          const newBalance = balanceRecord.balance + amountDifference; // Fixed: Use balance, not initialAmount
          if (newBalance < 0) {
            return res.status(400).json({ message: "Insufficient balance to decrease initial amount" });
          }
          balanceRecord.balance = newBalance;
          balanceRecord.initialAmount = amount;
  
          if (newBalance > amount) { // Excess if balance > new initialAmount
            const excess = newBalance - amount;
            balanceRecord.balance = amount; // Cap at new initialAmount
  
            const cashBookEntry = new CashBook({
              description: "Excess from decreased petty cash initial amount",
              amount: excess,
              type: "inflow",
              category: "pettyCashExcess",
              referenceId: transaction._id,
              balance: currentCashBalance + excess,
            });
            await cashBookEntry.save();
  
            const ledgerEntry = new Ledger({
              description: "Excess from decreased petty cash initial amount",
              amount: excess,
              category: "Fund Adjustment",
              source: "Petty Cash",
              transactionId: cashBookEntry._id,
              transactiontype: "CashBook",
            });
            await ledgerEntry.save();
          }
        }
      }
      else if (transaction.type === "expense") {
        // Reverse old expense
        balanceRecord.balance += transaction.amount;
  
        if (type === "expense") {
          if (balanceRecord.balance < amount) {
            return res.status(400).json({ message: "Insufficient balance for updated expense" });
          }
          balanceRecord.balance -= amount;
        } else if (type === "reimbursement") {
          const neededReimbursement = balanceRecord.initialAmount - balanceRecord.balance;
          if (amount > neededReimbursement) {
            return res.status(400).json({ message: `Reimbursement exceeds needed amount (${neededReimbursement})` });
          }
          balanceRecord.balance += amount;
        } else {
          return res.status(400).json({ message: "Invalid type change from expense" });
        }
      }
      else if (transaction.type === "reimbursement") {
        // Reverse old reimbursement
        balanceRecord.balance -= transaction.amount;
  
        if (type === "reimbursement") {
          const neededReimbursement = balanceRecord.initialAmount - balanceRecord.balance;
          if (amount > neededReimbursement) {
            return res.status(400).json({ message: `Reimbursement exceeds needed amount (${neededReimbursement})` });
          }
          balanceRecord.balance += amount;
        } else if (type === "expense") {
          if (balanceRecord.balance < amount) {
            return res.status(400).json({ message: "Insufficient balance for updated expense" });
          }
          balanceRecord.balance -= amount;
        } else {
          return res.status(400).json({ message: "Invalid type change from reimbursement" });
        }
      }
  
      // Update balance record
      balanceRecord.lastUpdated = Date.now();
      await balanceRecord.save();
  
      // Update the Pettycash transaction
      transaction.description = description;
      transaction.amount = amount;
      transaction.type = type;
      transaction.category = category;
      await transaction.save();
  
      // Update the corresponding Ledger entry
      const ledgerEntry = await Ledger.findOne({ transactionId: id, transactiontype: "Pettycash" });
      if (ledgerEntry) {
        ledgerEntry.description = description;
        ledgerEntry.amount = amount;
        ledgerEntry.category = category;
        await ledgerEntry.save();
      }
  
      res.status(200).json({ message: "Transaction updated", transaction });
    } catch (error) {
      res.status(500).json({ message: "Error updating transaction", error });
      console.error(error);
    }
  };




export const DeletePettycash = async (req,res) => {
    
    try {
        const {id} = req.params;
        const transaction = await Pettycash.findById(id);
      

       if(!transaction){
        return res.status(400).json({message:'No Petty Cash transactions are found'});
       }

       const BalanceRecord = await pettycashbal.findOne();

       if(!BalanceRecord){
        return res.status(400).json({message:'No balance found.'});  
       }

       //cash book took the last entry 
       const latestCashEntry = await CashBook.findOne().sort({date:-1});
       const currentCashBalance = latestCashEntry ? latestCashEntry.balance : 0;


       if(transaction.type==='initial'){
        if(BalanceRecord.balance<transaction.amount){
            res.status(400).json({message:'Insufficient balance for initial transaction deletion'});
        }
        BalanceRecord.balance-=transaction.amount;

       }
       else if (transaction.type=='expense'){
        const Newbalance = BalanceRecord.balance+transaction.amount;
        if(Newbalance>BalanceRecord.initialAmount){
            const excess = Newbalance - BalanceRecord.initialAmount;
            BalanceRecord.balance=BalanceRecord.initialAmount;//stops at the initial amount excess is sent to the cash book
        

        const CashBookEntry = new CashBook({

            description:'Excess deleted petty cash',
            amount:excess,
            type:'inflow',
            category:"pettyCashExcess",
            referenceId:transaction._id,
            balance:currentCashBalance+excess,
        });

       

         const excessLedger = new Ledger({
            description:'Excess from deleted petty cash',
            amount:excess,
            category:'Petty Cash Fund adjustment',
            source:'Petty Cash',
            transactionId:CashBookEntry._id,
            transactiontype:'CashBook'
          });
            try {
                await CashBookEntry.save();
                await excessLedger.save();
            } catch (error) {
                return res.status(500).json({message:'Error saving transaction to CashBook or Ledger entry', error});
            }
                



        }
    else{
        BalanceRecord.balance=Newbalance;
    }
    
       }

       else if(transaction.type==='reimbursement') {
        if(BalanceRecord.balance<transaction.amount){
            return res.status(400).json({ message: 'Insufficient balance for reimbursement deletion' });
        }
        BalanceRecord.balance-=transaction.amount;
       }
       
       await BalanceRecord.save();

       await Pettycash.findByIdAndDelete(id);
       await Ledger.findOneAndDelete({ transactionId:id,transactiontype:'Pettycash'});

       res.status(200).json({message:'Transaction deleted'});


    } catch (error) {
        res.status(500).json({message:'Error deleting transaction', error});
    }
};