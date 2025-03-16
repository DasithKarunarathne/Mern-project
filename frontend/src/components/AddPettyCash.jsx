import React,{useState} from "react";
import { Box, Button, TextField, MenuItem, Select } from "@mui/material";
import axios from "axios";

const AddTransaction = ({fetchTransactions}) =>{
    const[description, setdescription] = useState("");
    const[amount, setAmount] = useState("");
    const [type, settype] = useState("expense");
    const [category, setCategory] = useState("");
    const [errormsg, setErrormsg]= useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrormsg("");

        try {

            const response = await axios.post("/api/Pettycash//addPettyCash",{
                description,
                amount,
                type,
                category,
            });

            if (response.status === 201) {
                fetchTransactions();
                setdescription("");
                setAmount("");
                settype("expense");
                setCategory("");
              }
            
        } catch (error) {
            const msg = error.response?.data?.message || "An unexpeced error occured";
            setErrormsg(msg);
            console.error("Error adding transaction", error);
            
        }
    };

    const closeMdodal  =() => setErrormsg("");
    
    return(

        <Box sx={{
            p: 4,
            maxWidth: "400px", // Similar to max-w-md
            mx: "auto", // Center horizontally
          }}
        >
            <form onSubmit={handleSubmit}> 

            <TextField
          label="Description"
          variant="outlined"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          fullWidth
          sx={{ mb: 2 }} // Margin bottom for spacing
        />

        {/* Amount Input */}
        <TextField
          label="Amount"
          type="number"
          variant="outlined"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          fullWidth
          sx={{ mb: 2 }}
        />

<Select
          value={type}
          onChange={(e) => setType(e.target.value)}
          fullWidth
          variant="outlined"
          displayEmpty
          sx={{ mb: 2 }}
        >

<MenuItem value="" disabled>
            Select type
          </MenuItem>
          <MenuItem value="expense">Expense</MenuItem>
          <MenuItem value="reimbursement">Reimbursement</MenuItem>
          <MenuItem value="initial">Initial</MenuItem>
        </Select>


        <TextField
          label="Category"
          variant="outlined"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          fullWidth
          sx={{ mb: 2 }}
        />

        <Button type="submit" variant="contained" color="primary" fullWidth>
            Add Transaction
        </Button>
            </form>
            </Box>
    );
    

};

export default AddTransaction;
