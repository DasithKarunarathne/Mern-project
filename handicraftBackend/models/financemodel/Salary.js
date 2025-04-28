import mongoose, { mongo } from "mongoose";
//schema is written wrong i have connected it 
const salaryShcema = new mongoose.Schema({

    employeeId: { type: String, required: true },
    employeeName: { type: String, required: true },
    month: { type: String, required: true },
    basicSalary: { type: Number, required: true },
    overtimeHours: { type: Number, default: 0 },
    overtimeRate: { type: Number, default: 0 },
    totalOvertime: { type: Number, default: 0 },
    epf: { type: Number, default: 0 },
    etf: { type: Number, default: 0 },
    epf12: { type: Number, default: 0 },
    netSalary: { type: Number },
    status: { type: String, enum: ["Pending", "Completed"], default: "Pending" },
    paymentDate: { type: Date },
    dueDate: { type: Date, required: true }
},{timestamps:true});

//module.exports = mongoose.model("Salary", salaryShcema);

const Salary = mongoose.model("Salary",salaryShcema );
export default Salary;