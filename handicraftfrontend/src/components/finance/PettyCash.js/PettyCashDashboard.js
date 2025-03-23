import React, { useState, useEffect } from "react";
import BalanceCard from "./BalanceCard";
import TransactionTable from "./TransactionTable";
import AddTransactionForm from "./AddTransactionForm";
import { getPettyCash } from "../services/api";
import { Box, Button, Typography } from "@mui/material";

const PettyCashDashboard = () => {
    const [transactions, setTransactions] = useState([]);
    const [balance, setBalance] = useState(0);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 7)); // Default to current month and year
    const [filterTriggered, setFilterTriggered] = useState(false); // New state to track manual filter

    const fetchTransactions = async (date) => {
        try {
            const [year, month] = date.split('-');
            const response = await getPettyCash(parseInt(month, 10), parseInt(year, 10));
            setTransactions(response.data.transactions);
            setBalance(response.data.Currentbalance);
        } catch (error) {
            console.error("Error fetching transactions: ", error);
        }
    };

    useEffect(() => {
        fetchTransactions(selectedDate);
    }, [selectedDate, filterTriggered]); // Trigger fetch only when filterTriggered changes

    const handleDateChange = (event) => {
        const newDate = event.target.value;
        if (newDate) {
            setSelectedDate(newDate);
        } else {
            console.warn("Invalid date selected");
        }
    };

    const handleFilterClick = () => {
        setFilterTriggered((prev) => !prev); // Toggle filterTriggered to trigger useEffect
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 2 }}>Petty Cash Management</Typography>
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <input
                    type="month"
                    value={selectedDate}
                    onChange={handleDateChange}
                />
                <Button variant="contained" onClick={handleFilterClick}>Filter</Button>
            </Box>

            <BalanceCard balance={balance} />
            <AddTransactionForm onAdd={() => fetchTransactions(selectedDate)} />
            <TransactionTable transactions={transactions} onUpdate={() => fetchTransactions(selectedDate)} />
        </Box>
    );
};

export default PettyCashDashboard;