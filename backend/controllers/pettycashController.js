import Pettycash from "../models/Pettycash.js";
import pettycashbal from "../models/PettycashBalance.js";
import Ledger from "../models/Ledger.js";
import CashBook from "../models/CashBook.js";


export const addPettyCash = async(req,res)=>{
        try {
            
            const{description,amount, type,category} = req.body;

            if(!description || !amount || !amount<0){
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
        const transactions = await Pettycash.find();
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({message:'Error fetching transactions',error });
    }

}

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