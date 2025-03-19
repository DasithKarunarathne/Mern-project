import React, { useState, useEffect } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct, addToCart } from '../services/api';
import ProductCard from './ProductCard';
import { TextField, Button, Input, Box } from '@mui/material';
import './ProductManagement.css';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', stockQuantity: '', category: '', image: null
  });
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = ['All', 'Electronics', 'Clothing', 'Appliances', 'Books'];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await getProducts();
    setProducts(res.data);
    setFilteredProducts(res.data);
  };

  const handleChange = (e) => {
    if (e.target.name === 'image') {
      setFormData({ ...formData, image: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    if (editId) {
      await updateProduct(editId, data);
      setEditId(null);
    } else {
      await createProduct(data);
    }
    setFormData({ name: '', description: '', price: '', stockQuantity: '', category: '', image: null });
    fetchProducts();
  };

  const handleEdit = (product) => {
    setFormData({ ...product, image: null });
    setEditId(product._id);
  };

  const handleDelete = async (id) => {
    await deleteProduct(id);
    fetchProducts();
  };

  const handleAddToCart = async (product) => {
    await addToCart({ productId: product._id, quantity: 1 });
    alert(`${product.name} added to cart!`);
  };

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

  return (
    <Box sx={{ padding: 2 }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search products..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ marginBottom: 2, maxWidth: 400 }}
      />
      <Box sx={{ display: 'flex', overflowX: 'auto', gap: 1, marginBottom: 2 }}>
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'contained' : 'outlined'}
            onClick={() => setSelectedCategory(category)}
            sx={{
              backgroundColor: selectedCategory === category ? '#228B22' : '#8B4513',
              color: '#F5F5DC',
              '&:hover': { backgroundColor: '#228B22' }
            }}
          >
            {category}
          </Button>
        ))}
      </Box>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginBottom: 3 }}>
        <TextField name="name" value={formData.name} onChange={handleChange} placeholder="Name" required sx={{ flex: 1, minWidth: 150 }} />
        <TextField name="description" value={formData.description} onChange={handleChange} placeholder="Description" required sx={{ flex: 1, minWidth: 150 }} />
        <TextField name="price" type="number" value={formData.price} onChange={handleChange} placeholder="Price" required sx={{ flex: 1, minWidth: 150 }} />
        <TextField name="stockQuantity" type="number" value={formData.stockQuantity} onChange={handleChange} placeholder="Stock" required sx={{ flex: 1, minWidth: 150 }} />
        <TextField name="category" value={formData.category} onChange={handleChange} placeholder="Category" required sx={{ flex: 1, minWidth: 150 }} />
        <Input name="image" type="file" onChange={handleChange} accept="image/*" sx={{ flex: 1, minWidth: 150 }} />
        <Button type="submit" variant="contained" sx={{ backgroundColor: '#DAA520', color: '#333333', '&:hover': { backgroundColor: '#228B22', color: '#F5F5DC' } }}>
          {editId ? 'Update' : 'Add'} Product
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        {filteredProducts.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddToCart={handleAddToCart}
          />
        ))}
      </Box>
    </Box>
  );
};

export default ProductManagement;