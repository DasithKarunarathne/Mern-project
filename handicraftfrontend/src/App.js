import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";

// Layout Component
import Layout from "./components/Layout";

// Pages
import About from "./pages/About";
import Contact from "./components/Contact";
import ManagerLogin from "./pages/ManagerLogin";

// HR Components
import EmployeeForm from "./components/hr/EmployeeForm";
import EmployeeList from "./components/hr/EmployeeList";
import OvertimeForm from "./components/hr/OvertimeForm";
import MonthlyOvertime from "./components/hr/MonthlyOvertime";

// Finance Components
import Dashboard from "./components/finance/Pages/Dashboard";

// Product Components
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
import Chatbot from "./components/customer/Chatbot";

// Manager Components
import ManagerDashboard from "./pages/ManagerDashboard";

// Inventory Components
import AddInventories from "./components/inventory/addInventories.js";
import ReadInventories from "./components/inventory/readinventories.js";
import UpdateInventories from "./components/inventory/updateinventories.js";
import DeleteInventories from "./components/inventory/deleteinventories.js";
import InventoryReport from "./components/inventory/inventoryreports.js";
import RestockPage from "./components/inventory/restockPage.js";
import CheckInventoryQuality from "./components/inventory/checkinventories.js";

// Define PrivateRoute Component with manager type check
const PrivateRoute = ({ element, allowedManagerTypes }) => {
  const managerType = sessionStorage.getItem("managerType");

  if (!managerType) {
    return <Navigate to="/manager/login" />;
  }

  if (allowedManagerTypes && !allowedManagerTypes.includes(managerType)) {
    return <Navigate to="/manager/login" />;
  }

  return element;
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
            {/* Public Routes */}
            <Route path="/" element={<ProductDashboard />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/product/:id" element={<ProductList />} />

            {/* Customer Routes */}
            <Route path="/customer" element={<CustHome />} />
            <Route path="/customer/register" element={<Register />} />
            <Route path="/customer/login" element={<Login />} />
            <Route path="/customer/profile" element={<Profile />} />
            <Route path="/customer/admin" element={<AdminDashboard />} />
            <Route path="/customer/chat" element={<Chatbot />} /> {/* Added chatbot route */}
            <Route path="/product/cart" element={<Cart />} />
            <Route path="/product/delivery" element={<DeliveryDetails />} />
            <Route path="/product/order-summary" element={<OrderSummary />} />
            <Route path="/product/payment" element={<Payment />} />
            <Route path="/product/order-history" element={<OrderHistory />} />
            <Route path="/product/refund-request/:orderId" element={<RefundRequest />} />

            {/* Manager Routes */}
            <Route path="/manager/login" element={<ManagerLogin />} />
            <Route path="/manager" element={<PrivateRoute element={<ManagerDashboard />} />} />

            {/* HR Routes */}
            <Route path="/hr/*" element={<PrivateRoute element={<EmployeeForm />} allowedManagerTypes={["hr"]} />} />
            <Route path="/hr/list" element={<PrivateRoute element={<EmployeeList />} allowedManagerTypes={["hr"]} />} />
            <Route path="/hr/overtime" element={<PrivateRoute element={<OvertimeForm />} allowedManagerTypes={["hr"]} />} />
            <Route
              path="/hr/overtime/monthly"
              element={<PrivateRoute element={<MonthlyOvertime />} allowedManagerTypes={["hr"]} />}
            />
            <Route
              path="/hr/overtime/monthly/:year/:month"
              element={<PrivateRoute element={<MonthlyOvertime />} allowedManagerTypes={["hr"]} />}
            />

            {/* Finance Routes */}
            <Route
              path="/finance/dashboard/*"
              element={<PrivateRoute element={<Dashboard />} allowedManagerTypes={["finance"]} />}
            />

            {/* Product Management Routes */}
            <Route
              path="/product/manager"
              element={<PrivateRoute element={<ProductManager />} allowedManagerTypes={["product"]} />}
            />
            <Route
              path="/product/admin/refund-management"
              element={<PrivateRoute element={<RefundManagement />} allowedManagerTypes={["product"]} />}
            />

            {/* Inventory Routes */}
            <Route path="/inventory" element={<PrivateRoute element={<ReadInventories />} allowedManagerTypes={["inventory"]} />} />
            <Route path="/inventory/add" element={<PrivateRoute element={<AddInventories />} allowedManagerTypes={["inventory"]} />} />
            <Route path="/inventory/check" element={<PrivateRoute element={<CheckInventoryQuality />} allowedManagerTypes={["inventory"]} />} />
            <Route path="/inventory/display" element={<PrivateRoute element={<ReadInventories />} allowedManagerTypes={["inventory"]} />} />
            <Route path="/inventory/update/:id" element={<PrivateRoute element={<UpdateInventories />} allowedManagerTypes={["inventory"]} />} />
            <Route path="/inventory/delete/:id" element={<PrivateRoute element={<DeleteInventories />} allowedManagerTypes={["inventory"]} />} />
            <Route path="/inventory/restock" element={<PrivateRoute element={<ReadInventories />} allowedManagerTypes={["inventory"]} />} />
            <Route path="/inventory/restock/:id" element={<PrivateRoute element={<RestockPage />} allowedManagerTypes={["inventory"]} />} />
            <Route path="/inventory/report" element={<PrivateRoute element={<InventoryReport />} allowedManagerTypes={["inventory"]} />} />

            {/* Catch-All Route */}
            <Route path="*" element={<div>404 - Route Not Found</div>} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;