import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getProductById } from '../services/api';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const OrderSummary = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
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
      <Box sx={{ padding: 2, textAlign: 'center' }}>
        <Typography sx={{ marginTop: 4 }}>
          No order data available. Please go back and try again.
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
      navigate('/payment', {
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
    <Box sx={{ padding: 2, maxWidth: 800, margin: '0 auto' }}>
      <ToastContainer />
      <Typography variant="h4" sx={{ marginBottom: 2, textAlign: 'center' }}>
        Order Summary
      </Typography>
      {error && (
        <Typography color="error" sx={{ marginBottom: 2, textAlign: 'center' }}>
          {error}
        </Typography>
      )}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Typography variant="h6">Delivery Details:</Typography>
          <Typography>Name: {deliveryData.name}</Typography>
          <Typography>Address: {deliveryData.address}</Typography>
          <Typography>Phone: {deliveryData.phone}</Typography>
          <Typography>Postal Code: {deliveryData.postalCode}</Typography>
          {deliveryData.email && <Typography>Email: {deliveryData.email}</Typography>}
          <Typography sx={{ marginTop: 2, marginBottom: 2 }}>
            Delivery Charge: LKR {deliveryChargeValue.toFixed(2)}
          </Typography>
          <Typography variant="h6">Items:</Typography>
          {products.map((item, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
              {item.productDetails && (
                <img
                  src={item.productDetails.image ? `http://localhost:8080${item.productDetails.image}` : 'https://via.placeholder.com/100'}
                  alt={item.productDetails.name}
                  style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: '8px' }}
                />
              )}
              <Box>
                <Typography>
                  {item.productDetails ? item.productDetails.name : 'Product'} (x{item.quantity || 1})
                </Typography>
                <Typography>
                  Price: LKR {(item.price * (item.quantity || 1)).toFixed(2)}
                </Typography>
              </Box>
            </Box>
          ))}
          <Typography sx={{ marginTop: 2 }}>
            Subtotal: LKR {subtotal.toFixed(2)}
          </Typography>
          <Typography sx={{ marginBottom: 2 }}>
            Total: LKR {total.toFixed(2)}
          </Typography>
          <Button
            variant="contained"
            onClick={handleProceedToPayment}
            sx={{ backgroundColor: '#DAA520', '&:hover': { backgroundColor: '#228B22' } }}
            disabled={loading}
          >
            Proceed to Payment
          </Button>
        </>
      )}
    </Box>
  );
};

export default OrderSummary;