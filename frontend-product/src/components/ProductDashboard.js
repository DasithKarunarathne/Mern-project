import React, { useState, useEffect } from 'react';
import { getProducts } from '../services/api';
import { Box, Typography, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ProductDashboard = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProducts();
        setProducts(response.data);
        setFilteredProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  const categories = ['All', ...new Set(products.map((product) => product.category))];

  useEffect(() => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((product) => product.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, products]);

  const handleViewDetails = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" sx={{ marginBottom: 3, textAlign: 'center' }}>
        Handicraft Products
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, marginBottom: 3 }}>
        <TextField
          label="Search Products"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ width: 300 }}
        />
        <FormControl sx={{ width: 200 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={selectedCategory}
            onChange={handleCategoryChange}
            label="Category"
          >
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {filteredProducts.length === 0 ? (
        <Typography variant="h6" sx={{ textAlign: 'center' }}>
          No products available.
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center' }}>
          {filteredProducts.map((product) => (
            <Box
              key={product._id}
              sx={{
                width: 200,
                height: 200,
                cursor: 'pointer',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: 3,
                '&:hover': {
                  transform: 'scale(1.05)',
                  transition: 'transform 0.3s ease-in-out',
                },
              }}
              onClick={() => handleViewDetails(product._id)}
            >
              <img
                src={product.image ? `http://localhost:8080${product.image}` : 'https://via.placeholder.com/200'}
                alt={product.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ProductDashboard;