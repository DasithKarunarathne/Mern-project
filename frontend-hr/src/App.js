import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Container, Typography } from "@mui/material";
import EmployeeForm from "./components/EmployeeForm";
import EmployeeList from "./components/EmployeeList";

function App() {
  const [refresh, setRefresh] = useState(false);

  const handleEmployeeAdded = () => {
    setRefresh(!refresh); // Toggle refresh to trigger re-fetch in EmployeeList
  };

  return (
    <Router>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Employee Management
        </Typography>
        <Routes>
          <Route path="/" element={<EmployeeForm onEmployeeAdded={handleEmployeeAdded} />} />
          <Route path="/list" element={<EmployeeList refresh={refresh} />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
