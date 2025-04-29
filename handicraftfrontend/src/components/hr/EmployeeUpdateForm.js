import React, { useState, useEffect } from "react";
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
    empID: employee.empID || '',
    empname: employee.empname || '',
    role: employee.role || '',
    basicSalary: employee.basicSalary || '',
    overtimeRate: employee.overtimeRate || '200',
    gender: employee.gender || '',
    contactNumber: employee.contactNumber || '',
    address: employee.address || '',
    emergencyContact: employee.emergencyContact || '',
    image: null,
    birthCertificate: null,
    medicalRecords: null,
    existingImage: employee.image || null,
    existingBirthCertificate: employee.birthCertificate || null,
    existingMedicalRecords: employee.medicalRecords || null
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Debug log for initial props and state
  useEffect(() => {
    console.log('Employee Data:', employee);
    console.log('Initial Form Data:', formData);
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!formData.empID?.trim()) {
      errors.empID = 'Employee ID is required';
    }
    if (!formData.empname?.trim()) {
      errors.empname = 'Employee name is required';
    }
    if (!formData.role?.trim()) {
      errors.role = 'Role is required';
    }
    if (!formData.gender?.trim()) {
      errors.gender = 'Gender is required';
    }
    if (!formData.contactNumber?.trim()) {
      errors.contactNumber = 'Contact number is required';
    }
    if (!formData.address?.trim()) {
      errors.address = 'Address is required';
    }
    if (!formData.emergencyContact?.trim()) {
      errors.emergencyContact = 'Emergency contact is required';
    }
    if (!formData.basicSalary || isNaN(formData.basicSalary) || Number(formData.basicSalary) <= 0) {
      errors.basicSalary = 'Basic salary must be a positive number';
    }
    if (formData.overtimeRate && (isNaN(formData.overtimeRate) || Number(formData.overtimeRate) < 0)) {
      errors.overtimeRate = 'Overtime rate must be a non-negative number';
    }

    // Only validate required files if they're not already present
    if (!formData.image && !formData.existingImage) {
      errors.image = 'Employee photo is required';
    }
    if (!formData.birthCertificate && !formData.existingBirthCertificate) {
      errors.birthCertificate = 'Birth certificate is required';
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      const file = files[0];
      if (file) {
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setValidationErrors(prev => ({
            ...prev,
            [name]: 'File size must be less than 5MB'
          }));
          return;
        }

        // Validate file type
        const validImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const validDocTypes = [...validImageTypes, 'application/pdf'];
        
        if (name === 'image' && !validImageTypes.includes(file.type)) {
          setValidationErrors(prev => ({
            ...prev,
            [name]: 'Please upload a valid image file (JPEG, PNG, or WebP)'
          }));
          return;
        }
        
        if ((name === 'birthCertificate' || name === 'medicalRecords') && !validDocTypes.includes(file.type)) {
          setValidationErrors(prev => ({
            ...prev,
            [name]: 'Please upload a valid file (PDF, JPEG, or PNG)'
          }));
          return;
        }

        // Clear error if file is valid
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
        setFormData(prev => ({ ...prev, [name]: file }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      // Validate form
      const errors = validateForm();
      if (Object.keys(errors).length > 0) {
        console.log('Validation errors:', errors);
        setValidationErrors(errors);
        throw new Error('Please fix all validation errors before submitting.');
      }

      const data = new FormData();
      
      // Add all required fields
      const basicFields = {
        empID: formData.empID.trim(),
        empname: formData.empname.trim(),
        role: formData.role.trim(),
        basicSalary: formData.basicSalary,
        overtimeRate: formData.overtimeRate || "200",
        gender: formData.gender.trim(),
        contactNumber: formData.contactNumber.trim(),
        address: formData.address.trim(),
        emergencyContact: formData.emergencyContact.trim()
      };

      // Log the data being sent
      console.log('Submitting data:', basicFields);
      
      // Append all fields
      Object.entries(basicFields).forEach(([key, value]) => {
        data.append(key, value);
      });

      // Handle files - only send new files if they exist
      if (formData.image) {
        console.log('Appending new image:', formData.image.name);
        data.append("image", formData.image);
      }

      if (formData.birthCertificate) {
        console.log('Appending new birth certificate:', formData.birthCertificate.name);
        data.append("birthCertificate", formData.birthCertificate);
      }

      if (formData.medicalRecords) {
        console.log('Appending new medical records:', formData.medicalRecords.name);
        data.append("medicalRecords", formData.medicalRecords);
      }

      // Add flags to indicate if we're keeping existing files
      data.append("keepExistingImage", !formData.image && formData.existingImage ? "true" : "false");
      data.append("keepExistingBirthCertificate", !formData.birthCertificate && formData.existingBirthCertificate ? "true" : "false");
      data.append("keepExistingMedicalRecords", !formData.medicalRecords && formData.existingMedicalRecords ? "true" : "false");

      console.log('Making API call to:', `${BACKEND_URL}/api/employee/update/${employee._id}`);
      
      const response = await axios.put(
        `${BACKEND_URL}/api/employee/update/${employee._id}`,
        data,
        {
          headers: { 
            "Content-Type": "multipart/form-data"
          },
          timeout: 30000,
          validateStatus: function (status) {
            return status >= 200 && status < 500;
          }
        }
      );

      console.log('API Response:', response);

      if (response.status === 200) {
        setSuccessMessage("Employee Updated Successfully");
        setTimeout(() => {
          setSuccessMessage("");
          onUpdate();
          onCancel();
        }, 3000);
      } else {
        throw new Error(response.data.error || 'Update failed');
      }
    } catch (error) {
      console.error('Update failed:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });

      if (error.response?.status === 500) {
        setErrorMessage('Server error occurred. Please check server logs for details.');
      } else if (error.response?.data?.error) {
        setErrorMessage(error.response.data.error);
      } else if (error.message.includes('validation')) {
        setErrorMessage('Please fix the form errors and try again.');
      } else {
        setErrorMessage(
          'Failed to update employee. Please check your connection and try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Update Employee
      </Typography>
      {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
      {errorMessage && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>}
      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField 
          label="Employee ID" 
          name="empID" 
          value={formData.empID} 
          onChange={handleChange} 
          required 
          fullWidth 
          disabled={loading}
          error={!!validationErrors.empID}
          helperText={validationErrors.empID}
        />
        <TextField 
          label="Name" 
          name="empname" 
          value={formData.empname} 
          onChange={handleChange} 
          required 
          fullWidth 
          disabled={loading}
          error={!!validationErrors.empname}
          helperText={validationErrors.empname}
        />
        <TextField 
          label="Role" 
          name="role" 
          value={formData.role} 
          onChange={handleChange} 
          required 
          fullWidth 
          disabled={loading}
          error={!!validationErrors.role}
          helperText={validationErrors.role}
        />
        <TextField 
          label="Gender"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          required
          fullWidth
          disabled={loading}
          error={!!validationErrors.gender}
          helperText={validationErrors.gender}
        />
        <TextField 
          label="Contact Number"
          name="contactNumber"
          value={formData.contactNumber}
          onChange={handleChange}
          required
          fullWidth
          disabled={loading}
          error={!!validationErrors.contactNumber}
          helperText={validationErrors.contactNumber}
        />
        <TextField 
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
          fullWidth
          multiline
          rows={3}
          disabled={loading}
          error={!!validationErrors.address}
          helperText={validationErrors.address}
        />
        <TextField 
          label="Emergency Contact"
          name="emergencyContact"
          value={formData.emergencyContact}
          onChange={handleChange}
          required
          fullWidth
          disabled={loading}
          error={!!validationErrors.emergencyContact}
          helperText={validationErrors.emergencyContact}
        />
        <TextField
          label="Basic Salary"
          name="basicSalary"
          type="number"
          value={formData.basicSalary}
          onChange={handleChange}
          required
          fullWidth
          disabled={loading}
          error={!!validationErrors.basicSalary}
          helperText={validationErrors.basicSalary}
        />
        <TextField
          label="Overtime Rate"
          name="overtimeRate"
          type="number"
          value={formData.overtimeRate}
          onChange={handleChange}
          fullWidth
          disabled={loading}
          error={!!validationErrors.overtimeRate}
          helperText={validationErrors.overtimeRate}
        />
        <FormControl fullWidth error={!!validationErrors.image}>
          <InputLabel shrink>Employee Photo (current file will be kept if not updated)</InputLabel>
          <input 
            type="file" 
            name="image" 
            accept="image/jpeg,image/png" 
            onChange={handleChange} 
            style={{ marginTop: "16px" }} 
            disabled={loading} 
          />
          {validationErrors.image && (
            <Typography variant="caption" color="error">
              {validationErrors.image}
            </Typography>
          )}
          {employee.image && !formData.image && (
            <Typography variant="caption" color="textSecondary">
              Current: Image file (type: {employee.imageType})
            </Typography>
          )}
        </FormControl>
        <FormControl fullWidth error={!!validationErrors.birthCertificate}>
          <InputLabel shrink>Birth Certificate (current file will be kept if not updated)</InputLabel>
          <input
            type="file"
            name="birthCertificate"
            accept="image/jpeg,image/png,application/pdf"
            onChange={handleChange}
            style={{ marginTop: "16px" }}
            disabled={loading}
          />
          {validationErrors.birthCertificate && (
            <Typography variant="caption" color="error">
              {validationErrors.birthCertificate}
            </Typography>
          )}
          {employee.birthCertificate && !formData.birthCertificate && (
            <Typography variant="caption" color="textSecondary">
              Current: Birth Certificate (type: {employee.birthCertificateType})
            </Typography>
          )}
        </FormControl>
        <FormControl fullWidth error={!!validationErrors.medicalRecords}>
          <InputLabel shrink>Medical Records (optional, current file will be kept if not updated)</InputLabel>
          <input
            type="file"
            name="medicalRecords"
            accept="image/jpeg,image/png,application/pdf"
            onChange={handleChange}
            style={{ marginTop: "16px" }}
            disabled={loading}
          />
          {validationErrors.medicalRecords && (
            <Typography variant="caption" color="error">
              {validationErrors.medicalRecords}
            </Typography>
          )}
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
            disabled={loading || Object.keys(validationErrors).length > 0}
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