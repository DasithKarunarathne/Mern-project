import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { requestRefund } from '../../components/products/services/api.js';
import { Box, Typography, TextField, Button, CircularProgress } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RefundRequest = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [refundReason, setRefundReason] = useState('');
  const [refundComments, setRefundComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!refundReason.trim()) {
      toast.error('Refund reason is required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await requestRefund(orderId, refundReason, refundComments);
      toast.success('Refund request submitted successfully!');
      navigate('/product/order-history', { state: { refresh: true } });
    } catch (error) {
      console.error('Error submitting refund request:', error);
      setError(error.response?.data?.error || error.message);
      toast.error('Failed to submit refund request: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ padding: 2, maxWidth: 500, margin: '0 auto' }}>
      <ToastContainer />
      <Typography variant="h4" sx={{ marginBottom: 2, textAlign: 'center' }}>
        Request Refund
      </Typography>
      <Typography variant="body1" sx={{ marginBottom: 2 }}>
        Order ID: {orderId}
      </Typography>
      {error && (
        <Typography color="error" sx={{ marginBottom: 2, textAlign: 'center' }}>
          {error}
        </Typography>
      )}
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Reason for Refund"
          value={refundReason}
          onChange={(e) => setRefundReason(e.target.value)}
          required
          multiline
          rows={3}
          disabled={loading}
        />
        <TextField
          label="Additional Comments (Optional)"
          value={refundComments}
          onChange={(e) => setRefundComments(e.target.value)}
          multiline
          rows={3}
          disabled={loading}
        />
        <Button
          type="submit"
          variant="contained"
          color="warning"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Submit Refund Request'}
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate('/product/order-history')}
          disabled={loading}
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default RefundRequest;