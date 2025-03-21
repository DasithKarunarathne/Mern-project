import React, { useState } from "react";
import { getCashBookEntries } from "./api/cashbookApi"; // Import the API function
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

const CashList = () => {
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!month || !year) {
      setError("Please select both month and year.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getCashBookEntries(month, year);
      setEntries(response.data);
    } catch (error) {
      console.error("Error fetching cash book entries:", error);
      setError("Failed to fetch cash book entries. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ padding: 3, maxWidth: 600, margin: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Fetch Cash Book Entries
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", gap: 2, mb: 3 }}>
        {/* Month Select */}
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

        {/* Year Input */}
        <TextField
          label="Year"
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          fullWidth
          required
          inputProps={{ min: 2000, max: 9999 }}
        />

        {/* Submit Button */}
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : "Fetch Entries"}
        </Button>
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Display Entries */}
      {entries.length > 0 ? (
        <List>
          {entries.map((entry) => (
            <ListItem key={entry._id} sx={{ borderBottom: "1px solid #eee" }}>
              <ListItemText
                primary={entry.description}
                secondary={`Amount: ${entry.amount} (${entry.type}) - ${new Date(
                  entry.date
                ).toLocaleDateString()}`}
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body1" color="textSecondary">
          No entries found for the selected period.
        </Typography>
      )}
    </Box>
  );
};

export default CashList;