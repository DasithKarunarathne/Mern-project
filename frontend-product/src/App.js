import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProductDashboard from './components/ProductDashboard';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import DeliveryDetails from './components/DeliveryDetails';
import OrderSummary from './components/OrderSummary';
import Payment from './components/Payment';
import OrderHistory from './components/OrderHistory';
import RefundRequest from './components/RefundRequest'; 
import ProductManager from './components/ProductManager';
import RefundManagement from './components/RefundManagement';

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes> 
        <Route path="/" element={<ProductDashboard />} />
        <Route path="/product/:id" element={<ProductList />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/delivery" element={<DeliveryDetails />} />
        <Route path="/order-summary" element={<OrderSummary />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/order-history" element={<OrderHistory />} />
        <Route path="/refund-request/:orderId" element={<RefundRequest />} />
        <Route path="/manager" element={<ProductManager />} />
        <Route path="/admin/refund-management" element={<RefundManagement />} />
      </Routes>
    </Router>
  );
};

export default App;