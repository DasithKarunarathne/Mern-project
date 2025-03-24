import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

// HR Components
import EmployeeForm from "./components/hr/EmployeeForm";
import EmployeeList from "./components/hr/EmployeeList";
import OvertimeForm from "./components/hr/OvertimeForm";
import MonthlyOvertime from "./components/hr/MonthlyOvertime";

// Finance Components
import Dashboard from "./components/finance/Pages/Dashboard";

// Shared Components
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";

import HomePage from "./pages/Homepage";

// Styles
import "./styles/common.css";
import "./styles/hr.css";
import "./styles/finance.css";

function App() {
  return (
    <Router>
      <div className="App">
        {/* Shared Header */}
        <Header />

        {/* Main Content */}
        <Routes>
          {/* HR Routes */}
          <Route path="/hr" element={<EmployeeForm />} />
          <Route path="/hr/list" element={<EmployeeList />} />
          <Route path="/hr/overtime" element={<OvertimeForm />} />
          <Route path="/hr/overtime/monthly" element={<MonthlyOvertime />} />
          <Route
            path="/hr/overtime/monthly/:year/:month"
            element={<MonthlyOvertime />}
          />

          {/* Finance Routes */}
          <Route path="/finance/dashboard/*" element={<Dashboard />} />

          {/* Home Route */}
          <Route path="/" element={<HomePage />} />
        </Routes>

        {/* Shared Footer */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;