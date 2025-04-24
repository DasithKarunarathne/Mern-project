import React, { useState, useEffect } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../components/products/services/api.js';
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    category: '',
    image: null,
  });
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts();
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to fetch products. Please try again later.');
      toast.error('Failed to fetch products: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a valid image (JPEG, PNG, or WEBP).');
        return;
      }
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error('Image size must be less than 2MB.');
        return;
      }
    }
    setFormData({ ...formData, image: file });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      return "Name is required.";
    }
    if (!formData.description.trim()) {
      return "Description is required.";
    }
    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      return "Price must be a positive number.";
    }
    const stock = parseInt(formData.stockQuantity, 10);
    if (isNaN(stock) || stock < 0) {
      return "Stock Quantity must be a non-negative number.";
    }
    if (!formData.category.trim()) {
      return "Category is required.";
    }
    return null; // No errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('stockQuantity', formData.stockQuantity);
    data.append('category', formData.category);
    if (formData.image) {
      data.append('image', formData.image);
    }

    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id, data);
        toast.success('Product updated successfully!');
      } else {
        await createProduct(data);
        toast.success('Product added successfully!');
      }
      setFormData({ name: '', description: '', price: '', stockQuantity: '', category: '', image: null });
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      setError('Failed to save product: ' + (error.response?.data?.error || error.message));
      toast.error('Failed to save product: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stockQuantity: product.stockQuantity,
      category: product.category,
      image: null,
    });
    setError(null); // Clear error when editing starts
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        setLoading(true);
        await deleteProduct(id);
        toast.success('Product deleted successfully!');
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product: ' + (error.response?.data?.error || error.message));
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Box sx={{ padding: 2 }}>
      <ToastContainer />
      <Typography variant="h4" sx={{ marginBottom: 2, textAlign: 'center' }}>
        Product Manager Dashboard
      </Typography>
      {error && (
        <Typography color="error" sx={{ marginBottom: 2, textAlign: 'center' }}>
          {error}
        </Typography>
      )}
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 500, margin: '0 auto' }}>
        <TextField
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
          disabled={loading}
          error={!formData.name.trim() && error}
          helperText={!formData.name.trim() && error ? "Name is required" : ""}
        />
        <TextField
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          required
          multiline
          rows={3}
          disabled={loading}
          error={!formData.description.trim() && error}
          helperText={!formData.description.trim() && error ? "Description is required" : ""}
        />
        <TextField
          label="Price"
          name="price"
          type="number"
          value={formData.price}
          onChange={handleInputChange}
          required
          disabled={loading}
          error={(isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) && error}
          helperText={(isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) && error ? "Price must be positive" : ""}
        />
        <TextField
          label="Stock Quantity"
          name="stockQuantity"
          type="number"
          value={formData.stockQuantity}
          onChange={handleInputChange}
          required
          disabled={loading}
          error={(isNaN(parseInt(formData.stockQuantity, 10)) || parseInt(formData.stockQuantity, 10) < 0) && error}
          helperText={(isNaN(parseInt(formData.stockQuantity, 10)) || parseInt(formData.stockQuantity, 10) < 0) && error ? "Stock must be non-negative" : ""}
        />
        <TextField
          label="Category"
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          required
          disabled={loading}
          error={!formData.category.trim() && error}
          helperText={!formData.category.trim() && error ? "Category is required" : ""}
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={loading}
        />
        <Button
          type="submit"
          variant="contained"
          sx={{ backgroundColor: '#DAA520', '&:hover': { backgroundColor: '#228B22' } }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : editingProduct ? 'Update Product' : 'Add Product'}
        </Button>
        {editingProduct && (
          <Button
            variant="outlined"
            onClick={() => {
              setEditingProduct(null);
              setFormData({ name: '', description: '', price: '', stockQuantity: '', category: '', image: null });
              setError(null); // Clear error on cancel
            }}
            disabled={loading}
          >
            Cancel Edit
          </Button>
        )}
      </Box>
      <Typography variant="h5" sx={{ marginTop: 4, marginBottom: 2 }}>
        Product List
      </Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      ) : products.length === 0 ? (
        <Typography>No products available.</Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product._id}>
                <TableCell>
                  <img
                    src={product.image ? `http://localhost:5000${product.image}` : 'https://via.placeholder.com/50'}
                    alt={product.name}
                    style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: '4px' }}
                  />
                </TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>LKR {product.price.toFixed(2)}</TableCell>
                <TableCell>{product.stockQuantity}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(product)} disabled={loading}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(product._id)} disabled={loading}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
};

export default ProductManager;