import React, { useState, useEffect } from 'react';
import { getPendingRefunds, approveRefund, denyRefund } from '../services/api';
import { Box, Typography, Button, CircularProgress, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RefundManagement = () => {
  const [pendingRefunds, setPendingRefunds] = useState(null); // Initialize as null instead of []
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPendingRefunds();
  }, []);

  const fetchPendingRefunds = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPendingRefunds();
      setPendingRefunds(response.data);
    } catch (error) {
      console.error('Error fetching pending refunds:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      const errorMessage = error.response?.status === 403
        ? 'Access denied. Please ensure you have admin privileges.'
        : 'Failed to fetch pending refunds. Please try again later.';
      setError(errorMessage);
      toast.error(errorMessage);
      setPendingRefunds(null); // Reset pendingRefunds on error
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (orderId) => {
    if (window.confirm('Are you sure you want to approve this refund?')) {
      try {
        setLoading(true);
        await approveRefund(orderId);
        toast.success('Refund approved successfully!');
        fetchPendingRefunds();
      } catch (error) {
        console.error('Error approving refund:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        const errorMessage = error.response?.status === 403
          ? 'Access denied. Please ensure you have admin privileges.'
          : 'Failed to approve refund: ' + (error.response?.data?.error || error.message);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeny = async (orderId) => {
    if (window.confirm('Are you sure you want to deny this refund?')) {
      try {
        setLoading(true);
        await denyRefund(orderId);
        toast.success('Refund denied successfully!');
        fetchPendingRefunds();
      } catch (error) {
        console.error('Error denying refund:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        const errorMessage = error.response?.status === 403
          ? 'Access denied. Please ensure you have admin privileges.'
          : 'Failed to deny refund: ' + (error.response?.data?.error || error.message);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Box sx={{ padding: 2, maxWidth: 1000, margin: '0 auto' }}>
      <ToastContainer />
      <Typography variant="h4" sx={{ marginBottom: 2, textAlign: 'center' }}>
        Refund Management
      </Typography>
      {error && (
        <Typography color="error" sx={{ marginBottom: 2, textAlign: 'center' }}>
          {error}
        </Typography>
      )}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
          <CircularProgress />
        </Box>
      ) : error ? null : !pendingRefunds || pendingRefunds.length === 0 ? (
        <Typography sx={{ textAlign: 'center' }}>
          No pending refund requests.
        </Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer Name</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Refund Reason</TableCell>
              <TableCell>Comments</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pendingRefunds.map((order) => (
              <TableRow key={order._id}>
                <TableCell>{order._id}</TableCell>
                <TableCell>{order.deliveryData?.name || 'N/A'}</TableCell>
                <TableCell>LKR {order.total?.toFixed(2) || '0.00'}</TableCell>
                <TableCell>{order.refundReason || 'N/A'}</TableCell>
                <TableCell>{order.refundComments || 'None'}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleApprove(order._id)}
                    sx={{ marginRight: 1 }}
                    disabled={loading}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleDeny(order._id)}
                    disabled={loading}
                  >
                    Deny
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

export default RefundManagement;