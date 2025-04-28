import React, { useState, useEffect } from "react";
import { getProducts } from "../products/services/api.js";
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
  IconButton,
  Rating,
  Stack,
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
  ShoppingCart as CartIcon,
  FavoriteBorder as WishlistIcon,
  ArrowBackIos,
  ArrowForwardIos,
} from "@mui/icons-material";
import WhyChooseUs from './WhyChooseUs';
import config from '../../config';
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
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease-in-out',
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
    '& .product-actions': {
      transform: 'translateY(0)',
      opacity: 1,
    },
    '& .product-image': {
      transform: 'scale(1.05)',
    },
  },
}));

const ProductImageWrapper = styled(Box)({
  position: 'relative',
  paddingTop: '75%', // 4:3 aspect ratio
  overflow: 'hidden',
  backgroundColor: '#f5f5f5',
});

const StyledProductImage = styled('img')({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  transition: 'transform 0.3s ease-in-out',
});

const ProductActions = styled(Stack)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  padding: theme.spacing(2),
  background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
  transform: 'translateY(100%)',
  opacity: 0,
  transition: 'all 0.3s ease-in-out',
  zIndex: 1,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  gap: theme.spacing(1),
}));

const ActionIconButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 1)',
    transform: 'scale(1.1)',
  },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
  zIndex: 1,
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(4px)',
  fontWeight: 600,
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
  height: '300px',
  overflow: 'hidden',
  borderRadius: '12px',
  marginBottom: theme.spacing(3),
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
  [theme.breakpoints.down('sm')]: {
    height: '200px',
  },
}));

const CarouselSlide = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
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
  padding: theme.spacing(2),
  background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
  color: 'white',
  textAlign: 'center',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  },
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

const getImageUrl = (imagePath) => {
  if (!imagePath) return config.DEFAULT_PRODUCT_IMAGE;
  
  // Check if it's already a complete URL or data URL
  if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
    return imagePath;
  }
  
  // Remove any leading slashes to avoid double slashes in the URL
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  return `${config.IMAGE_BASE_URL}/${cleanPath}`;
};

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
        if (response && response.data) {
          setProducts(response.data);
          setFilteredProducts(response.data);
          setError(null);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        if (retryCount < MAX_RETRIES) {
          setRetryCount(prev => prev + 1);
          setTimeout(() => {
            fetchProducts();
          }, 2000 * (retryCount + 1));
        } else {
          setError("Failed to load products. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [retryCount]);

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

  const handleImageError = (e) => {
    e.target.onerror = null; // Prevent infinite loop
    e.target.src = config.DEFAULT_PRODUCT_IMAGE;
  };

  const renderContent = () => {
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
          <Typography variant="h6" color="error" gutterBottom>
            {error}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => setRetryCount(0)} 
            sx={{ mt: 2 }}
          >
            Retry Loading
          </Button>
        </Box>
      );
    }

    if (filteredProducts.length === 0) {
      return (
        <Fade in>
          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No products found matching your criteria.
            </Typography>
          </Box>
        </Fade>
      );
    }

    return (
      <Fade in>
        <ProductGrid>
          {filteredProducts.map((product) => (
            <ProductCard key={product._id}>
              <ProductImageWrapper>
                <StyledProductImage
                  className="product-image"
                  src={getImageUrl(product.image)}
                  alt={product.name}
                  onError={handleImageError}
                />
                <StyledChip
                  label={product.category}
                  size="small"
                  color="primary"
                />
                <ProductActions className="product-actions">
                  <ActionIconButton
                    onClick={() => handleViewDetails(product._id)}
                    size="small"
                    title="View Details"
                  >
                    <ViewIcon />
                  </ActionIconButton>
                  <ActionIconButton
                    onClick={handleLoginPrompt}
                    size="small"
                    title="Add to Cart"
                  >
                    <CartIcon />
                  </ActionIconButton>
                  <ActionIconButton
                    onClick={handleLoginPrompt}
                    size="small"
                    title="Add to Wishlist"
                  >
                    <WishlistIcon />
                  </ActionIconButton>
                </ProductActions>
              </ProductImageWrapper>
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    mb: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    minHeight: '2.75rem',
                  }}
                >
                  {product.name}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Rating value={4.5} precision={0.5} size="small" readOnly />
                  <Typography variant="body2" color="text.secondary">
                    (4.5)
                  </Typography>
                </Stack>
                <Typography 
                  variant="h6" 
                  color="primary" 
                  sx={{ 
                    fontWeight: 700,
                    mt: 'auto',
                    pt: 1
                  }}
                >
                  LKR {(product.price || 0).toFixed(2)}
                </Typography>
                {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
                  <Typography variant="caption" color="error.main" sx={{ mt: 0.5 }}>
                    Only {product.stockQuantity} left in stock!
                  </Typography>
                )}
                {product.stockQuantity === 0 && (
                  <Typography variant="caption" color="error.main" sx={{ mt: 0.5 }}>
                    Out of stock
                  </Typography>
                )}
              </CardContent>
            </ProductCard>
          ))}
        </ProductGrid>
      </Fade>
    );
  };

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
                : "https://via.placeholder.com/280x200?text=Product+Image";
              
              return (
                <ProductCard key={product._id}>
                  <CardMedia
                    component="img"
                    image={imageUrl}
                    alt={product.name}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/280x200?text=Image+Not+Found";
                    }}
                    sx={{
                      height: 200,
                      objectFit: 'cover'
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