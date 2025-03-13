import Pettycash from "../models/Pettycash.js";
import pettycashbal from "../models/PettycashBalance.js";
import Ledger from "../models/Ledger.js";


export const addPettyCash = async(req,res)=>{
        try {
            
            const{description,amount, type,category} = req.body;

             const balanceRecord =await pettycashbal.findOne();

            //if no initial balance
            if(!balanceRecord){
                if(!type=='initial'){
                    return res.status(400).json({message:'No initial Balance set. Add an initial Payment'});
                }
                balanceRecord = new pettycashbal({balance :amount, initialAmount: amount});
                //cash flow ekata yanna hadanna

            }

            if(type=='initial'){
                return res.status(400).json({message:'Initial Amount already set. Cannot insert again'});
            }
            else if(type=='expense'){
                if(balanceRecord.balance<amount){
                    return res.status(400).json({message:'Insufficient balance. Add more funds'});
                }
                
                    balanceRecord.balance-=amount;                
            }
            else {
                return res.status(400).json({message:'Invalid transaction type'});
            }
            //updating the lastupdated time of the intial amount
            balanceRecord.lastUpdated = Date.now();
            
            //saving the transaction in the db in the PettyCashBalance
            await balanceRecord.save();

            const transaction = new Pettycash({description,amount,type,category});
            await transaction.save();

            //add to ledger part methanta danna

            const LedgerEntry = new Ledger({description, amount,category,source:'Petty cash'});
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
       const initialbalance = await pettycashbal.findOne();

       if(!transaction){
        return res.status(400).json({message:'No Petty Cash transactions are found'});
       }

       if(transaction.type=='initial'){
        initialbalance-=transaction.amount;

       }
       else if (transaction.type=='expense'){
        initialbalance+=transaction.amount;
       }

       await Pettycash.findByIdAndDelete(id);
       await Ledger.findOneAndDelete({source:'Petty cash', _id:id});

       res.status(200).json({message:'Transaction deleted'});


    } catch (error) {
        res.status(500).json({message:'Error deleting transaction', error});
    }
};