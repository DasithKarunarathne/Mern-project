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
  Alert,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import EmployeeUpdateForm from "./EmployeeUpdateForm";
import Header from "./Header"; // Import the Header component

// Use the same BACKEND_URL as in other components
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const EmployeeList = ({ refresh }) => {
  const [employees, setEmployees] = useState([]);
  const [overtimeRecords, setOvertimeRecords] = useState({});
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
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

  // Helper function to format date safely
  const formatDate = (dateString) => {
    if (!dateString) return "No date available";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Helper function to format the month (e.g., "2025-03" to "Mar 2025")
  const formatMonth = (monthString) => {
    if (!monthString) return "Unknown Month";
    const [year, month] = monthString.split("-");
    const date = new Date(year, month - 1); // month is 0-based in JavaScript
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  return (
    <Box sx={{ px: 3, width: "100%", maxWidth: "100%" }}>
      <Header /> {/* Handicraft Store header */}
      <Box sx={{ mb: 2, display: "flex", gap: 2, mt: 2 }}>
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
          onClick={() => navigate("/overtime")} // Navigate to the Add Daily Overtime Record page
        >
          Add Overtime
        </Button>
      </Box>
      {employees.length === 0 ? (
        <Typography>No employees found.</Typography>
      ) : (
        employees.map((employee) => (
          <Card key={employee._id} sx={{ mb: 2, width: "100%" }}>
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
              <Typography>Total Overtime Pay: ${employee.totalOvertimePay.toLocaleString()}</Typography> {/* Display totalOvertimePay */}
              {overtimeRecords[employee._id] && overtimeRecords[employee._id].length > 0 ? (
                overtimeRecords[employee._id].map((record) => (
                  <Box key={record._id}>
                    <Typography variant="subtitle2" sx={{ mt: 1 }}>
                      Month: {formatMonth(record.month)}
                    </Typography>
                    {record.details && record.details.length > 0 ? (
                      record.details.map((detail, index) => (
                        <Typography key={`${record._id}-${index}`}>
                          Overtime ({formatDate(detail.date)}): {detail.overtimeHours} hrs (EmpID: {record.empID})
                        </Typography>
                      ))
                    ) : (
                      <Typography>No overtime details found for this month.</Typography>
                    )}
                  </Box>
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
    </Box>
  );
};

export default EmployeeList;