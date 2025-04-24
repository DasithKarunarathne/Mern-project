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

  const validate = () => {
    const newErrors = {};
    if (!deliveryData.name) newErrors.name = 'Name is required';
    if (!deliveryData.address) newErrors.address = 'Address is required';
    if (!deliveryData.phone || !/^\d{10}$/.test(deliveryData.phone))
      newErrors.phone = 'Valid 10-digit phone number is required';
    if (!deliveryData.postalCode || !/^\d{5}$/.test(deliveryData.postalCode))
      newErrors.postalCode = 'Valid 5-digit postal code is required';
    if (!deliveryData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(deliveryData.email))
      newErrors.email = 'Valid email is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDeliveryData({ ...deliveryData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const fetchDeliveryCharge = async (postalCode) => {
    try {
      const response = await getDeliveryCharge(postalCode);
      setProvince(response.data.province);
      setDeliveryCharge(response.data.deliveryCharge);
    } catch (error) {
      console.error('Error fetching delivery charge:', error);
      setProvince('Unknown');
      setDeliveryCharge(700);
      toast.error('Failed to calculate delivery charge. Using default charge of LKR 700.');
    }
  };

  useEffect(() => {
    if (deliveryData.postalCode.length === 5) {
      fetchDeliveryCharge(deliveryData.postalCode);
    } else {
      setProvince('');
      setDeliveryCharge(0);
    }
  }, [deliveryData.postalCode]);

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error('Please fill all required fields correctly.');
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
                    label="Name"
                    name="name"
                    value={deliveryData.name}
                    onChange={handleChange}
                    fullWidth
                    required
                    error={!!errors.name}
                    helperText={errors.name}
                    disabled={loading}
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
                    helperText={errors.phone}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    label="Address"
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
                    helperText={errors.postalCode}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    label="Email (for notifications)"
                    name="email"
                    value={deliveryData.email}
                    onChange={handleChange}
                    fullWidth
                    required
                    error={!!errors.email}
                    helperText={errors.email}
                    disabled={loading}
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
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Province:</strong> {province}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    <strong>Delivery Charge:</strong> LKR {deliveryCharge.toFixed(2)}
                  </Typography>
                </Box>
              )}
              <SubmitButton
                variant="contained"
                onClick={handleSubmit}
                fullWidth
                disabled={loading}
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