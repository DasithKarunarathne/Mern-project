import React, { useState, useEffect } from 'react';
import { getFinancialOverview } from '../../components/products/services/api.js';
import { Box, Typography, CircularProgress } from '@mui/material';

const FinancialOverview = () => {
  const [financialData, setFinancialData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setLoading(true);
        const response = await getFinancialOverview();
        setFinancialData(response.data);
      } catch (error) {
        console.error('Error fetching financial overview:', error);
        setError('Failed to load financial overview. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchFinancialData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ padding: 2, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!financialData) {
    return (
      <Box sx={{ padding: 2, textAlign: 'center' }}>
        <Typography>No financial data available.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 2, maxWidth: 600, margin: '0 auto' }}>
      <Typography variant="h4" sx={{ marginBottom: 2, textAlign: 'center' }}>
        Financial Overview
      </Typography>
      <Typography variant="h6">
        Total Income: LKR {financialData.totalIncome.toFixed(2)}
      </Typography>
      <Typography variant="h6">
        Total Refunds: LKR {financialData.totalRefunds.toFixed(2)}
      </Typography>
      <Typography variant="h6">
        Pending Refunds: LKR {financialData.pendingRefunds.toFixed(2)}
      </Typography>
      <Typography variant="h6">
        Net Income: LKR {financialData.netIncome.toFixed(2)}
      </Typography>
      <Typography variant="h6">
        Completed Orders: {financialData.completedOrdersCount}
      </Typography>
      <Typography variant="h6">
        Refunded Orders: {financialData.refundedOrdersCount}
      </Typography>
      <Typography variant="h6">
        Pending Refund Orders: {financialData.pendingRefundOrdersCount}
      </Typography>
    </Box>
  );
};

export default FinancialOverview;