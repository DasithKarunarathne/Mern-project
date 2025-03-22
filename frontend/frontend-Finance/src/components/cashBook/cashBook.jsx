import React, { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import AddCashBookEntryForm from "./AddCashForm";
import CashList from "./CashList";

const CashBookPage = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ padding: 3, maxWidth: 800, margin: "auto" }}>
      <Tabs value={tabValue} onChange={handleTabChange} centered>
        <Tab label="Add Entry" />
        <Tab label="View Entries" />
      </Tabs>

      {tabValue === 0 && (
        <Box sx={{ mt: 3 }}>
          <AddCashBookEntryForm/>
        </Box>
      )}

      {tabValue === 1 && (
        <Box sx={{ mt: 3 }}>
          <CashList/>
        </Box>
      )}
    </Box>
  );
};

export default CashBookPage;