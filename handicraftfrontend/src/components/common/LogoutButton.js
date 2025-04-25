import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';

const LogoutButton = ({ color = 'inherit', variant = 'text' }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem('managerType');
    navigate('/');
  };

  return (
    <Button
      color={color}
      variant={variant}
      onClick={handleLogout}
      startIcon={<LogoutIcon />}
      sx={{
        borderRadius: '12px',
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        },
      }}
    >
      Logout
    </Button>
  );
};

export default LogoutButton; 