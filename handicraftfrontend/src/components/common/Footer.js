import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  IconButton,
  Link,
  Divider,
  useTheme,
  Stack,
  Paper,
} from "@mui/material";
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Phone,
  Email,
  LocationOn,
  ArrowUpward,
} from "@mui/icons-material";

const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box
      component="footer"
      sx={{
        background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
        color: "white",
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #ff4081 0%, #7c4dff 50%, #00bcd4 100%)',
        },
      }}
    >
      {/* Scroll to top button */}
      <IconButton
        onClick={scrollToTop}
        sx={{
          position: 'absolute',
          top: '-20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'white',
          boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
          '&:hover': {
            backgroundColor: 'secondary.light',
            transform: 'translateX(-50%) translateY(-5px)',
          },
          transition: 'all 0.3s ease',
        }}
      >
        <ArrowUpward color="primary" />
      </IconButton>

      <Container maxWidth="lg" sx={{ pt: 8, pb: 6 }}>
        <Grid container spacing={6}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ 
              p: 3, 
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(10px)',
              borderRadius: 2,
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
              }
            }}>
              <Typography variant="h5" gutterBottom sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(90deg, #fff 0%, #e3f2fd 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2
              }}>
                Handicraft Store
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.7 }}>
                Bringing the finest handcrafted treasures to your doorstep. Our commitment
                to quality and tradition creates unique pieces that tell stories.
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                {[
                  { icon: <Facebook />, url: "https://facebook.com" },
                  { icon: <Twitter />, url: "https://twitter.com" },
                  { icon: <Instagram />, url: "https://instagram.com" },
                  { icon: <LinkedIn />, url: "https://linkedin.com" },
                ].map((social, index) => (
                  <IconButton
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)',
                      '&:hover': {
                        backgroundColor: 'secondary.main',
                        transform: 'translateY(-3px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {social.icon}
                  </IconButton>
                ))}
              </Stack>
            </Paper>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" gutterBottom sx={{ 
              fontWeight: 600,
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: '-8px',
                left: 0,
                width: '40px',
                height: '3px',
                background: theme.palette.secondary.main,
                borderRadius: '2px',
              }
            }}>
              Quick Links
            </Typography>
            <Stack spacing={2} sx={{ mt: 4 }}>
              {[
                { text: "About Us", href: "/about" },
                { text: "Products", href: "/products" },
                { text: "Services", href: "/services" },
                { text: "Contact", href: "/contact" },
                { text: "Career", href: "/career" },
              ].map((link) => (
                <Link
                  key={link.text}
                  href={link.href}
                  sx={{
                    color: 'white',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      color: theme.palette.secondary.light,
                      transform: 'translateX(10px)',
                    },
                    '&::before': {
                      content: '""',
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255,255,255,0.5)',
                      marginRight: '10px',
                      transition: 'all 0.3s ease',
                    },
                    '&:hover::before': {
                      backgroundColor: theme.palette.secondary.light,
                    },
                  }}
                >
                  {link.text}
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" gutterBottom sx={{ 
              fontWeight: 600,
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: '-8px',
                left: 0,
                width: '40px',
                height: '3px',
                background: theme.palette.secondary.main,
                borderRadius: '2px',
              }
            }}>
              Contact Us
            </Typography>
            <Stack spacing={3} sx={{ mt: 4 }}>
              {[
                { icon: <LocationOn />, text: "123 Craft Street, Colombo 10, Sri Lanka" },
                { icon: <Phone />, text: "+94 11 234 5678" },
                { icon: <Email />, text: "info@handicraftstore.com" },
              ].map((contact, index) => (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 1.5,
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateX(5px)',
                      background: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  <Box sx={{
                    p: 1,
                    borderRadius: 1,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  }}>
                    {contact.icon}
                  </Box>
                  <Typography variant="body2">{contact.text}</Typography>
                </Paper>
              ))}
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ 
          my: 6,
          borderColor: 'rgba(255,255,255,0.1)',
          '&::before, &::after': {
            borderColor: 'rgba(255,255,255,0.1)',
          }
        }} />

        {/* Copyright */}
        <Box sx={{ 
          textAlign: "center",
          py: 2,
        }}>
          <Typography 
            variant="body2" 
            sx={{
              opacity: 0.8,
              letterSpacing: 0.5,
              '&:hover': {
                opacity: 1,
              },
              transition: 'opacity 0.3s ease',
            }}
          >
            © {currentYear} Handicraft Store. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;