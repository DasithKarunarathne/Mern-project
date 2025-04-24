import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getProductById } from '../../components/products/services/api.js';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  useTheme,
  useMediaQuery,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PaymentIcon from '@mui/icons-material/Payment';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const OrderContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  margin: theme.spacing(4, 'auto'),
  maxWidth: 1000,
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
}));

const OrderCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
  },
}));

const ProductImage = styled('img')(({ theme }) => ({
  width: 100,
  height: 100,
  objectFit: 'cover',
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
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

const OrderSummary = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { deliveryData, cart, singleProduct, deliveryCharge } = state || {};
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const items = cart || (singleProduct ? [singleProduct] : []);
        const productPromises = items.map(async (item) => {
          const response = await getProductById(item.productId);
          return { ...item, productDetails: response.data.product };
        });
        const fetchedProducts = await Promise.all(productPromises);
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Error fetching product details:', error);
        setError(error.response?.data?.error || error.message);
        toast.error('Failed to fetch product details: ' + (error.response?.data?.error || error.message));
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetails();
  }, [cart, singleProduct]);

  if (!deliveryData || (!cart && !singleProduct)) {
    return (
      <Box sx={{ padding: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          No order data available
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

  const items = cart
    ? cart.map(item => ({
        productId: item.productId,
        quantity: Number(item.quantity),
        price: Number(item.price),
      }))
    : singleProduct
    ? [
        {
          productId: singleProduct.productId,
          quantity: Number(singleProduct.quantity),
          price: Number(singleProduct.price),
        },
      ]
    : [];

  const subtotal = items.reduce((total, item) => {
    const itemPrice = Number(item.price) || 0;
    const itemQuantity = Number(item.quantity) || 1;
    return total + itemPrice * itemQuantity;
  }, 0);

  const deliveryChargeValue = Number(deliveryCharge) || 0;
  const total = subtotal + deliveryChargeValue;

  const handleProceedToPayment = () => {
    try {
      if (items.length === 0) {
        throw new Error('No items in the order.');
      }
      if (items.some(item => !item.productId || !item.quantity || isNaN(item.price) || item.price <= 0)) {
        throw new Error('One or more items are missing a valid productId, quantity, or price.');
      }
      navigate('/product/payment', {
        state: {
          items,
          deliveryData,
          total,
          deliveryCharge: deliveryChargeValue,
        },
      });
    } catch (error) {
      console.error('Error navigating to payment:', error);
      setError(error.message || 'Failed to proceed to payment. Please try again.');
      toast.error(error.message || 'Failed to proceed to payment. Please try again.');
    }
  };

  return (
    <OrderContainer>
      <ToastContainer />
      <Stepper activeStep={1} alternativeLabel sx={{ mb: 4 }}>
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
        Order Summary
      </Typography>

      {error && (
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
          {error}
        </Typography>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={60} thickness={4} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <OrderCard>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocalShippingIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Delivery Details</Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1">
                      <strong>Name:</strong> {deliveryData.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1">
                      <strong>Phone:</strong> {deliveryData.phone}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body1">
                      <strong>Address:</strong> {deliveryData.address}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1">
                      <strong>Postal Code:</strong> {deliveryData.postalCode}
                    </Typography>
                  </Grid>
                  {deliveryData.email && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">
                        <strong>Email:</strong> {deliveryData.email}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </OrderCard>

            <OrderCard sx={{ mt: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ShoppingCartIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Order Items</Typography>
                </Box>
                {products.map((item, index) => (
                  <Box key={index} sx={{ mb: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={3}>
                        <ProductImage
                          src={item.productDetails?.image ? `http://localhost:5000${item.productDetails.image}` : 'https://via.placeholder.com/100'}
                          alt={item.productDetails?.name || 'Product'}
                        />
                      </Grid>
                      <Grid item xs={12} sm={9}>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          {item.productDetails?.name || 'Product'}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          Quantity: {item.quantity || 1}
                        </Typography>
                        <Typography variant="body1" color="primary" fontWeight="bold">
                          LKR {(item.price * (item.quantity || 1)).toFixed(2)}
                        </Typography>
                      </Grid>
                    </Grid>
                    {index < products.length - 1 && <Divider sx={{ my: 2 }} />}
                  </Box>
                ))}
              </CardContent>
            </OrderCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <OrderCard>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PaymentIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Order Summary</Typography>
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1">Subtotal:</Typography>
                    <Typography variant="body1">LKR {subtotal.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body1">Delivery Charge:</Typography>
                    <Typography variant="body1">LKR {deliveryChargeValue.toFixed(2)}</Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6">Total:</Typography>
                    <Typography variant="h6" color="primary">
                      LKR {total.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
                <ActionButton
                  variant="contained"
                  onClick={handleProceedToPayment}
                  fullWidth
                  disabled={loading}
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  }}
                >
                  Proceed to Payment
                </ActionButton>
              </CardContent>
            </OrderCard>
          </Grid>
        </Grid>
      )}
    </OrderContainer>
  );
};

export default OrderSummary;