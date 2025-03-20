// src/components/ProductManagerForm.js
import React, { useState } from 'react';
import { createProduct } from '../services/api';
import { Box, Typography, TextField, Button, Input } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ProductManagerForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    category: '',
    image: null,
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (e.target.name === 'image') {
      setFormData({ ...formData, image: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.name) tempErrors.name = 'Product Name is required';
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
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('stockQuantity', formData.stockQuantity);
      data.append('category', formData.category);
      if (formData.image) data.append('image', formData.image);

      // Log the form data for debugging
      console.log('Form Data:');
      for (let [key, value] of data.entries()) {
        console.log(`${key}: ${value}`);
      }

      try {
        const response = await createProduct(data);
        console.log('Product added successfully:', response.data);
        alert('Product added successfully!');
        navigate('/manager');
      } catch (error) {
        console.error('Error adding product:', error);
        console.log('Error response:', error.response);
        const errorMessage = error.response?.data?.error || error.message;
        alert(`Failed to add product: ${errorMessage}`);
      }
    } else {
      console.log('Validation failed:', errors);
      alert('Please fill all required fields correctly.');
    }
  };

  return (
    <Box sx={{ padding: 2, maxWidth: 600, margin: '0 auto', border: '1px solid #ccc', borderRadius: 2, backgroundColor: '#fff' }}>
      <Typography variant="h4" sx={{ textAlign: 'center', marginBottom: 2 }}>
        Product Management
      </Typography>
      <Typography variant="h5" sx={{ marginBottom: 2 }}>
        Add Product
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          name="name"
          value={formData.name}
          onChange={handleChange}
          label="Product Name *"
          error={!!errors.name}
          helperText={errors.name}
          required
          fullWidth
        />
        <TextField
          name="category"
          value={formData.category}
          onChange={handleChange}
          label="Category *"
          error={!!errors.category}
          helperText={errors.category}
          required
          fullWidth
        />
        <TextField
          name="price"
          type="number"
          value={formData.price}
          onChange={handleChange}
          label="Price *"
          error={!!errors.price}
          helperText={errors.price}
          required
          fullWidth
          InputLabelProps={{ shrink: true }}
          InputProps={{ startAdornment: <Typography sx={{ marginRight: 1 }}>LKR</Typography> }}
        />
        <TextField
          name="stockQuantity"
          type="number"
          value={formData.stockQuantity}
          onChange={handleChange}
          label="Stock Quantity *"
          error={!!errors.stockQuantity}
          helperText={errors.stockQuantity}
          required
          fullWidth
        />
        <TextField
          name="description"
          value={formData.description}
          onChange={handleChange}
          label="Description *"
          error={!!errors.description}
          helperText={errors.description}
          required
          fullWidth
          multiline
          rows={2}
        />
        <Box>
          <Typography variant="body1" sx={{ marginBottom: 1 }}>
            Product Image (optional)
          </Typography>
          <Input
            name="image"
            type="file"
            onChange={handleChange}
            accept="image/*"
            fullWidth
          />
        </Box>
        <Button
          type="submit"
          variant="contained"
          sx={{ backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#1565c0' }, marginTop: 2 }}
          fullWidth
        >
          Add Product
        </Button>
      </Box>
    </Box>
  );
};

export default ProductManagerForm;