import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { styled } from "@mui/material/styles";

// Custom styled components
const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, rgba(139, 69, 19, 0.8), rgba(210, 180, 140, 0.8)), url('https://images.unsplash.com/photo-1618762222015-3a69a1b6e5f2?q=80&w=2070&auto=format&fit=crop')`, // Combine gradient and image
  backgroundSize: "cover",
  backgroundPosition: "center",
  color: "#fff",
  height: "calc(100vh - 100px)", // Adjusted for larger AppBar height
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  overflow: "hidden",
}));

const ManagerButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
  backgroundColor: "#FFD700", // Gold
  color: "#3E2723", // Deep brown text
  "&:hover": {
    backgroundColor: "#FFC107", // Lighter gold on hover
  },
}));

const HomePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundImage: "url('/background.jpg')", // Ensure the image exists in the public directory
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <HeroSection>
        <Container>
          <Typography
            variant={isMobile ? "h4" : "h2"}
            component="h1"
            gutterBottom
            sx={{ fontWeight: 700, textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}
          >
            Welcome to Heritage Hands
          </Typography>
          <Typography variant={isMobile ? "h6" : "h5"} gutterBottom sx={{ mb: 4 }}>
            Crafting Excellence in Handicraft Management
          </Typography>
          <Box sx={{ mb: 4 }}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              component={RouterLink}
              to="/product"
              sx={{ backgroundColor: "#FFD700", color: "#3E2723", "&:hover": { backgroundColor: "#FFC107" }, mr: 2 }}
            >
              Explore Products
            </Button>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              component={RouterLink}
              to="/customer"
              sx={{ backgroundColor: "#FFD700", color: "#3E2723", "&:hover": { backgroundColor: "#FFC107" } }}
            >
              Customer Home
            </Button>
          </Box>
          <Typography variant={isMobile ? "h6" : "h5"} gutterBottom sx={{ mb: 2 }}>
            Manager Functions
          </Typography>
          <Box>
            <ManagerButton
              variant="contained"
              component={RouterLink}
              to="/hr"
            >
              HR Manager
            </ManagerButton>
            <ManagerButton
              variant="contained"
              component={RouterLink}
              to="/finance/dashboard"
            >
              Finance Manager
            </ManagerButton>
            <ManagerButton
              variant="contained"
              component={RouterLink}
              to="/product/manager"
            >
              Product Manager
            </ManagerButton>
            <ManagerButton
              variant="contained"
              component={RouterLink}
              to="/inventory"
            >
              Inventory Manager
            </ManagerButton>
          </Box>
        </Container>
      </HeroSection>
    </div>
  );
};

export default HomePage;