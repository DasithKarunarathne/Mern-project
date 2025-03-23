import React, { useState } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Header from "./Header"; // Import the Header component

// Use the same BACKEND_URL as in other components
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const OvertimeForm = ({ employees }) => {
  const [formData, setFormData] = useState({
    employeeId: "",
    overtimeHours: "",
    date: "", // Use YYYY-MM-DD format
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.employeeId) newErrors.employeeId = "Employee is required";
    if (!formData.overtimeHours) {
      newErrors.overtimeHours = "Overtime Hours is required";
    } else {
      const overtimeHoursNum = Number(formData.overtimeHours);
      if (isNaN(overtimeHoursNum) || overtimeHoursNum <= 0) {
        newErrors.overtimeHours = "Overtime Hours must be a number greater than 0";
      } else if (!Number.isInteger(overtimeHoursNum)) {
        newErrors.overtimeHours = "Overtime Hours must be a whole number";
      }
    }
    if (!formData.date) newErrors.date = "Date is required";
    else {
      const parsedDate = new Date(formData.date);
      if (isNaN(parsedDate.getTime())) {
        newErrors.date = "Invalid date format. Use YYYY-MM-DD.";
      } else if (parsedDate > new Date()) {
        newErrors.date = "Date cannot be in the future.";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const response = await axios.post(`${BACKEND_URL}/api/employee/overtime/add`, formData, {
        headers: { "Content-Type": "application/json" },
      });
      setSuccessMessage("Overtime record added successfully");
      setFormData({
        employeeId: "",
        overtimeHours: "",
        date: "",
      });
      setErrors({});
      setErrorMessage("");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error adding overtime record:", error);
      const errorMsg = error.response?.data?.details
        ? `Error adding overtime record: ${error.response.data.error} - ${error.response.data.details}`
        : `Error adding overtime record: ${error.response?.data?.error || error.message}`;
      setErrorMessage(errorMsg);
    }
  };

  return (
    <Box sx={{ mb: 4, px: 3, width: "100%", maxWidth: "100%" }}>
      <Header /> {/* Handicraft Store header */}
      <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
        Add Daily Overtime Record
      </Typography>
      <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => navigate("/list")}
        >
          Back to Employee List
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => navigate("/overtime/monthly")}
        >
          View Monthly Overtime Report
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
        <FormControl fullWidth margin="normal">
          <InputLabel>Employee</InputLabel>
          <Select
            name="employeeId"
            value={formData.employeeId}
            onChange={handleChange}
            required
            error={!!errors.employeeId}
          >
            <MenuItem value="">Select Employee</MenuItem>
            {employees.map((employee) => (
              <MenuItem key={employee._id} value={employee._id}>
                {employee.empname} (ID: {employee.empID})
              </MenuItem>
            ))}
          </Select>
          {errors.employeeId && (
            <Typography color="error" variant="caption">
              {errors.employeeId}
            </Typography>
          )}
        </FormControl>
        <TextField
          label="Overtime Hours"
          name="overtimeHours"
          type="number"
          value={formData.overtimeHours}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          error={!!errors.overtimeHours}
          helperText={errors.overtimeHours}
          inputProps={{ min: 1, step: 1 }} // Enforce whole numbers, minimum 1
        />
        <TextField
          label="Date"
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          error={!!errors.date}
          helperText={errors.date}
          InputLabelProps={{ shrink: true }}
        />
        <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
          <Button type="submit" variant="contained" color="primary">
            Add Overtime Record
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default OvertimeForm;