import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div>
      <h1>Welcome to Handicraft Frontend</h1>
      <nav>
        <ul>
          <li>
            <Link to="/hr">Go to HR Section</Link>
          </li>
          <li>
            <Link to="/finance/dashboard">Go to Finance Section</Link>
          </li>
          <li>
            <Link to="/product">Go to Product Section</Link>
          </li>

          <li>
            <Link to="/customer">Go to Customer Section</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default HomePage;