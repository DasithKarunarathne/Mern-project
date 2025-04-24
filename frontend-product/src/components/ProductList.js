import React, { useState, useEffect } from 'react';
import { getProducts, deleteProduct } from '../services/api';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  IconButton,
  Card,
  CardContent,
  Alert,
  Snackbar,
  useTheme,
  Breadcrumbs,
  Link,
  Fade,
  Button,
  TablePagination,
  Tooltip,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  AttachMoney as PriceIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
  },
}));

const StyledTableContainer = styled(Box)(({ theme }) => ({
  borderRadius: '12px',
  overflow: 'hidden',
  '& .MuiTableCell-head': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontWeight: 600,
  },
  '& .MuiTableRow-root:hover': {
    backgroundColor: theme.palette.action.hover,
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

const StockChip = styled(Chip)(({ theme, stock }) => ({
  borderRadius: '8px',
  fontWeight: 500,
  backgroundColor: stock > 0 ? theme.palette.success.light : theme.palette.error.light,
  color: stock > 0 ? theme.palette.success.dark : theme.palette.error.dark,
}));

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [refreshKey, setRefreshKey] = useState(0);

  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, [refreshKey]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts();
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to fetch products: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEdit = (product) => {
    navigate(`/products/edit/${product._id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        setLoading(true);
        await deleteProduct(id);
        setRefreshKey(old => old + 1);
      } catch (error) {
        console.error('Error deleting product:', error);
        setError('Failed to delete product: ' + (error.response?.data?.error || error.message));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <Fade in timeout={500}>
      <Box sx={{ padding: theme.spacing(3) }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Breadcrumbs>
            <Link color="inherit" href="/dashboard">
              Dashboard
            </Link>
            <Typography color="primary">Products</Typography>
          </Breadcrumbs>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <ActionButton
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={() => setRefreshKey(old => old + 1)}
              disabled={loading}
            >
              Refresh
            </ActionButton>
            <ActionButton
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/products/add')}
              disabled={loading}
            >
              Add Product
            </ActionButton>
          </Box>
        </Box>

        <StyledCard>
          <CardContent>
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <InventoryIcon color="primary" sx={{ fontSize: 32 }} />
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.primary.main,
                  }}
                >
                  Product Inventory
                </Typography>
              </Box>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress size={40} thickness={4} />
              </Box>
            ) : products.length === 0 ? (
              <Typography sx={{ textAlign: 'center', color: theme.palette.text.secondary }}>
                No products available.
              </Typography>
            ) : (
              <>
                <StyledTableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Image</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="center">Stock</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(rowsPerPage > 0
                        ? products.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        : products
                      ).map((product) => (
                        <TableRow key={product._id} hover>
                          <TableCell>
                            <img
                              src={product.image ? `http://localhost:8080${product.image}` : 'https://via.placeholder.com/50'}
                              alt={product.name}
                              style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: '8px' }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {product.name}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {product.description}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={<CategoryIcon />}
                              label={product.category}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                              <PriceIcon color="action" fontSize="small" />
                              <Typography sx={{ fontWeight: 600 }}>
                                LKR {product.price.toLocaleString()}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <StockChip
                              label={`${product.stockQuantity} in stock`}
                              stock={product.stockQuantity}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                              <Tooltip title="Edit Product">
                                <IconButton
                                  onClick={() => handleEdit(product)}
                                  disabled={loading}
                                  color="primary"
                                  size="small"
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Product">
                                <IconButton
                                  onClick={() => handleDelete(product._id)}
                                  disabled={loading}
                                  color="error"
                                  size="small"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </StyledTableContainer>

                <TablePagination
                  component="div"
                  count={products.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                />
              </>
            )}
          </CardContent>
        </StyledCard>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={handleCloseError}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseError}
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

export default ProductList;