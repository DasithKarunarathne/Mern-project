import React, { useState, useEffect } from "react";
import { addPettyCash, getSuggestedReimbursement } from "../services/api.js";
import { Alert, Box, TextField, Button, MenuItem } from "@mui/material";

const AddTransactionsForm = ({ onAdd, selectedDate }) => {
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "initial",
    category: "",
  });
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [suggestedAmount, setSuggestedAmount] = useState(0);

  const [year, month] = selectedDate.split("-");

  useEffect(() => {
    if (formData.type === "reimbursement") {
      const fetchSuggestedAmount = async () => {
        try {
          const response = await getSuggestedReimbursement(parseInt(month, 10), parseInt(year, 10));
          const suggested = response.data.suggestedAmount || 0;
          setSuggestedAmount(suggested);
          setFormData((prev) => ({ ...prev, amount: suggested.toString() }));
        } catch (error) {
          console.error("Error fetching suggested reimbursement:", error);
          setErrorMessage("Failed to fetch suggested reimbursement amount");
        }
      };
      fetchSuggestedAmount();
    } else {
      setSuggestedAmount(0);
      setFormData((prev) => ({ ...prev, amount: "" }));
    }
  }, [formData.type, month, year]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    const errors = {};
    if (!formData.description) errors.description = "Description is required";
    if (!formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) {
      errors.amount = "A positive amount is required";
    }
    if (formData.type === "reimbursement" && Number(formData.amount) > suggestedAmount) {
      errors.amount = `Amount exceeds suggested reimbursement (${suggestedAmount})`;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      await addPettyCash({
        ...formData,
        month: parseInt(month, 10),
        year: parseInt(year, 10),
      });
      setFormData({ description: "", amount: "", type: "initial", category: "" });
      setSuccessMessage("Transaction added successfully");
      onAdd();
    } catch (error) {
      const message = error.response?.data?.message || "An unexpected error occurred";
      setErrorMessage(message);
      console.error("Error adding transaction: ", error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 2 }}>
      {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
      {errorMessage && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>}

      <TextField
        label="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        fullWidth
        sx={{ mb: 2 }}
        error={Boolean(fieldErrors.description)}
        helperText={fieldErrors.description}
      />

      <TextField
        label="Amount"
        type="number"
        value={formData.amount}
        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
        fullWidth
        sx={{ mb: 2 }}
        error={Boolean(fieldErrors.amount)}
        helperText={
          formData.type === "reimbursement"
            ? `Suggested amount: ${suggestedAmount}. ${fieldErrors.amount || ""}`
            : fieldErrors.amount
        }
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
        value={formData.category}
        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        fullWidth
        sx={{ mb: 2 }}
      />

      <Button type="submit" variant="contained">
        Add Transaction
      </Button>
    </Box>
  );
};

export default AddTransactionsForm;