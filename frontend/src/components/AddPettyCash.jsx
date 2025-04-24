import React, { useState } from "react";
import { Box, Button, TextField, MenuItem, Select, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, useMediaQuery } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import axios from "axios";

const AddTransaction = ({ fetchTransactions }) => {
    const [description, setdescription] = useState("");
    const [amount, setAmount] = useState("");
    const [type, settype] = useState("expense");
    const [category, setCategory] = useState("");
    const [errormsg, setErrormsg] = useState("");
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrormsg("");

        try {
            const response = await axios.post("/api/Pettycash/addPettyCash", {
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

    const closeModal = () => setErrormsg("");

    return (
        <Box sx={{
            p: 4,
            maxWidth: "400px",
            mx: "auto",
        }}>
            <form onSubmit={handleSubmit}>
                <TextField
                    label="Description"
                    variant="outlined"
                    value={description}
                    onChange={(e) => setdescription(e.target.value)}
                    required
                    fullWidth
                    sx={{ mb: 2 }}
                />

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
                    open={!!errormsg}
                    onClose={closeModal}
                    fullScreen={fullScreen}
                    maxWidth="sm"
                    fullWidth
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
                        </Button>
                    </DialogActions>
                </Dialog>
            </form>
        </Box>
    );
};

export default AddTransaction;
