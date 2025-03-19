import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProductManagement from './components/ProductManagement';
import Cart from './components/Cart';
import Delivery from './components/Delivery';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<ProductManagement />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/delivery" element={<Delivery />} />
      </Routes>
    </Router>
  );
}

export default App;