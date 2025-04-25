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
  Paper,
  IconButton,
  Tooltip,
  Alert,
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
import ManagerHeader from '../../components/common/ManagerHeader';

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  background: '#ffffff',
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: 'rgba(222, 184, 135, 0.05)',
  },
  '&:hover': {
    backgroundColor: 'rgba(222, 184, 135, 0.1)',
  },
  transition: 'background-color 0.3s ease',
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  textTransform: 'none',
  fontWeight: 600,
  padding: theme.spacing(1.5, 3),
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
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
    
    // Header with brown color
    doc.setFillColor(46, 19, 8); // #2E1308 Darkest Brown
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Title and subtitle in beige
    doc.setFontSize(24);
    doc.setTextColor(200, 173, 127); // #C8AD7F Beige
    doc.text('HERITAGE HANDS', pageWidth/2, 15, { align: 'center' });
    
    doc.setFontSize(16);
    doc.text('Products Stock Levels Report', pageWidth/2, 25, { align: 'center' });
    
    // Add generation date
    doc.setFontSize(12);
    doc.text(`Generated on: ${currentDate}`, pageWidth/2, 35, { align: 'center' });

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
    doc.addImage(chartImage, 'PNG', 10, 45, 190, 90);

    // Product table with updated colors
    autoTable(doc, {
      startY: 145,
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
      theme: 'plain', // Changed from 'grid' to remove default blue borders
      tableLineColor: [151, 85, 59], // Medium Brown
      tableLineWidth: 0.1,
      didParseCell: function(data) {
        // Ensure all cells have white background by default
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
    <Box>
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
          mb: 3
        }}>
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#2E1308' }}>
            Product Management Dashboard
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <ActionButton
              variant="contained"
              startIcon={<FileDownloadIcon />}
              onClick={generatePDF}
              sx={{
                backgroundColor: '#97553B',
                '&:hover': { backgroundColor: '#5E3219' }
              }}
            >
              Generate Report
            </ActionButton>
            <ActionButton
              variant="contained"
              color="primary"
              startIcon={<RefundIcon />}
              onClick={() => navigate('/product/admin/refund-management')}
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
              borderRadius: 2
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
              gap: 2, 
              maxWidth: 800, 
              margin: '0 auto',
              p: 3 
            }}
          >
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              required
              disabled={loading}
              error={!!formErrors.name}
              helperText={formErrors.name || 'Only letters and spaces are allowed'}
              inputProps={{
                maxLength: 100
              }}
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              margin="normal"
              multiline
              rows={3}
              required
              disabled={loading}
              error={!!formErrors.description}
              helperText={formErrors.description}
              inputProps={{
                maxLength: 500
              }}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
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
                inputProps={{
                  min: 0,
                  step: 0.01,
                  max: 1000000
                }}
              />
              <TextField
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
                inputProps={{
                  min: 0,
                  max: 10000
                }}
              />
            </Box>
            <TextField
              fullWidth
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              disabled={loading}
              error={!!formErrors.category}
              helperText={formErrors.category}
              inputProps={{
                maxLength: 50
              }}
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
                    mr: 2,
                    borderColor: '#97553B',
                    color: '#97553B',
                    '&:hover': {
                      borderColor: '#5E3219',
                      backgroundColor: 'rgba(151, 85, 59, 0.04)'
                    }
                  }}
                >
                  Upload Image
                </Button>
              </label>
              {formData.image && (
                <Typography variant="body2" component="span" color="textSecondary">
                  {typeof formData.image === 'string' 
                    ? 'Current image: ' + formData.image.split('/').pop()
                    : 'Selected file: ' + formData.image.name
                  }
                </Typography>
              )}
            </Box>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  minWidth: 200,
                  backgroundColor: '#97553B',
                  '&:hover': { backgroundColor: '#5E3219' }
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  formData._id ? 'Update Product' : 'Add Product'
                )}
              </Button>
            </Box>
          </Box>
        </StyledPaper>
      </Box>
    </Box>
  );
};

export default ProductManager;