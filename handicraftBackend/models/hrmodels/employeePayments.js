// models/employeePayments.js
import mongoose from "mongoose";

const Schema = mongoose.Schema;

const employeePaymentsSchema = new Schema({
    empID: {
        type: String,
        required: true,
        unique: true // Ensure empID is unique
    },
    empname: {
        type: String,
        required: true
    },
    basicSalary: {
        type: Number,
        required: true
    },
    totalOvertimePay: {
        type: Number,
        required: true,
        default: 0
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const employeePayments = mongoose.model("employeePayments", employeePaymentsSchema);

export default employeePayments;