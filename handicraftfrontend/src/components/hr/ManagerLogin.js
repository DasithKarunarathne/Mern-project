import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from "@mui/material";
import { styled } from "@mui/material/styles";

const LoginContainer = styled(Box)({
  background: "linear-gradient(135deg, #8B4513 0%, #D2B48C 100%)",
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const LoginForm = styled(Box)({
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  padding: "24px",
  borderRadius: "16px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  width: "100%",
  maxWidth: 400,
  textAlign: "center",
});

const SubmitButton = styled(Button)({
  marginTop: "16px",
  backgroundColor: "#FFD700",
  color: "#3E2723",
  "&:hover": {
    backgroundColor: "#FFC107",
  },
});

const ManagerLogin = () => {
  const navigate = useNavigate();

  const [managerType, setManagerType] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!managerType) {
      setError("Please select a manager type.");
      return;
    }

    console.log("🔍 Sending login request:", { managerType, username, password });

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ managerType, username, password }),
      });

      const data = await response.json();
      console.log("🔍 Server response:", data);

      if (!response.ok) {
        setError(data.error || "Invalid username or password.");
      } else {
        localStorage.setItem("token", data.token);
        navigate(data.redirect);
      }
    } catch (err) {
      console.error("❌ Network error:", err);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <LoginContainer>
      <Container>
        <LoginForm component="form" onSubmit={handleSubmit}>
          <Typography variant="h4" sx={{ color: "#5D4037", fontWeight: 700 }}>
            Manager Login
          </Typography>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="manager-type-label">Manager Type</InputLabel>
            <Select
              labelId="manager-type-label"
              value={managerType}
              onChange={(e) => setManagerType(e.target.value)}
            >
              <MenuItem value="Product Manager">Product Manager</MenuItem>
              <MenuItem value="Inventory Manager">Inventory Manager</MenuItem>
              <MenuItem value="Finance Manager">Finance Manager</MenuItem>
              <MenuItem value="Human Resource Manager">Human Resource Manager</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
          />

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <SubmitButton type="submit" variant="contained" fullWidth>
            Login
          </SubmitButton>
        </LoginForm>
      </Container>
    </LoginContainer>
  );
};

export default ManagerLogin;
