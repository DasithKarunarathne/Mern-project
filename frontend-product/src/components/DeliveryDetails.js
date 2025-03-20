// src/components/DeliveryDetails.js
import React, { useState } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

const DeliveryDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [deliveryData, setDeliveryData] = useState({
    name: '',
    address: '',
    phone: '',
  });
  const [errors, setErrors] = useState({});

  if (!state) {
    return (
      <Box sx={{ padding: 2, textAlign: 'center' }}>
        <Typography variant="h4">Delivery Details</Typography>
        <Typography variant="h6" sx={{ marginTop: 2 }}>
          No items selected for delivery.
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/')}
          sx={{ marginTop: 2 }}
        >
          Back to Products
        </Button>
      </Box>
    );
  }

  const { cart, productId, quantity } = state;

  const handleChange = (e) => {
    setDeliveryData({ ...deliveryData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    let tempErrors = {};
    if (!deliveryData.name) tempErrors.name = 'Name is required';
    if (!deliveryData.address) tempErrors.address = 'Address is required';
    if (!deliveryData.phone || !/^\d{10}$/.test(deliveryData.phone)) tempErrors.phone = 'Valid 10-digit phone number is required';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      if (cart) {
        navigate('/order-summary', { state: { deliveryData, cart } });
      } else {
        navigate('/order-summary', { state: { deliveryData, singleProduct: { productId, quantity } } });
      }
    } else {
      alert('Please fill all required fields correctly.');
    }
  };

  return (
    <Box sx={{ padding: 2, maxWidth: 600, margin: '0 auto' }}>
      <Typography variant="h4" sx={{ marginBottom: 2, textAlign: 'center' }}>
        Delivery Details
      </Typography>
      {cart ? (
        <Typography variant="body1">
          Cart Items: {cart.length} items selected for delivery.
        </Typography>
      ) : (
        <Typography variant="body1">
          Product ID: {productId}, Quantity: {quantity}
        </Typography>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 2 }}>
        <TextField
          name="name"
          value={deliveryData.name}
          onChange={handleChange}
          label="Name *"
          error={!!errors.name}
          helperText={errors.name}
          required
          fullWidth
        />
        <TextField
          name="address"
          value={deliveryData.address}
          onChange={handleChange}
          label="Address *"
          error={!!errors.address}
          helperText={errors.address}
          required
          fullWidth
          multiline
          rows={3}
        />
        <TextField
          name="phone"
          value={deliveryData.phone}
          onChange={handleChange}
          label="Phone Number *"
          error={!!errors.phone}
          helperText={errors.phone}
          required
          fullWidth
        />
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{ backgroundColor: '#DAA520', '&:hover': { backgroundColor: '#228B22' } }}
        >
          Proceed to Order Summary
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate('/')}
          sx={{ marginTop: 1 }}
        >
          Back to Products
        </Button>
      </Box>
    </Box>
  );
};

export default DeliveryDetails;