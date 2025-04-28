import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getDeliveryCharge, saveDeliveryDetails } from '../../components/products/services/api.js';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Paper,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Alert,
  InputAdornment,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PaymentIcon from '@mui/icons-material/Payment';
import axios from 'axios';

const DeliveryContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  margin: theme.spacing(4, 'auto'),
  maxWidth: 1000,
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
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

const SubmitButton = styled(Button)(({ theme }) => ({
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

const DeliveryCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
  },
}));

const validationRules = {
  name: {
    pattern: /^[A-Za-z\s.'-]+$/,
    minLength: 3,
    maxLength: 50,
    message: 'Name must contain only letters, spaces, and basic punctuation (.-\')'
  },
  phone: {
    pattern: /^(?:\+94|0)?[0-9]{9,10}$/,
    message: 'Enter a valid Sri Lankan phone number (e.g., 0771234567 or +94771234567)'
  },
  address: {
    pattern: /^[A-Za-z0-9\s,.-]+$/,
    minLength: 10,
    maxLength: 200,
    message: 'Address must contain only letters, numbers, spaces, and basic punctuation (,.-)'
  },
  postalCode: {
    pattern: /^[0-9]{5}$/,
    message: 'Postal code must be exactly 5 digits'
  },
  email: {
    pattern: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    message: 'Enter a valid email address'
  }
};

const DeliveryDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { cart, singleProduct } = state || {};
  const userId = 'mock-user-id';

  const [deliveryData, setDeliveryData] = useState({
    name: '',
    address: '',
    phone: '',
    postalCode: '',
    email: '',
  });
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [province, setProvince] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isCalculatingCharge, setIsCalculatingCharge] = useState(false);

  const validateField = (name, value) => {
    const rule = validationRules[name];
    if (!value.trim()) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    }

    if (rule.minLength && value.length < rule.minLength) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} must be at least ${rule.minLength} characters`;
    }

    if (rule.maxLength && value.length > rule.maxLength) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} must not exceed ${rule.maxLength} characters`;
    }

    if (!rule.pattern.test(value)) {
      return rule.message;
    }

    return '';
  };

  const validate = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(deliveryData).forEach(field => {
      const error = validateField(field, deliveryData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    // Additional validation for postal code
    if (!newErrors.postalCode && !province) {
      newErrors.postalCode = 'Invalid postal code. Please enter a valid Sri Lankan postal code';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format input based on field type
    switch (name) {
      case 'name':
        // Remove any numbers or special characters except allowed ones
        formattedValue = value.replace(/[^A-Za-z\s.'-]/g, '');
        break;
      case 'phone':
        // Format phone number
        formattedValue = value.replace(/[^0-9+]/g, '');
        if (formattedValue.startsWith('0') && formattedValue.length > 10) {
          formattedValue = formattedValue.slice(0, 10);
        } else if (formattedValue.startsWith('+94') && formattedValue.length > 12) {
          formattedValue = formattedValue.slice(0, 12);
        }
        break;
      case 'postalCode':
        // Only allow numbers and limit to 5 digits
        formattedValue = value.replace(/[^0-9]/g, '').slice(0, 5);
        break;
      case 'email':
        // Convert to lowercase
        formattedValue = value.toLowerCase();
        break;
      default:
        break;
    }

    setDeliveryData({ ...deliveryData, [name]: formattedValue });
    
    // Real-time validation
    const error = validateField(name, formattedValue);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const fetchDeliveryCharge = async (postalCode) => {
    setIsCalculatingCharge(true);
    try {
      console.log('Fetching delivery charge for postal code:', postalCode);
      const response = await getDeliveryCharge(postalCode);
      console.log('Delivery charge response:', response.data);
      
      if (response.data && typeof response.data.deliveryCharge === 'number') {
        setProvince(response.data.province || 'Unknown');
        setDeliveryCharge(response.data.deliveryCharge);
        setErrors(prev => ({ ...prev, postalCode: '' }));
      } else {
        setErrors(prev => ({
          ...prev,
          postalCode: 'Unable to calculate delivery charge for this postal code'
        }));
        setProvince('Unknown');
        setDeliveryCharge(0);
      }
    } catch (error) {
      console.error('Error fetching delivery charge:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Set appropriate error message based on the error type
      let errorMessage = 'Failed to calculate delivery charge. Please try again.';
      if (error.response?.status === 400) {
        errorMessage = 'Invalid postal code. Please enter a valid Sri Lankan postal code.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Delivery is not available for this postal code.';
      }
      
      setErrors(prev => ({ ...prev, postalCode: errorMessage }));
      setProvince('Unknown');
      setDeliveryCharge(0);
      toast.error(errorMessage);
    } finally {
      setIsCalculatingCharge(false);
    }
  };

  useEffect(() => {
    if (deliveryData.postalCode.length === 5) {
      fetchDeliveryCharge(deliveryData.postalCode);
    } else {
      setProvince('');
      setDeliveryCharge(0);
      if (deliveryData.postalCode.length > 0) {
        setErrors(prev => ({
          ...prev,
          postalCode: 'Postal code must be exactly 5 digits'
        }));
      }
    }
  }, [deliveryData.postalCode]);

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error('Please correct all errors before proceeding.');
      return;
    }

    if (deliveryCharge === 0) {
      toast.error('Please wait for the delivery charge to be calculated.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const deliveryDetails = {
        userId,
        name: deliveryData.name,
        address: deliveryData.address,
        phone: deliveryData.phone,
        postalCode: deliveryData.postalCode,
        email: deliveryData.email,
        deliveryCharge,
      };
      const response = await saveDeliveryDetails(deliveryDetails);
      const savedDelivery = response.data.delivery;

      if (cart) {
        const validCart = cart.filter(item => {
          const isValid =
            item.productId &&
            item.quantity &&
            !isNaN(Number(item.quantity)) &&
            Number(item.quantity) > 0 &&
            !isNaN(Number(item.price)) &&
            Number(item.price) > 0;
          if (!isValid) {
            console.warn('Invalid cart item filtered out:', item);
          }
          return isValid;
        });

        if (validCart.length === 0) {
          throw new Error('No valid items in the cart after filtering.');
        }

        navigate('/product/order-summary', {
          state: { deliveryData: savedDelivery, cart: validCart, deliveryCharge },
        });
      } else if (singleProduct) {
        const price = Number(singleProduct.price);
        if (!singleProduct.productId || !singleProduct.quantity || isNaN(price) || price <= 0) {
          throw new Error('Invalid product details: productId, quantity, or price is missing or invalid.');
        }
        navigate('/product/order-summary', {
          state: {
            deliveryData: savedDelivery,
            singleProduct: {
              productId: singleProduct.productId,
              quantity: singleProduct.quantity,
              price: price,
            },
            deliveryCharge,
          },
        });
      } else {
        throw new Error('No items to deliver.');
      }
    } catch (error) {
      console.error('Error saving delivery details:', error);
      setErrorMessage(error.response?.data?.error || error.message || 'Failed to save delivery details. Please try again.');
      toast.error(error.response?.data?.error || error.message || 'Failed to save delivery details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!cart && !singleProduct) {
    return (
      <Box sx={{ padding: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          No items to deliver
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Please add items to your cart or buy a product.
        </Typography>
        <SubmitButton
          variant="contained"
          onClick={() => navigate('/')}
          sx={{ backgroundColor: theme.palette.primary.main }}
        >
          Back to Products
        </SubmitButton>
      </Box>
    );
  }

  return (
    <DeliveryContainer>
      <ToastContainer />
      <Stepper activeStep={0} alternativeLabel sx={{ mb: 4 }}>
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
        Delivery Details
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
          <DeliveryCard>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    label="Full Name"
                    name="name"
                    value={deliveryData.name}
                    onChange={handleChange}
                    fullWidth
                    required
                    error={!!errors.name}
                    helperText={errors.name}
                    disabled={loading}
                    placeholder="Enter your full name"
                    InputProps={{
                      inputProps: {
                        maxLength: validationRules.name.maxLength
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    label="Phone Number"
                    name="phone"
                    value={deliveryData.phone}
                    onChange={handleChange}
                    fullWidth
                    required
                    error={!!errors.phone}
                    helperText={errors.phone || "Format: 0771234567 or +94771234567"}
                    disabled={loading}
                    placeholder="Enter your phone number"
                    InputProps={{
                      startAdornment: deliveryData.phone.startsWith('+94') ? null : (
                        <InputAdornment position="start">🇱🇰</InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    label="Delivery Address"
                    name="address"
                    value={deliveryData.address}
                    onChange={handleChange}
                    fullWidth
                    required
                    error={!!errors.address}
                    helperText={errors.address}
                    disabled={loading}
                    multiline
                    rows={3}
                    placeholder="Enter your complete delivery address"
                    InputProps={{
                      inputProps: {
                        maxLength: validationRules.address.maxLength
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    label="Postal Code"
                    name="postalCode"
                    value={deliveryData.postalCode}
                    onChange={handleChange}
                    fullWidth
                    required
                    error={!!errors.postalCode}
                    helperText={errors.postalCode || "Enter 5-digit postal code"}
                    disabled={loading}
                    placeholder="Enter 5-digit postal code"
                    InputProps={{
                      inputProps: {
                        maxLength: 5
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    label="Email Address"
                    name="email"
                    value={deliveryData.email}
                    onChange={handleChange}
                    fullWidth
                    required
                    error={!!errors.email}
                    helperText={errors.email}
                    disabled={loading}
                    placeholder="Enter your email address"
                    type="email"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </DeliveryCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <DeliveryCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationOnIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Delivery Information</Typography>
              </Box>
              {deliveryData.postalCode && (
                <Box sx={{ mt: 2 }}>
                  {isCalculatingCharge ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : (
                    <>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Province:</strong> {province}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        <strong>Delivery Charge:</strong>{' '}
                        {deliveryCharge > 0 ? `LKR ${deliveryCharge.toFixed(2)}` : 'Not available'}
                      </Typography>
                    </>
                  )}
                </Box>
              )}
              <SubmitButton
                variant="contained"
                onClick={handleSubmit}
                fullWidth
                disabled={loading || isCalculatingCharge || deliveryCharge === 0}
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
                  'Proceed to Order Summary'
                )}
              </SubmitButton>
            </CardContent>
          </DeliveryCard>
        </Grid>
      </Grid>
    </DeliveryContainer>
  );
};

export default DeliveryDetails;