import React, { useState, useEffect } from 'react';
import { Box, Fab, Dialog, DialogTitle, DialogContent, IconButton, Alert } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import Chatbot from './Chatbot';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const FloatingChatbot = () => {
  const [open, setOpen] = useState(false);
  const [isBackendAvailable, setIsBackendAvailable] = useState(true);
  const [error, setError] = useState(null);

  // Check if backend is available
  useEffect(() => {
    const checkBackend = async () => {
      try {
        await axios.get(`${BACKEND_URL}/api/customer/chat/messages`);
        setIsBackendAvailable(true);
        setError(null);
      } catch (err) {
        console.error("Backend connection error:", err);
        setIsBackendAvailable(false);
        setError("Chat service is currently unavailable. Please try again later.");
      }
    };
    
    checkBackend();
  }, []);

  const handleClickOpen = () => {
    if (isBackendAvailable) {
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Fab
        color="primary"
        aria-label="chat"
        onClick={handleClickOpen}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          backgroundColor: isBackendAvailable ? '#5D4037' : '#9e9e9e',
          '&:hover': {
            backgroundColor: isBackendAvailable ? '#4E342E' : '#757575',
          },
          zIndex: 1000,
        }}
      >
        <ChatIcon />
      </Fab>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            height: '80vh',
            maxHeight: '600px',
            borderRadius: '12px',
          },
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: '#5D4037',
          color: 'white'
        }}>
          Chat with Us
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Chatbot />
        </DialogContent>
      </Dialog>
      {!isBackendAvailable && (
        <Alert 
          severity="warning" 
          sx={{ 
            position: 'fixed', 
            bottom: 80, 
            right: 20, 
            zIndex: 1000,
            maxWidth: 300,
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            borderRadius: '8px',
          }}
        >
          {error}
        </Alert>
      )}
    </>
  );
};

export default FloatingChatbot; 