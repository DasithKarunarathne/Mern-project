import mongoose from "mongoose";

const Schema = mongoose.Schema;

const employeeSchema = new Schema({
    empID: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    empname: {
        type: String,
        required: true
    },
    role: { 
        type: String, 
        required: true 
    },
    basicSalary: { 
        type: Number, 
        required: true
    },
    overtimeRate: { 
        type: Number,
        default: 200 
    },
    image: { 
        type: Buffer, 
        
    },
    imageType: { 
        type: String, 
        required: true 
    },
    birthCertificate: { 
        type: Buffer,
        required: true 
    },
    birthCertificateType: { 
        type: String,
        required: true
    },
    medicalRecords: { 
        type: Buffer,
        required: false 
    },
    medicalRecordsType: { 
        type: String, 
        required: false 
    },
    totalOvertimePay: { 
        type: Number, 
        default: 0 // New field to store cumulative overtime pay
    }
});

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;