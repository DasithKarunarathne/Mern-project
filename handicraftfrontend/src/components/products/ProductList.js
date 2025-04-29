import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, addToCart } from '../../components/products/services/api.js';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Grid,
  Rating,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InventoryIcon from '@mui/icons-material/Inventory';
import config from '../../config';

const ProductContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  margin: theme.spacing(4, 'auto'),
  maxWidth: 1200,
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
}));

const ProductImage = styled('img')(({ theme }) => ({
  width: '100%',
  height: 'auto',
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.02)',
  },
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

const ProductList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await getProductById(id);
        setProduct(response.data.product);
      } catch (error) {
        console.error('Error fetching product:', error);
        setError(error.response?.data?.error || error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) {
      alert('Product data is not available. Please try again.');
      return;
    }

    try {
      setLoading(true);
      const cartItem = {
        productId: id,
        quantity: 1,
        price: Number(product.price),
        userId: 'mock-user-id',
      };
      await addToCart(cartItem);
      alert('Product added to cart!');
      navigate('/product/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = () => {
    if (!product) {
      alert('Product data is not available. Please try again.');
      return;
    }
    navigate('/product/delivery', {
      state: {
        singleProduct: {
          productId: id,
          quantity: 1,
          price: Number(product.price),
        },
      },
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ padding: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          {error}
        </Typography>
        <ActionButton
          variant="contained"
          onClick={() => navigate('/')}
          sx={{ marginTop: 2 }}
        >
          Back to Products
        </ActionButton>
      </Box>
    );
  }

  if (!product) {
    return (
      <Box sx={{ padding: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Product not found
        </Typography>
        <ActionButton
          variant="contained"
          onClick={() => navigate('/product')}
          sx={{ marginTop: 2 }}
        >
          Back to Products
        </ActionButton>
      </Box>
    );
  }

  return (
    <ProductContainer>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <ProductImage
            src={product.image ? `http://localhost:5000${product.image}` : config.DEFAULT_PRODUCT_IMAGE}
            alt={product.name}
            onError={(e) => {
              e.target.onerror = null; // Prevent infinite loop
              e.target.src = config.DEFAULT_PRODUCT_IMAGE;
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Typography
              variant={isMobile ? 'h4' : 'h3'}
              sx={{
                fontWeight: 700,
                marginBottom: 2,
                color: theme.palette.primary.main,
              }}
            >
              {product.name}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Chip
                icon={<InventoryIcon />}
                label={`Stock: ${product.stockQuantity}`}
                color={product.stockQuantity > 0 ? 'success' : 'error'}
                variant="outlined"
              />
              <Chip
                icon={<LocalShippingIcon />}
                label="Free Shipping"
                color="info"
                variant="outlined"
              />
            </Box>

            <Typography
              variant="h4"
              sx={{
                color: theme.palette.secondary.main,
                fontWeight: 600,
                mb: 2,
              }}
            >
              LKR {product.price.toFixed(2)}
            </Typography>

            <Rating
              value={4.5}
              precision={0.5}
              readOnly
              sx={{ mb: 2 }}
            />

            <Typography
              variant="body1"
              sx={{
                mb: 3,
                lineHeight: 1.8,
                color: theme.palette.text.secondary,
              }}
            >
              {product.description}
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mt: 'auto' }}>
              <ActionButton
                variant="contained"
                color="primary"
                onClick={handleBuyNow}
                disabled={loading}
                startIcon={<LocalShippingIcon />}
                sx={{
                  flex: 1,
                  backgroundColor: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                }}
              >
                Buy Now
              </ActionButton>
              <ActionButton
                variant="contained"
                color="secondary"
                onClick={handleAddToCart}
                disabled={loading}
                startIcon={<ShoppingCartIcon />}
                sx={{
                  flex: 1,
                  backgroundColor: theme.palette.secondary.main,
                  '&:hover': {
                    backgroundColor: theme.palette.secondary.dark,
                  },
                }}
              >
                Add to Cart
              </ActionButton>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </ProductContainer>
  );
};

export default ProductList;