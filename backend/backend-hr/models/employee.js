import mongoose from "mongoose";

const Schema = mongoose.Schema;

const employeeSchema = new Schema({
    empID: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    empname: {
        type: String,
        required: true,
        index: true,
    },
    role: {
        type: String,
        required: true,
    },
    basicSalary: {
        type: Number,
        required: true,
    },
    overtimeRate: {
        type: Number,
        default: 200,
    },
    epfPercentage: {
        type: Number,
        default: 8,
    },
    etfPercentage: {
        type: Number,
        default: 3,
    },
    imageUrl: {
        type: String, // URL to the image file
        required: true,
    },
    birthCertificateUrl: {
        type: String, // URL to the birth certificate file
        required: true,
    },
    medicalRecordsUrl: {
        type: String, // URL to the medical records file (optional)
    },
});

// Compound index example (if needed)
employeeSchema.index({ empID: 1, empname: 1 }); // Compound index on empID and empname

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;