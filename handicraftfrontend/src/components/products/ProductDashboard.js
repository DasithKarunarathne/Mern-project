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
  Paper,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Category as CategoryIcon,
  Login as LoginIcon,
  HowToReg as RegisterIcon,
  Visibility as ViewIcon,
  ArrowBackIos,
  ArrowForwardIos,
} from "@mui/icons-material";
import WhyChooseUs from './WhyChooseUs';
import FloatingChatbot from '../customer/FloatingChatbot';
import config from '../../config';

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

const CarouselContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '500px',
  overflow: 'hidden',
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
  marginBottom: theme.spacing(4),
}));

const CarouselImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  objectPosition: 'center',
});

const CarouselSlide = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  transition: 'opacity 0.5s ease-in-out',
  opacity: 0,
  '&.active': {
    opacity: 1,
  },
}));

const CarouselContent = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  padding: theme.spacing(4),
  background: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.3))',
  color: theme.palette.common.white,
  borderRadius: `0 0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px`,
}));

const CarouselButton = styled(Button)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  color: 'white',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
}));

const PrevButton = styled(CarouselButton)(({ theme }) => ({
  left: theme.spacing(2),
}));

const NextButton = styled(CarouselButton)(({ theme }) => ({
  right: theme.spacing(2),
}));

const carouselItems = [
  {
    image: '/images/carousel/handicraft.jpg',
    title: 'Traditional Sri Lankan Handicrafts',
    description: 'Discover the rich heritage of Sri Lankan craftsmanship, where each piece tells a story of our ancient traditions and cultural legacy.'
  },
  {
    image: '/images/carousel/wood-carving.jpg',
    title: 'Authentic Wood Carvings',
    description: 'Experience the intricate beauty of Sri Lankan wood carvings, crafted with precision and passion by our skilled artisans.'
  },
  {
    image: '/images/carousel/batik.jpg',
    title: 'Handmade Batik & Textiles',
    description: 'Explore our collection of vibrant batik fabrics and handloom textiles, each piece showcasing unique Sri Lankan patterns and colors.'
  },
  {
    image: '/images/carousel/pottery.jpg',
    title: 'Traditional Pottery & Ceramics',
    description: 'Admire the timeless elegance of Sri Lankan pottery, where traditional techniques meet contemporary designs.'
  },
  {
    image: '/images/carousel/jewelry.jpg',
    title: 'Handcrafted Jewelry',
    description: 'Discover exquisite Sri Lankan jewelry, crafted with precious metals and gemstones, reflecting our island\'s natural beauty.'
  }
];

const ProductDashboard = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loginDialog, setLoginDialog] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  
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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
  };

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
          <CarouselContainer>
            {carouselItems.map((item, index) => (
              <CarouselSlide
                key={index}
                className={index === currentSlide ? 'active' : ''}
                sx={{
                  backgroundImage: `url(${item.image})`,
                }}
              >
                <CarouselContent>
                  <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="h6">
                    {item.description}
                  </Typography>
                </CarouselContent>
              </CarouselSlide>
            ))}
            <PrevButton onClick={handlePrevSlide}>
              <ArrowBackIos />
            </PrevButton>
            <NextButton onClick={handleNextSlide}>
              <ArrowForwardIos />
            </NextButton>
          </CarouselContainer>

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
                : config.DEFAULT_PRODUCT_IMAGE;
              
              return (
                <ProductCard key={product._id}>
                  <ProductImage
                    image={imageUrl}
                    title={product.name}
                    onError={(e) => {
                      e.target.onerror = null; // Prevent infinite loop
                      e.target.src = config.DEFAULT_PRODUCT_IMAGE;
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