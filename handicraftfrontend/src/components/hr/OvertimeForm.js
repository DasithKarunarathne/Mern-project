import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { AccessTime, People, CalendarToday, ArrowBack } from "@mui/icons-material";
import Header from "./Header";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const FormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  margin: theme.spacing(4, 'auto'),
  maxWidth: 800,
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

const CustomSelect = styled(Select)(({ theme }) => ({
  borderRadius: '12px',
  transition: 'all 0.3s ease',
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderWidth: '2px',
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

const OvertimeForm = () => {
  const [formData, setFormData] = useState({
    employeeId: "",
    overtimeHours: "",
    date: "",
  });
  const [employees, setEmployees] = useState([]);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/employee/`);
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setErrorMessage("Failed to load employees. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.employeeId) newErrors.employeeId = "Employee is required";
    if (!formData.overtimeHours) newErrors.overtimeHours = "Overtime Hours is required";
    else if (formData.overtimeHours <= 0) newErrors.overtimeHours = "Overtime Hours must be greater than 0";
    if (!formData.date) newErrors.date = "Date is required";
    else {
      const parsedDate = new Date(formData.date);
      if (isNaN(parsedDate.getTime())) newErrors.date = "Invalid date format. Use YYYY-MM-DD.";
      else if (parsedDate > new Date()) newErrors.date = "Date cannot be in the future.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      await axios.post(`${BACKEND_URL}/api/employee/overtime/add`, formData, {
        headers: { "Content-Type": "application/json" },
      });
      setSuccessMessage("Overtime record added successfully");
      setFormData({ employeeId: "", overtimeHours: "", date: "" });
      setErrors({});
      setErrorMessage("");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error adding overtime record:", error);
      const errorMsg = error.response?.data?.details
        ? `Error adding overtime record: ${error.response.data.error} - ${error.response.data.details}`
        : `Error adding overtime record: ${error.response?.data?.error || error.message}`;
      setErrorMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer>
      <Header />
      <Stepper activeStep={2} alternativeLabel sx={{ mb: 4 }}>
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
        Add Daily Overtime Record
      </Typography>

      <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
        <ActionButton
          variant="outlined"
          color="primary"
          onClick={() => navigate("/hr/list")}
          startIcon={<ArrowBack />}
        >
          Back to Employee List
        </ActionButton>
        <ActionButton
          variant="contained"
          color="secondary"
          onClick={() => navigate("/hr/overtime/monthly")}
          startIcon={<AccessTime />}
        >
          View Monthly Overtime Report
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
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.employeeId}>
                  <InputLabel>Employee</InputLabel>
                  <CustomSelect
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    required
                    startAdornment={
                      <InputAdornment position="start">
                        <People color="primary" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="">Select Employee</MenuItem>
                    {employees.length > 0 ? (
                      employees.map((employee) => (
                        <MenuItem key={employee._id} value={employee._id}>
                          {employee.empname} (ID: {employee.empID})
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No employees available</MenuItem>
                    )}
                  </CustomSelect>
                  {errors.employeeId && (
                    <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                      {errors.employeeId}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <CustomTextField
                  label="Overtime Hours"
                  name="overtimeHours"
                  type="number"
                  value={formData.overtimeHours}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!errors.overtimeHours}
                  helperText={errors.overtimeHours}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccessTime color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <CustomTextField
                  label="Date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!errors.date}
                  helperText={errors.date}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarToday color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
                  <ActionButton
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    sx={{
                      minWidth: 200,
                      backgroundColor: theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                      },
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Add Overtime Record"
                    )}
                  </ActionButton>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </FormCard>
    </FormContainer>
  );
};

export default OvertimeForm;