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
  CircularProgress,
  Alert,
} from "@mui/material";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const EmployeeUpdateForm = ({ employee, onUpdate, onCancel }) => {
  const [formData, setFormData] = useState({
    empID: employee.empID,
    empname: employee.empname,
    role: employee.role,
    basicSalary: employee.basicSalary,
    overtimeRate: employee.overtimeRate,
    image: null,
    birthCertificate: null,
    medicalRecords: null,
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) setFormData({ ...formData, [name]: files[0] });
    else setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

    const maxRetries = 3;
    let attempt = 0;
    let success = false;
    let lastError = null;

    while (attempt < maxRetries && !success) {
      try {
        await axios.put(`${BACKEND_URL}/api/employee/update/${employee._id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 20000,
        });
        success = true;
        setSuccessMessage("Employee Updated Successfully");
        setTimeout(() => {
          setSuccessMessage("");
          onUpdate();
          onCancel();
        }, 3000);
      } catch (error) {
        attempt++;
        lastError = error;
        console.error(`Attempt ${attempt} failed:`, error);
        if (attempt === maxRetries) {
          setErrorMessage(
            error.response?.data?.details
              ? `Error updating employee: ${error.response.data.error} - ${error.response.data.details}`
              : `Error updating employee: ${error.response?.data?.error || error.message}`
          );
        } else {
          console.log(`Retrying... (${attempt}/${maxRetries})`);
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }
    }
    setLoading(false);
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Update Employee
      </Typography>
      {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
      {errorMessage && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>}
      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField label="Employee ID" name="empID" value={formData.empID} onChange={handleChange} required fullWidth disabled={loading} />
        <TextField label="Name" name="empname" value={formData.empname} onChange={handleChange} required fullWidth disabled={loading} />
        <TextField label="Role" name="role" value={formData.role} onChange={handleChange} required fullWidth disabled={loading} />
        <TextField
          label="Basic Salary"
          name="basicSalary"
          type="number"
          value={formData.basicSalary}
          onChange={handleChange}
          required
          fullWidth
          disabled={loading}
        />
        <TextField
          label="Overtime Rate (optional)"
          name="overtimeRate"
          type="number"
          value={formData.overtimeRate}
          onChange={handleChange}
          fullWidth
          disabled={loading}
        />
        <FormControl fullWidth>
          <InputLabel shrink>Employee Photo (current file will be kept if not updated)</InputLabel>
          <input type="file" name="image" accept="image/jpeg,image/png" onChange={handleChange} style={{ marginTop: "16px" }} disabled={loading} />
          {employee.image && !formData.image && (
            <Typography variant="caption" color="textSecondary">
              Current: Image file (type: {employee.imageType})
            </Typography>
          )}
        </FormControl>
        <FormControl fullWidth>
          <InputLabel shrink>Birth Certificate (current file will be kept if not updated)</InputLabel>
          <input
            type="file"
            name="birthCertificate"
            accept="image/jpeg,image/png,application/pdf"
            onChange={handleChange}
            style={{ marginTop: "16px" }}
            disabled={loading}
          />
          {employee.birthCertificate && !formData.birthCertificate && (
            <Typography variant="caption" color="textSecondary">
              Current: Birth Certificate (type: {employee.birthCertificateType})
            </Typography>
          )}
        </FormControl>
        <FormControl fullWidth>
          <InputLabel shrink>Medical Records (optional, current file will be kept if not updated)</InputLabel>
          <input
            type="file"
            name="medicalRecords"
            accept="image/jpeg,image/png,application/pdf"
            onChange={handleChange}
            style={{ marginTop: "16px" }}
            disabled={loading}
          />
          {employee.medicalRecords && !formData.medicalRecords && (
            <Typography variant="caption" color="textSecondary">
              Current: Medical Records (type: {employee.medicalRecordsType})
            </Typography>
          )}
        </FormControl>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? "Updating Employee..." : "Update Employee"}
          </Button>
          <Button variant="outlined" color="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default EmployeeUpdateForm;