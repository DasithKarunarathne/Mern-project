// src/components/UpdateProduct.js
import React, { useState, useEffect } from 'react';
import { getProductById, updateProduct } from '../services/api';
import { Box, Typography, TextField, Button, Input } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';

const UpdateProduct = () => {
  const [formData, setFormData] = useState({ name: '', description: '', price: '', stockQuantity: '', category: '', image: null });
  const [errors, setErrors] = useState({});
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await getProductById(id);
        setFormData({ ...res.data.product, image: null });
      } catch (error) {
        console.error('Error fetching product:', error);
        alert('Failed to fetch product: ' + (error.response?.data?.error || error.message));
      }
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    if (e.target.name === 'image') {
      setFormData({ ...formData, image: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.name) tempErrors.name = 'Name is required';
    if (!formData.description) tempErrors.description = 'Description is required';
    if (!formData.price || isNaN(formData.price) || formData.price <= 0) tempErrors.price = 'Valid price is required';
    if (!formData.stockQuantity || isNaN(formData.stockQuantity) || formData.stockQuantity < 0) tempErrors.stockQuantity = 'Valid stock quantity is required';
    if (!formData.category) tempErrors.category = 'Category is required';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      const data = new FormData();
      Object.keys(formData).forEach((key) => data.append(key, formData[key]));
      try {
        await updateProduct(id, data);
        alert('Product updated successfully!');
        navigate('/manager');
      } catch (error) {
        console.error('Error updating product:', error);
        alert('Failed to update product: ' + (error.response?.data?.error || error.message));
      }
    } else {
      alert('Please fill all required fields correctly.');
    }
  };

  return (
    <Box sx={{ padding: 2, maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h4">Update Handicraft Product</Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <TextField name="name" value={formData.name} onChange={handleChange} placeholder="Name" error={!!errors.name} helperText={errors.name} required sx={{ flex: 1, minWidth: 150 }} />
        <TextField name="description" value={formData.description} onChange={handleChange} placeholder="Description" error={!!errors.description} helperText={errors.description} required sx={{ flex: 1, minWidth: 150 }} />
        <TextField
          name="price"
          type="number"
          value={formData.price}
          onChange={handleChange}
          placeholder="Price"
          error={!!errors.price}
          helperText={errors.price}
          required
          sx={{ flex: 1, minWidth: 150 }}
          InputLabelProps={{ shrink: true }}
          InputProps={{ startAdornment: <Typography sx={{ marginRight: 1 }}>LKR</Typography> }}
        />
        <TextField name="stockQuantity" type="number" value={formData.stockQuantity} onChange={handleChange} placeholder="Stock" error={!!errors.stockQuantity} helperText={errors.stockQuantity} required sx={{ flex: 1, minWidth: 150 }} />
        <TextField name="category" value={formData.category} onChange={handleChange} placeholder="Category" error={!!errors.category} helperText={errors.category} required sx={{ flex: 1, minWidth: 150 }} />
        <Input name="image" type="file" onChange={handleChange} accept="image/*" sx={{ flex: 1, minWidth: 150 }} />
        <Button type="submit" variant="contained" sx={{ backgroundColor: '#DAA520', '&:hover': { backgroundColor: '#228B22' } }}>
          Update Product
        </Button>
      </Box>
    </Box>
  );
};

export default UpdateProduct;