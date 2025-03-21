import mongoose from "mongoose";

const Schema = mongoose.Schema;

const overtimeDetailSchema = new Schema({
    date: {
        type: Date,
        required: true
    },
    overtimeHours: {
        type: Number,
        required: true
    },
    overtimePay: {
        type: Number,
        required: true
    }
});

const overtimeSchema = new Schema({
    employeeId: {
        type: Schema.Types.ObjectId,
        ref: "Employee",
        required: true
    },
    empID: {
        type: String,
        required: true
    },
    month: {  // Store the month and year (e.g., "2025-03")
        type: String,
        required: true
    },
    totalOvertimeHours: {  // Total overtime hours for the month
        type: Number,
        required: true,
        default: 0
    },
    totalOvertimePay: {  // Total overtime pay for the month
        type: Number,
        required: true,
        default: 0
    },
    details: [overtimeDetailSchema],  // Array of individual overtime records
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const Overtime = mongoose.model("Overtime", overtimeSchema);

export default Overtime;