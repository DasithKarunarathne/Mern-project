import React from "react";
import { Box, Typography, Container } from "@mui/material";
import { styled } from "@mui/material/styles";

const AboutSection = styled(Box)(({ theme }) => ({
  backgroundColor: "#FFF8E1", // Light cream background for a warm feel
  padding: theme.spacing(6),
  textAlign: "center",
  borderRadius: theme.spacing(2),
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  margin: theme.spacing(4, 0),
}));

const About = () => {
  return (
    <Container maxWidth="md">
      <AboutSection>
        <Typography variant="h3" gutterBottom sx={{ color: "#3E2723", fontWeight: 700 }}>
          About Us
        </Typography>
        <Typography variant="h5" gutterBottom sx={{ color: "#5D4037", mb: 3 }}>
          Heritage Hands
        </Typography>
        <Typography variant="body1" paragraph sx={{ color: "#4A322B", lineHeight: 1.8 }}>
          Welcome to <strong>Heritage Hands</strong>, Sri Lanka’s premier online handicraft management system, dedicated to celebrating the rich cultural heritage and skilled artistry of our island’s handicraft workers. We are more than just an e-commerce platform—we are a bridge connecting the timeless craftsmanship of Sri Lankan artisans to a global audience, while empowering the talented workers behind every masterpiece.
        </Typography>
        <Typography variant="body1" paragraph sx={{ color: "#4A322B", lineHeight: 1.8 }}>
          Heritage Hands was born out of a vision to support and streamline operations for a handicraft factory in Sri Lanka, where a diverse community of artisans—woodcarvers, weavers, potters, and more—pour their creativity and expertise into creating unique, handcrafted products. From intricately carved wooden sculptures to vibrant handwoven textiles, each piece tells a story of tradition, dedication, and cultural pride.
        </Typography>
        <Typography variant="body1" paragraph sx={{ color: "#4A322B", lineHeight: 1.8 }}>
          Our platform serves as a digital showcase for these exquisite creations, allowing customers from around the world to explore and purchase authentic Sri Lankan handicrafts online. Whether you’re looking for a statement piece for your home, a thoughtful gift, or a piece of Sri Lanka’s heritage to cherish, Heritage Hands offers a curated collection that reflects the beauty and diversity of our artisans’ work.
        </Typography>
        <Typography variant="body1" paragraph sx={{ color: "#4A322B", lineHeight: 1.8 }}>
          Beyond providing a marketplace, Heritage Hands is committed to supporting the artisans and the factory behind the scenes. Our system streamlines the management of the handicraft production process, from employee oversight to inventory tracking, ensuring that the artisans can focus on what they do best—creating. By shopping with us, you’re not just buying a product; you’re supporting the livelihoods of skilled workers and preserving the traditions that have been passed down through generations in Sri Lanka.
        </Typography>
        <Typography variant="body1" paragraph sx={{ color: "#4A322B", lineHeight: 1.8 }}>
          Join us on this journey to celebrate craftsmanship, culture, and community. At Heritage Hands, every product is a testament to the hands that craft heritage with love and care.
        </Typography>
      </AboutSection>
    </Container>
  );
};

export default About;