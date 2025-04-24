import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Typography,
  Box,
  Button,
} from "@mui/material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Import autoTable explicitly

const Ledger = () => {
  const [month, setMonth] = useState(new Date().getMonth() + 1); // Current month (1-12)
  const [year, setYear] = useState(new Date().getFullYear()); // Current year
  const [ledger, setLedger] = useState([]);
  const [error, setError] = useState(null);

  // Fetch ledger data (memoized with useCallback)
  const fetchLedger = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/ledger/fetchLedger/${month}/${year}`);
      setLedger(response.data); // Set ledger data
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error("Error fetching ledger", error);
      setError("Failed to fetch ledger: " + (error.response?.data?.message || error.message));
    }
  }, [month, year]);

  // Fetch ledger data when month or year changes
  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  // Function to download the table as PDF
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text(`Ledger for ${month}/${year}`, 10, 10); // Add a title

    // Convert table data to an array of arrays
    const tableData = ledger.map((entry) => [
      new Date(entry.date).toLocaleDateString(),
      entry.description,
      entry.amount,
      entry.category,
      entry.source,
      entry.transactionId,
      entry.transactiontype,
    ]);

    // Add the table to the PDF
    autoTable(doc, { // Use autoTable directly
      head: [["Date", "Description", "Amount", "Category", "Source", "Transaction ID", "Transaction Type"]],
      body: tableData,
    });

    // Save the PDF
    doc.save(`ledger_${month}_${year}.pdf`);
  };

  return (
    <Paper elevation={3} sx={{ padding: 3, margin: 2 }}>
      <Typography variant="h4" gutterBottom>
        Ledger
      </Typography>

      {/* Month and Year Selection */}
      <Box sx={{ display: "flex", gap: 2, marginBottom: 3 }}>
        <TextField
          type="number"
          label="Month"
          value={month}
          onChange={(e) => setMonth(parseInt(e.target.value))}
          inputProps={{ min: 1, max: 12 }}
        />
        <TextField
          type="number"
          label="Year"
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          inputProps={{ min: 2000, max: 2100 }}
        />
      </Box>

      {/* Error Message */}
      {error && (
        <Typography color="error" sx={{ marginBottom: 2 }}>
          {error}
        </Typography>
      )}

      {/* Download Button */}
      <Button variant="contained" onClick={downloadPDF} sx={{ marginBottom: 2 }}>
        Download as PDF
      </Button>

      {/* Ledger Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Transaction ID</TableCell>
              <TableCell>Transaction Type</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ledger.map((entry) => (
              <TableRow key={entry._id}>
                <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                <TableCell>{entry.description}</TableCell>
                <TableCell>{entry.amount}</TableCell>
                <TableCell>{entry.category}</TableCell>
                <TableCell>{entry.source}</TableCell>
                <TableCell>{entry.transactionId}</TableCell>
                <TableCell>{entry.transactiontype}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default Ledger;