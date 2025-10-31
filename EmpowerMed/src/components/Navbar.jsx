
// src/components/Navbar.jsx
import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion } from "framer-motion"; 
import styles from "../styles/Navbar.module.css";
import logo from "../assets/logo-cropped.png";

import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import '../styles/navbar.css';
import logo from '../assets/logo.png';


export default function EmpowerMedNavbar() {
  const [open, setOpen] = useState(false);

  return (

    <header className={styles.wrap}>
      <div className={styles.container}>
        {/* Brand */}
        <Link to="/" className={styles.brand} onClick={() => setOpen(false)}>
          <motion.img
            src={logo}
            alt="EmpowerMEd"
            className={styles.logo}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          />
          <motion.span
            className={styles.brandText}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.15 }}
          >
            EmpowerMEd
          </motion.span>
        </Link>

        <Navbar expand="lg" fixed="top" className="empowermed-navbar">
          <Container>
            <Navbar.Brand href="/" className="navbar-logo">
              <img src={logo} alt="EmpowerMEd Logo" className="navbar-logo-img" />
              <span>EmpowerMEd</span>
            </Navbar.Brand>


            {/* Mobile toggle */}
            <button
              className={styles.burger}
              aria-label="Toggle navigation"
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              <span />
              <span />
              <span />
            </button>

            {/* Nav */}
            <nav className={`${styles.nav} ${open ? styles.navOpen : ""}`}>
              <ul className={styles.links}>
                <li><NavLink to="/" end className={({isActive}) => isActive ? styles.active : undefined} onClick={() => setOpen(false)}>Home</NavLink></li>
                <li><NavLink to="/membership" className={({isActive}) => isActive ? styles.active : undefined} onClick={() => setOpen(false)}>Membership</NavLink></li>
                <li><NavLink to="/products" className={({isActive}) => isActive ? styles.active : undefined} onClick={() => setOpen(false)}>Products</NavLink></li>
                <li><NavLink to="/blog" className={({isActive}) => isActive ? styles.active : undefined} onClick={() => setOpen(false)}>Blog</NavLink></li>
                <li><NavLink to="/education" className={({isActive}) => isActive ? styles.active : undefined} onClick={() => setOpen(false)}>Educational Hub</NavLink></li>
                <li><NavLink to="/events" className={({isActive}) => isActive ? styles.active : undefined} onClick={() => setOpen(false)}>Events</NavLink></li>
                <li><NavLink to="/about" className={({isActive}) => isActive ? styles.active : undefined} onClick={() => setOpen(false)}>About</NavLink></li>
              </ul>

              <div className={styles.actions}>
                <Link to="/login" className={`${styles.btn} ${styles.btnLogin}`} onClick={() => setOpen(false)}>Login</Link>
                <Link to="/signup" className={`${styles.btn} ${styles.btnSignUp}`} onClick={() => setOpen(false)}>Sign Up</Link>
              </div>
            </nav>
          </Container>
        </Navbar>
      </div>
    </header>
  );
}
