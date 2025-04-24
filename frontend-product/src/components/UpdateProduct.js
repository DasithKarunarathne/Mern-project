import React, { useState, useEffect } from 'react';
import { getProductById, updateProduct } from '../services/api';
import { Box, Typography, TextField, Button, CircularProgress } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';

const UpdateProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    category: '',
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await getProductById(id);
        const product = response.data.product;
        setProductData({
          name: product.name,
          description: product.description,
          price: product.price,
          stockQuantity: product.stockQuantity,
          category: product.category,
        });
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Failed to load product details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    setProductData({ ...productData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('name', productData.name);
      formData.append('description', productData.description);
      formData.append('price', productData.price);
      formData.append('stockQuantity', productData.stockQuantity);
      formData.append('category', productData.category);
      if (image) {
        formData.append('image', image);
      }

      await updateProduct(id, formData);
      alert('Product updated successfully!');
      navigate('/manager');
    } catch (error) {
      console.error('Error updating product:', error);
      setError(error.response?.data?.error || error.message || 'Failed to update product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <Box sx={{ padding: 2, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/manager')}
          sx={{ marginTop: 2 }}
        >
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 2, maxWidth: 600, margin: '0 auto' }}>
      <Typography variant="h4" sx={{ marginBottom: 2, textAlign: 'center' }}>
        Update Product
      </Typography>
      {error && (
        <Typography color="error" sx={{ marginBottom: 2, textAlign: 'center' }}>
          {error}
        </Typography>
      )}
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Name"
          name="name"
          value={productData.name}
          onChange={handleChange}
          required
          fullWidth
          disabled={loading}
        />
        <TextField
          label="Description"
          name="description"
          value={productData.description}
          onChange={handleChange}
          required
          multiline
          rows={3}
          fullWidth
          disabled={loading}
        />
        <TextField
          label="Price (LKR)"
          name="price"
          type="number"
          value={productData.price}
          onChange={handleChange}
          required
          fullWidth
          disabled={loading}
        />
        <TextField
          label="Stock Quantity"
          name="stockQuantity"
          type="number"
          value={productData.stockQuantity}
          onChange={handleChange}
          required
          fullWidth
          disabled={loading}
        />
        <TextField
          label="Category"
          name="category"
          value={productData.category}
          onChange={handleChange}
          required
          fullWidth
          disabled={loading}
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          disabled={loading}
        />
        <Button
          type="submit"
          variant="contained"
          sx={{ backgroundColor: '#DAA520', '&:hover': { backgroundColor: '#228B22' } }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Update Product'}
        </Button>
      </Box>
    </Box>
  );
};

export default UpdateProduct;