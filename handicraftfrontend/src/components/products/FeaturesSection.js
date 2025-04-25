import React from 'react';
import { Box, Container, Typography, IconButton, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Star,
  LocalShipping,
  Security,
  Palette,
} from '@mui/icons-material';

const FeatureCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: 'center',
  borderRadius: theme.spacing(2),
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '4px',
    background: 'linear-gradient(90deg, #FFD700, #FFA000)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
    '&::before': {
      opacity: 1,
    },
    '& .feature-icon': {
      transform: 'scale(1.1) rotate(10deg)',
      backgroundColor: 'rgba(93, 64, 55, 0.2)',
    },
  },
}));

const FeatureIcon = styled(IconButton)(({ theme }) => ({
  backgroundColor: 'rgba(93, 64, 55, 0.1)',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  transition: 'all 0.3s ease',
}));

const features = [
  {
    icon: <Star />,
    title: 'Premium Quality',
    description: 'Each piece is handcrafted with meticulous attention to detail by skilled artisans',
  },
  {
    icon: <Palette />,
    title: 'Unique Designs',
    description: 'One-of-a-kind pieces that blend traditional craftsmanship with modern aesthetics',
  },
  {
    icon: <LocalShipping />,
    title: 'Fast Shipping',
    description: 'Secure and swift delivery to your doorstep with real-time tracking',
  },
  {
    icon: <Security />,
    title: 'Secure Shopping',
    description: 'Protected payments and verified authentic handicraft products',
  },
];

const FeaturesSection = () => {
  return (
    <Container maxWidth="lg" sx={{ my: 8 }}>
      <Typography
        variant="h3"
        align="center"
        sx={{
          mb: 6,
          fontWeight: 700,
          background: 'linear-gradient(45deg, #5D4037, #3E2723)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        Why Choose Us
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: 3,
        }}
      >
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            elevation={0}
            sx={{
              animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
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
            }}
          >
            <FeatureIcon className="feature-icon">
              {React.cloneElement(feature.icon, { sx: { color: '#5D4037' } })}
            </FeatureIcon>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontWeight: 600,
                color: '#3E2723',
              }}
            >
              {feature.title}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ lineHeight: 1.7 }}
            >
              {feature.description}
            </Typography>
          </FeatureCard>
        ))}
      </Box>
    </Container>
  );
};

export default FeaturesSection; 