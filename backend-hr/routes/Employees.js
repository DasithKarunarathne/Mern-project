import express from "express";
import Employee from "../models/employee.js";
import multer from "multer";

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype) {
            return cb(null, true);
        }
        cb(new Error("Only JPEG/JPG/PNG images are allowed"));
    }
}).single("image");

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
    const image = req.file ? req.file.buffer : null;
    const imageType = req.file ? req.file.mimetype : null;

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
        imageType
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
            const employeesWithImage = employees.map(employee => {
                const employeeObj = employee.toObject();
                if (employee.image && employee.imageType) {
                    employeeObj.image = `data:${employee.imageType};base64,${employee.image.toString("base64")}`;
                }
                return employeeObj;
            });
            res.json(employeesWithImage);
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
    const image = req.file ? req.file.buffer : undefined;
    const imageType = req.file ? req.file.mimetype : undefined;

    const updateEmployee = {
        empID,
        empname,
        role,
        basicSalary: Number(basicSalary),
        overtimeHours: Number(overtimeHours) || 0,
        overtimeRate: Number(overtimeRate) || 200,
        epfPercentage: Number(epfPercentage) || 8,
        etfPercentage: Number(etfPercentage) || 3,
        ...(image && { image }),
        ...(imageType && { imageType })
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
        res.status(200).send({ status: "User fetched", user: userObj });
    } catch (err) {
        console.log(err);
        res.status(500).send({ status: "Error with get user", error: err.message });
    }
});

export default router;