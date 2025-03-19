import React, { useState } from 'react';
import { placeOrder } from '../services/api';
import { Box, Typography, TextField, Button } from '@mui/material';
import './Delivery.css';

const Delivery = () => {
  const [deliveryData, setDeliveryData] = useState({
    address: '',
    city: '',
    postalCode: '',
    phone: ''
  });

  const handleChange = (e) => {
    setDeliveryData({ ...deliveryData, [e.target.name]: e.target.value });
  };

  const handleOrder = async (e) => {
    e.preventDefault();
    await placeOrder(deliveryData);
    alert('Order placed successfully!');
    setDeliveryData({ address: '', city: '', postalCode: '', phone: '' });
    window.location.href = '/';
  };

  return (
    <Box sx={{ padding: 2, maxWidth: 500, margin: '0 auto' }}>
      <Typography variant="h4">Delivery Details</Typography>
      <Box component="form" onSubmit={handleOrder} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField name="address" value={deliveryData.address} onChange={handleChange} placeholder="Address" required />
        <TextField name="city" value={deliveryData.city} onChange={handleChange} placeholder="City" required />
        <TextField name="postalCode" value={deliveryData.postalCode} onChange={handleChange} placeholder="Postal Code" required />
        <TextField name="phone" value={deliveryData.phone} onChange={handleChange} placeholder="Phone" required />
        <Button type="submit" variant="contained" sx={{ backgroundColor: '#DAA520', color: '#333333', '&:hover': { backgroundColor: '#228B22', color: '#F5F5DC' } }}>
          Place Order
        </Button>
      </Box>
    </Box>
  );
};

export default Delivery;