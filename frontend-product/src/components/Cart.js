// src/components/Cart.js
import React, { useState, useEffect } from 'react';
import { getCart, removeFromCart, updateCartQuantity } from '../services/api';
import { Box, Typography, Button, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await getCart();
        console.log('Cart items:', response.data);
        setCartItems(response.data);
      } catch (error) {
        console.error('Error fetching cart:', error);
      }
    };
    fetchCart();
  }, []);

  const handleRemove = async (id) => {
    try {
      await removeFromCart(id);
      setCartItems(cartItems.filter((item) => item._id !== id));
      alert('Item removed from cart!');
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const handleQuantityChange = async (id, quantity) => {
    try {
      await updateCartQuantity(id, quantity);
      setCartItems(
        cartItems.map((item) =>
          item._id === id ? { ...item, quantity } : item
        )
      );
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Failed to update quantity: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleProceedToDelivery = () => {
    const cartData = cartItems
      .filter(item => item.productId)
      .map((item) => ({
        productId: item.productId._id,
        quantity: item.quantity,
      }));
    if (cartData.length === 0) {
      alert('No valid items in cart to proceed to delivery.');
      return;
    }
    navigate('/delivery', { state: { cart: cartData } });
  };

  const calculateTotal = () => {
    return cartItems
      .filter(item => item.productId)
      .reduce((total, item) => total + item.productId.price * item.quantity, 0);
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" sx={{ marginBottom: 2, textAlign: 'center' }}>
        Your Cart
      </Typography>
      {cartItems.length === 0 || cartItems.every(item => !item.productId) ? (
        <Typography variant="h6" sx={{ textAlign: 'center' }}>
          Your cart is empty.
        </Typography>
      ) : (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cartItems.map((item) => {
                if (!item.productId) {
                  return null;
                }
                return (
                  <TableRow key={item._id}>
                    <TableCell>{item.productId.name}</TableCell>
                    <TableCell>LKR {item.productId.price}</TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item._id, Number(e.target.value))}
                        inputProps={{ min: 1 }}
                        sx={{ width: 60 }}
                      />
                    </TableCell>
                    <TableCell>LKR {item.productId.price * item.quantity}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleRemove(item._id)}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <Typography variant="h6" sx={{ marginTop: 2, textAlign: 'right' }}>
            Total: LKR {calculateTotal()}
          </Typography>
          <Button
            variant="contained"
            onClick={handleProceedToDelivery}
            sx={{ marginTop: 2, float: 'right' }}
          >
            Checkout
          </Button>
        </>
      )}
    </Box>
  );
};

export default Cart;