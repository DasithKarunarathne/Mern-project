import express from "express";
import mongoose from "mongoose";
import Employee from "../models/employee.js";
import Overtime from "../models/overtime.js";
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
        console.log("Starting /api/employee/add route...");

        const { empID, empname, role, basicSalary, overtimeRate, epfPercentage, etfPercentage } = req.body;

        // Log the incoming request data
        console.log("Received data:", {
            empID,
            empname,
            role,
            basicSalary,
            overtimeRate,
            epfPercentage,
            etfPercentage,
            image: req.files["image"] ? req.files["image"][0].originalname : null,
            birthCertificate: req.files["birthCertificate"] ? req.files["birthCertificate"][0].originalname : null,
            medicalRecords: req.files["medicalRecords"] ? req.files["medicalRecords"][0].originalname : null,
        });

        // Log file sizes
        console.log("File sizes:", {
            image: req.files["image"] ? req.files["image"][0].size : null,
            birthCertificate: req.files["birthCertificate"] ? req.files["birthCertificate"][0].size : null,
            medicalRecords: req.files["medicalRecords"] ? req.files["medicalRecords"][0].size : null,
        });

        // Validate required text fields
        console.log("Validating required text fields...");
        if (!empID || !empname || !role || !basicSalary) {
            console.log("Validation failed: Missing required text fields");
            return res.status(400).json({ error: "empID, empname, role, and basicSalary are required" });
        }

        // Validate required files (Employee Photo and Birth Certificate)
        console.log("Validating required files...");
        if (!req.files || !req.files["image"]) {
            console.log("Validation failed: Employee Photo is required");
            return res.status(400).json({ error: "Employee Photo is required" });
        }
        if (!req.files || !req.files["birthCertificate"]) {
            console.log("Validation failed: Birth Certificate is required");
            return res.status(400).json({ error: "Birth Certificate is required" });
        }

        // Check if employee already exists
        console.log("Checking for existing employee...");
        const existingEmployee = await Employee.findOne({ empID }).maxTimeMS(10000);
        if (existingEmployee) {
            console.log("Validation failed: Employee with this ID already exists", empID);
            return res.status(400).json({ error: "Employee with this ID already exists" });
        }

        // Extract files (Medical Records is optional)
        console.log("Extracting files...");
        const image = req.files["image"][0].buffer;
        const imageType = req.files["image"][0].mimetype;
        const birthCertificate = req.files["birthCertificate"][0].buffer;
        const birthCertificateType = req.files["birthCertificate"][0].mimetype;
        const medicalRecords = req.files["medicalRecords"] ? req.files["medicalRecords"][0].buffer : null;
        const medicalRecordsType = req.files["medicalRecords"] ? req.files["medicalRecords"][0].mimetype : null;

        const newEmployee = new Employee({
            empID,
            empname,
            role,
            basicSalary: Number(basicSalary),
            overtimeRate: Number(overtimeRate) || 200,
            epfPercentage: Number(epfPercentage) || 8,
            etfPercentage: Number(etfPercentage) || 3,
            image,
            imageType,
            birthCertificate,
            birthCertificateType,
            medicalRecords,
            medicalRecordsType
        });

        // Save the employee to MongoDB
        console.log("Saving employee to MongoDB...");
        const savedEmployee = await newEmployee.save({ maxTimeMS: 10000 });
        console.log("Employee saved to MongoDB:", savedEmployee._id);

        // Send the response
        console.log("Sending response...");
        res.status(200).json({ message: "Employee Added", employee: savedEmployee });
        console.log("Response sent successfully");
    } catch (err) {
        console.error("Error in /api/employee/add route:", err);
        res.status(500).json({ error: "Failed to add employee to MongoDB", details: err.message });
    }
});

// GET /api/employee/
router.route("/").get(async (req, res) => {
    try {
        console.log("Fetching employees...");
        const employees = await Employee.find().maxTimeMS(10000);
        console.log(`Fetched ${employees.length} employees`);
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
        console.log("Employees sent successfully");
    } catch (err) {
        console.error("Error fetching employees:", err);
        res.status(500).send({ status: "Error fetching employees", error: err.message });
    }
});

// DELETE /api/employee/delete/:id
router.delete("/delete/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Validate the ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid employee ID" });
        }

        // Find and delete the employee
        const deletedEmployee = await Employee.findByIdAndDelete(id).maxTimeMS(10000);
        if (!deletedEmployee) {
            return res.status(404).json({ error: "Employee not found" });
        }

        console.log(`Employee deleted: ${deletedEmployee.empID}`);
        res.status(200).json({ message: "Employee deleted successfully" });
    } catch (err) {
        console.error("Error deleting employee:", err);
        res.status(500).json({ error: "Failed to delete employee", details: err.message });
    }
});

// PUT /api/employee/update/:id
router.put("/update/:id", upload, async (req, res) => {
    try {
        const { id } = req.params;
        const { empID, empname, role, basicSalary, overtimeRate, epfPercentage, etfPercentage } = req.body;

        // Validate the ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid employee ID" });
        }

        // Find the employee
        const employee = await Employee.findById(id).maxTimeMS(10000);
        if (!employee) {
            return res.status(404).json({ error: "Employee not found" });
        }

        // Log the incoming update data
        console.log("Received update data:", {
            empID,
            empname,
            role,
            basicSalary,
            overtimeRate,
            epfPercentage,
            etfPercentage,
            image: req.files["image"] ? req.files["image"][0].originalname : null,
            birthCertificate: req.files["birthCertificate"] ? req.files["birthCertificate"][0].originalname : null,
            medicalRecords: req.files["medicalRecords"] ? req.files["medicalRecords"][0].originalname : null,
        });

        // Validate required text fields
        if (!empID || !empname || !role || !basicSalary) {
            console.log("Validation failed: Missing required text fields");
            return res.status(400).json({ error: "empID, empname, role, and basicSalary are required" });
        }

        // Check for duplicate empID (excluding the current employee)
        if (empID !== employee.empID) {
            const existingEmployee = await Employee.findOne({ empID }).maxTimeMS(10000);
            if (existingEmployee) {
                console.log(`Validation failed: empID ${empID} already exists`);
                return res.status(400).json({ error: `empID ${empID} already exists` });
            }
        }

        // Update text fields
        employee.empID = empID;
        employee.empname = empname;
        employee.role = role;
        employee.basicSalary = Number(basicSalary);
        employee.overtimeRate = Number(overtimeRate) || 200;
        employee.epfPercentage = Number(epfPercentage) || 8;
        employee.etfPercentage = Number(etfPercentage) || 3;

        // Update files if provided (otherwise keep existing files)
        if (req.files && req.files["image"]) {
            employee.image = req.files["image"][0].buffer;
            employee.imageType = req.files["image"][0].mimetype;
        }
        if (req.files && req.files["birthCertificate"]) {
            employee.birthCertificate = req.files["birthCertificate"][0].buffer;
            employee.birthCertificateType = req.files["birthCertificate"][0].mimetype;
        }
        if (req.files && req.files["medicalRecords"]) {
            employee.medicalRecords = req.files["medicalRecords"][0].buffer;
            employee.medicalRecordsType = req.files["medicalRecords"][0].mimetype;
        } else if (req.files && req.files["medicalRecords"] === null) {
            // If medicalRecords is explicitly set to null, remove it
            employee.medicalRecords = null;
            employee.medicalRecordsType = null;
        }

        // Save the updated employee
        const updatedEmployee = await employee.save({ maxTimeMS: 10000 });
        console.log("Employee updated in MongoDB:", updatedEmployee);
        res.status(200).json({ message: "Employee updated successfully", employee: updatedEmployee });
    } catch (err) {
        console.error("Error updating employee in MongoDB:", err);
        res.status(500).json({ error: "Failed to update employee", details: err.message });
    }
});

// POST /api/employee/overtime/add
router.post("/overtime/add", async (req, res) => {
    try {
        const { employeeId, overtimeHours, date } = req.body;

        // Validate required fields
        if (!employeeId || !overtimeHours || !date) {
            return res.status(400).json({ error: "employeeId, overtimeHours, and date are required" });
        }

        // Validate employeeId
        if (!mongoose.Types.ObjectId.isValid(employeeId)) {
            return res.status(400).json({ error: "Invalid employee ID" });
        }

        // Check if the employee exists
        const employee = await Employee.findById(employeeId).maxTimeMS(10000);
        if (!employee) {
            return res.status(404).json({ error: "Employee not found" });
        }

        // Validate date format
        const parsedDate = new Date(date);
        if (isNaN(parsedDate)) {
            return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD." });
        }

        // Check if an overtime record already exists for this employee and date
        const existingOvertime = await Overtime.findOne({ employeeId, date: parsedDate }).maxTimeMS(10000);
        if (existingOvertime) {
            return res.status(400).json({ error: `Overtime record for date ${date} already exists for this employee` });
        }

        // Create a new overtime record
        const newOvertime = new Overtime({
            employeeId,
            overtimeHours: Number(overtimeHours),
            date: parsedDate
        });

        // Save the overtime record
        const savedOvertime = await newOvertime.save({ maxTimeMS: 10000 });
        console.log("Overtime record saved to MongoDB:", savedOvertime);
        res.status(200).json({ message: "Overtime record added", overtime: savedOvertime });
    } catch (err) {
        console.error("Error adding overtime record to MongoDB:", err);
        res.status(500).json({ error: "Failed to add overtime record", details: err.message });
    }
});

// GET /api/employee/overtime/:employeeId
router.get("/overtime/:employeeId", async (req, res) => {
    try {
        const { employeeId } = req.params;

        // Validate employeeId
        if (!mongoose.Types.ObjectId.isValid(employeeId)) {
            return res.status(400).json({ error: "Invalid employee ID" });
        }

        // Fetch overtime records for the employee
        const overtimeRecords = await Overtime.find({ employeeId }).sort({ date: -1 }).maxTimeMS(10000);
        console.log(`Fetched ${overtimeRecords.length} overtime records for employee ${employeeId}`);
        res.status(200).json(overtimeRecords);
    } catch (err) {
        console.error("Error fetching overtime records:", err);
        res.status(500).json({ error: "Failed to fetch overtime records", details: err.message });
    }
});

// GET /api/employee/overtime/monthly/:year/:month
router.get("/overtime/monthly/:year/:month", async (req, res) => {
    try {
        const { year, month } = req.params;

        // Validate year and month
        const parsedYear = parseInt(year);
        const parsedMonth = parseInt(month);
        if (isNaN(parsedYear) || isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
            return res.status(400).json({ error: "Invalid year or month" });
        }

        // Define the date range for the given month
        const startDate = new Date(parsedYear, parsedMonth - 1, 1);
        const endDate = new Date(parsedYear, parsedMonth, 0); // Last day of the month

        // Fetch all employees
        const employees = await Employee.find().maxTimeMS(10000);

        // Fetch overtime records within the date range
        const overtimeRecords = await Overtime.find({
            date: {
                $gte: startDate,
                $lte: endDate,
            },
        }).maxTimeMS(10000);

        // Calculate total overtime hours, pay, and include detailed records for each employee
        const monthlyOvertime = employees.map(employee => {
            const employeeOvertime = overtimeRecords.filter(record => record.employeeId.toString() === employee._id.toString());
            const totalOvertimeHours = employeeOvertime.reduce((sum, record) => sum + record.overtimeHours, 0);
            const overtimePay = totalOvertimeHours * employee.overtimeRate;

            // Include detailed overtime records (date and hours)
            const details = employeeOvertime.map(record => ({
                date: record.date,
                overtimeHours: record.overtimeHours,
            }));

            return {
                employeeId: employee._id,
                empID: employee.empID,
                empname: employee.empname,
                totalOvertimeHours,
                overtimePay,
                overtimeRate: employee.overtimeRate,
                details,
            };
        }).filter(record => record.totalOvertimeHours > 0);

        res.status(200).json(monthlyOvertime);
    } catch (err) {
        console.error("Error fetching monthly overtime:", err);
        res.status(500).json({ error: "Failed to fetch monthly overtime", details: err.message });
    }
});

export default router;