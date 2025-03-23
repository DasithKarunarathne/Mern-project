import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getDeliveryCharge, saveDeliveryDetails } from '../services/api'; // Removed sendOtpEmail
import { Box, Typography, TextField, Button, CircularProgress } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DeliveryDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { cart, singleProduct } = state || {};
  const userId = 'mock-user-id'; // Replace with actual user ID

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
      setProvince(response.data.province || 'Unknown');
      setDeliveryCharge(response.data.deliveryCharge || 700);
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
    }
  }, [deliveryData.postalCode]);

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error('Please fill all required fields correctly.');
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

        navigate('/order-summary', {
          state: { deliveryData: savedDelivery, cart: validCart, deliveryCharge },
        });
      } else if (singleProduct) {
        const price = Number(singleProduct.price);
        if (!singleProduct.productId || !singleProduct.quantity || isNaN(price) || price <= 0) {
          throw new Error('Invalid product details: productId, quantity, or price is missing or invalid.');
        }
        navigate('/order-summary', {
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
      <Box sx={{ padding: 2, textAlign: 'center' }}>
        <Typography variant="h6">No items to deliver. Please add items to your cart or buy a product.</Typography>
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

  return (
    <Box sx={{ padding: 2, maxWidth: 800, margin: '0 auto' }}>
      <ToastContainer />
      <Typography variant="h4" sx={{ marginBottom: 2, textAlign: 'center' }}>
        Delivery Details
      </Typography>
      {errorMessage && (
        <Typography color="error" sx={{ marginBottom: 2, textAlign: 'center' }}>
          {errorMessage}
        </Typography>
      )}
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
        disabled={loading}
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
        disabled={loading}
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
        disabled={loading}
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
        disabled={loading}
      />
      <TextField
        label="Email (for notifications)"
        name="email"
        value={deliveryData.email}
        onChange={handleChange}
        fullWidth
        required
        error={!!errors.email}
        helperText={errors.email}
        sx={{ marginBottom: 2 }}
        disabled={loading}
      />
      {deliveryData.postalCode && (
        <Box>
          <Typography variant="body1" sx={{ marginTop: 1 }}>
            Province: {province}
          </Typography>
          <Typography variant="body1" sx={{ marginTop: 1 }}>
            Delivery Charge: LKR {deliveryCharge.toFixed(2)}
          </Typography>
        </Box>
      )}
      <Button
        variant="contained"
        onClick={handleSubmit}
        sx={{ backgroundColor: '#DAA520', marginTop: 2, '&:hover': { backgroundColor: '#228B22' } }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Proceed to Order Summary'}
      </Button>
    </Box>
  );
};

export default DeliveryDetails;