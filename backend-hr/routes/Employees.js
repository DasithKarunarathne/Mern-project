import express from "express";
import Employee from "../models/employee.js";
import multer from "multer";

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit per file
    fileFilter: (req, file, cb) => {
        // Allow JPEG/PNG for image, PDF/JPEG/PNG for birthCertificate and medicalRecords
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype) {
            return cb(null, true);
        }
        cb(new Error("Only JPEG, JPG, PNG, and PDF files are allowed"));
    }
}).fields([
    { name: "image", maxCount: 1 },           // Single image file
    { name: "birthCertificate", maxCount: 1 }, // Single birth certificate file
    { name: "medicalRecords", maxCount: 1 }    // Single medical records file
]);

const router = express.Router();

// POST /api/employee/add
router.route("/add").post(upload, (req, res) => {
    const empID = req.body.empID;
    const empname = req.body.empname;
    const role = req.body.role;
    const basicSalary = Number(req.body.basicSalary);
    const overtimeHours = Number(req.body.overtimeHours) || 0;
    const overtimeRate = Number(req.body.overtimeRate) || 200;
    const epfPercentage = Number(req.body.epfPercentage) || 8;
    const etfPercentage = Number(req.body.etfPercentage) || 3;

    // Extract files if provided
    const image = req.files && req.files["image"] ? req.files["image"][0].buffer : null;
    const imageType = req.files && req.files["image"] ? req.files["image"][0].mimetype : null;
    const birthCertificate = req.files && req.files["birthCertificate"] ? req.files["birthCertificate"][0].buffer : null;
    const birthCertificateType = req.files && req.files["birthCertificate"] ? req.files["birthCertificate"][0].mimetype : null;
    const medicalRecords = req.files && req.files["medicalRecords"] ? req.files["medicalRecords"][0].buffer : null;
    const medicalRecordsType = req.files && req.files["medicalRecords"] ? req.files["medicalRecords"][0].mimetype : null;

    // Explicit validation for required fields
    if (!empID || !empname || !role || !basicSalary) {
        return res.status(400).send({ 
            status: "Error", 
            error: "empID, empname, role, and basicSalary are required" 
        });
    }

    const newEmployee = new Employee({
        empID,
        empname,
        role,
        basicSalary,
        overtimeHours,
        overtimeRate,
        epfPercentage,
        etfPercentage,
        image,
        imageType,
        birthCertificate,
        birthCertificateType,
        medicalRecords,
        medicalRecordsType
    });

    newEmployee.save()
        .then(() => {
            res.json("Employee Added");
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({ status: "Error adding employee", error: err.message });
        });
});

// GET /api/employee/
router.route("/").get((req, res) => {
    Employee.find()
        .then((employees) => {
            const employeesWithFiles = employees.map(employee => {
                const employeeObj = employee.toObject();
                // Convert image to base64
                if (employee.image && employee.imageType) {
                    employeeObj.image = `data:${employee.imageType};base64,${employee.image.toString("base64")}`;
                }
                // Convert birthCertificate to base64
                if (employee.birthCertificate && employee.birthCertificateType) {
                    employeeObj.birthCertificate = `data:${employee.birthCertificateType};base64,${employee.birthCertificate.toString("base64")}`;
                }
                // Convert medicalRecords to base64
                if (employee.medicalRecords && employee.medicalRecordsType) {
                    employeeObj.medicalRecords = `data:${employee.medicalRecordsType};base64,${employee.medicalRecords.toString("base64")}`;
                }
                return employeeObj;
            });
            res.json(employeesWithFiles);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({ status: "Error fetching employees", error: err.message });
        });
});

// PUT /api/employee/update/:id
router.route("/update/:id").put(upload, async (req, res) => {
    const userId = req.params.id;
    const { empID, empname, role, basicSalary, overtimeHours, overtimeRate, epfPercentage, etfPercentage } = req.body;

    // Extract files if provided
    const image = req.files && req.files["image"] ? req.files["image"][0].buffer : undefined;
    const imageType = req.files && req.files["image"] ? req.files["image"][0].mimetype : undefined;
    const birthCertificate = req.files && req.files["birthCertificate"] ? req.files["birthCertificate"][0].buffer : undefined;
    const birthCertificateType = req.files && req.files["birthCertificate"] ? req.files["birthCertificate"][0].mimetype : undefined;
    const medicalRecords = req.files && req.files["medicalRecords"] ? req.files["medicalRecords"][0].buffer : undefined;
    const medicalRecordsType = req.files && req.files["medicalRecords"] ? req.files["medicalRecords"][0].mimetype : undefined;

    const updateEmployee = {
        empID,
        empname,
        role,
        basicSalary: Number(basicSalary),
        overtimeHours: Number(overtimeHours) || 0,
        overtimeRate: Number(overtimeRate) || 200,
        epfPercentage: Number(epfPercentage) || 8,
        etfPercentage: Number(etfPercentage) || 3,
        ...(image !== undefined && { image }),
        ...(imageType !== undefined && { imageType }),
        ...(birthCertificate !== undefined && { birthCertificate }),
        ...(birthCertificateType !== undefined && { birthCertificateType }),
        ...(medicalRecords !== undefined && { medicalRecords }),
        ...(medicalRecordsType !== undefined && { medicalRecordsType })
    };

    try {
        const updatedEmployee = await Employee.findByIdAndUpdate(userId, updateEmployee, { new: true });
        if (!updatedEmployee) {
            return res.status(404).send({ status: "Error", error: "Employee not found" });
        }
        const employeeObj = updatedEmployee.toObject();
        if (updatedEmployee.image && updatedEmployee.imageType) {
            employeeObj.image = `data:${updatedEmployee.imageType};base64,${updatedEmployee.image.toString("base64")}`;
        }
        if (updatedEmployee.birthCertificate && updatedEmployee.birthCertificateType) {
            employeeObj.birthCertificate = `data:${updatedEmployee.birthCertificateType};base64,${updatedEmployee.birthCertificate.toString("base64")}`;
        }
        if (updatedEmployee.medicalRecords && updatedEmployee.medicalRecordsType) {
            employeeObj.medicalRecords = `data:${updatedEmployee.medicalRecordsType};base64,${updatedEmployee.medicalRecords.toString("base64")}`;
        }
        res.status(200).send({ status: "User Updated", user: employeeObj });
    } catch (err) {
        console.log(err);
        res.status(500).send({ status: "Error with updating data", error: err.message });
    }
});

// DELETE /api/employee/delete/:id
router.route("/delete/:id").delete(async (req, res) => {
    const userId = req.params.id;

    try {
        const deletedEmployee = await Employee.findByIdAndDelete(userId);
        if (!deletedEmployee) {
            return res.status(404).send({ status: "Error", error: "Employee not found" });
        }
        res.status(200).send({ status: "User Deleted" });
    } catch (err) {
        console.log(err);
        res.status(500).send({ status: "Error with deleting data", error: err.message });
    }
});

// GET /api/employee/get/:id
router.route("/get/:id").get(async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await Employee.findById(userId);
        if (!user) {
            return res.status(404).send({ status: "Error", error: "Employee not found" });
        }
        const userObj = user.toObject();
        if (user.image && user.imageType) {
            userObj.image = `data:${user.imageType};base64,${user.image.toString("base64")}`;
        }
        if (user.birthCertificate && user.birthCertificateType) {
            userObj.birthCertificate = `data:${user.birthCertificateType};base64,${user.birthCertificate.toString("base64")}`;
        }
        if (user.medicalRecords && user.medicalRecordsType) {
            userObj.medicalRecords = `data:${user.medicalRecordsType};base64,${user.medicalRecords.toString("base64")}`;
        }
        res.status(200).send({ status: "User fetched", user: userObj });
    } catch (err) {
        console.log(err);
        res.status(500).send({ status: "Error with get user", error: err.message });
    }
});

export default router;