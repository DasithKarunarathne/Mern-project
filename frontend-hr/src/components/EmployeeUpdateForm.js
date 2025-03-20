import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  FormControl,
  InputLabel,
} from "@mui/material";

const EmployeeUpdateForm = ({ employee, onUpdate, onCancel }) => {
  const [formData, setFormData] = useState({
    empID: employee.empID,
    empname: employee.empname,
    role: employee.role,
    basicSalary: employee.basicSalary,
    overtimeHours: employee.overtimeHours,
    overtimeRate: employee.overtimeRate,
    epfPercentage: employee.epfPercentage,
    etfPercentage: employee.etfPercentage,
    image: null,
    birthCertificate: null,
    medicalRecords: null,
  });

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
      const response = await axios.put(`http://localhost:4000/api/employee/update/${employee._id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(response.data.status); // "User Updated"
      onUpdate(); // Refresh list
      onCancel(); // Close form
    } catch (error) {
      console.error(error);
      alert("Error updating employee: " + (error.response?.data?.error || error.message));
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Update Employee
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField label="Employee ID" name="empID" value={formData.empID} onChange={handleChange} required fullWidth />
        <TextField label="Name" name="empname" value={formData.empname} onChange={handleChange} required fullWidth />
        <TextField label="Role" name="role" value={formData.role} onChange={handleChange} required fullWidth />
        <TextField
          label="Basic Salary"
          name="basicSalary"
          type="number"
          value={formData.basicSalary}
          onChange={handleChange}
          required
          fullWidth
        />
        <TextField
          label="Overtime Hours (optional)"
          name="overtimeHours"
          type="number"
          value={formData.overtimeHours}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="Overtime Rate (optional)"
          name="overtimeRate"
          type="number"
          value={formData.overtimeRate}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="EPF Percentage (optional)"
          name="epfPercentage"
          type="number"
          value={formData.epfPercentage}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="ETF Percentage (optional)"
          name="etfPercentage"
          type="number"
          value={formData.etfPercentage}
          onChange={handleChange}
          fullWidth
        />
        <FormControl fullWidth>
          <InputLabel shrink>Image (optional)</InputLabel>
          <input type="file" name="image" accept="image/jpeg,image/png" onChange={handleChange} style={{ marginTop: "16px" }} />
        </FormControl>
        <FormControl fullWidth>
          <InputLabel shrink>Birth Certificate (optional)</InputLabel>
          <input
            type="file"
            name="birthCertificate"
            accept="image/jpeg,image/png,application/pdf"
            onChange={handleChange}
            style={{ marginTop: "16px" }}
          />
        </FormControl>
        <FormControl fullWidth>
          <InputLabel shrink>Medical Records (optional)</InputLabel>
          <input
            type="file"
            name="medicalRecords"
            accept="image/jpeg,image/png,application/pdf"
            onChange={handleChange}
            style={{ marginTop: "16px" }}
          />
        </FormControl>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="contained" color="primary" type="submit">
            Update Employee
          </Button>
          <Button variant="outlined" color="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default EmployeeUpdateForm;