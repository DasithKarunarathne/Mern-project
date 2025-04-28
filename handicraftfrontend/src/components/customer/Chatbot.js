import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Typography, TextField, Button, Box, Alert } from "@mui/material";
import ChatMessage from "./ChatMessage";

// Update the base URL to point to the backend server
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
const api = axios.create({
  baseURL: `${BACKEND_URL}/api/customer/chat`,
});

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState(null);
  const [isBackendAvailable, setIsBackendAvailable] = useState(true);
  const messagesEndRef = useRef(null);
  const token = localStorage.getItem("token");

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
        setError("Cannot connect to the chat server. Please try again later.");
      }
    };
    
    checkBackend();
  }, []);

  const fetchMessages = async () => {
    if (!token) return;
    
    try {
      const response = await api.get("/messages", {
        headers: { "x-auth-token": token },
        cache: "no-store",
      });
      setMessages(response.data);
      scrollToBottom();
    } catch (error) {
      console.error("FETCH - Error fetching messages:", error);
      setMessages([]);
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (token) {
      fetchMessages();
    }
  }, [token]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !token) return;

    try {
      await api.post("/message", { text: input }, { headers: { "x-auth-token": token } });
      setInput("");
      await fetchMessages();
    } catch (error) {
      console.error("SEND - Error sending message:", error);
    }
  };

  const clearMessages = async () => {
    if (!token) return;

    try {
      await api.delete("/messages", { headers: { "x-auth-token": token } });
      setMessages([]);
      await fetchMessages();
    } catch (error) {
      console.error("CLEAR - Error clearing messages:", error);
      setMessages([]);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!token) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Please log in to use the chat feature.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "white",
      }}
    >
      {!isBackendAvailable && (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      )}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        {messages.map((msg) => (
          <ChatMessage key={msg._id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </Box>
      <Box 
        component="form" 
        onSubmit={sendMessage} 
        sx={{ 
          p: 2, 
          borderTop: "1px solid #e0e0e0",
          display: "flex", 
          gap: 1,
          background: "#f5f5f5"
        }}
      >
        <TextField
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about our handicrafts..."
          variant="outlined"
          size="small"
          disabled={!isBackendAvailable}
          sx={{ 
            background: "white",
            borderRadius: 1,
            '& .MuiOutlinedInput-root': {
              borderRadius: 1,
            }
          }}
        />
        <Button 
          type="submit" 
          variant="contained" 
          color="primary"
          disabled={!isBackendAvailable}
          sx={{
            backgroundColor: "#5D4037",
            '&:hover': {
              backgroundColor: "#4E342E",
            }
          }}
        >
          Send
        </Button>
      </Box>
      <Box 
        sx={{ 
          p: 1, 
          textAlign: "center",
          borderTop: "1px solid #e0e0e0",
          background: "#f5f5f5"
        }}
      >
        <Button 
          onClick={clearMessages} 
          variant="outlined" 
          color="secondary"
          size="small"
          disabled={!isBackendAvailable}
          sx={{
            color: "#5D4037",
            borderColor: "#5D4037",
            '&:hover': {
              borderColor: "#4E342E",
              backgroundColor: "rgba(93, 64, 55, 0.04)",
            }
          }}
        >
          Clear Chat
        </Button>
      </Box>
    </Box>
  );
};

export default Chatbot;