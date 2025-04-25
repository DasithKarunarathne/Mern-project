import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ShoppingCart } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const HeroWrapper = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #5D4037 0%, #3E2723 100%)',
  color: '#fff',
  padding: theme.spacing(10, 2),
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
  marginBottom: theme.spacing(6),
  borderRadius: theme.spacing(0, 0, 4, 4),
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at center, rgba(255,215,0,0.1) 0%, transparent 70%)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url(/assets/pattern.png)',
    opacity: 0.1,
    animation: 'float 20s linear infinite',
  },
  '@keyframes float': {
    '0%': { transform: 'translateY(0) rotate(0deg)' },
    '100%': { transform: 'translateY(-100%) rotate(10deg)' },
  },
}));

const AnimatedText = styled(Typography)(({ theme }) => ({
  animation: 'fadeInUp 0.8s ease-out',
  '@keyframes fadeInUp': {
    from: {
      opacity: 0,
      transform: 'translateY(20px)',
    },
    to: {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
}));

const StyledButton = styled(Button)(({ theme, variant }) => ({
  borderRadius: '50px',
  padding: '12px 32px',
  fontSize: '1.1rem',
  textTransform: 'none',
  transition: 'all 0.3s ease',
  ...(variant === 'contained' ? {
    backgroundColor: '#FFD700',
    color: '#3E2723',
    '&:hover': {
      backgroundColor: '#FFC107',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(255,215,0,0.4)',
    },
  } : {
    borderColor: '#fff',
    color: '#fff',
    '&:hover': {
      borderColor: '#FFD700',
      color: '#FFD700',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(255,255,255,0.2)',
    },
  }),
}));

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <HeroWrapper>
      <Container maxWidth="lg">
        <AnimatedText
          variant="h1"
          sx={{
            fontWeight: 800,
            marginBottom: 2,
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            fontSize: { xs: '2.5rem', md: '4rem' },
            letterSpacing: '-0.5px',
          }}
        >
          Heritage Hands
        </AnimatedText>
        <AnimatedText
          variant="h5"
          sx={{
            mb: 4,
            opacity: 0.9,
            maxWidth: '800px',
            margin: '0 auto',
            lineHeight: 1.6,
            fontSize: { xs: '1.2rem', md: '1.5rem' },
            animation: 'fadeInUp 0.8s ease-out 0.2s both',
          }}
        >
          Discover unique handcrafted treasures that tell stories of tradition and artistry
        </AnimatedText>
        <Box 
          sx={{ 
            display: 'flex', 
            gap: 2, 
            justifyContent: 'center',
            flexWrap: 'wrap',
            animation: 'fadeInUp 0.8s ease-out 0.4s both',
          }}
        >
          <StyledButton
            variant="contained"
            size="large"
            startIcon={<ShoppingCart />}
            onClick={() => navigate('/customer/login')}
          >
            Start Shopping
          </StyledButton>
          <StyledButton
            variant="outlined"
            size="large"
            onClick={() => navigate('/about')}
          >
            Learn More
          </StyledButton>
        </Box>
      </Container>
    </HeroWrapper>
  );
};

export default HeroSection; 