import React,{useState} from "react";
import { Box, Button, TextField, MenuItem, Select, Dialog, DialogActions,DialogContent,DialogContentText,DialogTitle } from "@mui/material";
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

    const closeModal  =() => setErrormsg("");
    
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
          onChange={(e) => setdescription(e.target.value)}
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
          onChange={(e) => settype(e.target.value)}
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

        <Dialog
        open={!!errormsg}//if errormsg is not empty
        onClose={closeModal}
        fullScreen={fullScreen} // Full-screen below md breakpoint (900px)
        maxWidth="sm" // Standard width on larger screens
        fullWidth // Takes full width up to maxWidth
      >
        <DialogTitle>Error</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "red" }}>
            {errormsg}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal} color="primary">
            OK
          </Button>{/*When ok is clicked the error msg is set to "" noting*/}
        </DialogActions>
      </Dialog>
            </form>
            </Box>
    );
    

};

export default AddTransaction;
