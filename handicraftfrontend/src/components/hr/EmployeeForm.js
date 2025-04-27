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
  Container,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
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

const employeeTypes = [
  "Lacemaker",
  "Mask Maker",
  "Wood Carver",
  "Metal Worker / Brass Worker",
  "Potter",
  "Handloom Weaver",
  "Batik Artist",
  "Jeweler",
  "Cane Craftsman",
  "Coir Craftsman",
  "Palm Leaf Craftsman",
  "Painter",
  "Stone Carver"
];

const EmployeeForm = ({ onEmployeeAdded }) => {
  const [formData, setFormData] = useState({
    empID: "",
    empname: "",
    role: "",
    basicSalary: "",
    overtimeRate: "",
    gender: "",
    contactNumber: "",
    address: "",
    emergencyContact: "",
    image: null,
    birthCertificate: null,
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
    
    // Basic Salary validation
    if (!formData.basicSalary) {
      tempErrors.basicSalary = "Basic Salary is required";
    } else if (isNaN(formData.basicSalary)) {
      tempErrors.basicSalary = "Basic Salary must be a number";
    } else if (parseFloat(formData.basicSalary) < 0) {
      tempErrors.basicSalary = "Basic Salary cannot be negative";
    } else if (parseFloat(formData.basicSalary) < 25000) {
      tempErrors.basicSalary = "Basic Salary must be at least LKR 25,000";
    }

    // Overtime Rate validation
    if (!formData.overtimeRate) {
      tempErrors.overtimeRate = "Overtime Rate is required";
    } else if (isNaN(formData.overtimeRate)) {
      tempErrors.overtimeRate = "Overtime Rate must be a number";
    } else if (parseFloat(formData.overtimeRate) < 0) {
      tempErrors.overtimeRate = "Overtime Rate cannot be negative";
    } else if (parseFloat(formData.overtimeRate) < 250) {
      tempErrors.overtimeRate = "Overtime Rate must be at least LKR 250 per hour";
    }

    if (!formData.gender) tempErrors.gender = "Gender is required";
    if (!formData.contactNumber) tempErrors.contactNumber = "Contact number is required";
    if (!formData.contactNumber.match(/^\d{10}$/)) tempErrors.contactNumber = "Contact number must be 10 digits";
    if (!formData.address) tempErrors.address = "Home address is required";
    if (!formData.emergencyContact) tempErrors.emergencyContact = "Emergency contact is required";
    if (!formData.emergencyContact.match(/^\d{10}$/)) tempErrors.emergencyContact = "Emergency contact must be 10 digits";
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
          gender: "",
          contactNumber: "",
          address: "",
          emergencyContact: "",
          image: null,
          birthCertificate: null,
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
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Container maxWidth="lg">
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
                  onChange={(e) => {
                    // Only allow letters and spaces
                    const value = e.target.value;
                    if (value === '' || /^[A-Za-z\s]+$/.test(value)) {
                      handleChange(e);
                    }
                  }}
                  onKeyDown={(e) => {
                    // Prevent numbers and special characters
                    const isLetter = /^[A-Za-z\s]$/.test(e.key);
                    const isAllowedKey = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key);
                    if (!isLetter && !isAllowedKey) {
                      e.preventDefault();
                    }
                  }}
          fullWidth
          required
          error={!!errors.empname}
          helperText={errors.empname}
          disabled={loading}
                  inputProps={{
                    pattern: "[A-Za-z\\s]+",
                    title: "Only letters and spaces are allowed"
                  }}
        />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  select
                  label="Role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!errors.role}
                  helperText={errors.role}
                  disabled={loading}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="">Select Role</option>
                  {employeeTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </CustomTextField>
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
          inputProps={{
                    min: 0,
                    onKeyDown: (e) => {
                      if (e.key === '-' || e.key === 'e') {
                        e.preventDefault();
                      }
                    },
                  }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">LKR</InputAdornment>,
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
          inputProps={{
                    min: 0,
                    onKeyDown: (e) => {
                      if (e.key === '-' || e.key === 'e') {
                        e.preventDefault();
                      }
                    },
                  }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">LKR</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  select
                  label="Gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!errors.gender}
                  helperText={errors.gender}
                  disabled={loading}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value=""></option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </CustomTextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  label="Contact Number"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!errors.contactNumber}
                  helperText={errors.contactNumber}
                  disabled={loading}
                  inputProps={{
                    maxLength: 10,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  label="Home Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  fullWidth
                  required
                  multiline
                  rows={3}
                  error={!!errors.address}
                  helperText={errors.address}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  label="Emergency Contact Number"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!errors.emergencyContact}
                  helperText={errors.emergencyContact}
                  disabled={loading}
                  inputProps={{
                    maxLength: 10,
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
                  label="Add Employee Image"
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
                  label="Add Employee Birth Certificate"
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
      </Container>
    </Box>
  );
};

export default EmployeeForm;