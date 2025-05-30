import { Schema as _Schema, model } from "mongoose";
const Schema = _Schema;

const inventorySchema = new Schema({
    itemno: {
        type: String,
        required: true,
        unique: true
    },
    itemname: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    qty: {
        type: Number,
        required: true,
        min: 0
    },
    itemdescription: {
        type: String,
        required: true
    },
    inventorydate: {
        type: Date,
        required: true,
        default: Date.now
    },

    lastrestockdate: {
        type: Date,
        required: true,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export default model('Inventory', inventorySchema);