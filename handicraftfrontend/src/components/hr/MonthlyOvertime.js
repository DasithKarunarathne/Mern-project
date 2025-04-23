import React, { useState, useEffect, useCallback } from "react";
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
import { useNavigate, useParams } from "react-router-dom";
import Header from "./Header"; // Adjust path if needed
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Import autoTable directly

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const MonthlyOvertime = () => {
  const { year: paramYear, month: paramMonth } = useParams();
  const [year, setYear] = useState(paramYear || "2025");
  const [month, setMonth] = useState(paramMonth || "03");
  const [monthlyOvertime, setMonthlyOvertime] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchMonthlyOvertime = useCallback(async () => {
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

    navigate(`/hr/overtime/monthly/${year}/${month}`); // Updated path
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/employee/overtime/monthly/${year}/${month}`);
      console.log("API Response:", response.data); // Log the API response
      if (response.data.message) {
        // Handle special messages from the backend (e.g., orphaned records)
        setError(response.data.message);
        setMonthlyOvertime([]);
      } else {
        setMonthlyOvertime(response.data);
      }
    } catch (error) {
      console.error("Error fetching monthly overtime:", error);
      setError("Error fetching monthly overtime: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  }, [year, month, navigate]); // Added navigate to dependencies

  useEffect(() => {
    if (paramYear && paramMonth) fetchMonthlyOvertime(); // Only fetch if params are present
  }, [paramYear, paramMonth, fetchMonthlyOvertime]); // Depend on params and fetchMonthlyOvertime

  useEffect(() => {
    fetchMonthlyOvertime();
  }, [fetchMonthlyOvertime]); // Fixed missing dependency

  // Log the state to debug rendering issues
  useEffect(() => {
    console.log("Current monthlyOvertime state:", monthlyOvertime);
  }, [monthlyOvertime]);

  const formatDate = (dateString) => {
    if (!dateString) return "Invalid Date";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toISOString().split("T")[0];
  };

  // Generate PDF
  const generatePDF = () => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text("Employee Management - Monthly Overtime Report", 14, 20);

    // Add year and month
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const monthName = months[parseInt(month) - 1];
    doc.setFontSize(12);
    doc.text(`Year: ${year} | Month: ${monthName}`, 14, 30);

    // Prepare table data
    const tableData = monthlyOvertime.map((record) => [
      record.empID,
      record.empname,
      record.totalOvertimeHours.toString(),
      `$${record.overtimeRate.toLocaleString()}`,
      `$${record.overtimePay.toLocaleString()}`,
      record.details && record.details.length > 0
        ? record.details
            .map(
              (detail) =>
                `Date: ${formatDate(detail.date)}, Hours: ${detail.overtimeHours}, Pay: $${detail.overtimePay.toLocaleString()}`
            )
            .join("\n")
        : "No details available",
    ]);

    // Add table to PDF using autoTable
    autoTable(doc, {
      startY: 40,
      head: [
        [
          "Employee ID",
          "Name",
          "Total Overtime Hours",
          "Overtime Rate ($/hr)",
          "Overtime Pay ($)",
          "Overtime Details",
        ],
      ],
      body: tableData,
      theme: "striped",
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [94, 53, 177] }, // Deep brown color for header
      margin: { top: 40 },
    });

    // Add footer with page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        `Page ${i} of ${pageCount} - Heritage Hands`,
        14,
        doc.internal.pageSize.height - 10
      );
    }

    // Save the PDF
    doc.save(`Overtime_Report_${year}_${month}.pdf`);
  };

  return (
    <Box sx={{ mb: 4, p: 3, maxWidth: 1200, margin: "0 auto" }}>
      <Header />
      <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
        Employee Management
      </Typography>
      <Typography variant="h5" gutterBottom>
        Monthly Overtime Report
      </Typography>
      <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
        <Button variant="contained" color="primary" onClick={() => navigate("/hr")}>
          Add New Employee
        </Button>
        <Button variant="contained" color="primary" onClick={() => navigate("/hr/list")}>
          Employee List
        </Button>
        <Button variant="contained" color="primary" onClick={() => navigate("/hr/overtime")}>
          Add Overtime
        </Button>
        <TextField
          label="Year (YYYY)"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          sx={{ width: 100 }}
        />
        <TextField
          label="Month (MM)"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          sx={{ width: 100 }}
        />
        <Button variant="contained" color="primary" onClick={fetchMonthlyOvertime}>
          Fetch Report
        </Button>
        <Button
          variant="contained"
          onClick={generatePDF}
          sx={{
            backgroundColor: "#FFD700",
            color: "#3E2723",
            "&:hover": { backgroundColor: "#FFC107" },
          }}
          disabled={loading || monthlyOvertime.length === 0}
        >
          Generate PDF
        </Button>
      </Box>
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
          <CircularProgress />
        </Box>
      )}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {!loading && !error && monthlyOvertime.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Total Overtime Hours</TableCell>
                <TableCell>Overtime Rate ($/hr)</TableCell>
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
                  <TableCell>{record.overtimeRate.toLocaleString()}</TableCell>
                  <TableCell>{record.overtimePay.toLocaleString()}</TableCell>
                  <TableCell>
                    {record.details && record.details.length > 0 ? (
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Hours</TableCell>
                            <TableCell>Pay</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {record.details.map((detail, index) => (
                            <TableRow key={index}>
                              <TableCell>{formatDate(detail.date)}</TableCell>
                              <TableCell>{detail.overtimeHours}</TableCell>
                              <TableCell>${detail.overtimePay.toLocaleString()}</TableCell>
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