import React, { useState } from "react";
import axios from "axios"; // Removed duplicate import
import {
  TextField,
  Button,
  Box,
  Typography,
  Input,
} from "@mui/material";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation

const EmployeeForm = ({ onEmployeeAdded }) => {
  const [formData, setFormData] = useState({
    empID: "",
    empname: "",
    role: "",
    basicSalary: "",
    overtimeHours: "",
    overtimeRate: "",
    epfPercentage: "",
    etfPercentage: "",
    image: null,
    birthCertificate: null,
    medicalRecords: null,
  });
  const [successMessage, setSuccessMessage] = useState(""); // State for success message

  const navigate = useNavigate(); // Hook for navigation

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("empID", formData.empID);
    data.append("empname", formData.empname);
    data.append("role", formData.role);
    data.append("basicSalary", formData.basicSalary);
    data.append("overtimeHours", formData.overtimeHours || "0");
    data.append("overtimeRate", formData.overtimeRate || "200");
    data.append("epfPercentage", formData.epfPercentage || "8");
    data.append("etfPercentage", formData.etfPercentage || "3");
    if (formData.image) data.append("image", formData.image);
    if (formData.birthCertificate) data.append("birthCertificate", formData.birthCertificate);
    if (formData.medicalRecords) data.append("medicalRecords", formData.medicalRecords);

    try {
      const response = await axios.post("http://localhost:4000/api/employee/add", data, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 10000,
      });
      setSuccessMessage("Employee Added Successfully"); // Set success message
      setFormData({
        empID: "",
        empname: "",
        role: "",
        basicSalary: "",
        overtimeHours: "",
        overtimeRate: "",
        epfPercentage: "",
        etfPercentage: "",
        image: null,
        birthCertificate: null,
        medicalRecords: null,
      });
      document.querySelectorAll("input[type=file]").forEach(input => (input.value = ""));
      setTimeout(() => setSuccessMessage(""), 3000);
      if (onEmployeeAdded) onEmployeeAdded(); // Notify parent to refresh EmployeeList
      navigate("/list"); // Navigate to Employee List page
    } catch (error) {
      console.error("Frontend error:", error);
      if (error.response) {
        alert("Error adding employee: " + (error.response.data?.error || error.response.statusText));
      } else if (error.request) {
        alert("Error adding employee: Network Error - No response received from server. Check if backend is running on http://localhost:4000.");
      } else {
        alert("Error adding employee: " + error.message);
      }
    }
  };

  const handleViewList = () => {
    navigate("/list"); // Navigate to Employee List page
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        Add Employee
      </Typography>
      {successMessage && (
        <Typography variant="body1" color="success.main" sx={{ mb: 2 }}>
          {successMessage}
        </Typography>
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
        />
        <TextField
          label="Name"
          name="empname"
          value={formData.empname}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
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
        />
        <TextField
          label="Overtime Hours (optional)"
          name="overtimeHours"
          type="number"
          value={formData.overtimeHours}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Overtime Rate (optional)"
          name="overtimeRate"
          type="number"
          value={formData.overtimeRate}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="EPF Percentage (optional)"
          name="epfPercentage"
          type="number"
          value={formData.epfPercentage}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="ETF Percentage (optional)"
          name="etfPercentage"
          type="number"
          value={formData.etfPercentage}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <Input
          type="file"
          name="image"
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <Input
          type="file"
          name="birthCertificate"
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <Input
          type="file"
          name="medicalRecords"
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
          <Button type="submit" variant="contained" color="primary">
            Add Employee
          </Button>
          <Button variant="outlined" color="primary" onClick={handleViewList}>
            Employee List
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default EmployeeForm;