import React, { useState } from 'react';
import { placeOrder, sendOtpEmail } from '../services/api'; // Import sendOtpEmail
import { Box, Typography, TextField, Button, CircularProgress } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Payment = () => {
  const [cardDetails, setCardDetails] = useState({ cardNumber: '', expiry: '', cvv: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [otp, setOtp] = useState(''); // State for entered OTP
  const [generatedOtp, setGeneratedOtp] = useState(''); // State for generated OTP
  const [otpSent, setOtpSent] = useState(false); // Track if OTP has been sent
  const [otpVerified, setOtpVerified] = useState(false); // Track if OTP is verified
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state || !state.items || !state.deliveryData || !state.total) {
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

  const { items, deliveryData, total, deliveryCharge } = state;

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
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const generateAndSendOtp = async () => {
    if (!validate()) {
      toast.error('Please fill all required fields correctly.');
      return;
    }

    if (!deliveryData.email) {
      toast.error('No email provided. Please go back and enter an email in the delivery details.');
      return;
    }

    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(newOtp);
    setOtpSent(true);

    try {
      await sendOtpEmail(deliveryData.email, deliveryData.name || 'Customer', newOtp);
      toast.success('OTP sent to your email!');
    } catch (error) {
      console.error('Error sending OTP email:', error);
      toast.error('Failed to send OTP. Please use this OTP: ' + newOtp);
    }
  };

  const verifyOtp = () => {
    if (otp === generatedOtp) {
      setOtpVerified(true);
      toast.success('OTP verified successfully!');
    } else {
      toast.error('Invalid OTP. Please try again.');
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fill all required fields correctly.');
      return;
    }

    // If email is provided, require OTP verification
    if (deliveryData.email && !otpVerified) {
      toast.error('Please verify the OTP before proceeding.');
      return;
    }

    // If no email is provided, skip OTP verification
    if (!deliveryData.email) {
      setOtpVerified(true); // Skip OTP verification
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const validItems = items
        .filter(item => {
          const hasValidProductId = item.productId && (typeof item.productId === 'string' || item.productId._id);
          const price = Number(item.price);
          const hasValidPrice = !isNaN(price) && price > 0;
          return hasValidProductId && hasValidPrice;
        })
        .map(item => ({
          productId: typeof item.productId === 'string' ? item.productId : item.productId._id,
          quantity: Number(item.quantity) || 1,
          price: Number(item.price),
        }));

      if (validItems.length === 0) {
        throw new Error('No valid items in the cart. Please add items and try again.');
      }

      const orderData = {
        userId: 'mock-user-id',
        deliveryData,
        subtotal: validItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        deliveryCharge: Number(deliveryCharge) || 0,
        total: Number(total),
        items: validItems,
      };
      await placeOrder(orderData);
      toast.success('Transaction successful!');
      navigate('/order-history', { state: { refresh: true } });
    } catch (error) {
      console.error('Error placing order:', error);
      setErrorMessage(error.response?.data?.error || error.message || 'Payment failed. Please try again.');
      toast.error(error.response?.data?.error || error.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ padding: 2, maxWidth: 500, margin: '0 auto' }}>
      <ToastContainer />
      <Typography variant="h4">Payment</Typography>
      <Typography variant="h6" sx={{ marginTop: 2 }}>
        Total Amount: LKR {total.toFixed(2)}
      </Typography>
      {errorMessage && (
        <Typography color="error" sx={{ marginTop: 2, textAlign: 'center' }}>
          {errorMessage}
        </Typography>
      )}
      <Box component="form" onSubmit={handlePayment} sx={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 2 }}>
        <TextField
          name="cardNumber"
          value={cardDetails.cardNumber}
          onChange={handleChange}
          placeholder="Card Number"
          error={!!errors.cardNumber}
          helperText={errors.cardNumber}
          required
          disabled={loading}
        />
        <TextField
          name="expiry"
          value={cardDetails.expiry}
          onChange={handleChange}
          placeholder="MM/YY"
          error={!!errors.expiry}
          helperText={errors.expiry}
          required
          disabled={loading}
        />
        <TextField
          name="cvv"
          value={cardDetails.cvv}
          onChange={handleChange}
          placeholder="CVV"
          error={!!errors.cvv}
          helperText={errors.cvv}
          required
          disabled={loading}
        />
        {deliveryData.email ? (
          !otpSent ? (
            <Button
              variant="contained"
              onClick={generateAndSendOtp}
              sx={{ backgroundColor: '#8B4513', '&:hover': { backgroundColor: '#228B22' } }}
              disabled={loading}
            >
              Send OTP
            </Button>
          ) : !otpVerified ? (
            <>
              <TextField
                label="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                fullWidth
                required
                sx={{ marginTop: 2 }}
                disabled={loading}
              />
              <Button
                variant="contained"
                onClick={verifyOtp}
                sx={{ backgroundColor: '#8B4513', marginTop: 2, '&:hover': { backgroundColor: '#228B22' } }}
                disabled={loading}
              >
                Verify OTP
              </Button>
            </>
          ) : (
            <Button
              type="submit"
              variant="contained"
              sx={{ backgroundColor: '#DAA520', '&:hover': { backgroundColor: '#228B22' } }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Pay Now'}
            </Button>
          )
        ) : (
          <Button
            type="submit"
            variant="contained"
            sx={{ backgroundColor: '#DAA520', '&:hover': { backgroundColor: '#228B22' } }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Pay Now'}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default Payment;