import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Login() {
  const [formData, setFormData] = useState({ username: "", password: "" });

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/auth/login", formData);
      localStorage.setItem("token", res.data.token);
      window.location.href = "/customer/profile";//check if this is the correct path
    } catch (err) {
      console.error(err.response.data);
      alert(err.response.data.msg || "Login failed");
    }
  };

  const handleClick = () => {
    // Handle forget password click
    alert("Forget password clicked");
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #4a90e2, #87ceeb)", // Blue gradient background
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          width: "900px",
          height: "500px",
          background: "rgba(255, 255, 255, 0.1)", // Slight transparency for the card
          borderRadius: "20px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
        }}
      >
        {/* Left Section: Welcome Message */}
        <div
          style={{
            flex: 1,
            background: "#4a90e2", // Solid blue background
            padding: "40px",
            color: "white",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "50px",
              height: "50px",
              background: "white",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#4a90e2",
              fontWeight: "bold",
              marginBottom: "20px",
            }}
          >
            YOUR LOGO
          </div>
          <h1 style={{ fontSize: "36px", margin: "0 0 10px" }}>
            Hello, Welcome!
          </h1>
          <p style={{ fontSize: "14px", opacity: 0.8 }}>
            Handcrafting is a timeless art that brings creativity and skill
            together. Each piece is crafted with care, reflecting tradition and
            passion
          </p>
        </div>

        {/* Right Section: Login Form */}
        <div
          style={{
            flex: 1,
            background: "white",
            padding: "40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <form onSubmit={onSubmit}>
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  color: "#333",
                  marginBottom: "5px",
                }}
              >
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={onChange}
                placeholder="Username"
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  fontSize: "14px",
                }}
              />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  color: "#333",
                  marginBottom: "5px",
                }}
              >
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={onChange}
                placeholder="Password"
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  fontSize: "14px",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                fontSize: "14px",
              }}
            >
              <label style={{ display: "flex", alignItems: "center" }}>
                <input type="checkbox" style={{ marginRight: "5px" }} />{" "}
                Remember me
              </label>
              <button
                type="button"
                onClick={handleClick}
                style={{
                  background: "none",
                  border: "none",
                  color: "#4a90e2",
                  textDecoration: "none",
                  cursor: "pointer",
                }}
              >
                Forget password?
              </button>
            </div>
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "10px",
                border: "none",
                borderRadius: "5px",
                fontSize: "16px",
                cursor: "pointer",
                background: "#4a90e2",
                color: "white",
                marginBottom: "10px",
              }}
            >
              Login
            </button>
            <Link to="/customer/register">
              <button
                type="button"
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #4a90e2",
                  borderRadius: "5px",
                  fontSize: "16px",
                  cursor: "pointer",
                  background: "transparent",
                  color: "#4a90e2",
                }}
              >
                Sign up
              </button>
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
