import React, { useState, useEffect } from "react";
import { getProducts } from "../../components/products/services/api.js";
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardMedia,
  CardContent,
  InputAdornment,
  CircularProgress,
  Fade,
  Container,
  Chip,
  Button,
  Alert,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Category as CategoryIcon,
  Login as LoginIcon,
  HowToReg as RegisterIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import WhyChooseUs from './WhyChooseUs';
import FloatingChatbot from '../customer/FloatingChatbot';

const StyledContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(2),
  marginBottom: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
  },
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  minWidth: 200,
  [theme.breakpoints.down('sm')]: {
    minWidth: '100%',
  },
}));

const ProductCard = styled(Card)(({ theme }) => ({
  height: 320,
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
  },
}));

const ProductImage = styled(CardMedia)(({ theme }) => ({
  height: 200,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
}));

const ProductGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: theme.spacing(3),
  padding: theme.spacing(2),
}));

const ProductDashboard = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loginDialog, setLoginDialog] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await getProducts();
        setProducts(response.data);
        setFilteredProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = ["All", ...new Set(products.map((product) => product.category))];

  useEffect(() => {
    let filtered = products;
    if (searchTerm) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedCategory !== "All") {
      filtered = filtered.filter((product) => product.category === selectedCategory);
    }
    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, products]);

  const handleViewDetails = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleLoginPrompt = () => {
    setLoginDialog(true);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <StyledContainer maxWidth="xl">
      <Typography 
        variant={isMobile ? "h4" : "h3"} 
        sx={{ 
          mb: 4, 
          textAlign: "center",
          fontWeight: 700,
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Heritage Hands
      </Typography>

      {!isLoggedIn && (
        <>
          <Alert 
            severity="info" 
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              backgroundColor: 'rgba(229, 246, 253, 0.9)',
            }}
          >
            Please log in or register to view product details and make purchases. You can browse our collection as a guest.
          </Alert>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 4 }}>
            <Button
              variant="contained"
              startIcon={<LoginIcon />}
              onClick={() => navigate('/customer/login')}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Login
            </Button>
            <Button
              variant="outlined"
              startIcon={<RegisterIcon />}
              onClick={() => navigate('/customer/register')}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Register
            </Button>
          </Box>
        </>
      )}

      <SearchContainer>
        <TextField
          fullWidth
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1 }}
        />
        <StyledFormControl>
          <InputLabel>Category</InputLabel>
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            label="Category"
            startAdornment={
              <InputAdornment position="start">
                <CategoryIcon color="action" />
              </InputAdornment>
            }
          >
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </StyledFormControl>
      </SearchContainer>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress size={60} thickness={4} />
        </Box>
      ) : filteredProducts.length === 0 ? (
        <Fade in>
          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No products found matching your criteria.
            </Typography>
          </Box>
        </Fade>
      ) : (
        <Fade in>
          <ProductGrid>
            {filteredProducts.map((product) => {
              const imageUrl = product.image 
                ? `http://localhost:5000${product.image}` 
                : "https://via.placeholder.com/280x200?text=Product+Image";
              
              return (
                <ProductCard key={product._id}>
                  <ProductImage
                    image={imageUrl}
                    title={product.name}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/280x200?text=Image+Not+Found";
                    }}
                  />
                  <CardContent>
                    <Typography variant="h6" noWrap sx={{ mb: 1 }}>
                      {product.name}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" color="primary">
                        LKR {product.price?.toFixed(2)}
                      </Typography>
                      <Chip
                        label={product.category}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Button
                        variant="contained"
                        startIcon={<ViewIcon />}
                        onClick={() => isLoggedIn ? handleViewDetails(product._id) : handleLoginPrompt()}
                        sx={{
                          borderRadius: '8px',
                          textTransform: 'none',
                        }}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={isLoggedIn ? () => navigate('/product/delivery', { state: { singleProduct: { productId: product._id, quantity: 1, price: product.price } } }) : handleLoginPrompt}
                        sx={{
                          borderRadius: '8px',
                          textTransform: 'none',
                        }}
                      >
                        Buy Now
                      </Button>
                    </Box>
                  </CardContent>
                </ProductCard>
              );
            })}
          </ProductGrid>
        </Fade>
      )}

      <WhyChooseUs />

      <FloatingChatbot />

      <Dialog open={loginDialog} onClose={() => setLoginDialog(false)}>
        <DialogTitle>Login Required</DialogTitle>
        <DialogContent>
          <Typography>
            Please log in or create an account to view product details and make purchases.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLoginDialog(false)}>Cancel</Button>
          <Button 
            variant="contained"
            onClick={() => navigate('/customer/login')}
          >
            Login
          </Button>
          <Button 
            variant="outlined"
            onClick={() => navigate('/customer/register')}
          >
            Register
          </Button>
        </DialogActions>
      </Dialog>
    </StyledContainer>
  );
};

export default ProductDashboard;