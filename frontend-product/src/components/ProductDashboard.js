// src/components/ProductDashboard.js
import React, { useState, useEffect } from 'react';
import { getProducts, addToCart } from '../services/api';
import { Box, Typography, Button, Card, CardMedia, CardContent, CardActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ProductDashboard = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProducts();
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = async (productId) => {
    try {
      await addToCart({ productId, quantity: 1 });
      alert('Product added to cart!');
      navigate('/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleBuyNow = (productId) => {
    navigate('/delivery', { state: { productId, quantity: 1 } });
  };

  const handleViewDetails = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" sx={{ marginBottom: 3, textAlign: 'center' }}>
        Handicraft Products
      </Typography>
      {products.length === 0 ? (
        <Typography variant="h6" sx={{ textAlign: 'center' }}>
          No products available.
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center' }}>
          {products.map((product) => (
            <Card key={product._id} sx={{ width: 300, boxShadow: 3 }}>
              <CardMedia
                component="img"
                height="200"
                image={product.image ? `http://localhost:8080${product.image}` : 'https://via.placeholder.com/300'}
                alt={product.name}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent>
                <Typography variant="h6">{product.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Category: {product.category}
                </Typography>
                <Typography variant="body1" sx={{ marginTop: 1 }}>
                  Price: LKR {product.price}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Stock: {product.stockQuantity}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'space-between', padding: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => handleBuyNow(product._id)}
                  sx={{ backgroundColor: '#DAA520', '&:hover': { backgroundColor: '#228B22' } }}
                >
                  Buy Now
                </Button>
                <Button
                  variant="contained"
                  onClick={() => handleAddToCart(product._id)}
                  sx={{ backgroundColor: '#8B4513', '&:hover': { backgroundColor: '#228B22' } }}
                >
                  Add to Cart
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => handleViewDetails(product._id)}
                  sx={{ borderColor: '#1976d2', color: '#1976d2', '&:hover': { borderColor: '#1565c0', color: '#1565c0' } }}
                >
                  View Details
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ProductDashboard;