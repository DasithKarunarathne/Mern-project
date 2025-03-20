// src/components/Payment.js
import React, { useState } from 'react';
import { placeOrder } from '../services/api';
import { Box, Typography, TextField, Button } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

const Payment = () => {
  const [cardDetails, setCardDetails] = useState({ cardNumber: '', expiry: '', cvv: '' });
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [errors, setErrors] = useState({});
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    return (
      <Box sx={{ padding: 2, textAlign: 'center' }}>
        <Typography variant="h4">Payment</Typography>
        <Typography variant="h6" sx={{ marginTop: 2 }}>
          No payment details available.
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

  const { total } = state;

  const generateOtp = () => {
    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(newOtp);
    alert(`Your OTP is: ${newOtp}`);
  };

  const handleChange = (e) => {
    setCardDetails({ ...cardDetails, [e.target.name]: e.target.value });
  };

  const validate = () => {
    let tempErrors = {};
    if (!cardDetails.cardNumber || !/^\d{16}$/.test(cardDetails.cardNumber)) 
      tempErrors.cardNumber = 'Valid 16-digit card number is required';
    if (!cardDetails.expiry || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardDetails.expiry)) 
      tempErrors.expiry = 'Valid expiry (MM/YY) is required';
    if (!cardDetails.cvv || !/^\d{3}$/.test(cardDetails.cvv)) 
      tempErrors.cvv = 'Valid 3-digit CVV is required';
    if (!otp || otp !== generatedOtp) 
      tempErrors.otp = 'Correct OTP is required';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        await placeOrder({
          deliveryData: state.deliveryData,
          total: state.total,
          items: state.items.map(item => ({ productId: item.productId._id, quantity: item.quantity }))
        });
        alert('Transaction successful!');
        navigate('/');
      } catch (error) {
        console.error('Error placing order:', error);
        alert('Payment failed');
      }
    }
  };

  return (
    <Box sx={{ padding: 2, maxWidth: 500, margin: '0 auto' }}>
      <Typography variant="h4">Payment</Typography>
      <Typography variant="h6" sx={{ marginTop: 2 }}>
        Total Amount: LKR {total.toFixed(2)}
      </Typography>
      <Box component="form" onSubmit={handlePayment} sx={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 2 }}>
        <TextField name="cardNumber" value={cardDetails.cardNumber} onChange={handleChange} placeholder="Card Number" error={!!errors.cardNumber} helperText={errors.cardNumber} required />
        <TextField name="expiry" value={cardDetails.expiry} onChange={handleChange} placeholder="MM/YY" error={!!errors.expiry} helperText={errors.expiry} required />
        <TextField name="cvv" value={cardDetails.cvv} onChange={handleChange} placeholder="CVV" error={!!errors.cvv} helperText={errors.cvv} required />
        <Button variant="contained" onClick={generateOtp} sx={{ backgroundColor: '#8B4513', '&:hover': { backgroundColor: '#228B22' } }}>
          Generate OTP
        </Button>
        <TextField value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" error={!!errors.otp} helperText={errors.otp} required />
        <Button type="submit" variant="contained" sx={{ backgroundColor: '#DAA520', '&:hover': { backgroundColor: '#228B22' } }}>
          Pay Now
        </Button>
      </Box>
    </Box>
  );
};

export default Payment;