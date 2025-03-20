import mongoose from "mongoose";

const Schema = mongoose.Schema;

const employeeSchema = new Schema({
    empID: {
        type: String,
        required: true,
        unique: true
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
    overtimeHours: { 
        type: Number,
        default: 0 
    },
    overtimeRate: { 
        type: Number,
        default: 200 
    },
    epfPercentage: { 
        type: Number, 
        default: 8 
    },
    etfPercentage: { 
        type: Number, 
        default: 3 
    },
    image: { 
        type: Buffer, 
        required: false 
    },
    imageType: { 
        type: String, 
        required: false 
    },
    birthCertificate: { // New field for birth certificate
        type: Buffer,
        required: false // Optional
    },
    birthCertificateType: { // MIME type for birth certificate
        type: String,
        required: false
    },
    medicalRecords: { // New field for medical records
        type: Buffer,
        required: false // Optional
    },
    medicalRecordsType: { // MIME type for medical records
        type: String,
        required: false
    }
});

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;
