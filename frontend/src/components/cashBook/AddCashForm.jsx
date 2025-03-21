import React, { useState } from "react";
import { addCashBookEntry } from "../services/CashApi"; // Adjust the import path
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Typography,
} from "@mui/material";

const AddCashBookEntryForm = () => {
  const [formData, setFormData] = useState({
    description: "",
    amount: 0,
    type: "inflow",
    category: "salary",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await addCashBookEntry(formData);
      if (response.data) {
        alert("Cash book entry added successfully!");
        setFormData({ description: "", amount: 0, type: "inflow", category: "salary" });
      }
    } catch (error) {
      console.error("Error adding cash book entry:", error);
      alert("Failed to add cash book entry. Please try again.");
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        maxWidth: 400,
        margin: "auto",
        padding: 3,
        boxShadow: 3,
        borderRadius: 2,
      }}
    >
      <Typography variant="h5" align="center" gutterBottom>
        Add Cash Book Entry
      </Typography>

      {/* Description Field */}
      <TextField
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        required
        fullWidth
      />

      {/* Amount Field */}
      <TextField
        label="Amount"
        name="amount"
        type="number"
        value={formData.amount}
        onChange={handleChange}
        required
        fullWidth
      />

      {/* Type Field */}
      <FormControl fullWidth required>
        <InputLabel>Type</InputLabel>
        <Select
          name="type"
          value={formData.type}
          onChange={handleChange}
          label="Type"
        >
          <MenuItem value="inflow">Inflow</MenuItem>
          <MenuItem value="outflow">Outflow</MenuItem>
        </Select>
      </FormControl>

      {/* Category Field */}
      <FormControl fullWidth required>
        <InputLabel>Category</InputLabel>
        <Select
          name="category"
          value={formData.category}
          onChange={handleChange}
          label="Category"
        >
          <MenuItem value="salary">Salary</MenuItem>
          <MenuItem value="reimbursement">Reimbursement</MenuItem>
          <MenuItem value="order_income">Order Income</MenuItem>
          <MenuItem value="pettyCashExcess">Petty Cash Excess</MenuItem>
          <MenuItem value="initial_cash">Initial Cash</MenuItem>
        </Select>
      </FormControl>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 2 }}
      >
        Add Entry
      </Button>
    </Box>
  );
};

export default AddCashBookEntryForm;