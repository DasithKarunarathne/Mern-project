// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProductDashboard from './components/ProductDashboard';
import ProductManagerDashboard from './components/ProductManagerDashboard';
import ProductManagerForm from './components/ProductManagerForm';
import UpdateProduct from './components/UpdateProduct';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import DeliveryDetails from './components/DeliveryDetails';
import OrderSummary from './components/OrderSummary';
import Payment from './components/Payment';

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Customer Routes */}
        <Route path="/" element={<ProductDashboard />} />
        <Route path="/product/:id" element={<ProductList />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/delivery" element={<DeliveryDetails />} />
        <Route path="/order-summary" element={<OrderSummary />} />
        <Route path="/payment" element={<Payment />} />
        {/* Product Manager Routes */}
        <Route path="/manager" element={<ProductManagerDashboard />} />
        <Route path="/manager/add" element={<ProductManagerForm />} />
        <Route path="/manager/update/:id" element={<UpdateProduct />} />
      </Routes>
    </Router>
  );
};

export default App;