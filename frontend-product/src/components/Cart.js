import React, { useState, useEffect } from 'react';
import { getCart, removeFromCart } from '../services/api';
import { Box, Typography, Button, List, ListItem } from '@mui/material';
import './Cart.css';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    const res = await getCart();
    setCartItems(res.data);
  };

  const handleRemove = async (id) => {
    await removeFromCart(id);
    fetchCart();
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <Box sx={{ padding: 2, maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h4">Your Cart</Typography>
      {cartItems.length === 0 ? (
        <Typography>Your cart is empty</Typography>
      ) : (
        <>
          <List>
            {cartItems.map((item) => (
              <ListItem key={item._id} sx={{ display: 'flex', justifyContent: 'space-between', padding: 1, backgroundColor: 'white', marginBottom: 1, borderRadius: 1 }}>
                <Typography>{item.name} - ${item.price} x {item.quantity}</Typography>
                <Button variant="contained" onClick={() => handleRemove(item._id)} sx={{ backgroundColor: '#8B4513', color: '#F5F5DC', '&:hover': { backgroundColor: '#228B22' } }}>
                  Remove
                </Button>
              </ListItem>
            ))}
          </List>
          <Typography variant="h6">Total: ${total.toFixed(2)}</Typography>
          <Button variant="contained" onClick={() => window.location.href = '/delivery'} sx={{ backgroundColor: '#DAA520', color: '#333333', marginTop: 2, '&:hover': { backgroundColor: '#228B22', color: '#F5F5DC' } }}>
            Proceed to Checkout
          </Button>
        </>
      )}
    </Box>
  );
};

export default Cart;