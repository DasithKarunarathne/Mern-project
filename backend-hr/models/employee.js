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
        required: true 
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
    }
});

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;