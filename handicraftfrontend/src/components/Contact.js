import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  Grid,
  Paper,
  IconButton,
  useTheme,
  useMediaQuery,
  Fade,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  LocationOn,
  Phone,
  Email,
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
} from '@mui/icons-material';

const ContactContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(8, 4),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(4, 2),
  },
}));

const ContactCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.spacing(3),
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
}));

const ContactInfoCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.2)',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(1),
    transition: 'all 0.3s ease',
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderWidth: '2px',
    },
  },
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5, 4),
  borderRadius: theme.spacing(1),
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '1.1rem',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  },
}));

const SocialIcon = styled(IconButton)(({ theme }) => ({
  color: theme.palette.primary.contrastText,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-3px)',
    color: theme.palette.secondary.main,
  },
}));

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Here you would typically make an API call to your backend
      // For now, we'll simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (err) {
      setError('Failed to send message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ContactContainer maxWidth="lg">
      <Fade in timeout={500}>
        <Box>
          <Typography
            variant={isMobile ? "h3" : "h2"}
            align="center"
            sx={{
              mb: 6,
              fontWeight: 700,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Contact Us
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <ContactInfoCard>
                <Box sx={{ mb: 3 }}>
                  <LocationOn sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Our Location
                  </Typography>
                  <Typography variant="body1">
                    123 Handicraft Street,<br />
                    Colombo, Sri Lanka
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Phone sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Phone
                  </Typography>
                  <Typography variant="body1">
                    +94 11 234 5678
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Email sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Email
                  </Typography>
                  <Typography variant="body1">
                    info@handicraft.com
                  </Typography>
                </Box>

                <Box sx={{ mt: 'auto', pt: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Follow Us
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <SocialIcon>
                      <Facebook />
                    </SocialIcon>
                    <SocialIcon>
                      <Twitter />
                    </SocialIcon>
                    <SocialIcon>
                      <Instagram />
                    </SocialIcon>
                    <SocialIcon>
                      <LinkedIn />
                    </SocialIcon>
                  </Box>
                </Box>
              </ContactInfoCard>
            </Grid>

            <Grid item xs={12} md={8}>
              <ContactCard>
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <StyledTextField
                        fullWidth
                        label="Your Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <StyledTextField
                        fullWidth
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <StyledTextField
                        fullWidth
                        label="Subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <StyledTextField
                        fullWidth
                        label="Message"
                        name="message"
                        multiline
                        rows={4}
                        value={formData.message}
                        onChange={handleChange}
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <SubmitButton
                          type="submit"
                          variant="contained"
                          color="primary"
                          disabled={loading}
                          size="large"
                        >
                          {loading ? (
                            <CircularProgress size={24} color="inherit" />
                          ) : (
                            'Send Message'
                          )}
                        </SubmitButton>
                      </Box>
                    </Grid>
                  </Grid>
                </form>
              </ContactCard>
            </Grid>
          </Grid>
        </Box>
      </Fade>

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Your message has been sent successfully!
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </ContactContainer>
  );
};

export default Contact; 