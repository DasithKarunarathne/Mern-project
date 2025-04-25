import React, { useState } from "react";
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

  // State for dropdown menu
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle logo load error
  const handleLogoError = (e) => {
    console.error("Failed to load logo at /assets/logo.jpg");
    e.target.style.display = "none"; // Hide the broken image icon
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <AppBar
        position="static"
        sx={{
          backgroundColor: "#5D4037",
          height: 100, // Increased height of the AppBar
        }}
      >
        <Toolbar
          sx={{
            height: "100%", // Ensure Toolbar takes the full height of the AppBar
            display: "flex",
            alignItems: "center", // Center content vertically
          }}
        >
          {/* Logo */}
          <Box sx={{ flexGrow: 1 }}>
            <Link component={RouterLink} to="/">
              <img
                src="/assets/logo.jpg" // Path to the saved logo image
                alt="Heritage Hands Logo"
                style={{ height: 80, padding: theme.spacing(1) }} // Increased logo height
                onError={handleLogoError} // Add error handling
              />
            </Link>
          </Box>

          {/* Navigation Links */}
          {!isMobile && (
            <>
              <Link
                component={RouterLink}
                to="/"
                color="inherit"
                sx={{
                  mx: 2,
                  textDecoration: "none",
                  fontSize: "1.4rem",
                }}
              >
                Home
              </Link>
              <Link
                component={RouterLink}
                to="/about"
                color="inherit"
                sx={{
                  mx: 2,
                  textDecoration: "none",
                  fontSize: "1.4rem",
                }}
              >
                About
              </Link>
              <Link
                component={RouterLink}
                to="/contact"
                color="inherit"
                sx={{
                  mx: 2,
                  textDecoration: "none",
                  fontSize: "1.4rem",
                }}
              >
                Contact
              </Link>

              {/* Customer Home Button */}
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

              {/* Manager Access Button */}
              <Button
                component={RouterLink}
                to="/manager"
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

              {/* Login Button with Dropdown */}
              <LoginButton variant="contained" onClick={handleMenuOpen}>
                Login
              </LoginButton>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
              >
                <MenuItem
                  onClick={handleMenuClose}
                  component={RouterLink}
                  to="/customer/login"
                >
                  Customer Login
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1 }}>{children}</Box>

      {/* Footer */}
      <Footer>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {/* About Section */}
            <Grid item xs={12} sm={6} md={3}>
              <FooterSection>
                <Typography variant="h6" className="section-title">
                  About Us
                </Typography>
                <Typography variant="body2" sx={{ 
                  mb: 3, 
                  opacity: 0.9, 
                  lineHeight: 1.8,
                  textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                }}>
                  Heritage Hands is Sri Lanka's premier handicraft marketplace, 
                  celebrating the artistry and cultural heritage of our skilled craftsmen.
                </Typography>
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
              </FooterSection>
            </Grid>

            {/* Quick Links */}
            <Grid item xs={12} sm={6} md={3}>
              <FooterSection>
                <Typography variant="h6" className="section-title">
                  Quick Links
                </Typography>
                <Link component={RouterLink} to="/about" className="footer-link">About Us</Link>
                <Link component={RouterLink} to="/products" className="footer-link">Our Products</Link>
                <Link component={RouterLink} to="/customer" className="footer-link">Customer Portal</Link>
                <Link component={RouterLink} to="/manager" className="footer-link">Manager Access</Link>
                <Link component={RouterLink} to="/contact" className="footer-link">Contact Us</Link>
              </FooterSection>
            </Grid>

            {/* Services */}
            <Grid item xs={12} sm={6} md={3}>
              <FooterSection>
                <Typography variant="h6" className="section-title">
                  Our Services
                </Typography>
                <Link component={RouterLink} to="/custom-orders" className="footer-link">Custom Orders</Link>
                <Link component={RouterLink} to="/wholesale" className="footer-link">Wholesale</Link>
                <Link component={RouterLink} to="/shipping" className="footer-link">Shipping Information</Link>
                <Link component={RouterLink} to="/returns" className="footer-link">Returns & Refunds</Link>
                <Link component={RouterLink} to="/faq" className="footer-link">FAQ</Link>
              </FooterSection>
            </Grid>

            {/* Contact Info */}
            <Grid item xs={12} sm={6} md={3}>
              <FooterSection>
                <Typography variant="h6" className="section-title">
                  Contact Us
                </Typography>
                <Box className="contact-item">
                  <LocationOn />
                  <Typography variant="body2">
                    123 Craft Street, Colombo 10,<br />Sri Lanka
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
                    info@heritagehands.lk
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
            },
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              width: '50px',
              height: '50px',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%) rotate(45deg)',
              background: 'linear-gradient(135deg, transparent 45%, rgba(255,215,0,0.1) 50%, transparent 55%)',
            }
          }} />

          {/* Bottom Footer */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, 
            justifyContent: 'space-between',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -20,
              left: 0,
              right: 0,
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.2), transparent)',
            }
          }}>
            <Typography variant="body2" sx={{ 
              opacity: 0.9,
              letterSpacing: 1,
              fontWeight: 500,
              textShadow: '0 1px 2px rgba(0,0,0,0.2)',
            }}>
              © {new Date().getFullYear()} Heritage Hands. All rights reserved.
            </Typography>
            <Box sx={{ 
              mt: { xs: 2, sm: 0 },
              display: 'flex',
              gap: 3,
            }}>
              <Link 
                component={RouterLink} 
                to="/privacy" 
                className="footer-link" 
                sx={{ 
                  display: 'inline',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                }}
              >
                Privacy Policy
              </Link>
              <Link 
                component={RouterLink} 
                to="/terms" 
                className="footer-link" 
                sx={{ 
                  display: 'inline',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                }}
              >
                Terms of Service
              </Link>
            </Box>
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
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: '#FFA000',
              transform: 'translateY(-5px)',
              boxShadow: '0 5px 15px rgba(255,215,0,0.4)',
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: '50%',
              background: 'rgba(255,215,0,0.2)',
              animation: 'pulse 2s infinite',
            },
            '@keyframes pulse': {
              '0%': {
                transform: 'scale(1)',
                opacity: 1,
              },
              '100%': {
                transform: 'scale(1.5)',
                opacity: 0,
              },
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