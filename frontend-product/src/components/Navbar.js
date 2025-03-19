import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import './Navbar.css';

const Navbar = () => {
  return (
    <AppBar position="static" sx={{ backgroundColor: '#8B4513' }}>
      <Toolbar>
        <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: '#F5F5DC' }}>
          Handicraft Store
        </Typography>
        <Button color="inherit" component={Link} to="/">Shop</Button>
        <Button color="inherit" component={Link} to="/cart">Cart</Button>
        <Button color="inherit" component={Link} to="/delivery">Checkout</Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;