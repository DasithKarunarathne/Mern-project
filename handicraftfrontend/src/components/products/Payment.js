import React, { useState } from 'react';
import { placeOrder, sendOtpEmail } from '../../components/products/services/api.js';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Paper,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SecurityIcon from '@mui/icons-material/Security';
import PaymentIcon from '@mui/icons-material/Payment';

const PaymentContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  margin: theme.spacing(4, 'auto'),
  maxWidth: 800,
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
}));

const PaymentCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
  },
}));

const CustomTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    transition: 'all 0.3s ease',
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderWidth: '2px',
    },
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5, 3),
  borderRadius: '12px',
  textTransform: 'none',
  fontWeight: 600,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
  },
}));

const Payment = () => {
  const [cardDetails, setCardDetails] = useState({ cardNumber: '', expiry: '', cvv: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const { state } = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!state || !state.items || !state.deliveryData || !state.total) {
    return (
      <Box sx={{ padding: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          No payment details available
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Please go back and try again.
        </Typography>
        <ActionButton
          variant="contained"
          onClick={() => navigate('/product')}
          sx={{ backgroundColor: theme.palette.primary.main }}
        >
          Back to Products
        </ActionButton>
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

    if (deliveryData.email && !otpVerified) {
      toast.error('Please verify the OTP before proceeding.');
      return;
    }

    if (!deliveryData.email) {
      setOtpVerified(true);
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
      navigate('/product/order-history', { state: { refresh: true } });
    } catch (error) {
      console.error('Error placing order:', error);
      setErrorMessage(error.response?.data?.error || error.message || 'Payment failed. Please try again.');
      toast.error(error.response?.data?.error || error.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaymentContainer>
      <ToastContainer />
      <Stepper activeStep={2} alternativeLabel sx={{ mb: 4 }}>
        <Step>
          <StepLabel>Delivery Details</StepLabel>
        </Step>
        <Step>
          <StepLabel>Order Summary</StepLabel>
        </Step>
        <Step>
          <StepLabel>Payment</StepLabel>
        </Step>
      </Stepper>

      <Typography
        variant={isMobile ? 'h4' : 'h3'}
        sx={{
          fontWeight: 700,
          marginBottom: 4,
          textAlign: 'center',
          color: theme.palette.primary.main,
        }}
      >
        Payment Details
      </Typography>

      {errorMessage && (
        <Typography
          color="error"
          sx={{
            marginBottom: 3,
            textAlign: 'center',
            padding: 2,
            backgroundColor: 'rgba(255, 0, 0, 0.1)',
            borderRadius: '8px',
          }}
        >
          {errorMessage}
        </Typography>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <PaymentCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <CreditCardIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Card Details</Typography>
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <CustomTextField
                    name="cardNumber"
                    value={cardDetails.cardNumber}
                    onChange={handleChange}
                    label="Card Number"
                    error={!!errors.cardNumber}
                    helperText={errors.cardNumber}
                    required
                    disabled={loading}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    name="expiry"
                    value={cardDetails.expiry}
                    onChange={handleChange}
                    label="Expiry Date (MM/YY)"
                    error={!!errors.expiry}
                    helperText={errors.expiry}
                    required
                    disabled={loading}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    name="cvv"
                    value={cardDetails.cvv}
                    onChange={handleChange}
                    label="CVV"
                    error={!!errors.cvv}
                    helperText={errors.cvv}
                    required
                    disabled={loading}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </CardContent>
          </PaymentCard>

          {deliveryData.email && (
            <PaymentCard sx={{ mt: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <SecurityIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Security Verification</Typography>
                </Box>
                {!otpSent ? (
                  <ActionButton
                    variant="contained"
                    onClick={generateAndSendOtp}
                    fullWidth
                    disabled={loading}
                    sx={{
                      backgroundColor: theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                      },
                    }}
                  >
                    Send OTP
                  </ActionButton>
                ) : !otpVerified ? (
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <CustomTextField
                        label="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        fullWidth
                        required
                        disabled={loading}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <ActionButton
                        variant="contained"
                        onClick={verifyOtp}
                        fullWidth
                        disabled={loading}
                        sx={{
                          backgroundColor: theme.palette.primary.main,
                          '&:hover': {
                            backgroundColor: theme.palette.primary.dark,
                          },
                        }}
                      >
                        Verify OTP
                      </ActionButton>
                    </Grid>
                  </Grid>
                ) : null}
              </CardContent>
            </PaymentCard>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          <PaymentCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PaymentIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Order Total</Typography>
              </Box>
              <Typography variant="h4" color="primary" sx={{ mb: 3, textAlign: 'center' }}>
                LKR {total.toFixed(2)}
              </Typography>
              <ActionButton
                type="submit"
                variant="contained"
                onClick={handlePayment}
                fullWidth
                disabled={loading || (deliveryData.email && !otpVerified)}
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Pay Now'
                )}
              </ActionButton>
            </CardContent>
          </PaymentCard>
        </Grid>
      </Grid>
    </PaymentContainer>
  );
};

export default Payment;