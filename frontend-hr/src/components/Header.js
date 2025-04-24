import React from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";

const Header = () => {
  return (
    <AppBar 
      position="static" 
      sx={{ 
        backgroundColor: 'transparent',
        boxShadow: 'none',
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        color: 'text.primary'
      }}
    >
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
          Handicraft Store
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Header;