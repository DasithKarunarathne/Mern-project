import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
  Grid,
  Paper,
} from "@mui/material";
import { styled } from "@mui/material/styles";

// Custom styled components
const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, rgba(139, 69, 19, 0.85), rgba(210, 180, 140, 0.85)), url('https://images.unsplash.com/photo-1618762222015-3a69a1b6e5f2?q=80&w=2070&auto=format&fit=crop')`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  color: "#fff",
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  position: "relative",
  overflow: "hidden",
  padding: theme.spacing(8, 0),
}));

const ManagerButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
  backgroundColor: "rgba(255, 215, 0, 0.9)",
  color: "#3E2723",
  backdropFilter: "blur(5px)",
  borderRadius: "12px",
  padding: theme.spacing(1.5, 3),
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: "rgba(255, 193, 7, 0.95)",
    transform: "translateY(-2px)",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  position: "relative",
  marginBottom: theme.spacing(4),
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: -10,
    left: "50%",
    transform: "translateX(-50%)",
    width: "60px",
    height: "3px",
    backgroundColor: "#FFD700",
    borderRadius: "2px",
  },
}));

const HomePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <HeroSection>
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography
              variant={isMobile ? "h3" : "h2"}
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 800,
                textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                lineHeight: 1.2,
                mb: 3,
              }}
            >
              Welcome to Heritage Hands
            </Typography>
            <Typography
              variant={isMobile ? "h6" : "h5"}
              sx={{
                mb: 4,
                opacity: 0.9,
                fontWeight: 400,
              }}
            >
              Crafting Excellence in Handicraft Management
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Button
                variant="contained"
                size="large"
                component={RouterLink}
                to="/product"
                sx={{
                  backgroundColor: "rgba(255, 215, 0, 0.9)",
                  color: "#3E2723",
                  borderRadius: "12px",
                  padding: "12px 24px",
                  "&:hover": {
                    backgroundColor: "rgba(255, 193, 7, 0.95)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                  },
                }}
              >
                Explore Products
              </Button>
              <Button
                variant="contained"
                size="large"
                component={RouterLink}
                to="/customer"
                sx={{
                  backgroundColor: "rgba(255, 215, 0, 0.9)",
                  color: "#3E2723",
                  borderRadius: "12px",
                  padding: "12px 24px",
                  "&:hover": {
                    backgroundColor: "rgba(255, 193, 7, 0.95)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                  },
                }}
              >
                Customer Home
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
                borderRadius: "20px",
                padding: theme.spacing(4),
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              <SectionTitle
                variant={isMobile ? "h5" : "h4"}
                align="center"
                sx={{ color: "#FFD700" }}
              >
                Manager Functions
              </SectionTitle>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: 2,
                }}
              >
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
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </HeroSection>
  );
};

export default HomePage;