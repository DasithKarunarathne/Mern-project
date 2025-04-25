import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Breadcrumbs,
  Link,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import LogoutButton from './LogoutButton';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: 'rgba(93, 64, 55, 0.95)',
  backdropFilter: 'blur(8px)',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  position: 'relative',
}));

const ManagerHeader = ({ title, breadcrumbs = [] }) => {
  return (
    <StyledAppBar position="static">
      <Toolbar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" component="div" sx={{ mb: breadcrumbs.length ? 1 : 0 }}>
            {title}
          </Typography>
          {breadcrumbs.length > 0 && (
            <Breadcrumbs aria-label="breadcrumb" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              <Link
                component={RouterLink}
                to="/manager"
                color="inherit"
                sx={{ textDecoration: 'none' }}
              >
                Manager Dashboard
              </Link>
              {breadcrumbs.map((crumb, index) => (
                <Link
                  key={index}
                  component={RouterLink}
                  to={crumb.path}
                  color="inherit"
                  sx={{ textDecoration: 'none' }}
                >
                  {crumb.label}
                </Link>
              ))}
              <Typography color="inherit">{title}</Typography>
            </Breadcrumbs>
          )}
        </Box>
        <LogoutButton />
      </Toolbar>
    </StyledAppBar>
  );
};

export default ManagerHeader; 