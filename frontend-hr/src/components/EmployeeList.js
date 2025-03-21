import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardMedia,
  Box,
  Button,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Alert,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import EmployeeUpdateForm from "./EmployeeUpdateForm";

// Use the same BACKEND_URL as in other components
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const EmployeeList = ({ refresh }) => {
  const [employees, setEmployees] = useState([]);
  const [overtimeRecords, setOvertimeRecords] = useState({});
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [overtimeData, setOvertimeData] = useState({
    employeeId: "",
    overtimeHours: "",
    date: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/employee/`);
      setEmployees(response.data);

      // Fetch overtime records for each employee
      const overtimeData = {};
      for (const employee of response.data) {
        const overtimeResponse = await axios.get(`${BACKEND_URL}/api/employee/overtime/${employee._id}`);
        overtimeData[employee._id] = overtimeResponse.data;
      }
      setOvertimeRecords(overtimeData);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [refresh]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await axios.delete(`${BACKEND_URL}/api/employee/delete/${id}`);
        fetchEmployees(); // Refresh the list after deletion
        alert("Employee deleted successfully");
      } catch (error) {
        console.error("Error deleting employee:", error);
        alert("Error deleting employee: " + (error.response?.data?.error || error.message));
      }
    }
  };

  const handleUpdateClick = (id) => {
    setSelectedEmployeeId(id === selectedEmployeeId ? null : id);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setOvertimeData({ employeeId: "", overtimeHours: "", date: "" });
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleOvertimeChange = (e) => {
    const { name, value } = e.target;
    setOvertimeData({ ...overtimeData, [name]: value });
  };

  const handleOvertimeSubmit = async (e) => {
    e.preventDefault();

    if (!overtimeData.employeeId || !overtimeData.overtimeHours || !overtimeData.date) {
      setErrorMessage("All fields are required");
      return;
    }

    try {
      const response = await axios.post(`${BACKEND_URL}/api/employee/overtime/add`, overtimeData);
      setSuccessMessage("Overtime added successfully");
      fetchEmployees(); // Refresh the list to show the new overtime record
      setTimeout(() => {
        setSuccessMessage("");
        handleCloseDialog();
      }, 2000);
    } catch (err) {
      console.error("Error adding overtime:", err);
      setErrorMessage(err.response?.data?.error || "Failed to add overtime");
    }
  };

  // Helper function to format date safely
  const formatDate = (dateString) => {
    if (!dateString) return "Invalid Date";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toISOString().split("T")[0];
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Employee Management
      </Typography>
      <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/")}
        >
          Add New Employee
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => navigate("/overtime/monthly")}
        >
          View Monthly Overtime Report
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenDialog}
        >
          Add Overtime
        </Button>
      </Box>
      {employees.length === 0 ? (
        <Typography>No employees found.</Typography>
      ) : (
        employees.map((employee) => (
          <Card key={employee._id} sx={{ maxWidth: 600, mb: 2 }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h6">
                  {employee.empname} (ID: {employee.empID})
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
              <Typography color="textSecondary">{employee.role}</Typography>
              <Typography>Salary: ${employee.basicSalary}</Typography>
              <Typography>Overtime Rate: ${employee.overtimeRate}/hr</Typography>
              {overtimeRecords[employee._id] && overtimeRecords[employee._id].length > 0 ? (
                overtimeRecords[employee._id].map((record) => (
                  <Typography key={record._id}>
                    Overtime ({formatDate(record.date)}): {record.overtimeHours} hrs
                  </Typography>
                ))
              ) : (
                <Typography>No overtime records found.</Typography>
              )}
              {employee.image && (
                <CardMedia component="img" image={employee.image} alt={employee.empname} sx={{ width: 100, mt: 1 }} />
              )}
              {selectedEmployeeId === employee._id && (
                <EmployeeUpdateForm employee={employee} onUpdate={fetchEmployees} onCancel={() => setSelectedEmployeeId(null)} />
              )}
            </CardContent>
          </Card>
        ))
      )}

      {/* Dialog for Adding Overtime */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Add Overtime</DialogTitle>
        <DialogContent>
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
          <Box component="form" onSubmit={handleOvertimeSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Employee</InputLabel>
              <Select
                name="employeeId"
                value={overtimeData.employeeId}
                onChange={handleOvertimeChange}
                required
              >
                <MenuItem value="">Select Employee</MenuItem>
                {employees.map((employee) => (
                  <MenuItem key={employee._id} value={employee._id}>
                    {employee.empname} (ID: {employee.empID})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Overtime Hours"
              name="overtimeHours"
              type="number"
              value={overtimeData.overtimeHours}
              onChange={handleOvertimeChange}
              fullWidth
              required
            />
            <TextField
              label="Date"
              name="date"
              type="date"
              value={overtimeData.date}
              onChange={handleOvertimeChange}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleOvertimeSubmit} color="primary">
            Add Overtime
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeList;