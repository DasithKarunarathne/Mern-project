// src/components/OrderSummary.js
import React, { useState, useEffect } from 'react';
import { getCart, getProductById } from '../services/api';
import { Box, Typography, Button } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

const OrderSummary = () => {
  const [items, setItems] = useState([]);
  const { state } = useLocation();
  const navigate = useNavigate();

  // Use the deliveryCharge from state, default to 0 if not provided
  const deliveryCharge = state?.deliveryCharge || 0;

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      if (state?.singleProduct) {
        const res = await getProductById(state.singleProduct.productId);
        setItems([{ productId: res.data.product, quantity: state.singleProduct.quantity }]);
      } else {
        const res = await getCart();
        setItems(res.data.filter((item) => item.productId));
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => sum + item.productId.price * item.quantity, 0);

  // Calculate total (subtotal + delivery charge)
  const total = subtotal + deliveryCharge;

  return (
    <Box sx={{ padding: 2, maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h4" sx={{ marginBottom: 2, textAlign: 'center' }}>
        Order Summary
      </Typography>
      <Box sx={{ marginTop: 2 }}>
        {items.length === 0 ? (
          <Typography>No items to display.</Typography>
        ) : (
          items.map((item) => (
            <Box
              key={item.productId._id}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: 1,
                borderBottom: '1px solid #ddd',
              }}
            >
              <Typography>
                {item.productId.name} (x{item.quantity})
              </Typography>
              <Typography>
                LKR {(item.productId.price * item.quantity).toFixed(2)}
              </Typography>
            </Box>
          ))
        )}
        <Box sx={{ marginTop: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Subtotal:</span>
            <span>LKR {subtotal.toFixed(2)}</span>
          </Typography>
          <Typography variant="h6" sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Delivery Charge:</span>
            <span>LKR {deliveryCharge.toFixed(2)}</span>
          </Typography>
          <Typography
            variant="h6"
            sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 1, fontWeight: 'bold' }}
          >
            <span>Total Payable:</span>
            <span>LKR {total.toFixed(2)}</span>
          </Typography>
        </Box>
      </Box>
      <Button
        variant="contained"
        onClick={() =>
          navigate('/payment', { state: { deliveryData: state.deliveryData, total, items } })
        }
        sx={{ backgroundColor: '#DAA520', marginTop: 2, '&:hover': { backgroundColor: '#228B22' } }}
      >
        Continue to Payment
      </Button>
      <Button
        variant="outlined"
        onClick={() => navigate('/delivery', { state: { cart: state?.cart, singleProduct: state?.singleProduct } })}
        sx={{ marginTop: 2, marginLeft: 2 }}
      >
        Back to Delivery Details
      </Button>
    </Box>
  );
};

export default OrderSummary;