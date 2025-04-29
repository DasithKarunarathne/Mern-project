import React, { useState, useEffect } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../components/products/services/api.js';
import { useNavigate } from 'react-router-dom';
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
  Container,
  Grid,
  Card,
  CardContent,
  Paper,
} from '@mui/material';
import { Edit, Delete, PictureAsPdf, SwapHoriz } from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { HERITAGE_HANDS_LOGO } from '../hr/logo';

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

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
  const navigate = useNavigate();

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

  const generateStockReport = () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Add header
    pdf.setFontSize(24);
    pdf.setTextColor(139, 69, 19);
    pdf.text('Product Stock Level Report', pageWidth / 2, 25, { align: 'center' });
    
    // Add date
    pdf.setFontSize(12);
    pdf.setTextColor(100);
    pdf.text(new Date().toLocaleDateString(), pageWidth / 2, 35, { align: 'center' });

    // Add summary
    const totalProducts = products.length;
    const lowStockProducts = products.filter(p => p.stockQuantity < 10).length;
    const outOfStockProducts = products.filter(p => p.stockQuantity === 0).length;
    const totalStockValue = products.reduce((sum, p) => sum + (p.price * p.stockQuantity), 0);

    const summaryData = [
      ['Total Products', totalProducts],
      ['Low Stock Products', lowStockProducts],
      ['Out of Stock Products', outOfStockProducts],
      ['Total Stock Value', `Rs. ${totalStockValue.toLocaleString()}`]
    ];

    autoTable(pdf, {
      startY: 45,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      headStyles: {
        fillColor: [139, 69, 19],
        textColor: 255,
        fontSize: 12,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 11,
        cellPadding: 5,
        halign: 'center'
      },
      styles: {
        fontSize: 11,
        cellPadding: 5,
        lineColor: [139, 69, 19],
        lineWidth: 0.1
      },
      margin: { left: 20, right: 20 }
    });

    // Create bar chart data
    const chartData = products.map(product => ({
      name: product.name,
      stock: product.stockQuantity
    }));

    // Sort by stock level
    chartData.sort((a, b) => b.stock - a.stock);

    // Draw bar chart
    const chartStartY = pdf.lastAutoTable.finalY + 15;
    const chartHeight = 90;
    const chartWidth = 170;
    const maxBarsPerPage = 8;
    const barWidth = chartWidth / maxBarsPerPage;
    const maxStock = Math.max(...chartData.map(d => d.stock));
    
    // Round up maxStock to nearest hundred for grid lines
    const gridMaxY = Math.ceil(maxStock / 200) * 200;
    const gridLines = 10;
    const gridStep = gridMaxY / gridLines;
    
    // Draw chart title
    pdf.setFontSize(16);
    pdf.setTextColor(139, 69, 19);
    pdf.text('Stock Levels Overview', 20, chartStartY);

    // Draw grid lines and labels
    pdf.setDrawColor(200, 200, 200);
    pdf.setTextColor(100);
    pdf.setFontSize(8);
    for (let i = 0; i <= gridLines; i++) {
        const y = chartStartY + 10 + (chartHeight - (i * chartHeight / gridLines));
        const value = Math.round(i * gridStep);
        
        // Draw grid line
        pdf.setLineDashPattern([0.5, 0.5], 0);
        pdf.line(20, y, 20 + chartWidth, y);
        
        // Draw label
        pdf.text(value.toString(), 15, y, { align: 'right' });
    }

    // Draw bars
    chartData.slice(0, maxBarsPerPage).forEach((item, index) => {
      const x = 20 + (index * barWidth);
      const barHeight = (item.stock / gridMaxY) * chartHeight;
      const y = chartStartY + 10 + (chartHeight - barHeight);
      
      // Create gradient effect with multiple rectangles
      const gradientSteps = 5;
      const baseColor = [139, 69, 19];
      for (let i = 0; i < gradientSteps; i++) {
        const opacity = 1 - (i * 0.15);
        pdf.setFillColor(
          baseColor[0],
          baseColor[1],
          baseColor[2]
        );
        const stepHeight = barHeight / gradientSteps;
        pdf.setGState(new pdf.GState({ opacity: opacity }));
        pdf.rect(x, y + (i * stepHeight), barWidth - 2, stepHeight, 'F');
      }
      
      // Draw product name (rotated)
      pdf.setGState(new pdf.GState({ opacity: 1.0 }));
      pdf.setFontSize(7);
      pdf.setTextColor(100);
      
      // Truncate long product names
      const maxNameLength = 15;
      const displayName = item.name.length > maxNameLength 
        ? item.name.substring(0, maxNameLength) + '...' 
        : item.name;
      
      pdf.text(displayName, x + (barWidth / 2), chartStartY + chartHeight + 25, { angle: 45 });
    });

    // Add product table with pagination
    const tableData = products.map(product => [
      product.name,
      product.stockQuantity,
      `Rs. ${product.price.toLocaleString()}`,
      product.stockQuantity === 0 ? 'Out of Stock' : 
      product.stockQuantity < 10 ? 'Low Stock' : 'In Stock',
      product.stockQuantity === 0 ? 'Urgent Restock Required' : 
      product.stockQuantity < 10 ? 'Consider Restocking' : 'No Action Required'
    ]);

    let finalY = chartStartY + chartHeight + 35;

    autoTable(pdf, {
      startY: finalY,
      head: [['Product Name', 'Stock', 'Price', 'Status', 'Action Required']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [139, 69, 19],
        textColor: 255,
        fontSize: 11,
        fontStyle: 'bold',
        halign: 'center',
        cellPadding: 4
      },
      bodyStyles: {
        fontSize: 10,
        cellPadding: 4,
        halign: 'center'
      },
      styles: {
        lineColor: [139, 69, 19],
        lineWidth: 0.1
      },
      margin: { left: 15, right: 15, top: 15, bottom: 25 },
      columnStyles: {
        0: { cellWidth: 45 },
        1: { cellWidth: 25 },
        2: { cellWidth: 35 },
        3: { cellWidth: 30 },
        4: { cellWidth: 40 }
      },
      didDrawPage: function(data) {
        // Add footer on each page
        pdf.setFontSize(10);
        pdf.setTextColor(100);
        pdf.text('Generated by Heritage Hands Product Management System', pageWidth / 2, pageHeight - 10, { align: 'center' });
        pdf.text(`Page ${data.pageNumber}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
      }
    });

    pdf.save(`product-stock-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleRefundManagement = () => {
    navigate('/product/admin/refund-management');
  };

  // Stock level chart data
  const chartData = {
    labels: products.map(p => p.name),
    datasets: [
      {
        label: 'Stock Level',
        data: products.map(p => p.stockQuantity),
        borderColor: '#8B4513',
        backgroundColor: 'rgba(139, 69, 19, 0.1)',
        tension: 0.1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Product Stock Levels'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Quantity'
        }
      }
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Container maxWidth="lg">
        <ToastContainer />
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Typography variant="h4">
            Product Manager Dashboard
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<SwapHoriz />}
              onClick={handleRefundManagement}
              sx={{ 
                backgroundColor: '#8B4513', 
                '&:hover': { 
                  backgroundColor: '#654321' 
                }
              }}
            >
              Manage Refunds
            </Button>
            <Button
              variant="contained"
              startIcon={<PictureAsPdf />}
              onClick={generateStockReport}
              sx={{ 
                backgroundColor: '#8B4513', 
                '&:hover': { 
                  backgroundColor: '#654321' 
                }
              }}
            >
              Generate Stock Report
            </Button>
          </Box>
        </Box>
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
                      src={product.image 
                        ? `http://localhost:5000${product.image}` 
                        : 'https://placehold.co/50x50/brown/white?text=No+Image'}
                      alt={product.name}
                      style={{ 
                        width: 50, 
                        height: 50, 
                        objectFit: 'cover', 
                        borderRadius: '4px',
                        border: '1px solid #ddd'
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/50x50/brown/white?text=Error';
                      }}
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
      </Container>
    </Box>
  );
};

export default ProductManager;