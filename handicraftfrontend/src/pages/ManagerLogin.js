import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: '12px 24px',
  fontSize: '1.1rem',
  textTransform: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
  },
}));

const ManagerLogin = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    managerType: '',
  });
  const [error, setError] = useState('');

  // Manager credentials
  const managerCredentials = {
    hr: { username: 'hrmanager', password: 'hr@123' },
    finance: { username: 'financemanager', password: 'finance@123' },
    product: { username: 'productmanager', password: 'product@123' },
    inventory: { username: 'inventorymanager', password: 'inventory@123' },
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const credentials = managerCredentials[formData.managerType];

    if (!credentials) {
      setError('Please select a manager type');
      return;
    }

    if (formData.username === credentials.username && formData.password === credentials.password) {
      // Store manager type in session storage
      sessionStorage.setItem('managerType', formData.managerType);
      
      // Redirect based on manager type
      switch (formData.managerType) {
        case 'hr':
          navigate('/hr');
          break;
        case 'finance':
          navigate('/finance/dashboard');
          break;
        case 'product':
          navigate('/product/manager');
          break;
        case 'inventory':
          navigate('/inventory');
          break;
        default:
          navigate('/manager');
      }
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        background: `linear-gradient(135deg, rgba(139, 69, 19, 0.1), rgba(210, 180, 140, 0.1))`,
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <StyledCard>
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant={isMobile ? 'h4' : 'h3'}
              component="h1"
              align="center"
              gutterBottom
              sx={{
                fontWeight: 700,
                color: theme.palette.primary.main,
                mb: 4,
              }}
            >
              Manager Login
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Manager Type</InputLabel>
                <Select
                  name="managerType"
                  value={formData.managerType}
                  onChange={handleChange}
                  required
                  label="Manager Type"
                >
                  <MenuItem value="hr">HR Manager</MenuItem>
                  <MenuItem value="finance">Finance Manager</MenuItem>
                  <MenuItem value="product">Product Manager</MenuItem>
                  <MenuItem value="inventory">Inventory Manager</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                sx={{ mb: 4 }}
              />

              <StyledButton
                type="submit"
                fullWidth
                variant="contained"
                size="large"
              >
                Login
              </StyledButton>
            </form>
          </CardContent>
        </StyledCard>
      </Container>
    </Box>
  );
};

export default ManagerLogin; 