import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, addToCart } from '../services/api';
import { Box, Typography, Button, CircularProgress } from '@mui/material';

const ProductList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
        userId: 'mock-user-id', // Replace with actual user ID
      };
      await addToCart(cartItem);
      alert('Product added to cart!');
      navigate('/cart');
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
    navigate('/delivery', {
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
      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ padding: 2, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
        <Button variant="contained" onClick={() => navigate('/')} sx={{ marginTop: 2 }}>
          Back to Products
        </Button>
      </Box>
    );
  }

  if (!product) {
    return (
      <Box sx={{ padding: 2, textAlign: 'center' }}>
        <Typography>Product not found.</Typography>
        <Button variant="contained" onClick={() => navigate('/')} sx={{ marginTop: 2 }}>
          Back to Products
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 2, maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h4" sx={{ marginBottom: 2, textAlign: 'center' }}>
        {product.name}
      </Typography>
      <Box sx={{ display: 'flex', gap: 3 }}>
        <Box sx={{ flex: 1 }}>
          <img
            src={product.image ? `http://localhost:8080${product.image}` : 'https://via.placeholder.com/300'}
            alt={product.name}
            style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6">Category: {product.category}</Typography>
          <Typography variant="h6">Price: LKR {product.price.toFixed(2)}</Typography>
          <Typography variant="h6">Stock: {product.stockQuantity}</Typography>
          <Typography variant="body1" sx={{ marginTop: 2 }}>
            {product.description}
          </Typography>
          <Box sx={{ marginTop: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleBuyNow}
              sx={{ marginRight: 2 }}
              disabled={loading}
            >
              Buy Now
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleAddToCart}
              disabled={loading}
            >
              Add to Cart
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ProductList;