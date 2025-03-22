import mongoose, { mongo } from "mongoose";

const PettycashSchema = new mongoose.Schema({

    date:{type:Date, default: Date.now},
    description:{type:String, required:true},
    amount:{type:Number, required:true},
    type:{type:String, enum:['initial', 'expense','reimbursement'], required:true},
    category:{type:String},
});

const PettyCash = mongoose.model('Pettycash', PettycashSchema);
export default PettyCash;