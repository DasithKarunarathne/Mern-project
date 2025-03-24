// src/components/customer/Home.js
import React from "react";
import { Link } from "react-router-dom";
import bg01 from "./images/back01.jpg"; // Adjust path if needed
import "./custHome.css"; // Import the extracted CSS

const CustHome = () => {
  return (
    <div
      className="home-container"
      style={{
        backgroundImage: `url(${bg01})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        height: "100vh",
      }}
    >
      <div className="home-content">
        <h1 className="home-title">Welcome</h1>
        <h2 className="home-subtitle">To Our Company</h2>
        <p className="home-description">
          Handcrafting is the art of creating unique, high-quality items with
          skill and precision. It has been a cherished tradition for centuries,
          passed down through generations to preserve craftsmanship and
          creativity.
        </p>
        <div className="home-buttons">
          <Link to="/customer/login">
            <button className="home-button">Login</button>
          </Link>
          <Link to="/customer/register">
            <button className="home-button">Register</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CustHome;