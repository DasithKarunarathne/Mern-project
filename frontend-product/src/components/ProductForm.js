import React, { useState } from 'react';
import { createProduct, updateProduct } from '../services/api';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Alert,
  Snackbar,
  useTheme,
  Breadcrumbs,
  Link,
  Fade,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Upload as UploadIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    transition: 'all 0.3s ease',
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderWidth: '2px',
    },
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: theme.spacing(1.5, 3),
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: 'none',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
}));

const FileInput = styled('input')({
  display: 'none',
});

const StyledUploadButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: theme.spacing(1.5, 3),
  textTransform: 'none',
  fontWeight: 600,
  border: `2px dashed ${theme.palette.primary.main}`,
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    border: `2px dashed ${theme.palette.primary.dark}`,
  },
}));

const ProductForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    category: '',
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState('');

  const theme = useTheme();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, image: file });
    setSelectedFileName(file ? file.name : '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null) {
        data.append(key, formData[key]);
      }
    });

    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id, data);
        setSuccess('Product updated successfully!');
      } else {
        await createProduct(data);
        setSuccess('Product added successfully!');
      }
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      setError('Failed to save product: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stockQuantity: '',
      category: '',
      image: null,
    });
    setSelectedFileName('');
    setEditingProduct(null);
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
    setError(null);
  };

  return (
    <Fade in timeout={500}>
      <Box sx={{ padding: theme.spacing(3) }}>
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link color="inherit" href="/products">
            Products
          </Link>
          <Typography color="primary">
            {editingProduct ? 'Edit Product' : 'Add Product'}
          </Typography>
        </Breadcrumbs>

        <StyledCard>
          <CardContent>
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                {editingProduct ? <EditIcon color="primary" /> : <AddIcon color="primary" />}
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.primary.main,
                  }}
                >
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </Typography>
              </Box>
            </Box>

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                maxWidth: 600,
                mx: 'auto',
              }}
            >
              <StyledTextField
                label="Product Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                fullWidth
              />

              <StyledTextField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                multiline
                rows={3}
                fullWidth
              />

              <StyledTextField
                label="Price (LKR)"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                required
                fullWidth
                inputProps={{ min: 0, step: "0.01" }}
              />

              <StyledTextField
                label="Stock Quantity"
                name="stockQuantity"
                type="number"
                value={formData.stockQuantity}
                onChange={handleInputChange}
                required
                fullWidth
                inputProps={{ min: 0 }}
              />

              <StyledTextField
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                fullWidth
              />

              <Box>
                <input
                  accept="image/*"
                  id="product-image"
                  type="file"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="product-image">
                  <StyledUploadButton
                    component="span"
                    fullWidth
                    startIcon={<UploadIcon />}
                  >
                    {selectedFileName || 'Upload Product Image'}
                  </StyledUploadButton>
                </label>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <ActionButton
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  fullWidth
                  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                >
                  {loading
                    ? (editingProduct ? 'Updating...' : 'Adding...')
                    : (editingProduct ? 'Update Product' : 'Add Product')}
                </ActionButton>

                {editingProduct && (
                  <ActionButton
                    variant="outlined"
                    onClick={resetForm}
                    disabled={loading}
                    fullWidth
                    startIcon={<CancelIcon />}
                  >
                    Cancel Edit
                  </ActionButton>
                )}
              </Box>
            </Box>
          </CardContent>
        </StyledCard>

        <Snackbar
          open={!!success}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity="success"
            sx={{ borderRadius: '12px' }}
          >
            {success}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity="error"
            sx={{ borderRadius: '12px' }}
          >
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </Fade>
  );
};

export default ProductForm; 