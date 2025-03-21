import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import EmployeeForm from "./components/EmployeeForm";
import EmployeeList from "./components/EmployeeList";
import OvertimeForm from "./components/OvertimeForm";
import MonthlyOvertime from "./components/MonthlyOvertime";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

function App() {
  const [refresh, setRefresh] = useState(false);
  const [employees, setEmployees] = useState([]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/employee/`);
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [refresh]);

  const handleEmployeeAdded = () => {
    setRefresh(!refresh); // Toggle refresh to trigger re-fetch in EmployeeList
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<EmployeeForm onEmployeeAdded={handleEmployeeAdded} />} />
        <Route path="/list" element={<EmployeeList refresh={refresh} />} />
        <Route path="/overtime" element={<OvertimeForm employees={employees} />} />
        <Route path="/overtime/monthly" element={<MonthlyOvertime />} />
        <Route path="/overtime/monthly/:year/:month" element={<MonthlyOvertime />} />
      </Routes>
    </Router>
  );
}

export default App;
