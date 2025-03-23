import React, { useState, useEffect } from "react";
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
} from "@mui/material";

const Ledger = () => {
  const [month, setMonth] = useState(new Date().getMonth() + 1); // Current month (1-12)
  const [year, setYear] = useState(new Date().getFullYear()); // Current year
  const [ledger, setLedger] = useState([]);
  const [error, setError] = useState(null);

  // Fetch ledger data
  const fetchLedger = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/ledger/${month}/${year}`);
      setLedger(response.data); // Set ledger data
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error("Error fetching ledger", error);
      setError("Failed to fetch ledger: " + (error.response?.data?.message || error.message));
    }
  };

  // Fetch ledger data when month or year changes
  useEffect(() => {
    fetchLedger();
  }, [month, year]);

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