import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  useTheme,
  useMediaQuery,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Edit, Delete, Search, Add, AccessTime, Description } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import EmployeeUpdateForm from "./EmployeeUpdateForm";
import Header from "./Header";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const ListContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  margin: theme.spacing(4, 'auto'),
  maxWidth: 1200,
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
}));

const EmployeeCard = styled(Card)(({ theme }) => ({
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

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [overtimeRecords, setOvertimeRecords] = useState({});
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/employee/`);
      setEmployees(response.data);
      setFilteredEmployees(response.data);

      const overtimeData = {};
      for (const employee of response.data) {
        const overtimeResponse = await axios.get(`${BACKEND_URL}/api/employee/overtime/${employee._id}`);
        overtimeData[employee._id] = overtimeResponse.data;
      }
      setOvertimeRecords(overtimeData);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setError("Failed to load employees. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    let filtered = employees;
    if (searchTerm) {
      filtered = filtered.filter((employee) =>
        employee.empname.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredEmployees(filtered);
  }, [searchTerm, employees]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await axios.delete(`${BACKEND_URL}/api/employee/delete/${id}`);
        fetchEmployees();
        toast.success("Employee deleted successfully");
      } catch (error) {
        console.error("Error deleting employee:", error);
        toast.error("Error deleting employee: " + (error.response?.data?.error || error.message));
      }
    }
  };

  const handleUpdateClick = (id) => {
    setSelectedEmployeeId(id === selectedEmployeeId ? null : id);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No date available";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const formatMonth = (monthString) => {
    if (!monthString) return "Unknown Month";
    const [year, month] = monthString.split("-");
    const date = new Date(year, month - 1);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
  };

  return (
    <ListContainer>
      <Header />
      <Stepper activeStep={1} alternativeLabel sx={{ mb: 4 }}>
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
        Employee List
      </Typography>

      <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
        <ActionButton
          variant="contained"
          color="primary"
          onClick={() => navigate("/hr")}
          startIcon={<Add />}
        >
          Add New Employee
        </ActionButton>
        <ActionButton
          variant="contained"
          color="secondary"
          onClick={() => navigate("/hr/overtime/monthly")}
          startIcon={<AccessTime />}
        >
          View Monthly Overtime Report
        </ActionButton>
        <ActionButton
          variant="contained"
          color="primary"
          onClick={() => navigate("/hr/overtime")}
          startIcon={<Description />}
        >
          Add Overtime
        </ActionButton>
        <CustomTextField
          label="Search Employees"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: (
              <Search color="primary" sx={{ mr: 1 }} />
            ),
          }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress size={60} thickness={4} />
        </Box>
      ) : filteredEmployees.length === 0 ? (
        <Typography variant="h6" align="center" sx={{ my: 4 }}>
          No employees found.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredEmployees.map((employee) => (
            <Grid item xs={12} sm={6} md={4} key={employee._id}>
              <EmployeeCard>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {employee.empname}
                    </Typography>
                    <Box>
                      <IconButton color="primary" onClick={() => handleUpdateClick(employee._id)}>
                        <Edit />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(employee._id)}>
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Chip
                    label={`ID: ${employee.empID}`}
                    size="small"
                    sx={{ mb: 2 }}
                  />
                  <Chip
                    label={employee.role}
                    color="primary"
                    size="small"
                    sx={{ mb: 2, ml: 1 }}
                  />

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Basic Salary: ${employee.basicSalary}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Overtime Rate: ${employee.overtimeRate}/hr
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Overtime Pay: ${employee.totalOvertimePay?.toLocaleString() || '0'}
                    </Typography>
                  </Box>

                  {employee.image && (
                    <CardMedia
                      component="img"
                      image={employee.image}
                      alt={employee.empname}
                      sx={{
                        width: '100%',
                        height: 200,
                        objectFit: 'cover',
                        borderRadius: '8px',
                        mb: 2,
                      }}
                    />
                  )}

                  {overtimeRecords[employee._id] && overtimeRecords[employee._id].length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Recent Overtime Records:
                      </Typography>
                      {overtimeRecords[employee._id].slice(0, 2).map((record) => (
                        <Box key={record._id} sx={{ mb: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            {formatMonth(record.month)}: {record.totalOvertimeHours} hours
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}

                  {selectedEmployeeId === employee._id && (
                    <Box sx={{ mt: 2 }}>
                      <Divider sx={{ my: 2 }} />
                      <EmployeeUpdateForm
                        employee={employee}
                        onUpdate={fetchEmployees}
                        onCancel={() => setSelectedEmployeeId(null)}
                      />
                    </Box>
                  )}
                </CardContent>
              </EmployeeCard>
            </Grid>
          ))}
        </Grid>
      )}
    </ListContainer>
  );
};

export default EmployeeList;