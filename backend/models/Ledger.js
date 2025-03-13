import mongoose from "mongoose";

const LedgerSchema = new mongoose.Schema ({
date:{type:Date, default:Date.now},
description:{type:String, required:true},
amount:{type:Number, required:true},
category:{type:String},
source:{type:String, enum: ['Petty Cash', 'Other'],required:true}

});

const Ledger = mongoose.model('ledger',LedgerSchema );
export default Ledger;