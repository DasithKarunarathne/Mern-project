import mongoose from "mongoose";

const salaryShcema = new mongoose.Schema({

    employeeId: { type: String, required: true },
    basicSalary: { type: Number, required: true },
    overtimeHours: { type: Number, default: 0 },
    epf: { type: Number, default: 0 },
    etf: { type: Number, default: 0 },
    netSalary: { type: Number },
    month: { type: String, required: true },
    status: { type: Boolean, default: false }

})

module.exports = mongoose.model("Salary", salaryShcema);