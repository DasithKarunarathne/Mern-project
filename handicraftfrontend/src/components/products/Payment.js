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

const validationRules = {
  cardNumber: {
    pattern: /^[0-9]{16}$/,
    validate: (number) => {
      const cleanNumber = number.replace(/\s/g, '');
      
      // Check if the number contains only digits and is exactly 16 digits
      if (!/^\d{16}$/.test(cleanNumber)) {
        return false;
      }

      // Simple validation - just check if it's a 16-digit number
      return true;

      // Removing Luhn Algorithm temporarily as it might be too restrictive
      // We can add it back if needed
    },
    format: (value) => {
      // Remove any non-digit characters
      const digitsOnly = value.replace(/\D/g, '');
      // Limit to 16 digits
      const limitedDigits = digitsOnly.slice(0, 16);
      // Format as XXXX XXXX XXXX XXXX
      return limitedDigits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
    }
  },
  expiry: {
    pattern: /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
    validate: (value) => {
      if (!value) return false;
      
      const [month, year] = value.split('/');
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;
      
      const expYear = parseInt(year);
      const expMonth = parseInt(month);
      
      if (expYear < currentYear) return false;
      if (expYear === currentYear && expMonth < currentMonth) return false;
      
      return true;
    },
    format: (value) => {
      // Format expiry as: MM/YY
      return value
        .replace(/\D/g, '')
        .replace(/^([0-9]{2})/, '$1/')
        .substr(0, 5);
    }
  },
  cvv: {
    pattern: /^[0-9]{3,4}$/,
    format: (value) => value.replace(/\D/g, '').substr(0, 4)
  }
};

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

  const [formattedCard, setFormattedCard] = useState('');
  const [cardType, setCardType] = useState('');

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

  const detectCardType = (number) => {
    const cleanNumber = number.replace(/\s/g, '');
    const cardPatterns = {
      'Visa': /^4[0-9]{12}(?:[0-9]{3})?$/,
      'MasterCard': /^5[1-5][0-9]{14}$/,
      'American Express': /^3[47][0-9]{13}$/,
      'Discover': /^6(?:011|5[0-9]{2})[0-9]{12}$/
    };

    for (const [cardType, pattern] of Object.entries(cardPatterns)) {
      if (pattern.test(cleanNumber)) {
        return cardType;
      }
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    let error = '';

    switch (name) {
      case 'cardNumber':
        // Only allow digits
        if (!/^\d*$/.test(value.replace(/\s/g, ''))) {
          return; // Ignore input if it contains non-digits
        }
        formattedValue = validationRules.cardNumber.format(value);
        const cleanNumber = formattedValue.replace(/\s/g, '');
        if (cleanNumber.length > 0) {
          if (cleanNumber.length === 16) {
            // Simplified validation check
            if (!/^\d{16}$/.test(cleanNumber)) {
              error = 'Please enter a valid 16-digit card number';
            }
          } else if (cleanNumber.length > 16) {
            error = 'Card number cannot exceed 16 digits';
          }
        }
        setFormattedCard(formattedValue);
        break;

      case 'expiry':
        formattedValue = validationRules.expiry.format(value);
        if (formattedValue.length === 5) {
          if (!validationRules.expiry.validate(formattedValue)) {
            error = 'Card has expired';
          }
        }
        break;

      case 'cvv':
        formattedValue = validationRules.cvv.format(value);
        break;

      default:
        break;
    }

    setCardDetails(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    if (error) {
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    } else {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    let isValid = true;

    // Card Number Validation
    const cleanCardNumber = cardDetails.cardNumber.replace(/\s/g, '');
    if (!cleanCardNumber) {
      newErrors.cardNumber = 'Card number is required';
      isValid = false;
    } else if (!/^\d{16}$/.test(cleanCardNumber)) {
      newErrors.cardNumber = 'Please enter a valid 16-digit card number';
      isValid = false;
    }

    // Expiry Validation
    if (!cardDetails.expiry) {
      newErrors.expiry = 'Expiry date is required';
      isValid = false;
    } else if (!validationRules.expiry.pattern.test(cardDetails.expiry)) {
      newErrors.expiry = 'Invalid expiry date format (MM/YY)';
      isValid = false;
    } else if (!validationRules.expiry.validate(cardDetails.expiry)) {
      newErrors.expiry = 'Card has expired';
      isValid = false;
    }

    // CVV Validation
    if (!cardDetails.cvv) {
      newErrors.cvv = 'CVV is required';
      isValid = false;
    } else if (!validationRules.cvv.pattern.test(cardDetails.cvv)) {
      newErrors.cvv = 'CVV must be 3 or 4 digits';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const generateAndSendOtp = async () => {
    if (!validate()) {
      return;
    }

    if (!deliveryData.email) {
      toast.error('Email address is required for verification.');
      return;
    }

    try {
      const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedOtp(newOtp);
      
      await sendOtpEmail(deliveryData.email, deliveryData.name || 'Customer', newOtp);
      setOtpSent(true);
      toast.success('OTP sent to your email!');
    } catch (error) {
      console.error('Error sending OTP email:', error);
      setOtpSent(false);
      setGeneratedOtp('');
    }
  };

  const verifyOtp = () => {
    if (otp === generatedOtp) {
      setOtpVerified(true);
      toast.success('OTP verified successfully!');
    } else {
      setOtp('');
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
                    value={formattedCard}
                    onChange={handleChange}
                    label={`Card Number ${cardType ? `(${cardType})` : ''}`}
                    error={!!errors.cardNumber}
                    helperText={errors.cardNumber}
                    required
                    disabled={loading}
                    fullWidth
                    placeholder="XXXX XXXX XXXX XXXX"
                    InputProps={{
                      inputProps: {
                        maxLength: 19
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    name="expiry"
                    value={cardDetails.expiry}
                    onChange={handleChange}
                    label="Expiry Date"
                    error={!!errors.expiry}
                    helperText={errors.expiry || "MM/YY"}
                    required
                    disabled={loading}
                    fullWidth
                    placeholder="MM/YY"
                    InputProps={{
                      inputProps: {
                        maxLength: 5
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    name="cvv"
                    value={cardDetails.cvv}
                    onChange={handleChange}
                    label="CVV"
                    error={!!errors.cvv}
                    helperText={errors.cvv || "3 or 4 digits"}
                    required
                    disabled={loading}
                    fullWidth
                    type="password"
                    placeholder="***"
                    InputProps={{
                      inputProps: {
                        maxLength: 4
                      }
                    }}
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