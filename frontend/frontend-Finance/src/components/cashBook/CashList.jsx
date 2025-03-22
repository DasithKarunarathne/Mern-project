import React, { useState, useEffect, useRef } from "react";
import { getCashBookEntrylistbyMonth } from "../services/CashApi";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
} from "@mui/material";

const CashList = () => {
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [entries, setEntries] = useState([]);
  const initialLoadDone = useRef(false);

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const fetchEntries = async (selectedMonth, selectedYear) => {
    if (!selectedMonth || !selectedYear) return;

    setLoading(true);
    setError(null);

    try {
      console.log("Fetching entries for:", selectedMonth, selectedYear); // Debugging
      const response = await getCashBookEntrylistbyMonth(selectedMonth, selectedYear);
      console.log("API response:", response); // Debugging
      setEntries(response.data.data);
    } catch (error) {
      console.error("Error fetching cash book entries:", error);
      setError("Failed to fetch cash book entries. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Set default month and year
  useEffect(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    setMonth(currentMonth);
    setYear(currentYear);
  }, []);

  // Fetch data when month and year are set initially
  useEffect(() => {
    if (month && year && !initialLoadDone.current) {
      initialLoadDone.current = true;
      fetchEntries(month, year);
    }
  }, [month, year]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetchEntries(month, year);
  };

  return (
    <Box sx={{ padding: 3, maxWidth: 800, margin: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Fetch Cash Book Entries
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          select
          label="Month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          fullWidth
          required
        >
          {months.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Year"
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          fullWidth
          required
          inputProps={{ min: 2000, max: 9999 }}
        />

        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : "Fetch Entries"}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {entries.length > 0 ? (
        <Paper sx={{ overflowX: "auto" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry._id}>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell align="right">{entry.amount}</TableCell>
                  <TableCell>{entry.type}</TableCell>
                  <TableCell>{entry.category}</TableCell>
                  <TableCell>
                    {new Date(entry.date).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      ) : (
        <Typography variant="body1" color="textSecondary">
          No entries found for the selected period.
        </Typography>
      )}
    </Box>
  );
};

export default CashList;