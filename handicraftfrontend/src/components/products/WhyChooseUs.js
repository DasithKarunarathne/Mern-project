import React from 'react';
import { Box, Container, Typography, Grid, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  LocalShipping,
  VerifiedUser,
  Nature,
  Support,
  Handshake,
  Star,
} from '@mui/icons-material';

const FeatureCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  borderRadius: theme.spacing(2),
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
    '& .feature-icon': {
      transform: 'scale(1.1)',
    },
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4)',
  },
}));

const FeatureIcon = styled(Box)(({ theme, index }) => ({
  width: 80,
  height: 80,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  background: `linear-gradient(135deg, ${getIconColor(index).start}, ${getIconColor(index).end})`,
  color: 'white',
  transition: 'all 0.3s ease',
  '& .MuiSvgIcon-root': {
    fontSize: 40,
  },
}));

const getIconColor = (index) => {
  const colors = [
    { start: '#FF6B6B', end: '#FF8E8E' },
    { start: '#4ECDC4', end: '#45B7D1' },
    { start: '#96CEB4', end: '#88D8B0' },
    { start: '#FFD93D', end: '#FF9F1C' },
    { start: '#A8E6CF', end: '#DCEDC1' },
    { start: '#FFB6B9', end: '#FAE3D9' },
  ];
  return colors[index % colors.length];
};

const features = [
  {
    icon: <LocalShipping />,
    title: 'Fast & Reliable Shipping',
    description: 'We ensure your orders are delivered quickly and safely to your doorstep.',
  },
  {
    icon: <VerifiedUser />,
    title: 'Authentic Products',
    description: 'Every item is verified for authenticity and quality before shipping.',
  },
  {
    icon: <Nature />,
    title: 'Eco-Friendly',
    description: 'Our products are made with sustainable materials and eco-conscious practices.',
  },
  {
    icon: <Support />,
    title: '24/7 Support',
    description: 'Our dedicated support team is always ready to assist you.',
  },
  {
    icon: <Handshake />,
    title: 'Fair Trade',
    description: 'We work directly with artisans ensuring fair wages and working conditions.',
  },
  {
    icon: <Star />,
    title: 'Premium Quality',
    description: 'Each product is crafted with attention to detail and superior materials.',
  },
];

const WhyChooseUs = () => {
  return (
    <Box
      sx={{
        py: 8,
        background: 'linear-gradient(135deg, #f8f8f8 0%, #ffffff 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100%',
          background: 'url("/assets/pattern.png")',
          opacity: 0.05,
          zIndex: 0,
        },
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h3"
          align="center"
          sx={{
            mb: 6,
            fontWeight: 700,
            background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          Why Choose Us
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <FeatureCard
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
                <FeatureIcon className="feature-icon" index={index}>
                  {feature.icon}
                </FeatureIcon>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    fontWeight: 600,
                    color: '#2C3E50',
                    mb: 2,
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ lineHeight: 1.7 }}
                >
                  {feature.description}
                </Typography>
              </FeatureCard>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default WhyChooseUs; 