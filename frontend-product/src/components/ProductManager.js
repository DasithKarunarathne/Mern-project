import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Container,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  CircularProgress,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Chip,
  Divider,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Image as ImageIcon,
  Category as CategoryIcon,
  Inventory as InventoryIcon,
  AttachMoney as MoneyIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const ProductImage = styled('img')({
  width: '100%',
  height: '200px',
  objectFit: 'cover',
  borderRadius: '8px 8px 0 0',
});

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: 'none',
  '&:hover': {
    boxShadow: theme.shadows[2],
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius * 1.5,
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    '&:hover': {
      borderColor: theme.palette.primary.main,
    },
  },
}));

// Add validation functions after the styled components and before the ProductManager component
const validateName = (name) => {
  if (!name) return 'Product name is required';
  if (!/^[A-Za-z\s]+$/.test(name)) return 'Only letters and spaces are allowed';
  if (name.trim().length === 0) return 'Product name cannot be empty';
  if (name.length > 100) return 'Product name must be less than 100 characters';
  return '';
};

const validateDescription = (description) => {
  if (!description) return 'Description is required';
  if (!/^[A-Za-z0-9\s.,!?-]+$/.test(description)) {
    return 'Description can only contain letters, numbers, and basic punctuation';
  }
  if (description.length > 500) return 'Description must be less than 500 characters';
  return '';
};

const validatePrice = (price) => {
  const numPrice = parseFloat(price);
  if (!price) return 'Price is required';
  if (isNaN(numPrice) || numPrice <= 0) return 'Price must be a positive number';
  if (numPrice > 1000000) return 'Price must be less than 1,000,000';
  return '';
};

const validateStock = (stock) => {
  const numStock = parseInt(stock);
  if (!stock) return 'Stock quantity is required';
  if (isNaN(numStock) || numStock < 0) return 'Stock must be a non-negative number';
  if (numStock > 10000) return 'Stock must be less than 10,000';
  return '';
};

const validateCategory = (category) => {
  if (!category) return 'Category is required';
  if (!/^[A-Za-z\s-]+$/.test(category)) {
    return 'Category can only contain letters, spaces, and hyphens';
  }
  if (category.length > 50) return 'Category must be less than 50 characters';
  return '';
};

const validateImage = (file) => {
  if (!file) return '';
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return 'Please upload a valid image (JPEG, PNG, or WEBP)';
  }
  if (file.size > 2 * 1024 * 1024) {
    return 'Image size must be less than 2MB';
  }
  return '';
};

const ProductManager = () => {
  const theme = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formErrors, setFormErrors] = useState({
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    category: '',
  });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    category: '',
    image: null,
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts();
      setProducts(response.data);
    } catch (error) {
      toast.error('Failed to fetch products: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenDialog = (product = null) => {
    setSelectedProduct(product);
    setFormErrors({
      name: '',
      description: '',
      price: '',
      stockQuantity: '',
      category: '',
    });
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        stockQuantity: product.stockQuantity.toString(),
        category: product.category,
        image: null,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        stockQuantity: '',
        category: '',
        image: null,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      stockQuantity: '',
      category: '',
      image: null,
    });
  };

  const handleKeyDown = (e) => {
    if (e.target.name === 'name') {
      const key = e.key;
      const allowedKeys = [
        'Backspace',
        'Delete',
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'ArrowDown',
        'Tab',
        'Enter',
        'Escape',
        ' '
      ];

      if (!allowedKeys.includes(key) && !/^[A-Za-z]$/.test(key)) {
        e.preventDefault();
        setSnackbar({
          open: true,
          message: 'Only letters and spaces are allowed',
          severity: 'warning'
        });
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate the field
    let validationError = '';
    switch (name) {
      case 'name':
        validationError = validateName(value);
        break;
      case 'description':
        validationError = validateDescription(value);
        break;
      case 'price':
        validationError = validatePrice(value);
        break;
      case 'stockQuantity':
        validationError = validateStock(value);
        break;
      case 'category':
        validationError = validateCategory(value);
        break;
      default:
        break;
    }

    // Update form errors
    setFormErrors(prev => ({
      ...prev,
      [name]: validationError
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const error = validateImage(file);
      if (error) {
        showSnackbar(error, 'error');
        e.target.value = '';
        return;
      }
      setFormData(prev => ({ ...prev, image: file }));
    }
  };

  const validateForm = () => {
    const errors = {
      name: validateName(formData.name),
      description: validateDescription(formData.description),
      price: validatePrice(formData.price),
      stockQuantity: validateStock(formData.stockQuantity),
      category: validateCategory(formData.category)
    };

    setFormErrors(errors);
    return !Object.values(errors).some(error => error !== '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showSnackbar('Please correct all errors before submitting', 'error');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('name', formData.name.trim());
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('stockQuantity', formData.stockQuantity);
      data.append('category', formData.category);
      if (formData.image) {
        data.append('image', formData.image);
      }

      if (selectedProduct) {
        await updateProduct(selectedProduct._id, data);
        setSnackbar({
          open: true,
          message: 'Product updated successfully',
          severity: 'success'
        });
      } else {
        await createProduct(data);
        setSnackbar({
          open: true,
          message: 'Product created successfully',
          severity: 'success'
        });
      }
      handleCloseDialog();
      fetchProducts();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to save product',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setLoading(true);
      try {
        await deleteProduct(id);
        toast.success('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        toast.error('Failed to delete product');
      } finally {
        setLoading(false);
      }
    }
  };

  const getStockColor = (quantity) => {
    if (quantity <= 10) return theme.palette.error.main;
    if (quantity <= 30) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <ToastContainer />
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Product Management
        </Typography>
        <Box>
          <ActionButton
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={fetchProducts}
            sx={{ mr: 2 }}
          >
            Refresh
          </ActionButton>
          <ActionButton
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Product
          </ActionButton>
        </Box>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={60} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product._id}>
              <StyledCard>
                <ProductImage
                  src={product.image ? `http://localhost:8080${product.image}` : 'https://via.placeholder.com/300'}
                  alt={product.name}
                />
                <CardContent>
                  <Typography variant="h6" gutterBottom noWrap>
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }} noWrap>
                    {product.description}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Chip
                      label={`LKR ${product.price.toFixed(2)}`}
                      color="primary"
                      size="small"
                      icon={<MoneyIcon />}
                    />
                    <Chip
                      label={`Stock: ${product.stockQuantity}`}
                      size="small"
                      sx={{ backgroundColor: getStockColor(product.stockQuantity), color: 'white' }}
                      icon={<InventoryIcon />}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Tooltip title="Edit">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(product)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(product._id)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Product Form Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedProduct ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  fullWidth
                  label="Product Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter product name (letters and spaces only)"
                  required
                  error={!!formErrors.name}
                  helperText={formErrors.name || 'Only letters and spaces are allowed'}
                  InputProps={{
                    startAdornment: (
                      <DescriptionIcon 
                        sx={{ 
                          mr: 1, 
                          color: formErrors.name ? theme.palette.error.main : 'text.secondary'
                        }} 
                      />
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-error': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.error.main,
                        },
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  fullWidth
                  label="Category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  InputProps={{
                    startAdornment: <CategoryIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  fullWidth
                  label="Price (LKR)"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  InputProps={{
                    startAdornment: <MoneyIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  fullWidth
                  label="Stock Quantity"
                  name="stockQuantity"
                  type="number"
                  value={formData.stockQuantity}
                  onChange={handleInputChange}
                  required
                  InputProps={{
                    startAdornment: <InventoryIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <StyledTextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="image-upload"
                    type="file"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="image-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<ImageIcon />}
                      sx={{ borderRadius: theme.shape.borderRadius * 1.5 }}
                    >
                      {selectedProduct ? 'Change Image' : 'Upload Image'}
                    </Button>
                  </label>
                  {formData.image && (
                    <Typography variant="caption" sx={{ ml: 2 }}>
                      {formData.image.name}
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={handleCloseDialog} variant="outlined">Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || !!formErrors.name}
          >
            {loading ? <CircularProgress size={24} /> : selectedProduct ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProductManager;