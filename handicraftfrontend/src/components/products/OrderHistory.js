import React, { useState, useEffect } from 'react';
import { getUserOrders } from '../../components/products/services/api.js';
import { Box, Typography, Button, CircularProgress, Tooltip } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const userId = 'mock-user-id'; // Replace with actual user ID

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

  return (
    <Box sx={{ padding: 2, maxWidth: 800, margin: '0 auto' }}>
      <ToastContainer />
      <Typography variant="h4" sx={{ marginBottom: 2, textAlign: 'center' }}>
        Order History
      </Typography>
      <Button
        variant="contained"
        onClick={fetchOrders}
        sx={{ marginBottom: 2 }}
        disabled={loading}
      >
        {loading ? 'Refreshing...' : 'Refresh Orders'}
      </Button>
      {error && (
        <Typography color="error" sx={{ marginBottom: 2, textAlign: 'center' }}>
          {error}
        </Typography>
      )}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
          <CircularProgress />
        </Box>
      ) : orders.length === 0 ? (
        <Typography>No orders found.</Typography>
      ) : (
        orders.map((order) => (
          <Box
            key={order._id}
            sx={{ border: '1px solid #ddd', padding: 2, marginBottom: 2, borderRadius: 2 }}
          >
            <Typography variant="h6">Order ID: {order._id}</Typography>
            <Typography>Status: {order.status}</Typography>
            <Typography>Order Date: {new Date(order.createdAt).toLocaleDateString()}</Typography>
            <Typography>Total: LKR {order.total.toFixed(2)}</Typography>
            <Typography variant="h6" sx={{ marginTop: 1 }}>
              Items:
            </Typography>
            {order.items.map((item, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 2, marginTop: 1 }}>
                {item.productId && (
                  <img
                    src={item.productId.image ? `http://localhost:5000${item.productId.image}` : 'https://via.placeholder.com/50'}
                    alt={item.productId.name}
                    style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: '4px' }}
                  />
                )}
                <Box>
                  <Typography>{item.productId ? item.productId.name : 'Product'} (x{item.quantity})</Typography>
                  <Typography>Price: LKR {(item.price * item.quantity).toFixed(2)}</Typography>
                </Box>
              </Box>
            ))}
            {canShowRefundButton(order) ? (
              <Button
                variant="contained"
                color="warning"
                onClick={() => handleRequestRefund(order._id)}
                sx={{ marginTop: 2 }}
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
                    sx={{ marginTop: 2 }}
                  >
                    Request Refund
                  </Button>
                </span>
              </Tooltip>
            )}
          </Box>
        ))
      )}
    </Box>
  );
};

export default OrderHistory;