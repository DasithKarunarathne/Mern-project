import mongoose from "mongoose";

// Changed: Use import instead of require
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
    }, // Example value per hour
    epfPercentage: { 
        type: Number, 
        default: 8 
    }, // EPF 8%
    etfPercentage: { 
        type: Number, 
        default: 3 
    },  // ETF 3%

    image: { // New field for employee picture
        type: Buffer, // Store image as binary data
        required: false // Optional, set to true if mandatory
    },
    imageType: { // Store MIME type (e.g., "image/jpeg")
        type: String,
        required: false
    }
});

const Employee = mongoose.model("Employee", employeeSchema);

// Changed: Use export default instead of module.exports
export default Employee;
