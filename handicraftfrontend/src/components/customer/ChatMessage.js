import React from "react";
import { Box, Typography } from "@mui/material";

function ChatMessage({ message }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: message.isBot ? "flex-start" : "flex-end",
        mb: 1,
      }}
    >
      <Box
        sx={{
          maxWidth: "70%",
          p: 1,
          borderRadius: 2,
          background: message.isBot ? "#5D4037" : "#FFD700",
          color: message.isBot ? "white" : "black",
          boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Typography variant="body2">{message.text}</Typography>
      </Box>
    </Box>
  );
}

export default ChatMessage;