import mongoose from "mongoose";

const LedgerSchema = new mongoose.Schema ({
date:{type:Date, default:Date.now},
description:{type:String, required:true},
amount:{type:Number, required:true},
category:{type:String},
source:{type:String, enum: ['Petty Cash', 'Other', 'Cash Book'],required:true},
transactionId:{type:mongoose.Schema.Types.ObjectId, required:true},
transactiontype:{type:String, required:true}//Type of 
// transaction (e.g., 'Pettycash', 'SalaryPayment', 'OrderPayment')

});

const Ledger = mongoose.model('ledger',LedgerSchema );
export default Ledger;