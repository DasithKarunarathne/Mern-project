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
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { Search, Category as CategoryIcon, Add as AddIcon } from "@mui/icons-material";

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

const AddButton = styled(IconButton)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(4),
  right: theme.spacing(4),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
  zIndex: 1000,
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
}));

const ProductDashboard = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
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
        Handicraft Products
      </Typography>

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

      {filteredProducts.length === 0 ? (
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
                <ProductCard key={product._id} onClick={() => handleViewDetails(product._id)}>
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
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={product.category}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      {product.status && (
                        <Chip
                          label={product.status}
                          size="small"
                          color={product.status === 'In Stock' ? 'success' : 'error'}
                        />
                      )}
                    </Box>
                  </CardContent>
                </ProductCard>
              );
            })}
          </ProductGrid>
        </Fade>
      )}

      <AddButton
        size="large"
        onClick={() => navigate('/product/add')}
        title="Add New Product"
      >
        <AddIcon />
      </AddButton>
    </StyledContainer>
  );
};

export default ProductDashboard;