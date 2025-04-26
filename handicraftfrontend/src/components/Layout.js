import React, { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  AppBar,
  Toolbar,
  Link,
  Divider,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  Typography,
  Button,
  Container,
  Grid,
  IconButton,
  Stack,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Phone,
  Email,
  LocationOn,
  KeyboardArrowUp,
} from "@mui/icons-material";

// Custom styled components
const Footer = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #3E2723 0%, #5D4037 100%)',
  color: '#fff',
  position: 'relative',
  paddingTop: theme.spacing(8),
  paddingBottom: theme.spacing(4),
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #FFD700 0%, #FFA000 50%, #FFD700 100%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 3s infinite linear',
  },
  '@keyframes shimmer': {
    '0%': {
      backgroundPosition: '200% 0',
    },
    '100%': {
      backgroundPosition: '-200% 0',
    },
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at top right, rgba(255,215,0,0.1) 0%, transparent 70%)',
    pointerEvents: 'none',
  }
}));

const FooterSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(2),
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
  '& .section-title': {
    color: '#FFD700',
    fontWeight: 700,
    marginBottom: theme.spacing(3),
    position: 'relative',
    display: 'inline-block',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: -8,
      left: 0,
      width: '100%',
      height: 2,
      background: 'linear-gradient(90deg, #FFD700 0%, transparent 100%)',
      transition: 'width 0.3s ease',
    },
    '&:hover::after': {
      width: '50%',
    }
  },
  '& .footer-link': {
    color: '#fff',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    display: 'block',
    marginBottom: theme.spacing(1.5),
    opacity: 0.8,
    position: 'relative',
    paddingLeft: theme.spacing(2),
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: '50%',
      width: 6,
      height: 6,
      backgroundColor: '#FFD700',
      borderRadius: '50%',
      transform: 'translateY(-50%) scale(0.8)',
      transition: 'all 0.3s ease',
      opacity: 0.5,
    },
    '&:hover': {
      opacity: 1,
      paddingLeft: theme.spacing(3),
      color: '#FFD700',
      '&::before': {
        transform: 'translateY(-50%) scale(1.2)',
        opacity: 1,
      }
    }
  },
  '& .contact-item': {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2.5),
    padding: theme.spacing(1.5),
    borderRadius: theme.spacing(1),
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'rgba(255,255,255,0.1)',
      transform: 'translateX(10px)',
    },
    '& .MuiSvgIcon-root': {
      marginRight: theme.spacing(1.5),
      color: '#FFD700',
      transition: 'transform 0.3s ease',
    },
    '&:hover .MuiSvgIcon-root': {
      transform: 'scale(1.2)',
    }
  }
}));

const SocialButton = styled(IconButton)(({ theme }) => ({
  color: '#fff',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  marginRight: theme.spacing(1),
  padding: theme.spacing(1.5),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: '50%',
    border: '2px solid transparent',
    transition: 'all 0.3s ease',
  },
  '&:hover': {
    backgroundColor: '#FFD700',
    color: '#3E2723',
    transform: 'translateY(-5px) rotate(8deg)',
    boxShadow: '0 5px 15px rgba(255,215,0,0.4)',
    '&::before': {
      border: '2px solid #FFD700',
      transform: 'scale(1.2)',
      opacity: 0,
    }
  }
}));

const LoginButton = styled(Button)(({ theme }) => ({
  marginLeft: theme.spacing(2),
  backgroundColor: "#FFD700", // Gold
  color: "#3E2723", // Deep brown text
  padding: theme.spacing(1.5, 4), // Increased padding for larger button
  fontSize: "1.3rem", // Larger font size
  "&:hover": {
    backgroundColor: "#FFC107", // Lighter gold on hover
  },
}));

const Layout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [managerType, setManagerType] = useState(sessionStorage.getItem('managerType'));

  // State for dropdown menu
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Effect to listen for changes in session storage
  useEffect(() => {
    const handleStorageChange = () => {
      setManagerType(sessionStorage.getItem('managerType'));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('managerType');
    setManagerType(null); // Update local state
    window.location.href = '/';
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle logo load error
  const handleLogoError = (e) => {
    console.error("Failed to load logo at /assets/logo.jpg");
    e.target.style.display = "none";
  };

  // Get manager-specific navigation items
  const getManagerNavItems = () => {
    switch (managerType) {
      case 'hr':
        return [
          { label: 'Employee List', path: '/hr/list' },
          { label: 'Overtime', path: '/hr/overtime' },
          { label: 'Monthly Overtime', path: '/hr/overtime/monthly' },
        ];
      case 'finance':
        return [
          { label: 'Dashboard', path: '/finance/dashboard' },
          { label: 'Reports', path: '/finance/reports' },
          { label: 'Transactions', path: '/finance/transactions' },
        ];
      case 'product':
        return [
          { label: 'Product Manager', path: '/product/manager' },
          { label: 'Refund Management', path: '/product/admin/refund-management' },
        ];
      case 'inventory':
        return [
          { label: 'View Inventory', path: '/inventory/display' },
          { label: 'Add Inventory', path: '/inventory/add' },
          { label: 'Inventory Reports', path: '/inventory/reports' },
        ];
      default:
        return [];
    }
  };

  const getManagerFooterContent = () => {
    switch (managerType) {
      case 'hr':
        return {
          title: 'HR Management',
          quickLinks: [
            { label: 'Employee List', path: '/hr/list' },
            { label: 'Add Employee', path: '/hr/add-employee' },
            { label: 'Overtime Management', path: '/hr/overtime' },
            { label: 'Monthly Reports', path: '/hr/overtime/monthly' },
          ],
          services: [
            { label: 'Employee Records', path: '/hr/list' },
            { label: 'Attendance', path: '/hr/attendance' },
            { label: 'Performance', path: '/hr/performance' },
            { label: 'Training', path: '/hr/training' },
          ]
        };
      case 'finance':
        return {
          title: 'Finance Management',
          quickLinks: [
            { label: 'Dashboard', path: '/finance/dashboard' },
            { label: 'Transactions', path: '/finance/transactions' },
            { label: 'Reports', path: '/finance/reports' },
            { label: 'Analytics', path: '/finance/analytics' },
          ],
          services: [
            { label: 'Income Reports', path: '/finance/income' },
            { label: 'Expense Reports', path: '/finance/expenses' },
            { label: 'Payroll', path: '/finance/payroll' },
            { label: 'Budgeting', path: '/finance/budget' },
          ]
        };
      case 'product':
        return {
          title: 'Product Management',
          quickLinks: [
            { label: 'Product List', path: '/product/manager' },
            { label: 'Add Product', path: '/product/add' },
            { label: 'Categories', path: '/product/categories' },
            { label: 'Refund Management', path: '/product/admin/refund-management' },
          ],
          services: [
            { label: 'Product Analytics', path: '/product/analytics' },
            { label: 'Stock Management', path: '/product/stock' },
            { label: 'Price Management', path: '/product/pricing' },
            { label: 'Quality Control', path: '/product/quality' },
          ]
        };
      case 'inventory':
        return {
          title: 'Inventory Management',
          quickLinks: [
            { label: 'Inventory List', path: '/inventory/display' },
            { label: 'Add Inventory', path: '/inventory/add' },
            { label: 'Stock Levels', path: '/inventory/stock' },
            { label: 'Reports', path: '/inventory/reports' },
          ],
          services: [
            { label: 'Stock Tracking', path: '/inventory/tracking' },
            { label: 'Warehouse Management', path: '/inventory/warehouse' },
            { label: 'Supply Chain', path: '/inventory/supply-chain' },
            { label: 'Inventory Analytics', path: '/inventory/analytics' },
          ]
        };
      default:
        return null;
    }
  };

  const managerFooterContent = getManagerFooterContent();

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <AppBar
        position="static"
        sx={{
          backgroundColor: "#5D4037",
          height: 100,
        }}
      >
        <Toolbar>
          {/* Logo */}
          <Box
            component="img"
            src="/assets/logo.jpg"
            alt="Heritage Hands Logo"
            onError={handleLogoError}
            sx={{
              height: 80,
              mr: 2,
              objectFit: "contain",
            }}
          />

          {/* Navigation Links */}
          <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
            {!managerType ? (
              <>
                <Button
                  component={RouterLink}
                  to="/"
                  variant="text"
                  sx={{
                    mx: 1,
                    color: "#fff",
                    fontSize: "1.1rem",
                    textTransform: "none",
                  }}
                >
                  Home
                </Button>
                <Button
                  component={RouterLink}
                  to="/about"
                  variant="text"
                  sx={{
                    mx: 1,
                    color: "#fff",
                    fontSize: "1.1rem",
                    textTransform: "none",
                  }}
                >
                  About
                </Button>
                <Button
                  component={RouterLink}
                  to="/contact"
                  variant="text"
                  sx={{
                    mx: 1,
                    color: "#fff",
                    fontSize: "1.1rem",
                    textTransform: "none",
                  }}
                >
                  Contact
                </Button>
              </>
            ) : (
              <>
                {getManagerNavItems().map((item, index) => (
                  <Button
                    key={index}
                    component={RouterLink}
                    to={item.path}
                    variant="text"
                    sx={{
                      mx: 1,
                      color: "#fff",
                      fontSize: "1.1rem",
                      textTransform: "none",
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </>
            )}
          </Box>

          {/* Right-side buttons */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {!managerType ? (
              <>
                <Button
                  component={RouterLink}
                  to="/customer"
                  variant="contained"
                  sx={{
                    mx: 1,
                    backgroundColor: "rgba(255, 215, 0, 0.9)",
                    color: "#3E2723",
                    borderRadius: "12px",
                    padding: "8px 16px",
                    fontSize: "1.2rem",
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "rgba(255, 193, 7, 0.95)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                    },
                  }}
                >
                  Customer Home
                </Button>

                <Button
                  component={RouterLink}
                  to="/manager/login"
                  variant="contained"
                  sx={{
                    mx: 1,
                    backgroundColor: "rgba(93, 64, 55, 0.9)",
                    color: "#fff",
                    borderRadius: "12px",
                    padding: "8px 16px",
                    fontSize: "1.2rem",
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "rgba(93, 64, 55, 0.95)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                    },
                  }}
                >
                  Manager Access
                </Button>
              </>
            ) : (
              <Button
                onClick={handleLogout}
                variant="contained"
                sx={{
                  mx: 1,
                  backgroundColor: "rgba(255, 215, 0, 0.9)",
                  color: "#3E2723",
                  borderRadius: "12px",
                  padding: "8px 16px",
                  fontSize: "1.2rem",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "rgba(255, 193, 7, 0.95)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                  },
                }}
              >
                Logout
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>

      {/* Footer */}
      <Footer>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {/* About Section */}
            <Grid item xs={12} sm={6} md={3}>
              <FooterSection>
                <Typography variant="h6" className="section-title">
                  {managerType ? managerFooterContent.title : "About Us"}
                </Typography>
                <Typography variant="body2" sx={{ 
                  mb: 3, 
                  opacity: 0.9, 
                  lineHeight: 1.8,
                  textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                }}>
                  {managerType ? 
                    `Welcome to the ${managerFooterContent.title} portal. Access all your management tools and reports from one central location.` :
                    "Heritage Hands is Sri Lanka's premier handicraft marketplace, celebrating the artistry and cultural heritage of our skilled craftsmen."
                  }
                </Typography>
                {!managerType && (
                  <Stack direction="row" spacing={1.5}>
                    <SocialButton href="https://facebook.com" target="_blank">
                      <Facebook />
                    </SocialButton>
                    <SocialButton href="https://twitter.com" target="_blank">
                      <Twitter />
                    </SocialButton>
                    <SocialButton href="https://instagram.com" target="_blank">
                      <Instagram />
                    </SocialButton>
                    <SocialButton href="https://linkedin.com" target="_blank">
                      <LinkedIn />
                    </SocialButton>
                  </Stack>
                )}
              </FooterSection>
            </Grid>

            {/* Quick Links */}
            <Grid item xs={12} sm={6} md={3}>
              <FooterSection>
                <Typography variant="h6" className="section-title">
                  Quick Links
                </Typography>
                {managerType ? (
                  managerFooterContent.quickLinks.map((link, index) => (
                    <Link key={index} component={RouterLink} to={link.path} className="footer-link">
                      {link.label}
                    </Link>
                  ))
                ) : (
                  <>
                    <Link component={RouterLink} to="/about" className="footer-link">About Us</Link>
                    <Link component={RouterLink} to="/products" className="footer-link">Our Products</Link>
                    <Link component={RouterLink} to="/customer" className="footer-link">Customer Portal</Link>
                    <Link component={RouterLink} to="/manager" className="footer-link">Manager Access</Link>
                    <Link component={RouterLink} to="/contact" className="footer-link">Contact Us</Link>
                  </>
                )}
              </FooterSection>
            </Grid>

            {/* Services */}
            <Grid item xs={12} sm={6} md={3}>
              <FooterSection>
                <Typography variant="h6" className="section-title">
                  {managerType ? 'Management Tools' : 'Our Services'}
                </Typography>
                {managerType ? (
                  managerFooterContent.services.map((service, index) => (
                    <Link key={index} component={RouterLink} to={service.path} className="footer-link">
                      {service.label}
                    </Link>
                  ))
                ) : (
                  <>
                    <Link component={RouterLink} to="/custom-orders" className="footer-link">Custom Orders</Link>
                    <Link component={RouterLink} to="/wholesale" className="footer-link">Wholesale</Link>
                    <Link component={RouterLink} to="/shipping" className="footer-link">Shipping Information</Link>
                    <Link component={RouterLink} to="/returns" className="footer-link">Returns & Refunds</Link>
                    <Link component={RouterLink} to="/faq" className="footer-link">FAQ</Link>
                  </>
                )}
              </FooterSection>
            </Grid>

            {/* Contact Info */}
            <Grid item xs={12} sm={6} md={3}>
              <FooterSection>
                <Typography variant="h6" className="section-title">
                  Contact Support
                </Typography>
                <Box className="contact-item">
                  <LocationOn />
                  <Typography variant="body2">
                    Heritage Hands Head Office<br />123 Craft Street, Colombo 10,<br />Sri Lanka
                  </Typography>
                </Box>
                <Box className="contact-item">
                  <Phone />
                  <Typography variant="body2">
                    +94 11 234 5678
                  </Typography>
                </Box>
                <Box className="contact-item">
                  <Email />
                  <Typography variant="body2">
                    {managerType ? `${managerType}support@heritagehands.lk` : 'info@heritagehands.lk'}
                  </Typography>
                </Box>
              </FooterSection>
            </Grid>
          </Grid>

          <Divider sx={{ 
            my: 5, 
            borderColor: 'rgba(255, 215, 0, 0.1)',
            '&::before, &::after': {
              borderColor: 'rgba(255, 215, 0, 0.1)',
            }
          }} />

          {/* Bottom Footer */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, 
            justifyContent: 'space-between',
            alignItems: 'center',
            textAlign: 'center'
          }}>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              © {new Date().getFullYear()} Heritage Hands. All rights reserved.
            </Typography>
            {!managerType && (
              <Box sx={{ mt: { xs: 2, sm: 0 } }}>
                <Link component={RouterLink} to="/privacy" className="footer-link" sx={{ mr: 3 }}>
                  Privacy Policy
                </Link>
                <Link component={RouterLink} to="/terms" className="footer-link">
                  Terms of Service
                </Link>
              </Box>
            )}
          </Box>
        </Container>

        {/* Scroll to Top Button */}
        <IconButton
          onClick={scrollToTop}
          sx={{
            position: 'absolute',
            right: 20,
            bottom: 20,
            backgroundColor: '#FFD700',
            color: '#3E2723',
            padding: '12px',
            '&:hover': {
              backgroundColor: '#FFA000',
            },
          }}
        >
          <KeyboardArrowUp />
        </IconButton>
      </Footer>
    </Box>
  );
};

export default Layout;