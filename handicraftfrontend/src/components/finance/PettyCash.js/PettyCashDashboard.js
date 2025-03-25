import React, { useState, useEffect } from "react";
import BalanceCard from "./BalanceCard";
import TransactionTable from "./TransactionTable";
import AddTransactionsForm from "./AddTransactionForm";
import { getPettyCash } from "../services/api";
import { Box, Typography, TextField, Button } from "@mui/material";

const PettyCashDashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedDate, setSelectedDate] = useState(currentMonth);
  const [isCurrentMonth, setIsCurrentMonth] = useState(true);

  const fetchTransactions = async (date) => {
    try {
      const [year, month] = date.split("-");
      const response = await getPettyCash(parseInt(month, 10), parseInt(year, 10));
      setTransactions(response.data.transactions);
      setBalance(response.data.Currentbalance);
      setIsCurrentMonth(date === currentMonth);
    } catch (error) {
      console.error("Error fetching transactions: ", error);
    }
  };

  useEffect(() => {
    fetchTransactions(selectedDate);
  }, [selectedDate]);

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", my: 4, p: 2 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Petty Cash Management
      </Typography>
      
      <Box sx={{ display: "flex", gap: 2, mb: 4, alignItems: "center" }}>
        <TextField
          label="Select Month"
          type="month"
          value={selectedDate}
          onChange={handleDateChange}
          InputLabelProps={{ shrink: true }}
          sx={{ width: 200 }}
          inputProps={{
            max: currentMonth // Prevent future months
          }}
        />
      </Box>

      <BalanceCard 
        balance={balance} 
        isCurrentMonth={isCurrentMonth}
      />
      
      {/* Only show Add form for current month */}
      {isCurrentMonth && (
        <AddTransactionsForm 
          onAdd={() => fetchTransactions(selectedDate)} 
          selectedDate={selectedDate} 
        />
      )}
      
      {/* Always show transactions table */}
      <TransactionTable 
        transactions={transactions} 
        onUpdate={() => fetchTransactions(selectedDate)}
        allowEdit={isCurrentMonth} // Pass this to conditionally show edit buttons
      />
    </Box>
  );
};

export default PettyCashDashboard;