import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";

// Layout Component
import Layout from "./components/Layout";

// Pages
import HomePage from "./pages/Homepage";
import About from "./pages/About"; // Added import for About page

// HR Components
import EmployeeForm from "./components/hr/EmployeeForm";
import EmployeeList from "./components/hr/EmployeeList";
import OvertimeForm from "./components/hr/OvertimeForm";
import MonthlyOvertime from "./components/hr/MonthlyOvertime";

// Finance Components
import Dashboard from "./components/finance/Pages/Dashboard";

// Product Components (from frontend-product)
import ProductDashboard from "./components/products/ProductDashboard.js";
import ProductList from "./components/products/ProductList";
import Cart from "./components/products/Cart";
import DeliveryDetails from "./components/products/DeliveryDetails";
import OrderSummary from "./components/products/OrderSummary";
import Payment from "./components/products/Payment";
import OrderHistory from "./components/products/OrderHistory";
import RefundRequest from "./components/products/RefundRequest";
import ProductManager from "./components/products/ProductManager";
import RefundManagement from "./components/products/RefundManagement";

// Customer Components
import CustHome from "./components/customer/CustomerHome.js";
import Register from "./components/customer/Register";
import Login from "./components/customer/Login";
import Profile from "./components/customer/Profile";
import AdminDashboard from "./components/customer/AdminDashboard";

// Inventory Components
import AddInventories from "./components/inventory/addInventories.js";
import ReadInventories from "./components/inventory/readinventories";
import UpdateInventories from "./components/inventory/updateinventories";
import DeleteInventories from "./components/inventory/deleteinventories";
import InventoryReport from "./components/inventory/inventoryreports";
import RestockPage from "./components/inventory/restockPage";

// Define PrivateRoute Component (No token check needed)
const PrivateRoute = ({ element }) => {
  return element; // Allow access without checking for a token
};

// Define Material-UI theme for Heritage Hands
const theme = createTheme({
  palette: {
    primary: {
      main: "#5D4037", // Deep brown
    },
    secondary: {
      main: "#FFD700", // Gold
    },
  },
  typography: {
    fontFamily: "'Roboto', sans-serif",
    h2: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 600,
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Layout>
          <Routes>
            {/* Customer Routes (prefixed with /customer) */}
            <Route path="/customer" element={<CustHome />} />
            <Route path="/customer/register" element={<Register />} />
            <Route path="/customer/login" element={<Login />} />
            <Route path="/customer/profile" element={<Profile />} />
            <Route path="/customer/admin" element={<AdminDashboard />} />

            {/* HR Routes */}
            <Route path="/hr" element={<PrivateRoute element={<EmployeeForm />} />} />
            <Route path="/hr/list" element={<PrivateRoute element={<EmployeeList />} />} />
            <Route path="/hr/overtime" element={<PrivateRoute element={<OvertimeForm />} />} />
            <Route path="/hr/overtime/monthly" element={<PrivateRoute element={<MonthlyOvertime />} />} />
            <Route
              path="/hr/overtime/monthly/:year/:month"
              element={<PrivateRoute element={<MonthlyOvertime />} />}
            />

            {/* Finance Routes */}
            <Route path="/finance/dashboard/*" element={<PrivateRoute element={<Dashboard />} />} />

            {/* Product Routes (prefixed with /product) */}
            <Route path="/product" element={<ProductDashboard />} />
            <Route path="/product/:id" element={<ProductList />} />
            <Route path="/product/cart" element={<Cart />} />
            <Route path="/product/delivery" element={<DeliveryDetails />} />
            <Route path="/product/order-summary" element={<OrderSummary />} />
            <Route path="/product/payment" element={<Payment />} />
            <Route path="/product/order-history" element={<OrderHistory />} />
            <Route path="/product/refund-request/:orderId" element={<RefundRequest />} />
            <Route path="/product/manager" element={<PrivateRoute element={<ProductManager />} />} />
            <Route path="/product/admin/refund-management" element={<PrivateRoute element={<RefundManagement />} />} />

            {/* Inventory Routes (prefixed with /inventory) */}
            <Route path="/inventory" element={<PrivateRoute element={<Navigate to="/inventory/display" />} />} />
            <Route path="/inventory/add" element={<PrivateRoute element={<AddInventories />} />} />
            <Route path="/inventory/display" element={<PrivateRoute element={<ReadInventories />} />} />
            <Route path="/inventory/update/:id" element={<PrivateRoute element={<UpdateInventories />} />} />
            <Route path="/inventory/delete/:id" element={<PrivateRoute element={<DeleteInventories />} />} />
            <Route path="/inventory/restock/:id" element={<PrivateRoute element={<RestockPage />} />} />
            <Route path="/inventory/report" element={<PrivateRoute element={<InventoryReport />} />} />

            {/* About and Contact Routes */}
            <Route path="/about" element={<About />} /> {/* Updated to use About component */}
            <Route path="/contact" element={<div>Contact Page (Placeholder)</div>} />

            {/* Home Route */}
            <Route path="/" element={<HomePage />} />

            {/* Catch-All Route for Debugging */}
            <Route path="*" element={<div>404 - Route Not Found</div>} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;