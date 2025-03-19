import React from "react";
import { Container, Typography } from "@mui/material";
import EmployeeForm from "./components/EmployeeForm";
import EmployeeList from "./components/EmployeeList";

function App() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Employee Management
      </Typography>
      <EmployeeForm />
      <EmployeeList />
    </Container>
  );
}

export default App;
