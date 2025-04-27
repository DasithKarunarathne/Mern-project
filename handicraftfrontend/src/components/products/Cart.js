import React, { useState, useEffect } from 'react';
import { getCart, removeFromCart, updateCartQuantity } from '../../components/products/services/api.js';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Paper,
  IconButton,
  Card,
  CardContent,
  CardMedia,
  Divider,
  CircularProgress,
  Fade,
  Container,
  useTheme,
  useMediaQuery,
  Tooltip,
  Badge,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as CartIcon,
  ArrowBack as ArrowBackIcon,
  LocalShipping as ShippingIcon,
} from '@mui/icons-material';

const StyledContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const CartCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
  },
}));

const ProductImage = styled(CardMedia)(({ theme }) => ({
  width: 120,
  height: 120,
  borderRadius: theme.spacing(1),
  [theme.breakpoints.down('sm')]: {
    width: 80,
    height: 80,
  },
}));

const QuantityButton = styled(IconButton)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(1),
  padding: theme.spacing(0.5),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  width: 60,
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(1),
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  borderRadius: theme.spacing(1),
  textTransform: 'none',
  fontWeight: 600,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
}));

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const userId = 'mock-user-id'; // Replace with actual user ID

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        const response = await getCart(userId);
        const items = response.data.cart?.items || [];
        setCartItems(items);
      } catch (error) {
        console.error('Error fetching cart:', error);
        toast.error('Failed to fetch cart: ' + (error.response?.data?.error || error.message));
      } finally {
        setLoading(false);
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  return (
    <StyledContainer maxWidth="lg">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton
          onClick={() => navigate(-1)}
          sx={{ mr: 2 }}
          title="Go back"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography
          variant={isMobile ? "h4" : "h3"}
          sx={{
            fontWeight: 700,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Your Shopping Cart
        </Typography>
      </Box>

      {cartItems.length === 0 || cartItems.every(item => !item.productId) ? (
        <Fade in>
          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <CartIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Your cart is empty
            </Typography>
            <ActionButton
              variant="contained"
              onClick={() => navigate('/products')}
              sx={{ mt: 2 }}
            >
              Continue Shopping
            </ActionButton>
          </Box>
        </Fade>
      ) : (
        <Fade in>
          <Box>
            {cartItems.map((item) => {
              if (!item.productId) return null;
              
              return (
                <CartCard key={item._id}>
                  <CardContent>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <ProductImage
                        image={item.productId.image || 'https://via.placeholder.com/120x120?text=Product'}
                        title={item.productId.name}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" noWrap>
                          {item.productId.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.productId.category}
                        </Typography>
                        <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                          LKR {item.price?.toFixed(2)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <QuantityButton
                          onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <RemoveIcon />
                        </QuantityButton>
                        <StyledTextField
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item._id, Number(e.target.value))}
                          inputProps={{ min: 1 }}
                        />
                        <QuantityButton
                          onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                        >
                          <AddIcon />
                        </QuantityButton>
                        <Tooltip title="Remove item">
                          <IconButton
                            onClick={() => handleRemove(item._id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </CardContent>
                </CartCard>
              );
            })}

            <Paper
              elevation={3}
              sx={{
                p: 3,
                mt: 4,
                borderRadius: theme.spacing(2),
                background: `linear-gradient(45deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Order Summary
                </Typography>
                <Typography variant="h5" color="primary" sx={{ fontWeight: 700 }}>
                  LKR {calculateTotal().toFixed(2)}
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <ActionButton
                  variant="outlined"
                  onClick={() => navigate('/')}
                  startIcon={<ArrowBackIcon />}
                >
                  Continue Shopping
                </ActionButton>
                <ActionButton
                  variant="contained"
                  onClick={handleProceedToDelivery}
                  startIcon={<ShippingIcon />}
                  sx={{
                    backgroundColor: theme.palette.success.main,
                    '&:hover': {
                      backgroundColor: theme.palette.success.dark,
                    },
                  }}
                >
                  Proceed to Checkout
                </ActionButton>
              </Box>
            </Paper>
          </Box>
        </Fade>
      )}
    </StyledContainer>
  );
};

export default Cart;