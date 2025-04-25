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
    gender: {
        type: String,
        required: true,
        enum: ['Male', 'Female', 'Other']
    },
    contactNumber: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^\d{10}$/.test(v);
            },
            message: props => `${props.value} is not a valid 10-digit phone number!`
        }
    },
    address: {
        type: String,
        required: true
    },
    emergencyContact: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^\d{10}$/.test(v);
            },
            message: props => `${props.value} is not a valid 10-digit phone number!`
        }
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
    },
    totalOvertimePay: { 
        type: Number, 
        default: 0
    }
});

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;