import express from "express";
import mongoose from "mongoose"; // FIX: Import mongoose
import Employee from "../models/employee.js";
import multer from "multer";

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit per file
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype) {
            return cb(null, true);
        }
        cb(new Error("Only JPEG, JPG, PNG, and PDF files are allowed"));
    }
}).fields([
    { name: "image", maxCount: 1 },
    { name: "birthCertificate", maxCount: 1 },
    { name: "medicalRecords", maxCount: 1 }
]);

const router = express.Router();

// POST /api/employee/add
router.post("/add", upload, async (req, res) => {
    try {
        const { empID, empname, role, basicSalary, overtimeHours, overtimeRate, epfPercentage, etfPercentage } = req.body;
        if (!empID || !empname || !role || !basicSalary) {
            return res.status(400).json({ error: "empID, empname, role, and basicSalary are required" });
        }

        const newEmployee = new Employee({
            empID,
            empname,
            role,
            basicSalary: Number(basicSalary),
            overtimeHours: Number(overtimeHours) || 0,
            overtimeRate: Number(overtimeRate) || 200,
            epfPercentage: Number(epfPercentage) || 8,
            etfPercentage: Number(etfPercentage) || 3,
            image: req.files?.image?.[0]?.buffer || null,
            imageType: req.files?.image?.[0]?.mimetype || null,
            birthCertificate: req.files?.birthCertificate?.[0]?.buffer || null,
            birthCertificateType: req.files?.birthCertificate?.[0]?.mimetype || null,
            medicalRecords: req.files?.medicalRecords?.[0]?.buffer || null,
            medicalRecordsType: req.files?.medicalRecords?.[0]?.mimetype || null
        });

        const savedEmployee = await newEmployee.save();
        res.json({ message: "Employee Added", employee: savedEmployee });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// GET /api/employee/
router.route("/").get(async (req, res) => {
    try {
        const employees = await Employee.find();
        console.log(`Fetched ${employees.length} employees`); // Debug log
        const employeesWithFiles = employees.map(employee => {
            const employeeObj = employee.toObject();
            if (employee.image && employee.imageType) {
                employeeObj.image = `data:${employee.imageType};base64,${employee.image.toString("base64")}`;
            }
            if (employee.birthCertificate && employee.birthCertificateType) {
                employeeObj.birthCertificate = `data:${employee.birthCertificateType};base64,${employee.birthCertificate.toString("base64")}`;
            }
            if (employee.medicalRecords && employee.medicalRecordsType) {
                employeeObj.medicalRecords = `data:${employee.medicalRecordsType};base64,${employee.medicalRecords.toString("base64")}`;
            }
            return employeeObj;
        });
        res.json(employeesWithFiles);
    } catch (err) {
        console.log(err);
        res.status(500).send({ status: "Error fetching employees", error: err.message });
    }
});




// GET /api/employee/:empID
router.get("/:empID", async (req, res) => {
    try {
        const { empID } = req.params; // Extract empID from the URL parameters

        // Find the employee by empID
        const employee = await Employee.findOne({ empID });

        // If no employee is found, return a 404 error
        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found" });
        }

        // Convert the employee document to a plain object
        const employeeObj = employee.toObject();

        // Add base64-encoded file data if it exists
        if (employee.image && employee.imageType) {
            employeeObj.image = `data:${employee.imageType};base64,${employee.image.toString("base64")}`;
        }
        if (employee.birthCertificate && employee.birthCertificateType) {
            employeeObj.birthCertificate = `data:${employee.birthCertificateType};base64,${employee.birthCertificate.toString("base64")}`;
        }
        if (employee.medicalRecords && employee.medicalRecordsType) {
            employeeObj.medicalRecords = `data:${employee.medicalRecordsType};base64,${employee.medicalRecords.toString("base64")}`;
        }

        // Return the employee data
        res.status(200).json({ success: true, employee: employeeObj });
    } catch (err) {
        console.error("Error fetching employee:", err);
        res.status(500).json({ success: false, message: "Error fetching employee", error: err.message });
    }
});

// DELETE /api/employee/:id
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params; // Extract the employee ID from the URL parameters

        // Find and delete the employee by ID
        const deletedEmployee = await Employee.findByIdAndDelete(id);

        // If no employee is found, return a 404 error
        if (!deletedEmployee) {
            return res.status(404).json({ success: false, message: "Employee not found" });
        }

        // Return a success response
        res.status(200).json({ success: true, message: "Employee deleted", employee: deletedEmployee });
    } catch (err) {
        console.error("Error deleting employee:", err);
        res.status(500).json({ success: false, message: "Error deleting employee", error: err.message });
    }
});

// Other routes remain unchanged
export default router;
