import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Handicraft Store
        </Typography>
        <Button color="inherit" component={Link} to="/product/">
          Home
        </Button>
        <Button color="inherit" component={Link} to="/product/cart">
          Cart
        </Button>
        <Button color="inherit" component={Link} to="/product/order-history">
          Order History
        </Button>
        <Button color="inherit" component={Link} to="/product/manager">
          Manage Products
        </Button>
        <Button color="inherit" component={Link} to="/product/admin/refund-management">
          Refund Management
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;