import React, { useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  useTheme,
  useMediaQuery,
  Paper,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  People as HRIcon,
  AttachMoney as FinanceIcon,
  Inventory as InventoryIcon,
  Category as ProductIcon,
} from '@mui/icons-material';

const DashboardContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const ManagerCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '16px',
  transition: 'all 0.3s ease',
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  width: '60px',
  height: '60px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  background: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
}));

const ManagerDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const managerType = sessionStorage.getItem('managerType');

  useEffect(() => {
    if (!managerType) {
      navigate('/manager/login');
    }
  }, [managerType, navigate]);

  const managerSections = {
    hr: {
      title: 'HR Management',
      description: 'Manage employees, overtime, and HR related tasks',
      icon: <HRIcon sx={{ fontSize: 32 }} />,
      path: '/hr',
      color: '#5D4037',
    },
    finance: {
      title: 'Finance Management',
      description: 'Handle financial transactions and reports',
      icon: <FinanceIcon sx={{ fontSize: 32 }} />,
      path: '/finance/dashboard',
      color: '#5D4037',
    },
    product: {
      title: 'Product Management',
      description: 'Manage products, categories, and pricing',
      icon: <ProductIcon sx={{ fontSize: 32 }} />,
      path: '/product/manager',
      color: '#5D4037',
    },
    inventory: {
      title: 'Inventory Management',
      description: 'Track and manage product inventory',
      icon: <InventoryIcon sx={{ fontSize: 32 }} />,
      path: '/inventory',
      color: '#5D4037',
    },
  };

  if (!managerType) return null;

  const section = managerSections[managerType];
  if (!section) return null;

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Container maxWidth="lg">
        <Typography
          variant={isMobile ? 'h4' : 'h3'}
          component="h1"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 700,
            color: theme.palette.primary.main,
            mb: 6,
            pt: 4,
          }}
        >
          {section.title} Dashboard
        </Typography>

        <Grid container justifyContent="center">
          <Grid item xs={12} sm={8} md={6}>
            <ManagerCard>
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <IconWrapper sx={{ mx: 'auto', bgcolor: section.color }}>
                  {section.icon}
                </IconWrapper>
                <Typography
                  gutterBottom
                  variant="h5"
                  component="h2"
                  sx={{ fontWeight: 600 }}
                >
                  {section.title}
                </Typography>
                <Typography color="text.secondary" paragraph>
                  {section.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button
                  component={RouterLink}
                  to={section.path}
                  variant="contained"
                  size="large"
                  sx={{
                    borderRadius: '12px',
                    px: 4,
                    backgroundColor: section.color,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  }}
                >
                  Access Dashboard
                </Button>
              </CardActions>
            </ManagerCard>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ManagerDashboard; 