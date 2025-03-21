// src/components/DeliveryDetails.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getDeliveryCharge, saveDeliveryDetails } from '../services/api';
import { Box, Typography, TextField, Button } from '@mui/material';

const DeliveryDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { cart, singleProduct } = state || {};
  const productId = singleProduct?.productId;
  const quantity = singleProduct?.quantity || 1;

  const [deliveryData, setDeliveryData] = useState({
    name: '',
    address: '',
    phone: '',
    postalCode: '',
    email: '', // New field for email
  });
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!deliveryData.name) newErrors.name = 'Name is required';
    if (!deliveryData.address) newErrors.address = 'Address is required';
    if (!deliveryData.phone || !/^\d{10}$/.test(deliveryData.phone))
      newErrors.phone = 'Valid 10-digit phone number is required';
    if (!deliveryData.postalCode || !/^\d{5}$/.test(deliveryData.postalCode))
      newErrors.postalCode = 'Valid 5-digit postal code is required';
    if (deliveryData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(deliveryData.email))
      newErrors.email = 'Valid email is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDeliveryData({ ...deliveryData, [name]: value });
  };

  const fetchDeliveryCharge = async (postalCode) => {
    try {
      const response = await getDeliveryCharge(postalCode);
      setDeliveryCharge(response.data.deliveryCharge);
    } catch (error) {
      console.error('Error fetching delivery charge:', error);
      setDeliveryCharge(0);
    }
  };

  useEffect(() => {
    if (deliveryData.postalCode.length === 5) {
      fetchDeliveryCharge(deliveryData.postalCode);
    }
  }, [deliveryData.postalCode]);

  const handleSubmit = async () => {
    if (validate()) {
      try {
        const deliveryDetails = {
          name: deliveryData.name,
          address: deliveryData.address,
          phone: deliveryData.phone,
          postalCode: deliveryData.postalCode,
          deliveryCharge,
          email: deliveryData.email, // Include email in delivery details
        };
        const response = await saveDeliveryDetails(deliveryDetails);
        const savedDelivery = response.data.delivery;

        if (cart) {
          navigate('/order-summary', {
            state: { deliveryData: savedDelivery, cart, deliveryCharge },
          });
        } else {
          navigate('/order-summary', {
            state: { deliveryData: savedDelivery, singleProduct: { productId, quantity }, deliveryCharge },
          });
        }
      } catch (error) {
        console.error('Error saving delivery details:', error);
        alert('Failed to save delivery details: ' + (error.response?.data?.error || error.message));
      }
    } else {
      alert('Please fill all required fields correctly.');
    }
  };

  return (
    <Box sx={{ padding: 2, maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h4" sx={{ marginBottom: 2, textAlign: 'center' }}>
        Delivery Details
      </Typography>
      <TextField
        label="Name"
        name="name"
        value={deliveryData.name}
        onChange={handleChange}
        fullWidth
        required
        error={!!errors.name}
        helperText={errors.name}
        sx={{ marginBottom: 2 }}
      />
      <TextField
        label="Address"
        name="address"
        value={deliveryData.address}
        onChange={handleChange}
        fullWidth
        required
        error={!!errors.address}
        helperText={errors.address}
        sx={{ marginBottom: 2 }}
      />
      <TextField
        label="Phone Number"
        name="phone"
        value={deliveryData.phone}
        onChange={handleChange}
        fullWidth
        required
        error={!!errors.phone}
        helperText={errors.phone}
        sx={{ marginBottom: 2 }}
      />
      <TextField
        label="Postal Code"
        name="postalCode"
        value={deliveryData.postalCode}
        onChange={handleChange}
        fullWidth
        required
        error={!!errors.postalCode}
        helperText={errors.postalCode}
        sx={{ marginBottom: 2 }}
      />
      <TextField
        label="Email (Optional, for notifications)"
        name="email"
        value={deliveryData.email}
        onChange={handleChange}
        fullWidth
        error={!!errors.email}
        helperText={errors.email}
        sx={{ marginBottom: 2 }}
      />
      <Typography>Delivery Charge: LKR {deliveryCharge.toFixed(2)}</Typography>
      <Button
        variant="contained"
        onClick={handleSubmit}
        sx={{ backgroundColor: '#DAA520', marginTop: 2, '&:hover': { backgroundColor: '#228B22' } }}
      >
        Proceed to Order Summary
      </Button>
    </Box>
  );
};

export default DeliveryDetails;