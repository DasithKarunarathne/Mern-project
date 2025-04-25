import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, addToCart } from '../../components/products/services/api.js';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Grid,
  Rating,
  Chip,
  useTheme,
  useMediaQuery,
  CardMedia,
  Divider,
  Zoom,
  Fade,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShareIcon from '@mui/icons-material/Share';
import FavoriteIcon from '@mui/icons-material/Favorite';
import config from '../../config';

const ProductContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  margin: theme.spacing(4, 'auto'),
  maxWidth: 1200,
  borderRadius: '24px',
  boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12)',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '200px',
    background: `linear-gradient(45deg, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`,
    opacity: 0.1,
    zIndex: 0,
  },
}));

const ImageContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '500px',
  borderRadius: '16px',
  overflow: 'hidden',
  boxShadow: '0 12px 24px rgba(0, 0, 0, 0.12)',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.02)',
  },
  [theme.breakpoints.down('md')]: {
    height: '300px',
  },
}));

const ProductImage = styled('img')(({ theme }) => ({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
}));

const ActionButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5, 4),
  borderRadius: '12px',
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '1.1rem',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
  },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  borderRadius: '8px',
  fontWeight: 500,
  padding: theme.spacing(0.5, 0),
}));

const getImageUrl = (imagePath) => {
  if (!imagePath) return config.DEFAULT_PRODUCT_IMAGE;
  try {
    const url = new URL(imagePath);
    return imagePath;
  } catch {
    return `${config.IMAGE_BASE_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  }
};

const ProductList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await getProductById(id);
        setProduct(response.data.product);
      } catch (error) {
        console.error('Error fetching product:', error);
        setError(error.response?.data?.error || error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) {
      alert('Product data is not available. Please try again.');
      return;
    }

    try {
      setLoading(true);
      const cartItem = {
        productId: id,
        quantity: 1,
        price: Number(product.price),
        userId: 'mock-user-id',
      };
      await addToCart(cartItem);
      alert('Product added to cart!');
      navigate('/product/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = () => {
    if (!product) {
      alert('Product data is not available. Please try again.');
      return;
    }
    navigate('/product/delivery', {
      state: {
        singleProduct: {
          productId: id,
          quantity: 1,
          price: Number(product.price),
        },
      },
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ padding: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          {error}
        </Typography>
        <ActionButton
          variant="contained"
          onClick={() => navigate('/')}
          sx={{ marginTop: 2 }}
        >
          Back to Products
        </ActionButton>
      </Box>
    );
  }

  if (!product) {
    return (
      <Box sx={{ padding: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Product not found
        </Typography>
        <ActionButton
          variant="contained"
          onClick={() => navigate('/product')}
          sx={{ marginTop: 2 }}
        >
          Back to Products
        </ActionButton>
      </Box>
    );
  }

  return (
    <Fade in timeout={500}>
      <ProductContainer>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Zoom in={true} style={{ transitionDelay: '200ms' }}>
              <ImageContainer>
                <ProductImage
                  src={getImageUrl(product.image)}
                  alt={product.name}
                  onLoad={() => setIsImageLoaded(true)}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = config.DEFAULT_PRODUCT_IMAGE;
                  }}
                  style={{
                    opacity: isImageLoaded ? 1 : 0,
                    transition: 'opacity 0.5s ease-in-out',
                  }}
                />
              </ImageContainer>
            </Zoom>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant={isMobile ? 'h4' : 'h3'}
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {product.name}
                </Typography>

                <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                  <StyledChip
                    icon={<InventoryIcon />}
                    label={`Stock: ${product.stockQuantity}`}
                    color={product.stockQuantity > 0 ? 'success' : 'error'}
                    variant="outlined"
                  />
                  <StyledChip
                    icon={<LocalShippingIcon />}
                    label="Free Shipping"
                    color="info"
                    variant="outlined"
                  />
                </Stack>

                <Typography
                  variant="h4"
                  sx={{
                    color: theme.palette.secondary.main,
                    fontWeight: 600,
                    mb: 3,
                  }}
                >
                  LKR {product.price.toFixed(2)}
                </Typography>

                <Divider sx={{ my: 3 }} />

                <Typography
                  variant="body1"
                  sx={{
                    color: theme.palette.text.secondary,
                    mb: 3,
                    lineHeight: 1.8,
                  }}
                >
                  {product.description}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                  <Rating
                    value={4.5}
                    precision={0.5}
                    readOnly
                    size="large"
                  />
                  <Typography variant="body2" color="text.secondary">
                    (4.5/5)
                  </Typography>
                </Box>

                <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                  <ActionButton
                    variant="contained"
                    fullWidth
                    onClick={handleBuyNow}
                    sx={{
                      backgroundColor: theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                      },
                    }}
                  >
                    Buy Now
                  </ActionButton>
                  <ActionButton
                    variant="outlined"
                    fullWidth
                    startIcon={<ShoppingCartIcon />}
                    onClick={handleAddToCart}
                  >
                    Add to Cart
                  </ActionButton>
                </Stack>

                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                  <Tooltip title="Share">
                    <IconButton>
                      <ShareIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Add to Wishlist">
                    <IconButton>
                      <FavoriteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </ProductContainer>
    </Fade>
  );
};

export default ProductList;