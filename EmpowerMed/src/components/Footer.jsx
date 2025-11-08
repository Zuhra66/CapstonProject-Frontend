// src/components/Footer.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "../styles/Footer.module.css";

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // HIPAA compliant: Don't store health information in newsletter
    console.log("Newsletter signup:", email);
    setEmail("");
    alert("Thank you for subscribing to our wellness newsletter!");
  };

  return (
    <footer className={styles.footerSection}>
      <div className="container">
        <div className={styles.footerContent}>
          {/* Left side - Branding & Navigation */}
          <div className={styles.footerLeft}>
            <h3>EmpowerMEd</h3>
            <nav className={styles.footerNav} aria-label="Footer navigation">
              <Link to="/">Home</Link>
              <Link to="/services">Services</Link>
              <Link to="/products">Products</Link>
              <Link to="/blog">Blog</Link>
              <Link to="/education">Educational Hub</Link>
              <Link to="/events">Events</Link>
              <Link to="/about">About</Link>
            </nav>
            <div className={styles.footerSocial}>
              <a href="mailto:contact@empowermedwellness.com" aria-label="Email us">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Follow on Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/>
                </svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Follow on Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Right side - Newsletter & Copyright */}
          <div className={styles.footerRight}>
            <div className={styles.newsletter}>
              <h4 className={styles.newsletterTitle}>Stay in the loop</h4>
              <p className={styles.newsletterDescription}>
                Get wellness tips and updates 
              </p>
              <form className={styles.newsletterForm} onSubmit={handleNewsletterSubmit}>
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className={styles.newsletterInput}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                  aria-label="Email for newsletter"
                />
                <button type="submit" className={styles.newsletterButton}>
                  Sign Up
                </button>
              </form>
            </div>
            <div className={styles.footerBottom}>
              <p className={styles.footerCopyright}>
                © {new Date().getFullYear()} EmpowerMEd LLC. All rights reserved.
              </p>
              <div className={styles.footerLegal}>
                <Link to="/privacy">Privacy Policy</Link>
                <Link to="/terms">Terms of Service</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}