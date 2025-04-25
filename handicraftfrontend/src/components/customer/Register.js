import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

// Set a base URL for Axios
axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    console.log("Form data being sent:", formData); // Debugging

    try {
      const res = await axios.post("/api/auth/register", formData);
      localStorage.setItem("token", res.data.token);
      window.location.href = "/customer/profile";
    } catch (err) {
      console.error("Error response:", err.response?.data || err.message);
      alert(err.response?.data?.msg || "Registration failed");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundImage: `url("https://example.com/image.jpg")`,
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
            Register on our website today to easily manage your orders, track
            purchases, and get exclusive offers! Signing up is quick and gives
            you access to personalized recommendations and a seamless shopping
            experience. Don't miss out—join us now!
          </p>
        </div>

        {/* Right Section: Register Form */}
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
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={onChange}
                placeholder="Full Name"
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
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={onChange}
                placeholder="name@email.com"
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
              Register
            </button>
            <Link to="/login">
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
                Login
              </button>
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
