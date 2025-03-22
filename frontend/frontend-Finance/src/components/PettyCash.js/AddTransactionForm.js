import React, { useState } from 'react';
import { Button, MenuItem } from '@mui/material';
import { addPettyCash } from '../services/api.js';
import { Alert, Box, TextField } from '@mui/material';

const AddTransactionsForm = ({ onAdd }) => {
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        type: 'initial',
        category: '',
    });

    const [errorMessage, setErrorMessage] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({}); // Track specific field errors

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage(null);
        setFieldErrors({}); // Reset field errors

        // Frontend validation
        const errors = {};
        if (!formData.description) {
            errors.description = 'Description is required';
        }
        if (!formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) {
            errors.amount = 'A positive amount is required';
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        try {
            await addPettyCash(formData);
            setFormData({ description: '', amount: '', type: 'initial', category: '' });
            setSuccessMessage('Transaction added successfully');
            onAdd(); // Refreshing the transaction list
        } catch (error) {
            const message = error.response?.data?.message || 'An unexpected error occurred';
            setErrorMessage(message);
            console.error('Error adding transaction: ', error);
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
                helperText={fieldErrors.amount}
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

            <Button type="submit" variant="contained">Add Transaction</Button>
        </Box>
    );
};

export default AddTransactionsForm;