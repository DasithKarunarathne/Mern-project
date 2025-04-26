import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function CustomerDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await axios.get("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (err) {
        setError("Failed to fetch user data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "40px",
          padding: "20px",
          background: "#f8f9fa",
          borderRadius: "10px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <div>
          <h1 style={{ margin: "0", color: "#333" }}>
            Welcome, {user?.fullName}
          </h1>
          <p style={{ margin: "5px 0 0", color: "#666" }}>
            {user?.email}
          </p>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
          style={{
            padding: "10px 20px",
            background: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
          marginBottom: "40px",
        }}
      >
        <div
          style={{
            padding: "20px",
            background: "white",
            borderRadius: "10px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ margin: "0 0 10px", color: "#333" }}>My Orders</h3>
          <p style={{ margin: "0", color: "#666" }}>
            View and track your orders
          </p>
          <Link
            to="/customer/orders"
            style={{
              display: "inline-block",
              marginTop: "15px",
              padding: "8px 15px",
              background: "#007bff",
              color: "white",
              textDecoration: "none",
              borderRadius: "5px",
            }}
          >
            View Orders
          </Link>
        </div>

        <div
          style={{
            padding: "20px",
            background: "white",
            borderRadius: "10px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ margin: "0 0 10px", color: "#333" }}>Profile Settings</h3>
          <p style={{ margin: "0", color: "#666" }}>
            Update your personal information
          </p>
          <Link
            to="/customer/profile"
            style={{
              display: "inline-block",
              marginTop: "15px",
              padding: "8px 15px",
              background: "#28a745",
              color: "white",
              textDecoration: "none",
              borderRadius: "5px",
            }}
          >
            Edit Profile
          </Link>
        </div>

        <div
          style={{
            padding: "20px",
            background: "white",
            borderRadius: "10px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ margin: "0 0 10px", color: "#333" }}>Support</h3>
          <p style={{ margin: "0", color: "#666" }}>
            Need help? Contact our support team
          </p>
          <Link
            to="/customer/support"
            style={{
              display: "inline-block",
              marginTop: "15px",
              padding: "8px 15px",
              background: "#6c757d",
              color: "white",
              textDecoration: "none",
              borderRadius: "5px",
            }}
          >
            Get Help
          </Link>
        </div>
      </div>

      <section
        style={{
          padding: "20px",
          background: "white",
          borderRadius: "10px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ margin: "0 0 20px", color: "#333" }}>Recent Activity</h2>
        <p style={{ color: "#666" }}>No recent activity to display.</p>
      </section>
    </div>
  );
}

export default CustomerDashboard; 