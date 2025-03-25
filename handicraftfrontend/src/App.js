import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

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


//customer
// Customer Components
import CustHome from "./components/customer/CustomerHome.js"; // New customer homepage
import Register from "./components/customer/Register"; // Adjusted path
import Login from "./components/customer/Login"; // Adjusted path
import Profile from "./components/customer/Profile"; // Adjusted path
import AdminDashboard from "./components/customer/AdminDashboard"; // Adjusted path


//iventory components
import AddInventories from "./components/inventroy/addInventories.js"; // Adjusted path
import ReadInventories from "./components/inventroy/readinventories"; // Corrected path
import UpdateInventories from "./components/inventroy/updateinventories"; // Corrected path
import DeleteInventories from "./components/inventroy/deleteinventories"; // Corrected path
import InventoryReport from "./components/inventroy/inventoryreports"; // Corrected path
import RestockPage from "./components/inventroy/restockPage"; // Corrected path

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

           {/* Customer Routes (prefixed with /customer) */}
          <Route path="/customer" element={<CustHome />} /> {/* Added /customer route */}
          <Route path="/customer/register" element={<Register />} />
          <Route path="/customer/login" element={<Login />} />
          <Route path="/customer/profile" element={<Profile />} />
          <Route path="/customer/admin" element={<AdminDashboard />} />



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

          {/* Inventory Routes (prefixed with /inventory) */}
          <Route path="/inventory" element={<Navigate to="/inventory/add" />} />
          <Route path="/inventory/add" element={<AddInventories />} />
          <Route path="/inventory/display" element={<ReadInventories />} />
          <Route path="/inventory/update/:id" element={<UpdateInventories />} />
          <Route path="/inventory/delete/:id" element={<DeleteInventories />} />
          <Route path="/inventory/restock/:id" element={<RestockPage />} />
          <Route path="/inventory/report" element={<InventoryReport />} />

          

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