// src/components/ProductList.js (unchanged, but verified)
import React, { useState, useEffect } from 'react';
import { getProductById, addToCart } from '../services/api';
import { Box, Typography, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import './ProductList.css';

const ProductList = () => {
  const [product, setProduct] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await getProductById(id);
      setProduct(res.data.product);
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  };

  const handleAddToCart = async () => {
    try {
      await addToCart({ productId: id, quantity: 1 });
      alert('Product added to cart!');
      navigate('/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart');
    }
  };

  const handleBuyNow = () => {
    navigate('/delivery', { state: { productId: id, quantity: 1 } });
  };

  if (!product) return <Typography>Loading product details...</Typography>;

  return (
    <Box sx={{ padding: 2, maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h4">{product.name}</Typography>
      <Box sx={{ display: 'flex', gap: 4, marginTop: 2 }}>
        <Box>
          <img
            src={product.image ? `http://localhost:8080${product.image}` : 'https://via.placeholder.com/300'}
            alt={product.name}
            style={{ width: '300px', height: '300px', objectFit: 'cover', borderRadius: '8px' }}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6">Price: LKR {product.price}</Typography>
          <Typography variant="body1" sx={{ marginTop: 1 }}>
            <strong>Description:</strong> {product.description}
          </Typography>
          <Typography variant="body1" sx={{ marginTop: 1 }}>
            <strong>Category:</strong> {product.category}
          </Typography>
          <Typography variant="body1" sx={{ marginTop: 1 }}>
            <strong>Stock Available:</strong> {product.stockQuantity}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, marginTop: 3 }}>
            <Button
              variant="contained"
              onClick={handleBuyNow}
              sx={{ backgroundColor: '#DAA520', '&:hover': { backgroundColor: '#228B22' } }}
            >
              Buy Now
            </Button>
            <Button
              variant="contained"
              onClick={handleAddToCart}
              sx={{ backgroundColor: '#8B4513', '&:hover': { backgroundColor: '#228B22' } }}
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