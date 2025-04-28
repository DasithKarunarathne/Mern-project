import React, { useState, useEffect } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../products/services/api.js';
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
  Paper,
  IconButton,
  Tooltip,
  Alert,
  TableContainer,
  Chip,
  InputAdornment,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { Chart } from 'chart.js/auto';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import RefundIcon from '@mui/icons-material/AssignmentReturn';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ManagerHeader from '../common/ManagerHeader';
import config from '../../config';
import { alpha } from '@mui/material/styles';

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(151, 85, 59, 0.1)',
  background: '#ffffff',
  border: '1px solid rgba(151, 85, 59, 0.1)',
  backdropFilter: 'blur(10px)',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 48px rgba(151, 85, 59, 0.15)',
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 600,
  backgroundColor: alpha(theme.palette.primary.main, 0.02),
  color: theme.palette.text.primary,
  fontSize: '0.95rem',
  padding: theme.spacing(1.5),
  borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  '&.image-cell': {
    width: '200px',
    padding: theme.spacing(1),
  },
  '&.name-cell': {
    width: '250px',
  },
  '&.category-cell': {
    width: '150px',
  },
  '&.price-cell': {
    width: '120px',
  },
  '&.stock-cell': {
    width: '100px',
  },
  '&.actions-cell': {
    width: '120px',
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: alpha('#DEB887', 0.05),
  },
  '&:hover': {
    backgroundColor: alpha('#DEB887', 0.1),
    transform: 'scale(1.002)',
  },
  transition: 'all 0.2s ease',
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  textTransform: 'none',
  fontWeight: 600,
  padding: theme.spacing(1.5, 3),
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
  },
}));

const FormTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: '0 4px 12px rgba(151, 85, 59, 0.08)',
    },
    '&.Mui-focused': {
      boxShadow: '0 4px 12px rgba(151, 85, 59, 0.12)',
    },
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: alpha('#97553B', 0.2),
  },
  '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#97553B',
  },
}));

const ImagePreviewBox = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '180px',
  height: '120px',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.02)',
  },
}));

// Update validation functions
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

const getImageUrl = (imagePath) => {
  if (!imagePath) return config.DEFAULT_PRODUCT_IMAGE;
  try {
    const url = new URL(imagePath);
    return imagePath; // If it's already a full URL, return as is
  } catch {
    // If it's a relative path, prepend the image base URL
    return `${config.IMAGE_BASE_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  }
};

const ProductManager = () => {
  const navigate = useNavigate();
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
  const [formErrors, setFormErrors] = useState({
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    category: ''
  });

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
        toast.warning('Only letters and spaces are allowed');
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
        // Remove any characters that aren't letters or spaces
        const sanitizedValue = value.replace(/[^A-Za-z\s]/g, '');
        if (value !== sanitizedValue) {
          toast.warning('Only letters and spaces are allowed');
        }
        validationError = validateName(sanitizedValue);
        setFormData(prev => ({
          ...prev,
          name: sanitizedValue
        }));
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
      const imageError = validateImage(file);
      if (imageError) {
        toast.error(imageError);
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
      toast.error('Please correct all errors before submitting');
      return;
    }

    setLoading(true);
    const data = new FormData();
    data.append('name', formData.name.trim());
    data.append('description', formData.description.trim());
    data.append('price', parseFloat(formData.price).toFixed(2));
    data.append('stockQuantity', parseInt(formData.stockQuantity));
    data.append('category', formData.category.trim());
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
      setFormData({
        name: '',
        description: '',
        price: '',
        stockQuantity: '',
        category: '',
        image: null
      });
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
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

  const generatePDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Create brown header bar first
    doc.setFillColor(46, 19, 8); // #2E1308 Darkest Brown
    doc.rect(0, 0, pageWidth, 45, 'F');

    // Load and add logo
    const logoImg = new Image();
    logoImg.src = '/assets/logo.jpg';
    
    await new Promise((resolve, reject) => {
      logoImg.onload = () => {
        try {
          // Calculate logo dimensions to maintain aspect ratio
          const logoHeight = 35; // Fixed height for the header
          const logoWidth = (logoImg.width * logoHeight) / logoImg.height;
          
          // Add logo at the left side of the header
          doc.addImage(
            logoImg, 
            'JPEG', 
            10, // Left margin
            5,  // Top margin within header
            logoWidth, 
            logoHeight
          );
          
          // Add titles next to the logo
          doc.setTextColor(200, 173, 127); // #C8AD7F Beige
          
          // Company name
          doc.setFontSize(24);
          doc.text('HERITAGE HANDS', logoWidth + 20, 20);
          
          // Report title
          doc.setFontSize(16);
          doc.text('Products Stock Levels Report', logoWidth + 20, 35);
          
          // Add generation date on the right side
          doc.setFontSize(12);
          doc.text(
            `Generated: ${currentDate}`,
            pageWidth - 10,
            35,
            { align: 'right' }
          );

          resolve();
        } catch (error) {
          reject(error);
        }
      };
      logoImg.onerror = reject;
    });

    // Create bar chart
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    const sortedProducts = [...products]
      .sort((a, b) => b.stockQuantity - a.stockQuantity)
      .slice(0, 8);

    await new Promise((resolve) => {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: sortedProducts.map(p => 
            p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name
          ),
          datasets: [{
            label: 'Stock Level',
            data: sortedProducts.map(p => p.stockQuantity),
            backgroundColor: [
              '#2E1308',  // Darkest Brown
              '#5E3219',  // Dark Brown
              '#97553B',  // Medium Brown
              '#A6755B',  // Brown
              '#BC9773',  // Light Brown
              '#C8AD7F',  // Beige
              '#DEB887',  // Burlywood
              '#D2B48C'   // Tan
            ],
            borderColor: '#2E1308',
            borderWidth: 1,
            borderRadius: 4,
            barThickness: 40
          }]
        },
        options: {
          responsive: false,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Stock Levels Overview',
              color: '#2E1308',
              font: {
                size: 20,
                weight: 'bold'
              },
              padding: 20
            },
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: '#DEB887'  // Burlywood for grid lines
              },
              ticks: {
                color: '#2E1308',
                font: {
                  size: 12,
                  weight: 'bold'
                }
              }
            },
            x: {
              grid: { display: false },
              ticks: {
                color: '#2E1308',
                font: {
                  size: 12,
                  weight: 'bold'
                },
                maxRotation: 45,
                minRotation: 45
              }
            }
          }
        }
      });
      
      setTimeout(resolve, 100);
    });

    // Add chart to PDF
    const chartImage = canvas.toDataURL('image/png', 1.0);
    doc.addImage(chartImage, 'PNG', 10, 55, 190, 90);

    // Product table with updated colors
    autoTable(doc, {
      startY: 155,
      head: [['Product Name', 'Stock', 'Price (LKR)', 'Status', 'Action Required']],
      body: products.map(p => [
        p.name,
        p.stockQuantity,
        p.price.toFixed(2),
        p.stockQuantity <= 10 ? 'Critical' :
        p.stockQuantity <= 30 ? 'Low' :
        p.stockQuantity <= 50 ? 'Moderate' : 'Good',
        p.stockQuantity <= 10 ? 'Immediate Restock' :
        p.stockQuantity <= 30 ? 'Plan Restock' :
        p.stockQuantity <= 50 ? 'Monitor' : '-'
      ]),
      headStyles: {
        fillColor: [46, 19, 8],     // Darkest Brown
        textColor: [200, 173, 127], // Beige
        fontStyle: 'bold',
        fontSize: 12
      },
      bodyStyles: {
        fontSize: 10,
        textColor: [46, 19, 8]      // Darkest Brown
      },
      alternateRowStyles: {
        fillColor: [222, 184, 135, 0.05]  // Very light brown
      },
      styles: {
        cellPadding: 3,
        lineColor: [151, 85, 59],  // Medium Brown
        lineWidth: 0.1,
        fillColor: [255, 255, 255], // White background
        valign: 'middle'
      },
      theme: 'plain',
      tableLineColor: [151, 85, 59], // Medium Brown
      tableLineWidth: 0.1,
      didParseCell: function(data) {
        data.cell.styles.fillColor = [255, 255, 255];
      },
      didDrawCell: function(data) {
        if (data.section === 'body' && data.column.index === 3) {
          if (data.cell.text[0] === 'Critical') {
            doc.setFillColor(139, 0, 0);  // Dark Red
            doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
            doc.setTextColor(255, 255, 255);
            doc.text(data.cell.text[0], data.cell.x + 2, data.cell.y + 5);
          } else if (data.cell.text[0] === 'Low') {
            doc.setFillColor(255, 140, 0);  // Dark Orange
            doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
            doc.setTextColor(255, 255, 255);
            doc.text(data.cell.text[0], data.cell.x + 2, data.cell.y + 5);
          } else if (data.cell.text[0] === 'Moderate') {
            doc.setFillColor(222, 184, 135);  // Burlywood
            doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
            doc.setTextColor(0, 0, 0);
            doc.text(data.cell.text[0], data.cell.x + 2, data.cell.y + 5);
          } else if (data.cell.text[0] === 'Good') {
            doc.setFillColor(34, 139, 34);  // Forest Green
            doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
            doc.setTextColor(255, 255, 255);
            doc.text(data.cell.text[0], data.cell.x + 2, data.cell.y + 5);
          }
        }
      }
    });

    // Add footer with page number
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(46, 19, 8); // Darkest Brown
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    // Save PDF with formatted date
    const dateForFilename = new Date().toISOString().split('T')[0];
    doc.save(`HERITAGE_HANDS_Stock_Report_${dateForFilename}.pdf`);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, rgba(222,184,135,0.1) 0%, rgba(255,255,255,0.1) 100%)',
    }}>
      <ManagerHeader 
        title="Product Management" 
        breadcrumbs={[
          { label: 'Products', path: '/product/manager' },
        ]}
      />
      <Box sx={{ padding: 3 }}>
        <ToastContainer />
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 4,
          background: 'rgba(255,255,255,0.8)',
          padding: 3,
          borderRadius: '16px',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 20px rgba(151, 85, 59, 0.1)',
        }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700, 
              color: '#2E1308',
              background: 'linear-gradient(45deg, #2E1308, #97553B)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Product Management Dashboard
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <ActionButton
              variant="contained"
              startIcon={<FileDownloadIcon />}
              onClick={generatePDF}
              sx={{
                background: 'linear-gradient(45deg, #97553B, #5E3219)',
                '&:hover': { 
                  background: 'linear-gradient(45deg, #5E3219, #2E1308)',
                }
              }}
            >
              Generate Report
            </ActionButton>
            <ActionButton
              variant="contained"
              startIcon={<RefundIcon />}
              onClick={() => navigate('/product/admin/refund-management')}
              sx={{
                background: 'linear-gradient(45deg, #2E1308, #97553B)',
                '&:hover': { 
                  background: 'linear-gradient(45deg, #97553B, #2E1308)',
                }
              }}
            >
              Manage Refunds
            </ActionButton>
          </Box>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(211, 47, 47, 0.1)',
            }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        <StyledPaper elevation={0}>
          <Box 
            component="form" 
            onSubmit={handleSubmit} 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 3, 
              maxWidth: 800, 
              margin: '0 auto',
              p: 4,
            }}
          >
            <FormTextField
              fullWidth
              label="Product Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              required
              disabled={loading}
              error={!!formErrors.name}
              helperText={formErrors.name || 'Only letters and spaces are allowed'}
              InputProps={{
                sx: { fontSize: '1.1rem' }
              }}
              InputLabelProps={{
                sx: { fontSize: '1.1rem' }
              }}
            />
            <FormTextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              multiline
              rows={4}
              required
              disabled={loading}
              error={!!formErrors.description}
              helperText={formErrors.description}
            />
            <Box sx={{ display: 'flex', gap: 3 }}>
              <FormTextField
                fullWidth
                label="Price (LKR)"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                required
                disabled={loading}
                error={!!formErrors.price}
                helperText={formErrors.price}
                InputProps={{
                  startAdornment: <InputAdornment position="start">LKR</InputAdornment>,
                }}
              />
              <FormTextField
                fullWidth
                label="Stock Quantity"
                name="stockQuantity"
                type="number"
                value={formData.stockQuantity}
                onChange={handleInputChange}
                required
                disabled={loading}
                error={!!formErrors.stockQuantity}
                helperText={formErrors.stockQuantity}
              />
            </Box>
            <FormTextField
              fullWidth
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              disabled={loading}
              error={!!formErrors.category}
              helperText={formErrors.category}
            />
            <Box sx={{ mt: 2 }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="product-image-upload"
              />
              <label htmlFor="product-image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  sx={{ 
                    borderRadius: '12px',
                    borderColor: '#97553B',
                    color: '#97553B',
                    padding: '10px 24px',
                    '&:hover': {
                      borderColor: '#5E3219',
                      backgroundColor: 'rgba(151, 85, 59, 0.08)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Upload Image
                </Button>
              </label>
              {formData.image && (
                <Typography 
                  variant="body2" 
                  component="span" 
                  sx={{ 
                    ml: 2,
                    color: '#97553B',
                    fontStyle: 'italic'
                  }}
                >
                  {typeof formData.image === 'string' 
                    ? 'Current image: ' + formData.image.split('/').pop()
                    : 'Selected file: ' + formData.image.name
                  }
                </Typography>
              )}
            </Box>
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <ActionButton
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  minWidth: 250,
                  height: 48,
                  background: 'linear-gradient(45deg, #97553B, #5E3219)',
                  fontSize: '1.1rem',
                  '&:hover': { 
                    background: 'linear-gradient(45deg, #5E3219, #2E1308)',
                  }
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  editingProduct ? 'Update Product' : 'Add Product'
                )}
              </ActionButton>
            </Box>
          </Box>
        </StyledPaper>

        {/* Product List Section */}
        <StyledPaper elevation={0} sx={{ mt: 4 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              mb: 4, 
              color: '#2E1308', 
              fontWeight: 700,
              textAlign: 'center',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '60px',
                height: '3px',
                background: 'linear-gradient(45deg, #97553B, #5E3219)',
                borderRadius: '2px',
              }
            }}
          >
            Product List
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 6 }}>
              <CircularProgress 
                size={50}
                sx={{ 
                  color: '#97553B',
                  '& .MuiCircularProgress-circle': {
                    strokeLinecap: 'round',
                  }
                }} 
              />
            </Box>
          ) : products.length === 0 ? (
            <Box sx={{ 
              textAlign: 'center', 
              py: 6,
              px: 3,
              backgroundColor: alpha('#DEB887', 0.05),
              borderRadius: '12px',
            }}>
              <Typography 
                color="textSecondary"
                sx={{ 
                  fontSize: '1.1rem',
                  fontStyle: 'italic'
                }}
              >
                No products available. Add your first product using the form above.
              </Typography>
            </Box>
          ) : (
            <TableContainer sx={{ borderRadius: '12px', overflow: 'hidden' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledTableCell className="image-cell">Image</StyledTableCell>
                    <StyledTableCell className="name-cell">Name</StyledTableCell>
                    <StyledTableCell className="category-cell">Category</StyledTableCell>
                    <StyledTableCell className="price-cell">Price (LKR)</StyledTableCell>
                    <StyledTableCell className="stock-cell">Stock</StyledTableCell>
                    <StyledTableCell className="actions-cell" align="center">Actions</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((product) => (
                    <StyledTableRow key={product._id}>
                      <TableCell className="image-cell">
                        <ImagePreviewBox>
                          <img
                            src={getImageUrl(product.image)}
                            alt={product.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = config.DEFAULT_PRODUCT_IMAGE;
                            }}
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover',
                            }}
                          />
                        </ImagePreviewBox>
                      </TableCell>
                      <TableCell className="name-cell">
                        <Typography 
                          sx={{ 
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            color: '#2E1308',
                          }}
                        >
                          {product.name}
                        </Typography>
                      </TableCell>
                      <TableCell className="category-cell">
                        <Chip
                          label={product.category}
                          size="small"
                          sx={{ 
                            backgroundColor: alpha('#97553B', 0.1),
                            color: '#97553B',
                            fontWeight: 600,
                            borderRadius: '8px',
                            '& .MuiChip-label': {
                              px: 1.5,
                              fontSize: '0.85rem',
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell className="price-cell">
                        <Typography 
                          sx={{ 
                            fontWeight: 700,
                            color: '#2E1308',
                            fontSize: '0.95rem',
                          }}
                        >
                          {product.price.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell className="stock-cell">
                        <Chip
                          label={product.stockQuantity}
                          size="small"
                          sx={{
                            backgroundColor: product.stockQuantity <= 10 ? alpha('#dc3545', 0.1) :
                                          product.stockQuantity <= 30 ? alpha('#ffc107', 0.1) :
                                          alpha('#28a745', 0.1),
                            color: product.stockQuantity <= 10 ? '#dc3545' :
                                  product.stockQuantity <= 30 ? '#ffc107' :
                                  '#28a745',
                            fontWeight: 700,
                            borderRadius: '8px',
                            '& .MuiChip-label': {
                              px: 1.5,
                              fontSize: '0.85rem',
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell className="actions-cell">
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                          <Tooltip title="Edit Product" arrow>
                            <IconButton 
                              size="small"
                              onClick={() => handleEdit(product)}
                              sx={{ 
                                color: '#97553B',
                                backgroundColor: alpha('#97553B', 0.1),
                                '&:hover': { 
                                  backgroundColor: alpha('#97553B', 0.2),
                                  transform: 'scale(1.1)',
                                },
                                transition: 'all 0.3s ease',
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Product" arrow>
                            <IconButton 
                              size="small"
                              onClick={() => handleDelete(product._id)}
                              sx={{ 
                                color: '#dc3545',
                                backgroundColor: alpha('#dc3545', 0.1),
                                '&:hover': { 
                                  backgroundColor: alpha('#dc3545', 0.2),
                                  transform: 'scale(1.1)',
                                },
                                transition: 'all 0.3s ease',
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </StyledPaper>
      </Box>
    </Box>
  );
};

export default ProductManager;