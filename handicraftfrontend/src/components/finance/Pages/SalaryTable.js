import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
    Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Snackbar,
} from "@mui/material";

const Salarytable = () => {
  const [month, setMonth] = useState("2025-02");
  const [salaries, setSalaries] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Memoize fetchSalaries to prevent recreation on every render
  const fetchSalaries = useCallback(async () => {
    if (!month) {
      setError("Please select a month");
      return;
    }
    try {
      const response = await axios.get(`http://localhost:5000/api/salary/${month}`);
      setSalaries(response.data); // Array directly from getsalaries
      setError(null);
    } catch (error) {
      console.error("Error fetching salaries", error);
      setError("Failed to fetch salaries: " + (error.response?.data?.message || error.message));
    }
  }, [month]); // month is a dependency of fetchSalaries

  useEffect(() => {
    fetchSalaries();
  }, [fetchSalaries]); // Now fetchSalaries is stable and a valid dependency

  const genSalaries = async () => {
    if (!month) {
      setError("Please select a month to generate salaries");
      return;
    }
    try {
      const response = await axios.post("http://localhost:5000/api/salary/calculate", { month });
      setSalaries(response.data.salaries || []);
      setSuccess(response.data.message);
      setError(null);
    } catch (error) {
      console.error("Error generating salaries", error);
      setError("Failed to generate salaries: " + (error.response?.data?.message || error.message));
    }
  };

  const markSalaryPaid = async (salaryId) => {
    try {
      await axios.put(`http://localhost:5000/api/salary/markPaid/${salaryId}`);
      setSuccess("Salary marked as paid");
      setError(null);
      fetchSalaries();
    } catch (error) {
      console.error("Error marking salary as paid", error);
      setError("Failed to mark salary as paid: " + (error.response?.data?.message || error.message));
    }
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <Paper elevation={3} sx={{ padding: 3, margin: 2 }}>
      <Typography variant="h4" gutterBottom>
        Salary Management
      </Typography>

      {/* Month Selection and Buttons */}
      <Box sx={{ display: "flex", gap: 2, marginBottom: 3 }}>
        <TextField
          type="month"
          label="Select Month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <Button variant="contained" color="primary" onClick={fetchSalaries}>
          Fetch Salaries
        </Button>
        <Button variant="contained" color="secondary" onClick={genSalaries}>
          Generate Salaries
        </Button>
      </Box>

      {/* Error and Success Alerts */}
      {error && (
        <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert severity="error" onClose={handleCloseSnackbar}>
            {error}
          </Alert>
        </Snackbar>
      )}
      {success && (
        <Snackbar open={!!success} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert severity="success" onClose={handleCloseSnackbar}>
            {success}
          </Alert>
        </Snackbar>
      )}

      {/* Salary Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee ID</TableCell>
              <TableCell>Employee Name</TableCell>
              <TableCell>Month</TableCell>
              <TableCell>Basic Salary</TableCell>
              <TableCell>Overtime Pay</TableCell>
              <TableCell>EPF</TableCell>
              <TableCell>ETF</TableCell>
              <TableCell>Net Salary</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {salaries.map((salary) => (
              <TableRow key={salary._id}>
                <TableCell>{salary.employeeId}</TableCell>
                <TableCell>{salary.employeeName}</TableCell>
                <TableCell>{salary.month}</TableCell>
                <TableCell>{salary.basicSalary}</TableCell>
                <TableCell>{(salary.overtimeHours * salary.overtimeRate).toFixed(2)}</TableCell>
                <TableCell>{salary.epf.toFixed(2)}</TableCell>
                <TableCell>{salary.etf.toFixed(2)}</TableCell>
                <TableCell>{salary.netSalary.toFixed(2)}</TableCell>
                <TableCell>{salary.status}</TableCell>
                <TableCell>
                  {salary.status === "Pending" ? (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => markSalaryPaid(salary._id)}
                    >
                      Mark as Paid
                    </Button>
                  ) : (
                    <Typography>
                      Paid on {new Date(salary.paymentDate).toLocaleDateString()}
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default Salarytable;