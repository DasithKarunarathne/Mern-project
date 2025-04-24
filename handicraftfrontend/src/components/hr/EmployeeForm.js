import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Stepper,
  Step,
  StepLabel,
  InputAdornment,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PeopleIcon from "@mui/icons-material/People";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DescriptionIcon from "@mui/icons-material/Description";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const FormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  margin: theme.spacing(4, 'auto'),
  maxWidth: 1000,
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
}));

const FormCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
  },
}));

const CustomTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    transition: 'all 0.3s ease',
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderWidth: '2px',
    },
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5, 3),
  borderRadius: '12px',
  textTransform: 'none',
  fontWeight: 600,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
  },
}));

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData({ ...formData, [name]: files[0] });
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.empID) tempErrors.empID = "Employee ID is required";
    if (!formData.empname) tempErrors.empname = "Name is required";
    if (!formData.role) tempErrors.role = "Role is required";
    if (!formData.basicSalary) tempErrors.basicSalary = "Basic Salary is required";
    if (!formData.overtimeRate) tempErrors.overtimeRate = "Overtime Rate is required";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null) {
        formDataToSend.append(key, formData[key]);
      }
    });

    try {
      await axios.post(`${BACKEND_URL}/api/employee/add`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
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
      document.querySelectorAll("input[type=file]").forEach((input) => (input.value = ""));
      setTimeout(() => {
        setSuccessMessage("");
        if (onEmployeeAdded) onEmployeeAdded();
        navigate("/hr/list");
      }, 3000);
    } catch (error) {
      console.error("Error adding employee:", error);
      setErrorMessage("Error adding employee: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleViewList = () => {
    navigate("/hr/list");
  };

  return (
    <FormContainer>
      <Header />
      <Stepper activeStep={0} alternativeLabel sx={{ mb: 4 }}>
        <Step>
          <StepLabel>Add Employee</StepLabel>
        </Step>
        <Step>
          <StepLabel>Employee List</StepLabel>
        </Step>
        <Step>
          <StepLabel>Overtime Management</StepLabel>
        </Step>
      </Stepper>

      <Typography
        variant={isMobile ? "h4" : "h3"}
        sx={{
          fontWeight: 700,
          marginBottom: 4,
          textAlign: "center",
          color: theme.palette.primary.main,
        }}
      >
        Add New Employee
      </Typography>

      <Box sx={{ mb: 3, display: "flex", gap: 2, justifyContent: "center" }}>
        <ActionButton
          variant="contained"
          color="primary"
          onClick={handleViewList}
          disabled={loading}
          startIcon={<PeopleIcon />}
        >
          Employee List
        </ActionButton>
        <ActionButton
          variant="contained"
          color="secondary"
          onClick={() => navigate("/hr/overtime/monthly")}
          disabled={loading}
          startIcon={<AccessTimeIcon />}
        >
          View Monthly Overtime Report
        </ActionButton>
        <ActionButton
          variant="contained"
          color="primary"
          onClick={() => navigate("/hr/overtime")}
          disabled={loading}
          startIcon={<DescriptionIcon />}
        >
          Add Overtime
        </ActionButton>
      </Box>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>
          {successMessage}
        </Alert>
      )}
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
          {errorMessage}
        </Alert>
      )}

      <FormCard>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                label="Employee ID"
                name="empID"
                value={formData.empID}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.empID}
                helperText={errors.empID}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonAddIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                label="Name"
                name="empname"
                value={formData.empname}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.empname}
                helperText={errors.empname}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                label="Role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.role}
                helperText={errors.role}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                label="Basic Salary"
                name="basicSalary"
                type="number"
                value={formData.basicSalary}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.basicSalary}
                helperText={errors.basicSalary}
                disabled={loading}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                label="Overtime Rate"
                name="overtimeRate"
                type="number"
                value={formData.overtimeRate}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.overtimeRate}
                helperText={errors.overtimeRate}
                disabled={loading}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                type="file"
                name="image"
                onChange={handleFileChange}
                fullWidth
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CloudUploadIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                type="file"
                name="birthCertificate"
                onChange={handleFileChange}
                fullWidth
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DescriptionIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                type="file"
                name="medicalRecords"
                onChange={handleFileChange}
                fullWidth
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DescriptionIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </FormCard>

      <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
        <ActionButton
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={loading}
          sx={{
            minWidth: 200,
            backgroundColor: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
          }}
        >
          {loading ? "Adding..." : "Add Employee"}
        </ActionButton>
      </Box>
    </FormContainer>
  );
};

export default EmployeeForm;