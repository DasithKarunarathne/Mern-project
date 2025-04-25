import React, { useState, useEffect } from 'react';
import { getPendingRefunds, approveRefund, denyRefund } from '../../components/products/services/api.js';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  useTheme,
  IconButton,
  Tooltip,
  Alert,
  TableContainer,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Card,
  CardContent,
  Fade,
  Divider,
  Avatar,
} from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import MoneyIcon from '@mui/icons-material/Money';
import PersonIcon from '@mui/icons-material/Person';
import CommentIcon from '@mui/icons-material/Comment';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { styled } from '@mui/material/styles';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 600,
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[50],
  color: theme.palette.text.primary,
  fontSize: '0.95rem',
  borderBottom: `2px solid ${theme.palette.divider}`,
  padding: theme.spacing(2),
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[50],
  },
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    cursor: 'pointer',
  },
  transition: 'background-color 0.2s ease',
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  textTransform: 'none',
  fontWeight: 600,
  padding: theme.spacing(1, 3),
  transition: 'all 0.3s ease',
  boxShadow: 'none',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  },
}));

const StatusChip = styled(Chip)(({ theme, color }) => ({
  borderRadius: theme.spacing(2),
  fontWeight: 600,
  padding: theme.spacing(0.5, 0),
  '& .MuiChip-label': {
    padding: theme.spacing(0, 2),
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  background: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.background.paper,
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const RefundManagement = () => {
  const [pendingRefunds, setPendingRefunds] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [actionType, setActionType] = useState(null);
  const theme = useTheme();

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
      setPendingRefunds(null);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (order, type) => {
    setSelectedOrder(order);
    setActionType(type);
    setDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    setDialogOpen(false);
    if (!selectedOrder) return;

    try {
      setLoading(true);
      if (actionType === 'approve') {
        await approveRefund(selectedOrder._id);
        toast.success('Refund approved successfully!');
      } else {
        await denyRefund(selectedOrder._id);
        toast.success('Refund denied successfully!');
      }
      fetchPendingRefunds();
    } catch (error) {
      console.error(`Error ${actionType}ing refund:`, {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      const errorMessage = error.response?.status === 403
        ? 'Access denied. Please ensure you have admin privileges.'
        : `Failed to ${actionType} refund: ` + (error.response?.data?.error || error.message);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setSelectedOrder(null);
      setActionType(null);
    }
  };

  return (
    <Fade in={true}>
      <Box sx={{ 
        padding: { xs: 2, md: 4 },
        maxWidth: 1400,
        margin: '0 auto',
        minHeight: '100vh',
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[100]
      }}>
        <ToastContainer />
        
        <StyledCard sx={{ mb: 4, p: 3 }}>
          <Box sx={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <MoneyIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
              <Box>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700,
                    color: theme.palette.primary.main,
                    mb: 0.5
                  }}
                >
                  Refund Management
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage and process customer refund requests
                </Typography>
              </Box>
            </Box>
            <ActionButton
              variant="contained"
              onClick={fetchPendingRefunds}
              disabled={loading}
              startIcon={<RefreshIcon />}
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: 'white',
              }}
            >
              Refresh List
            </ActionButton>
          </Box>
        </StyledCard>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              boxShadow: 2,
              '& .MuiAlert-icon': {
                fontSize: '2rem'
              }
            }}
            icon={<ErrorOutlineIcon fontSize="inherit" />}
            onClose={() => setError(null)}
          >
            <Typography variant="subtitle1" fontWeight={600}>
              {error}
            </Typography>
          </Alert>
        )}

        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            minHeight: 400
          }}>
            <CircularProgress size={60} thickness={4} />
          </Box>
        ) : !pendingRefunds || pendingRefunds.length === 0 ? (
          <StyledCard sx={{ p: 6, textAlign: 'center' }}>
            <Box sx={{ mb: 3 }}>
              <MoneyIcon sx={{ fontSize: 60, color: theme.palette.grey[400], mb: 2 }} />
              <Typography variant="h5" fontWeight={600} color="textPrimary">
                No Pending Refund Requests
              </Typography>
              <Typography color="textSecondary" sx={{ mt: 1 }}>
                All refund requests have been processed
              </Typography>
            </Box>
            <ActionButton
              variant="outlined"
              onClick={fetchPendingRefunds}
              startIcon={<RefreshIcon />}
            >
              Check Again
            </ActionButton>
          </StyledCard>
        ) : (
          <TableContainer component={StyledCard}>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableCell>Order Details</StyledTableCell>
                  <StyledTableCell>Customer</StyledTableCell>
                  <StyledTableCell>Amount</StyledTableCell>
                  <StyledTableCell>Reason</StyledTableCell>
                  <StyledTableCell>Comments</StyledTableCell>
                  <StyledTableCell align="center">Actions</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingRefunds.map((order) => (
                  <StyledTableRow key={order._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                          #{order._id.slice(-2)}
                        </Avatar>
                        <Box>
                          <StatusChip 
                            label={`Order #${order._id.slice(-8)}`}
                            color="primary"
                            variant="outlined"
                            size="small"
                          />
                          <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon color="action" />
                        <Typography>{order.deliveryData?.name || 'N/A'}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ 
                        fontWeight: 700, 
                        color: theme.palette.success.main,
                        fontSize: '1.1rem'
                      }}>
                        LKR {order.total?.toFixed(2) || '0.00'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={order.refundReason || 'N/A'}>
                        <Typography 
                          sx={{ 
                            maxWidth: 200,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {order.refundReason || 'N/A'}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CommentIcon color="action" />
                        <Tooltip title={order.refundComments || 'None'}>
                          <Typography 
                            sx={{ 
                              maxWidth: 150,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {order.refundComments || 'None'}
                          </Typography>
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 1,
                        justifyContent: 'center'
                      }}>
                        <ActionButton
                          variant="contained"
                          color="success"
                          onClick={() => handleActionClick(order, 'approve')}
                          disabled={loading}
                          startIcon={<CheckCircleIcon />}
                          size="small"
                        >
                          Approve
                        </ActionButton>
                        <ActionButton
                          variant="contained"
                          color="error"
                          onClick={() => handleActionClick(order, 'deny')}
                          disabled={loading}
                          startIcon={<CancelIcon />}
                          size="small"
                        >
                          Deny
                        </ActionButton>
                      </Box>
                    </TableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: 3,
              padding: 2,
              maxWidth: 450
            }
          }}
        >
          <DialogTitle sx={{ 
            pb: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            {actionType === 'approve' ? (
              <CheckCircleIcon color="success" />
            ) : (
              <CancelIcon color="error" />
            )}
            <Typography variant="h6" component="span">
              Confirm {actionType === 'approve' ? 'Approval' : 'Denial'}
            </Typography>
          </DialogTitle>
          <Divider />
          <DialogContent>
            <DialogContentText sx={{ color: 'text.primary' }}>
              Are you sure you want to {actionType} this refund request for order{' '}
              <Typography component="span" fontWeight={600} color="primary">
                #{selectedOrder?._id.slice(-8)}
              </Typography>
              ?
              {actionType === 'deny' && (
                <Typography color="error.main" sx={{ mt: 2 }}>
                  This action cannot be undone and the customer will be notified.
                </Typography>
              )}
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ padding: 2, pt: 0 }}>
            <Button 
              onClick={() => setDialogOpen(false)}
              variant="outlined"
              sx={{ 
                textTransform: 'none',
                borderRadius: 2
              }}
            >
              Cancel
            </Button>
            <ActionButton
              onClick={handleConfirmAction}
              variant="contained"
              color={actionType === 'approve' ? 'success' : 'error'}
            >
              {actionType === 'approve' ? 'Approve Refund' : 'Deny Refund'}
            </ActionButton>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
};

export default RefundManagement;