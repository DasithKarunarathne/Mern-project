import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema({

    employeeId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    role: { type: String, required: true },
    basicSalary: { type: Number, required: true },
    overtimeHours: { type: Number, default: 0 },
    overtimeRate: { type: Number, default: 200 }, // Example value per hour
    epfPercentage: { type: Number, default: 8 }, // EPF 8%
    etfPercentage: { type: Number, default: 3 }  // ETF 3%
})

module.exports = mongoose.model("EMployee",EmployeeSchema );