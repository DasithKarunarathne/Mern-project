import mongoose from "mongoose";

const CashBookSchema = new mongoose.Schema({
    date:{type:Date, default:Date.now},
    description:{type:String, required:true},
    amount:{type:Number, required:true},
    type:{type:String, enum: ['inflow', 'outflow'], required:true },
    category:{type: String, enum: ['salary', 'reimbursement', 'order income', 'pettyCashExcess', 'initial cash']},
    referenceId:{type:mongoose.Schema.Types.ObjectId},
    balance: { type: Number, required: true }
});

const CashBook = mongoose.model('CashBook',CashBookSchema);
export default CashBook;