import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

// Use the same BACKEND_URL as in other components
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const MonthlyOvertime = () => {
  const [year, setYear] = useState("2025"); // Default to 2025
  const [month, setMonth] = useState("03"); // Default to March (03)
  const [monthlyOvertime, setMonthlyOvertime] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchMonthlyOvertime = async () => {
    // Validate year and month
    if (!year || !month) {
      setError("Please enter both year and month.");
      return;
    }
    const parsedYear = parseInt(year);
    const parsedMonth = parseInt(month);
    if (isNaN(parsedYear) || isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
      setError("Invalid year or month. Year must be a number, and month must be between 1 and 12.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/employee/overtime/monthly/${year}/${month}`);
      setMonthlyOvertime(response.data);
    } catch (error) {
      console.error("Error fetching monthly overtime:", error);
      setError("Error fetching monthly overtime: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Fetch the report automatically when the component mounts or when year/month changes
  useEffect(() => {
    fetchMonthlyOvertime();
  }, [year, month]); // Dependencies: re-fetch when year or month changes

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "Invalid Date";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toISOString().split("T")[0];
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        Monthly Overtime Report
      </Typography>
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          label="Year (YYYY)"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          fullWidth
        />
        <TextField
          label="Month (MM)"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          fullWidth
        />
        <Button variant="outlined" color="primary" onClick={() => navigate("/list")}>
          Back to Employee List
        </Button>
      </Box>
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
          <CircularProgress />
        </Box>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {!loading && !error && monthlyOvertime.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Total Overtime Hours</TableCell>
                <TableCell>Overtime Rate ($/hr)</TableCell> {/* New column */}
                <TableCell>Overtime Pay ($)</TableCell>
                <TableCell>Overtime Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {monthlyOvertime.map((record) => (
                <TableRow key={record.employeeId}>
                  <TableCell>{record.empID}</TableCell>
                  <TableCell>{record.empname}</TableCell>
                  <TableCell>{record.totalOvertimeHours}</TableCell>
                  <TableCell>{record.overtimeRate.toFixed(2)}</TableCell> {/* Display overtime rate */}
                  <TableCell>{record.overtimePay.toFixed(2)}</TableCell>
                  <TableCell>
                    {record.details && record.details.length > 0 ? (
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Hours</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {record.details.map((detail, index) => (
                            <TableRow key={index}>
                              <TableCell>{formatDate(detail.date)}</TableCell>
                              <TableCell>{detail.overtimeHours}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <Typography variant="body2">No details available</Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : !loading && !error ? (
        <Typography>No overtime records found for this month.</Typography>
      ) : null}
    </Box>
  );
};

export default MonthlyOvertime;