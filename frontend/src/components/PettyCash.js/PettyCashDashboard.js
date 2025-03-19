import React, { useState, useEffect } from "react";
import BalanceCard from "./BalanceCard";
import TransactionTable from "./TransactionTable";
import AddTransactionForm from "./AddTransactionForm";
import { getPettyCash } from "../services/api";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker'; // Only import once
import { Box, Button, Typography } from "@mui/material";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const PettyCashDashboard = () => {
    const [transactions, setTransactions] = useState([]);
    const [balance, setBalance] = useState(0);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [filterTriggered, setFilterTriggered] = useState(false); // New state to track manual filter

    const fetchTransactions = async (date) => {
        try {
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            const response = await getPettyCash(month, year);
            setTransactions(response.data.transactions);
            setBalance(response.data.CurrentBalance);
        } catch (error) {
            console.error("Error fetching transactions: ", error);
        }
    };

    useEffect(() => {
        fetchTransactions(selectedDate);
    }, [filterTriggered]); // Trigger fetch only when filterTriggered changes

    const handleDateChange = (newValue) => {
        if (newValue instanceof Date && !isNaN(newValue)) {
            setSelectedDate(newValue);
        } else {
            console.warn("Invalid date selected");
        }
    };

    const handleFilterClick = () => {
        setFilterTriggered((prev) => !prev); // Toggle filterTriggered to trigger useEffect
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box>
                <Typography variant="h4" sx={{ mb: 2 }}>Petty Cash Management</Typography>
                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                    <DatePicker
                        views={["month", "year"]}
                        label="Month and Year"
                        value={selectedDate}
                        onChange={handleDateChange} // Use handleDateChange for validation
                    />
                    <Button variant="contained" onClick={handleFilterClick}>Filter</Button>
                </Box>

                <BalanceCard balance={balance} />
                <AddTransactionForm onAdd={() => fetchTransactions(selectedDate)} />
                <TransactionTable transactions={transactions} onUpdate={() => fetchTransactions(selectedDate)} />
            </Box>
        </LocalizationProvider>
    );
};

export default PettyCashDashboard;