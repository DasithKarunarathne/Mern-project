import mongoose from "mongoose";

const Schema = mongoose.Schema;

const overtimeSchema = new Schema({
    employeeId: {
        type: Schema.Types.ObjectId,
        ref: "Employee", // Reference to the Employee collection
        required: true
    },
    overtimeHours: {
        type: Number,
        required: true,
        default: 0
    },
    date: {
        type: Date, // Store the specific date of the overtime (e.g., 2025-03-20)
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Overtime = mongoose.model("Overtime", overtimeSchema);

export default Overtime;