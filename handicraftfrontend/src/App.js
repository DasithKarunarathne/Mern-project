import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import axios from "axios";

// HR Components
import EmployeeForm from "./components/hr/EmployeeForm";
import EmployeeList from "./components/hr/EmployeeList";
import OvertimeForm from "./components/hr/OvertimeForm";
import MonthlyOvertime from "./components/hr/MonthlyOvertime";

// Finance Components
import Dashboard from "./components/finance/Pages/Dashboard";

// Shared Components (if any)
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";

import HomePage from "./pages/Homepage";

// Styles (if any)
import "./styles/common.css";
import "./styles/hr.css";
import "./styles/finance.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

function App() {
  // HR State
  const [refresh, setRefresh] = useState(false);
  const [employees, setEmployees] = useState([]);

  // Fetch Employees for HR
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
      <div className="App">
        {/* Shared Header */}
        <Header />

        {/* Main Content */}
        <Routes>
          {/* HR Routes */}
          <Route
            path="/hr"
            element={<EmployeeForm onEmployeeAdded={handleEmployeeAdded} />}
          />
          <Route path="/hr/list" element={<EmployeeList refresh={refresh} />} />
          <Route
            path="/hr/overtime"
            element={<OvertimeForm employees={employees} />}
          />
          <Route path="/hr/overtime/monthly" element={<MonthlyOvertime />} />
          <Route
            path="/hr/overtime/monthly/:year/:month"
            element={<MonthlyOvertime />}
          />

          {/* Finance Routes */}
          <Route path="/finance/dashboard/*" element={<Dashboard />} />

         {/* Home Route (Optional) */}
          <Route path="/" element={<HomePage />} />
        </Routes> 

        {/* Shared Footer */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;