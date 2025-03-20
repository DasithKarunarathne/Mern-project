// src/components/OrderSummary.js
import React, { useState, useEffect } from 'react';
import { getCart, getProductById } from '../services/api';
import { Box, Typography, Button } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

const OrderSummary = () => {
  const [items, setItems] = useState([]);
  const { state } = useLocation();
  const navigate = useNavigate();
  const deliveryCharge = 500;

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      if (state?.singleProduct) {
        const res = await getProductById(state.singleProduct.productId);
        setItems([{ productId: res.data.product, quantity: state.singleProduct.quantity }]);
      } else {
        const res = await getCart();
        setItems(res.data.filter(item => item.productId));
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.productId.price * item.quantity, 0);
  const total = subtotal + deliveryCharge;

  return (
    <Box sx={{ padding: 2, maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h4">Order Summary</Typography>
      <Box sx={{ marginTop: 2 }}>
        {items.length === 0 ? (
          <Typography>No items to display.</Typography>
        ) : (
          items.map((item) => (
            <Typography key={item.productId._id}>
              {item.productId.name} - LKR {item.productId.price} x {item.quantity}
            </Typography>
          ))
        )}
        <Typography variant="h6" sx={{ marginTop: 2 }}>Subtotal: LKR {subtotal.toFixed(2)}</Typography>
        <Typography>Delivery Charge: LKR {deliveryCharge.toFixed(2)}</Typography>
        <Typography variant="h6">Total Payable: LKR {total.toFixed(2)}</Typography>
      </Box>
      <Button
        variant="contained"
        onClick={() => navigate('/payment', { state: { deliveryData: state.deliveryData, total, items } })}
        sx={{ backgroundColor: '#DAA520', marginTop: 2, '&:hover': { backgroundColor: '#228B22' } }}
      >
        Continue to Payment
      </Button>
    </Box>
  );
};

export default OrderSummary;