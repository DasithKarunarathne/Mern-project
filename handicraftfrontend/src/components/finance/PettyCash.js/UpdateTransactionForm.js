import React, { useState } from "react";
import { updatePettyCash } from "../services/api";
import { Box, Button, MenuItem, TextField, Alert } from "@mui/material";

const UpdateTransactionForm = ({ transaction, onUpdate }) => {
  const [formData, setFormData] = useState({ ...transaction });
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    if (!formData.description) {
      errors.description = "Description is required";
    }
    if (!formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) {
      errors.amount = "A positive amount is required";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      await updatePettyCash(transaction._id, {
        ...formData,
        month: transaction.month,
        year: transaction.year,
      });
      onUpdate();
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error updating transaction";
      const details = error.response?.data?.details;
      setError({
        message: errorMessage,
        details: details
      });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message}
          {error.details?.reason && (
            <Box sx={{ mt: 1, fontSize: '0.875rem' }}>
              {error.details.reason}
            </Box>
          )}
        </Alert>
      )}

      <TextField
        label="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        fullWidth
        sx={{ mb: 2 }}
        error={!!fieldErrors.description}
        helperText={fieldErrors.description}
      />

      <TextField
        label="Amount"
        value={formData.amount}
        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
        fullWidth
        sx={{ mb: 2 }}
        error={!!fieldErrors.amount}
        helperText={fieldErrors.amount}
        type="number"
        inputProps={{ min: 0, step: "0.01" }}
      />

      <TextField
        select
        label="Type"
        value={formData.type}
        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
        fullWidth
        sx={{ mb: 2 }}
        disabled={formData.type === "initial"}
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

      <Button 
        type="submit" 
        variant="contained" 
        fullWidth
        disabled={formData.type === "initial" && (
          formData.description !== transaction.description ||
          formData.amount !== transaction.amount ||
          formData.type !== transaction.type
        )}
      >
        {formData.type === "initial" ? "Update Details" : "Update Transaction"}
      </Button>
    </Box>
  );
};

export default UpdateTransactionForm;