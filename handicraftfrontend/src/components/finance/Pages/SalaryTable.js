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
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, "0");
  const currentMonthString = `${currentYear}-${currentMonth}`;

  const [month, setMonth] = useState(currentMonthString);
  const [salaries, setSalaries] = useState([]);
  const [filteredSalaries, setFilteredSalaries] = useState([]);
  const [searchEmpId, setSearchEmpId] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchSalaries = useCallback(async () => {
    if (!month) {
      setError("Please select a month");
      return;
    }
    try {
      const response = await axios.get(`http://localhost:5000/api/salary/${month}`);
      setSalaries(response.data);
      setFilteredSalaries(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching salaries", error);
      setError("Failed to fetch salaries: " + (error.response?.data?.message || error.message));
    }
  }, [month]);

  useEffect(() => {
    fetchSalaries();
  }, [fetchSalaries]);

  const handleSearch = (e) => {
    const empId = e.target.value;
    setSearchEmpId(empId);
    if (empId.trim() === "") {
      setFilteredSalaries(salaries);
    } else {
      const filtered = salaries.filter((salary) =>
        salary.employeeId.toLowerCase().includes(empId.toLowerCase())
      );
      setFilteredSalaries(filtered);
    }
  };

  const genSalaries = async () => {
    if (!month) {
      setError("Please select a month to generate salaries");
      return;
    }
    
    // Check if selected month is current month
    if (month !== currentMonthString) {
      setError("You can only generate salaries for the current month");
      return;
    }
    
    try {
      const response = await axios.post("http://localhost:5000/api/salary/calculate", { month });
      setSalaries(response.data.salaries || []);
      setFilteredSalaries(response.data.salaries || []);
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

      <Box sx={{ display: "flex", gap: 2, marginBottom: 3, alignItems: "center" }}>
      <TextField
      type="month"
      label="Select Month"
      value={month}
      onChange={(e) => setMonth(e.target.value)}
      slotProps={{
        inputLabel: {
          shrink: true,
        },
        htmlInput: {
          max: currentMonthString
        }
      }}
    />
        <TextField
          label="Search by Employee ID"
          value={searchEmpId}
          onChange={handleSearch}
          placeholder="Enter Employee ID"
          sx={{ width: "200px" }}
        />
        <Button variant="contained" color="primary" onClick={fetchSalaries}>
          Fetch Salaries
        </Button>
        <Button 
          variant="contained" 
          color="secondary" 
          onClick={genSalaries}
          disabled={month !== currentMonthString} // Disable for past months
        >
          Generate Salaries
        </Button>
      </Box>

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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee ID</TableCell>
              <TableCell>Employee Name</TableCell>
              <TableCell>Month</TableCell>
              <TableCell>Basic Salary</TableCell>
              <TableCell>Overtime Hours</TableCell>
              <TableCell>Overtime Rate</TableCell>
              <TableCell>Total Overtime</TableCell>
              <TableCell>EPF 8%</TableCell>
              <TableCell>ETF 3%</TableCell>
              <TableCell>EPF 12%</TableCell>
              <TableCell>Net Salary</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSalaries.map((salary) => (
              <TableRow key={salary._id}>
                <TableCell>{salary.employeeId}</TableCell>
                <TableCell>{salary.employeeName}</TableCell>
                <TableCell>{salary.month}</TableCell>
                <TableCell>{salary.basicSalary}</TableCell>
                <TableCell>{salary.overtimeHours || 0}</TableCell>
                <TableCell>{salary.overtimeRate || 0}</TableCell>
                <TableCell>{salary.totalOvertime.toFixed(2)}</TableCell>
                <TableCell>{salary.epf.toFixed(2)}</TableCell>
                <TableCell>{salary.etf.toFixed(2)}</TableCell>
                <TableCell>{salary.epf12.toFixed(2)}</TableCell>
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