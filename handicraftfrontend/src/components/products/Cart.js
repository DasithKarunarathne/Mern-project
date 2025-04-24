import React, { useState, useEffect } from 'react';
import { getCart, removeFromCart, updateCartQuantity } from '../../components/products/services/api.js';
import { Box, Typography, Button, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();
  const userId = 'mock-user-id'; // Replace with actual user ID

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await getCart(userId);
        const items = response.data.cart?.items || [];
        setCartItems(items);
      } catch (error) {
        console.error('Error fetching cart:', error);
        toast.error('Failed to fetch cart: ' + (error.response?.data?.error || error.message));
      }
    };
    fetchCart();
  }, []);

  const handleRemove = async (id) => {
    try {
      await removeFromCart(id, userId);
      setCartItems(cartItems.filter((item) => item._id !== id));
      toast.success('Item removed from cart!');
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleQuantityChange = async (id, quantity) => {
    try {
      if (quantity < 1) {
        toast.error('Quantity must be at least 1.');
        return;
      }
      await updateCartQuantity(id, quantity, userId);
      setCartItems(
        cartItems.map((item) =>
          item._id === id ? { ...item, quantity } : item
        )
      );
      toast.success('Quantity updated!');
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleProceedToDelivery = () => {
    const cartData = cartItems
      .filter(item => item.productId)
      .map((item) => ({
        productId: item.productId._id,
        quantity: item.quantity,
        price: item.price,
      }));
    if (cartData.length === 0) {
      toast.error('No valid items in cart to proceed to delivery.');
      return;
    }
    navigate('/product/delivery', { state: { cart: cartData } });
  };

  const calculateTotal = () => {
    return cartItems
      .filter(item => item.productId)
      .reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <Box sx={{ padding: 2 }}>
      <ToastContainer />
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
                  console.warn('Invalid cart item (missing productId):', item);
                  return null;
                }
                return (
                  <TableRow key={item._id}>
                    <TableCell>{item.productId.name}</TableCell>
                    <TableCell>LKR {item.price?.toFixed(2)}</TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item._id, Number(e.target.value))}
                        inputProps={{ min: 1 }}
                        sx={{ width: 60 }}
                      />
                    </TableCell>
                    <TableCell>LKR {(item.price * item.quantity).toFixed(2)}</TableCell>
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
            Total: LKR {calculateTotal().toFixed(2)}
          </Typography>
          <Button
            variant="contained"
            onClick={handleProceedToDelivery}
            sx={{ marginTop: 2, float: 'right', backgroundColor: '#DAA520', '&:hover': { backgroundColor: '#228B22' } }}
          >
            Checkout
          </Button>
        </>
      )}
    </Box>
  );
};

export default Cart;