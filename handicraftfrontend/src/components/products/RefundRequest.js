import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { requestRefund } from '../../components/products/services/api.js';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Paper,
  Stepper,
  Step,
  StepLabel,
  useTheme,
  Alert,
  Fade,
  Divider,
  IconButton,
} from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(1.5),
    transition: 'all 0.3s ease',
    '&:hover': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
      },
    },
    '&.Mui-focused': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderWidth: '2px',
      },
    },
  },
  '& .MuiInputLabel-root': {
    transition: 'all 0.3s ease',
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(1.5, 3),
  textTransform: 'none',
  fontWeight: 600,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
  },
}));

const RefundRequest = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [refundReason, setRefundReason] = useState('');
  const [refundComments, setRefundComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!refundReason.trim()) {
      toast.error('Please provide a reason for the refund request.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await requestRefund(orderId, refundReason, refundComments);
      toast.success('Your refund request has been submitted successfully!');
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
    <Box sx={{ 
      padding: { xs: 2, md: 4 },
      maxWidth: 800,
      margin: '0 auto',
      minHeight: '100vh',
      backgroundColor: theme.palette.background.default
    }}>
      <ToastContainer />
      
      <Box sx={{ mb: 4 }}>
        <IconButton
          onClick={() => navigate('/product/order-history')}
          sx={{ mb: 2 }}
          color="primary"
        >
          <ArrowBackIcon />
        </IconButton>

        <Stepper activeStep={1} alternativeLabel sx={{ mb: 4 }}>
          <Step>
            <StepLabel>Select Order</StepLabel>
          </Step>
          <Step>
            <StepLabel>Request Refund</StepLabel>
          </Step>
          <Step>
            <StepLabel>Confirmation</StepLabel>
          </Step>
        </Stepper>
      </Box>

      <StyledPaper elevation={3}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          mb: 4 
        }}>
          <ReceiptLongIcon 
            color="primary" 
            sx={{ fontSize: 40 }}
          />
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 600,
              color: theme.palette.primary.main
            }}
          >
            Request Refund
          </Typography>
        </Box>

        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 3,
          p: 2,
          backgroundColor: theme.palette.grey[50],
          borderRadius: 2
        }}>
          <Typography variant="subtitle1" color="textSecondary">
            Order ID:
          </Typography>
          <Typography variant="subtitle1" fontWeight="600">
            #{orderId.slice(-8)}
          </Typography>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {error && (
          <Fade in={true}>
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          </Fade>
        )}

        <Box 
          component="form" 
          onSubmit={handleSubmit} 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 3 
          }}
        >
          <StyledTextField
            label="Reason for Refund"
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            required
            multiline
            rows={4}
            disabled={loading}
            placeholder="Please explain why you're requesting a refund..."
            helperText="Required - Please provide a detailed explanation"
            fullWidth
          />

          <StyledTextField
            label="Additional Comments"
            value={refundComments}
            onChange={(e) => setRefundComments(e.target.value)}
            multiline
            rows={3}
            disabled={loading}
            placeholder="Any additional information you'd like to share..."
            helperText="Optional - Add any other relevant details"
            fullWidth
          />

          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            mt: 2,
            flexDirection: { xs: 'column', sm: 'row' }
          }}>
            <ActionButton
              type="submit"
              variant="contained"
              color="warning"
              disabled={loading}
              fullWidth
              sx={{
                height: 48,
                backgroundColor: theme.palette.warning.main,
                '&:hover': {
                  backgroundColor: theme.palette.warning.dark,
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Submit Refund Request'
              )}
            </ActionButton>

            <ActionButton
              variant="outlined"
              onClick={() => navigate('/product/order-history')}
              disabled={loading}
              fullWidth
              sx={{
                height: 48,
                borderColor: theme.palette.grey[300],
                color: theme.palette.text.primary,
                '&:hover': {
                  borderColor: theme.palette.grey[400],
                  backgroundColor: theme.palette.grey[50],
                },
              }}
            >
              Cancel
            </ActionButton>
          </Box>
        </Box>
      </StyledPaper>
    </Box>
  );
};

export default RefundRequest;