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
} from "@mui/material";
import { styled } from "@mui/material/styles";

// Custom styled components
const Footer = styled(Box)(({ theme }) => ({
  backgroundColor: "#3E2723", // Deep brown
  color: "#fff",
  padding: theme.spacing(3),
  textAlign: "center",
  marginTop: theme.spacing(4),
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
        <Typography variant="body2">
          © {new Date().getFullYear()} Heritage Hands. All rights reserved.
        </Typography>
        <Divider sx={{ my: 2, backgroundColor: "#fff", opacity: 0.3 }} />
        <Typography variant="body2">
          Crafted with ❤️ for Handicraft Excellence
        </Typography>
      </Footer>
    </Box>
  );
};

export default Layout;