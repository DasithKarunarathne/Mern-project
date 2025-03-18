import React,{useState} from 'react';

import {addPettyCash} from '../services/api.js';
import { Alert, Box, TextField } from '@mui/material';


const AddTransactionsForm = ({onAdd}) =>{
    const [formData, setFormData] =useState({
        description:'',
        amount:'',
        type:'',
        category:'',
    });

const [errorMessage, setErrorMessage] = useState(null);
const [successMessage, setSuccessMessage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage(null);

        //frontedn validation

        if(!formData.description){
            setErrorMessage('Description is required');
            return;
        }
        if(!formData.amount || isNaN(formData.amount) ||Number(formData.amount)<=0){
            setErrorMessage('A positive amount is required');
            return;
        }

        try {
            await addPettyCash(formData);
            setFormData({description:'',amount:'',type:'initial', category:''});
            setSuccessMessage('Transaction added successfully');
            onAdd();//refreshing the transactionlist. took this from the prop sent from the parent component which was destructured using {} so that it can be used in any place in this component
        } catch (error) {
            const message = error.response?.data?.message || 'An unexpected error occured';
            setErrorMessage(message);
            console.error('Error adding transaction: ',error);
        }
    }

    return(
        <Box component="form" onSubmit={handleSubmit} sx={{mb:2}}>
            {successMessage && <Alert severity="success" sx={{mb:2}}>{successMessage}</Alert>}
            {errorMessage && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>}            
            
            <TextField
            label="Description"
            value={formData.description}
            onChange={(e)=>setFormData({...formData,description:e.target.value})}
            fullWidth
            sx={{mb:2}}
            error={!formData.description && errorMessage}
            />

<TextField
        label="Amount"
        type="number"
        value={formData.amount}
        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
        fullWidth
        sx={{ mb: 2 }}
        error={(!formData.amount || Number(formData.amount)<=0) && errorMessage}
        
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
