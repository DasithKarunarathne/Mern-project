import React, { useState, useEffect } from 'react';
import { getProducts, deleteProduct } from '../services/api';
import { Box, Typography, Button, Table, TableBody, TableCell, TableHead, TableRow, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProductManagerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await getProducts();
        console.log('Products:', response.data); // Log to verify image field
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to fetch products: ' + (error.response?.data?.error || error.message));
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      setProducts(products.filter((product) => product._id !== id));
      toast.success('Product deleted successfully!');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEdit = (id) => {
    navigate(`/manager/update/${id}`);
  };

  const handleViewDetails = (id) => {
    navigate(`/product/${id}`);
  };

  return (
    <Box sx={{ padding: 2 }}>
      <ToastContainer />
      <Typography variant="h4" sx={{ marginBottom: 2, textAlign: 'center' }}>
        Product Manager Dashboard
      </Typography>
      <Button
        variant="contained"
        onClick={() => navigate('/manager/add')}
        sx={{ marginBottom: 2 }}
      >
        Add New Product
      </Button>
      {loading ? (
        <Typography variant="h6" sx={{ textAlign: 'center' }}>
          Loading products...
        </Typography>
      ) : products.length === 0 ? (
        <Typography variant="h6" sx={{ textAlign: 'center' }}>
          No products available.
        </Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Stock Quantity</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product._id}>
                <TableCell>
                  {product.image ? (
                    <a href={`http://localhost:8080${product.image}`} target="_blank" rel="noopener noreferrer">
                      <Avatar
                        src={`http://localhost:8080${product.image}`} // Updated to port 8080
                        alt={product.name}
                        variant="square"
                        sx={{ width: 50, height: 50 }}
                      />
                    </a>
                  ) : (
                    <Typography variant="body2">No Image</Typography>
                  )}
                </TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>LKR {product.price}</TableCell>
                <TableCell>{product.stockQuantity}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleEdit(product._id)}
                    sx={{ marginRight: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleDelete(product._id)}
                    sx={{ marginRight: 1 }}
                  >
                    Delete
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleViewDetails(product._id)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
};

export default ProductManagerDashboard;