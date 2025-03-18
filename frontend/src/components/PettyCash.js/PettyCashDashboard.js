import React , {use, useState} from "react";

import BalanceCard from "./BalanceCard";
import TransactionTable from "./TransactionTable";
import AddTransactionForm from "./AddTransactionForm";
import { getPettyCash } from "../services/api";
import {DatePicker} from "@mui/lab";
import{LocalizationProvider} from "@mui/lab";
import { Box, Button, Typography } from "@mui/material";

const PettyCashDashboard = () => {

    const [transactions, setTransactions] = useState([]);
    const [balance, setBalance] = useState(0);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const fetchTransactions = async () => {
        try {
            const month = selectedDate.getMonth() + 1;
            const year = selectedDate.getFullYear();
            const response = await getPettyCash(month, year);
            setTransactions(response.data.transactions);
            setBalance(response.data.CurrenBalance);  
        
        } catch (error) {
            console.error("Error fetching transactions: ", error);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [selectedDate]);

    return(
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box>
                <Typography variant="h4" sx={{mb:2}}>Petty Cash Management</Typography>
                <Box sx={{display:"flex", gap:2, mb:2}}>
                    <DatePicker
                    views={["month","year"]}
                    label="Month and Year"
                    value={selectedDate}
                    onChange={(newValue) => setSelectedDate(newValue)}
                    />
                    <Button variant="contained" onClick={fetchTransactions}>Filter</Button>

                </Box>

                <BalanceCard balance={balance}/>
                <AddTransactionForm onAdd={fetchTransactions}/>
                <TransactionTable transactions={transactions} onUpdate={fetchTransactions}/>                  
            </Box>          
            </LocalizationProvider>


    )






};

export default PettyCashDashboard;