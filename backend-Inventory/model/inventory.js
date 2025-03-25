import mongoose from "mongoose";

const { Schema } = mongoose;

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
    }
}, { timestamps: true });

export default mongoose.model('Inventory', inventorySchema);
