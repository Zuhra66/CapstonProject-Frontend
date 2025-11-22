// src/pages/NotFound.jsx
import React from "react";
import { Link } from "react-router-dom";
import '../styles/Global.css';

export default function NotFound() {
  return (
    <div className="notFoundContainer">
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link to="/" className="homeLink">Go back to Home</Link>
    </div>
  );
}
