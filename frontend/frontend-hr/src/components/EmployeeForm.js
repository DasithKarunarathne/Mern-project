import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

// Use an environment variable for the backend URL
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const EmployeeForm = ({ onEmployeeAdded }) => {
  const [formData, setFormData] = useState({
    empID: "",
    empname: "",
    role: "",
    basicSalary: "",
    overtimeRate: "",
    epfPercentage: "",
    etfPercentage: "",
    image: null,
    birthCertificate: null,
    medicalRecords: null,
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [overtimeData, setOvertimeData] = useState({
    employeeId: "",
    overtimeHours: "",
    date: "",
  });
  const [overtimeSuccessMessage, setOvertimeSuccessMessage] = useState("");
  const [overtimeErrorMessage, setOvertimeErrorMessage] = useState("");

  const navigate = useNavigate();

  // Fetch employees for the overtime dialog dropdown
  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/employee/`);
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.empID) newErrors.empID = "Employee ID is required";
    if (!formData.empname) newErrors.empname = "Name is required";
    if (!formData.role) newErrors.role = "Role is required";
    if (!formData.basicSalary) newErrors.basicSalary = "Basic Salary is required";
    if (!formData.image) newErrors.image = "Employee Photo is required";
    if (!formData.birthCertificate) newErrors.birthCertificate = "Birth Certificate is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    const data = new FormData();
    data.append("empID", formData.empID);
    data.append("empname", formData.empname);
    data.append("role", formData.role);
    data.append("basicSalary", formData.basicSalary);
    data.append("overtimeRate", formData.overtimeRate || "200");
    data.append("epfPercentage", formData.epfPercentage || "8");
    data.append("etfPercentage", formData.etfPercentage || "3");
    if (formData.image) data.append("image", formData.image);
    if (formData.birthCertificate) data.append("birthCertificate", formData.birthCertificate);
    if (formData.medicalRecords) data.append("medicalRecords", formData.medicalRecords);

    console.log("Sending data to backend:", {
      empID: formData.empID,
      empname: formData.empname,
      role: formData.role,
      basicSalary: formData.basicSalary,
      overtimeRate: formData.overtimeRate || "200",
      epfPercentage: formData.epfPercentage || "8",
      etfPercentage: formData.etfPercentage || "3",
      image: formData.image ? formData.image.name : null,
      birthCertificate: formData.birthCertificate ? formData.birthCertificate.name : null,
      medicalRecords: formData.medicalRecords ? formData.medicalRecords.name : null,
    });

    const maxRetries = 3;
    let attempt = 0;
    let success = false;
    let lastError = null;

    while (attempt < maxRetries && !success) {
      try {
        const response = await axios.post(`${BACKEND_URL}/api/employee/add`, data, {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 20000,
        });
        console.log("Backend response:", response.data);
        success = true;
        setSuccessMessage("Employee Added Successfully");
        setFormData({
          empID: "",
          empname: "",
          role: "",
          basicSalary: "",
          overtimeRate: "",
          epfPercentage: "",
          etfPercentage: "",
          image: null,
          birthCertificate: null,
          medicalRecords: null,
        });
        setErrors({});
        document.querySelectorAll("input[type=file]").forEach(input => (input.value = ""));
        setTimeout(() => {
          setSuccessMessage("");
          if (onEmployeeAdded) onEmployeeAdded();
          navigate("/list");
        }, 3000);
      } catch (error) {
        attempt++;
        lastError = error;
        console.error(`Attempt ${attempt} failed:`, error);
        if (attempt === maxRetries) {
          console.error("Max retries reached. Checking if employee was added...");
        } else {
          console.log(`Retrying... (${attempt}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    if (!success) {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/employee/`);
        const employees = response.data;
        const employeeExists = employees.some(emp => emp.empID === formData.empID);
        if (employeeExists) {
          console.log("Employee was added despite error, redirecting...");
          setSuccessMessage("Employee Added Successfully (Detected via fallback)");
          setFormData({
            empID: "",
            empname: "",
            role: "",
            basicSalary: "",
            overtimeRate: "",
            epfPercentage: "",
            etfPercentage: "",
            image: null,
            birthCertificate: null,
            medicalRecords: null,
          });
          setErrors({});
          document.querySelectorAll("input[type=file]").forEach(input => (input.value = ""));
          setTimeout(() => {
            setSuccessMessage("");
            if (onEmployeeAdded) onEmployeeAdded();
            navigate("/list");
          }, 3000);
        } else {
          setErrorMessage("Error adding employee: " + (lastError.response?.data?.error || lastError.message));
        }
      } catch (checkErr) {
        console.error("Error checking employee list:", checkErr);
        setErrorMessage("Error adding employee: " + (lastError.response?.data?.error || lastError.message));
      }
    }

    setLoading(false);
  };

  const handleViewList = () => {
    navigate("/list");
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setOvertimeData({ employeeId: "", overtimeHours: "", date: "" });
    setOvertimeSuccessMessage("");
    setOvertimeErrorMessage("");
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleOvertimeChange = (e) => {
    const { name, value } = e.target;
    setOvertimeData({ ...overtimeData, [name]: value });
  };

  const handleOvertimeSubmit = async (e) => {
    e.preventDefault();

    if (!overtimeData.employeeId || !overtimeData.overtimeHours || !overtimeData.date) {
      setOvertimeErrorMessage("All fields are required");
      return;
    }

    try {
      const response = await axios.post(`${BACKEND_URL}/api/employee/overtime/add`, overtimeData);
      setOvertimeSuccessMessage("Overtime added successfully");
      setTimeout(() => {
        setOvertimeSuccessMessage("");
        handleCloseDialog();
      }, 2000);
    } catch (err) {
      console.error("Error adding overtime:", err);
      setOvertimeErrorMessage(err.response?.data?.error || "Failed to add overtime");
    }
  };

  return (
    <Box sx={{ mb: 4, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Employee Management
      </Typography>
      <Typography variant="h5" gutterBottom>
        Add Employee
      </Typography>
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Employee ID"
          name="empID"
          value={formData.empID}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          error={!!errors.empID}
          helperText={errors.empID}
          disabled={loading}
        />
        <TextField
          label="Name"
          name="empname"
          value={formData.empname}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          error={!!errors.empname}
          helperText={errors.empname}
          disabled={loading}
        />
        <TextField
          label="Role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          error={!!errors.role}
          helperText={errors.role}
          disabled={loading}
        />
        <TextField
          label="Basic Salary"
          name="basicSalary"
          type="number"
          value={formData.basicSalary}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          error={!!errors.basicSalary}
          helperText={errors.basicSalary}
          disabled={loading}
        />
        <TextField
          label="Overtime Rate (optional)"
          name="overtimeRate"
          type="number"
          value={formData.overtimeRate}
          onChange={handleChange}
          fullWidth
          margin="normal"
          disabled={loading}
        />
        <TextField
          label="EPF Percentage (optional)"
          name="epfPercentage"
          type="number"
          value={formData.epfPercentage}
          onChange={handleChange}
          fullWidth
          margin="normal"
          disabled={loading}
        />
        <TextField
          label="ETF Percentage (optional)"
          name="etfPercentage"
          type="number"
          value={formData.etfPercentage}
          onChange={handleChange}
          fullWidth
          margin="normal"
          disabled={loading}
        />
        <FormControl fullWidth margin="normal">
          <InputLabel shrink>Employee Photo *</InputLabel>
          <input
            type="file"
            name="image"
            onChange={handleChange}
            accept="image/jpeg,image/png"
            style={{ marginTop: "16px" }}
            required
            disabled={loading}
          />
          {errors.image && (
            <Typography color="error" variant="caption">
              {errors.image}
            </Typography>
          )}
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel shrink>Birth Certificate *</InputLabel>
          <input
            type="file"
            name="birthCertificate"
            onChange={handleChange}
            accept="image/jpeg,image/png,application/pdf"
            style={{ marginTop: "16px" }}
            required
            disabled={loading}
          />
          {errors.birthCertificate && (
            <Typography color="error" variant="caption">
              {errors.birthCertificate}
            </Typography>
          )}
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel shrink>Medical Records (optional)</InputLabel>
          <input
            type="file"
            name="medicalRecords"
            onChange={handleChange}
            accept="image/jpeg,image/png,application/pdf"
            style={{ marginTop: "16px" }}
            disabled={loading}
          />
        </FormControl>
        <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? "Adding Employee..." : "Add Employee"}
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleViewList}
            disabled={loading}
          >
            Employee List
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate("/overtime/monthly")}
            disabled={loading}
          >
            View Monthly Overtime Report
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenDialog}
            disabled={loading}
          >
            Add Overtime
          </Button>
        </Box>
      </form>

      {/* Dialog for Adding Overtime */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Add Overtime</DialogTitle>
        <DialogContent>
          {overtimeSuccessMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {overtimeSuccessMessage}
            </Alert>
          )}
          {overtimeErrorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {overtimeErrorMessage}
            </Alert>
          )}
          <Box component="form" onSubmit={handleOvertimeSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Employee</InputLabel>
              <Select
                name="employeeId"
                value={overtimeData.employeeId}
                onChange={handleOvertimeChange}
                required
              >
                <MenuItem value="">Select Employee</MenuItem>
                {employees.map((employee) => (
                  <MenuItem key={employee._id} value={employee._id}>
                    {employee.empname} (ID: {employee.empID})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Overtime Hours"
              name="overtimeHours"
              type="number"
              value={overtimeData.overtimeHours}
              onChange={handleOvertimeChange}
              fullWidth
              required
            />
            <TextField
              label="Date"
              name="date"
              type="date"
              value={overtimeData.date}
              onChange={handleOvertimeChange}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleOvertimeSubmit} color="primary">
            Add Overtime
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeForm;