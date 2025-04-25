import React, { useState, useEffect } from 'react';
import { getUserOrders } from '../../components/products/services/api.js';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Tooltip,
  Paper,
  Grid,
  Chip,
  Divider,
  Card,
  CardContent,
  IconButton,
  Collapse,
  useTheme
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
  const statusColors = {
    completed: theme.palette.success.main,
    pending: theme.palette.warning.main,
    processing: theme.palette.info.main,
    cancelled: theme.palette.error.main,
    'pending_refund': theme.palette.warning.dark,
    refunded: theme.palette.success.dark,
    'refund_denied': theme.palette.error.dark,
  };

  return {
    backgroundColor: statusColors[status] || theme.palette.grey[500],
    color: '#fff',
    fontWeight: 600,
  };
});

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const userId = 'mock-user-id';

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUserOrders(userId);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to fetch orders. Please try again later.');
      toast.error('Failed to fetch orders: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (location.state?.refresh) {
      fetchOrders();
    }
  }, [location.state]);

  const getRefundDeadline = (orderDate) => {
    const deadline = new Date(orderDate);
    deadline.setDate(deadline.getDate() + 10);
    return deadline.toLocaleDateString();
  };

  const handleRequestRefund = (orderId) => {
    if (window.confirm('Are you sure you want to request a refund for this order?')) {
      navigate(`/product/refund-request/${orderId}`);
    }
  };

  const canShowRefundButton = (order) => {
    if (!['completed'].includes(order.status)) {
      return false;
    }
    const currentDate = new Date();
    const orderDate = new Date(order.createdAt);
    const currentDateUTC = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate()));
    const orderDateUTC = new Date(Date.UTC(orderDate.getUTCFullYear(), orderDate.getUTCMonth(), orderDate.getUTCDate()));
    const daysDifference = Math.floor((currentDateUTC - orderDateUTC) / (1000 * 60 * 60 * 24));
    return daysDifference <= 10;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon />;
      case 'processing':
        return <LocalShippingIcon />;
      case 'pending':
        return <PendingIcon />;
      default:
        return <ReceiptIcon />;
    }
  };

  return (
    <Box sx={{ 
      padding: { xs: 2, md: 4 }, 
      maxWidth: 1200, 
      margin: '0 auto',
      backgroundColor: theme.palette.background.default,
      minHeight: '100vh'
    }}>
      <ToastContainer />
      <Paper 
        elevation={0}
        sx={{ 
          padding: 3, 
          marginBottom: 4, 
          borderRadius: 2,
          background: 'transparent'
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 4
        }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 600,
              color: theme.palette.primary.main
            }}
          >
        Order History
      </Typography>
      <Button
        variant="contained"
            startIcon={<RefreshIcon />}
        onClick={fetchOrders}
        disabled={loading}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              boxShadow: 2,
            }}
      >
            {loading ? 'Refreshing...' : 'Refresh'}
      </Button>
        </Box>

      {error && (
          <Typography 
            color="error" 
            sx={{ 
              marginBottom: 2, 
              textAlign: 'center',
              padding: 2,
              backgroundColor: 'rgba(255,0,0,0.1)',
              borderRadius: 1
            }}
          >
          {error}
        </Typography>
      )}

      {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
            <CircularProgress size={40} />
        </Box>
      ) : orders.length === 0 ? (
          <Paper 
            sx={{ 
              padding: 4, 
              textAlign: 'center',
              backgroundColor: theme.palette.background.paper,
              borderRadius: 2
            }}
          >
            <Typography variant="h6" color="textSecondary">
              No orders found
            </Typography>
            <Typography color="textSecondary" sx={{ mt: 1 }}>
              Your order history will appear here once you make a purchase
            </Typography>
          </Paper>
        ) : (
          orders.map((order) => (
            <StyledCard key={order._id}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: 2
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getStatusIcon(order.status)}
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Order #{order._id.slice(-8)}
                        </Typography>
                      </Box>
                      <StatusChip
                        label={order.status.replace('_', ' ').toUpperCase()}
                        status={order.status}
                        size="small"
                      />
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography color="textSecondary">
                          Order Date: {new Date(order.createdAt).toLocaleDateString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography color="textSecondary" align="right">
                          Total: <strong>LKR {order.total.toFixed(2)}</strong>
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 2 }}>
                  <Button
                    onClick={() => toggleOrderExpansion(order._id)}
                    endIcon={expandedOrders[order._id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    sx={{ textTransform: 'none' }}
                  >
                    {expandedOrders[order._id] ? 'Hide Details' : 'Show Details'}
                  </Button>
                </Box>

                <Collapse in={expandedOrders[order._id]}>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                      Order Items
                    </Typography>
                    <Grid container spacing={2}>
                      {order.items.map((item, index) => (
                        <Grid item xs={12} key={index}>
                          <Paper 
                            elevation={0} 
                            sx={{ 
                              p: 2, 
                              backgroundColor: theme.palette.background.default,
                              border: `1px solid ${theme.palette.divider}`,
                              borderRadius: 2
                            }}
                          >
                            <Grid container spacing={2} alignItems="center">
                              <Grid item>
                                <img
                                  src={item.productId?.image ? 
                                    `http://localhost:5000${item.productId.image}` : 
                                    'https://via.placeholder.com/80'
                                  }
                                  alt={item.productId?.name || 'Product'}
                                  style={{ 
                                    width: 80, 
                                    height: 80, 
                                    objectFit: 'cover', 
                                    borderRadius: '8px'
                                  }}
                                />
                              </Grid>
                              <Grid item xs>
                                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                                  {item.productId?.name || 'Product'}
                                </Typography>
                                <Typography color="textSecondary">
                                  Quantity: {item.quantity}
                                </Typography>
                                <Typography color="primary" sx={{ fontWeight: 500 }}>
                                  LKR {(item.price * item.quantity).toFixed(2)}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>

            {canShowRefundButton(order) ? (
              <Button
                variant="contained"
                color="warning"
                onClick={() => handleRequestRefund(order._id)}
                        sx={{ 
                          mt: 3,
                          borderRadius: 2,
                          textTransform: 'none'
                        }}
              >
                Request Refund
              </Button>
            ) : (
              <Tooltip
                title={
                  order.status === 'pending_refund'
                    ? 'Refund request is pending approval.'
                    : order.status === 'refunded'
                    ? 'This order has already been refunded.'
                    : order.status === 'refund_denied'
                    ? 'Refund request was denied.'
                    : `Refund period expired on ${getRefundDeadline(order.createdAt)}.`
                }
              >
                <span>
                  <Button
                    variant="contained"
                    color="warning"
                    disabled
                            sx={{ 
                              mt: 3,
                              borderRadius: 2,
                              textTransform: 'none'
                            }}
                  >
                    Request Refund
                  </Button>
                </span>
              </Tooltip>
            )}
          </Box>
                </Collapse>
              </CardContent>
            </StyledCard>
        ))
      )}
      </Paper>
    </Box>
  );
};

export default OrderHistory;