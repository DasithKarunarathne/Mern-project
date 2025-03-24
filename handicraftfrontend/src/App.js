import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

// HR Components
import EmployeeForm from "./components/hr/EmployeeForm";
import EmployeeList from "./components/hr/EmployeeList";
import OvertimeForm from "./components/hr/OvertimeForm";
import MonthlyOvertime from "./components/hr/MonthlyOvertime";

// Finance Components
import Dashboard from "./components/finance/Pages/Dashboard";

// Product Components (from frontend-product)
import Navbar from "./components/products/Navbar.js"; // Adjusted path
import ProductDashboard from "./components/products/ProductDashboard.js"; // Adjusted path
import ProductList from "./components/products/ProductList"; // Adjusted path
import Cart from "./components/products/Cart"; // Adjusted path
import DeliveryDetails from "./components/products/DeliveryDetails"; // Adjusted path
import OrderSummary from "./components/products/OrderSummary"; // Adjusted path
import Payment from "./components/products/Payment"; // Adjusted path
import OrderHistory from "./components/products/OrderHistory"; // Adjusted path
import RefundRequest from "./components/products/RefundRequest"; // Adjusted path
import ProductManager from "./components/products/ProductManager"; // Adjusted path
import RefundManagement from "./components/products/RefundManagement"; // Adjusted path

// Shared Components
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";

import HomePage from "./pages/Homepage";

// Styles
//import "./styles/common.css";
//import "./styles/hr.css";
//import "./styles/finance.css";
//import "./styles/product.css"; // Added for product-specific styles (create this if needed)

function App() {
  return (
    <Router>
      <div className="App">
        {/* Shared Header */}
        <Header />

        {/* Product-specific Navbar (optional, only for product routes) */}
        {/* Uncomment if you want the product Navbar to appear only on product routes */}
         <Routes>
          <Route path="/product/*" element={<Navbar />} />
        </Routes> 

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

          {/* Product Routes (prefixed with /product) */}
          <Route path="/product" element={<ProductDashboard />} />
          <Route path="/product/:id" element={<ProductList />} />
          <Route path="/product/cart" element={<Cart />} />
          <Route path="/product/delivery" element={<DeliveryDetails />} />
          <Route path="/product/order-summary" element={<OrderSummary />} />
          <Route path="/product/payment" element={<Payment />} />
          <Route path="/product/order-history" element={<OrderHistory />} />
          <Route path="/product/refund-request/:orderId" element={<RefundRequest />} />
          <Route path="/product/manager" element={<ProductManager />} />
          <Route path="/product/admin/refund-management" element={<RefundManagement />} />

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