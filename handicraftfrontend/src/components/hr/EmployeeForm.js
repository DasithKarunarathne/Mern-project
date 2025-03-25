import React, { useState } from "react";
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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Header from "./Header";

// Use an environment variable for the backend URL
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const EmployeeForm = ({ onEmployeeAdded }) => {
  const [formData, setFormData] = useState({
    empID: "",
    empname: "",
    role: "",
    basicSalary: "",
    overtimeRate: "",
    image: null,
    birthCertificate: null,
    medicalRecords: null,
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      // File input handling
      setFormData({ ...formData, [name]: files[0] });
    } else {
      // Text input handling
      // For basicSalary and overtimeRate, ensure the value is a non-negative integer
      if (name === "basicSalary" || name === "overtimeRate") {
        // Allow empty string to let users clear the field
        if (value === "") {
          setFormData({ ...formData, [name]: value });
          return;
        }

        // Remove any non-digit characters (except for validation later)
        const cleanedValue = value.replace(/[^0-9]/g, "");
        setFormData({ ...formData, [name]: cleanedValue });
      } else {
        setFormData({ ...formData, [name]: value });
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.empID) newErrors.empID = "Employee ID is required";
    if (!formData.empname) newErrors.empname = "Name is required";
    if (!formData.role) newErrors.role = "Role is required";
    if (!formData.basicSalary) {
      newErrors.basicSalary = "Basic Salary is required";
    } else {
      const basicSalaryNum = Number(formData.basicSalary);
      if (isNaN(basicSalaryNum) || basicSalaryNum <= 0) {
        newErrors.basicSalary = "Basic Salary must be a number greater than 0";
      } else if (!Number.isInteger(basicSalaryNum)) {
        newErrors.basicSalary = "Basic Salary must be a whole number";
      }
    }
    if (formData.overtimeRate) {
      const overtimeRateNum = Number(formData.overtimeRate);
      if (isNaN(overtimeRateNum) || overtimeRateNum <= 0) {
        newErrors.overtimeRate = "Overtime Rate must be a number greater than 0";
      } else if (!Number.isInteger(overtimeRateNum)) {
        newErrors.overtimeRate = "Overtime Rate must be a whole number";
      }
    }
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
    if (formData.image) data.append("image", formData.image);
    if (formData.birthCertificate) data.append("birthCertificate", formData.birthCertificate);
    if (formData.medicalRecords) data.append("medicalRecords", formData.medicalRecords);

    console.log("Sending data to backend:", {
      empID: formData.empID,
      empname: formData.empname,
      role: formData.role,
      basicSalary: formData.basicSalary,
      overtimeRate: formData.overtimeRate || "200",
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
            image: null,
            birthCertificate: null,
            medicalRecords: null,
          });
          setErrors({});
          document.querySelectorAll("input[type=file]").forEach(input => (input.value = ""));
          setTimeout(() => {
            setSuccessMessage("");
            if (onEmployeeAdded) onEmployeeAdded();
            navigate("/hr/list");
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
    navigate("/hr/list");
  };

  return (
    <Box sx={{ mb: 4, px: 3, width: "100%", maxWidth: "100%" }}>
      <Header />
      <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
        Add Employee
      </Typography>
      <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleViewList}
          disabled={loading}
        >
          Employee List
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => navigate("/hr/overtime/monthly")}
          disabled={loading}
        >
          View Monthly Overtime Report
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/hr/overtime")}
          disabled={loading}
        >
          Add Overtime
        </Button>
      </Box>
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
          inputProps={{
            min: 1, // Prevents negative values in the input
            step: 1, // Ensures only whole numbers can be entered
          }}
        />
        <TextField
          label="Overtime Rate (optional)"
          name="overtimeRate"
          type="number"
          value={formData.overtimeRate}
          onChange={handleChange}
          fullWidth
          margin="normal"
          error={!!errors.overtimeRate}
          helperText={errors.overtimeRate}
          disabled={loading}
          inputProps={{
            min: 1, // Prevents negative values in the input
            step: 1, // Ensures only whole numbers can be entered
          }}
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
        </Box>
      </form>
    </Box>
  );
};

export default EmployeeForm;