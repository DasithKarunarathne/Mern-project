import React, { useState } from "react";
import { updatePettyCash } from "../services/api";
import { Box, Button, MenuItem, TextField } from "@mui/material";

const UpdateTransactionForm = ({ transaction, onUpdate }) => {
  const [formData, setFormData] = useState({ ...transaction });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updatePettyCash(transaction._id, {
        ...formData,
        month: transaction.month,
        year: transaction.year,
      });
      onUpdate();
    } catch (error) {
      console.error("Error updating transaction: ", error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
      <TextField
        label="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        fullWidth
        sx={{ mb: 2 }}
      />

      <TextField
        label="Amount"
        value={formData.amount}
        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
        fullWidth
        sx={{ mb: 2 }}
      />

      <TextField
        select
        label="Type"
        value={formData.type}
        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
        fullWidth
        sx={{ mb: 2 }}
      >
        <MenuItem value="initial">Initial</MenuItem>
        <MenuItem value="expense">Expense</MenuItem>
        <MenuItem value="reimbursement">Reimbursement</MenuItem>
      </TextField>

      <TextField
        label="Category"
        value={formData.category || ""}
        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        fullWidth
        sx={{ mb: 2 }}
      />

      <Button type="submit" variant="contained">
        Update
      </Button>
    </Box>
  );
};

export default UpdateTransactionForm;