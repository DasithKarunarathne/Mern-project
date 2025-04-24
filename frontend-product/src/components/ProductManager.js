import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProductForm from './ProductForm';
import ProductList from './ProductList';

const ProductManager = () => {
  return (
    <Routes>
      <Route path="/" element={<ProductList />} />
      <Route path="/add" element={<ProductForm />} />
      <Route path="/edit/:id" element={<ProductForm />} />
      <Route path="*" element={<Navigate to="/products" replace />} />
    </Routes>
  );
};

export default ProductManager;