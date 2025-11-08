// src/components/Navbar.jsx
import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth0 } from '@auth0/auth0-react';
import LogoutButton from './LogoutButton.jsx';
import logo from '../assets/logo.png';
import styles from "../styles/Navbar.module.css";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  if (isLoading) return null;

  return (
    <nav className={styles.navbar}>
      <div className="container">
        <div className={styles.navbarContent}>
          {/* Logo + Text (stacked vertically) */}
          <Link to="/" className={styles.navbarBrand}>
            <div className={styles.logoContainer}>
              <img src={logo} alt="EmpowerMEd Logo" className={styles.navbarLogoImg} />
              <span className={styles.logoText}>EmpowerMEd</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className={styles.navbarNav}>
            <NavLink to="/" end className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}>
              Home
            </NavLink>
            <NavLink to="/membership" className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}>
              Membership
            </NavLink>
            <NavLink to="/products" className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}>
              Products
            </NavLink>
            <NavLink to="/blog" className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}>
              Blog
            </NavLink>
            <NavLink to="/education" className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}>
              Education
            </NavLink>
            <NavLink to="/events" className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}>
              Events
            </NavLink>
            <NavLink to="/about" className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}>
              About
            </NavLink>
          </div>

          {/* Auth Section */}
          <div className={styles.navbarAuth}>
            {!isAuthenticated ? (
              <div className={styles.authButtons}>
                <button className={styles.loginBtn} onClick={() => loginWithRedirect()}>
                  Login
                </button>
                <button className={styles.signupBtn} onClick={() => loginWithRedirect({ screen_hint: 'signup' })}>
                  Sign Up
                </button>
              </div>
            ) : (
              <div className={styles.userDropdown}>
                <div className={styles.userInfo}>
                  <img src={user.picture} alt="User avatar" className={styles.userAvatar} />
                  <span className={styles.userName}>
                    {user.given_name || user.name || user.nickname || user.email}
                  </span>
                  <div className={styles.dropdownArrow}>▼</div>
                </div>
                <div className={styles.dropdownMenu}>
                  <Link to="/account" className={styles.dropdownItem}>
                    👤 Account Settings
                  </Link>
                  <div className={styles.dropdownItem}>
                    <LogoutButton />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className={styles.navbarToggle}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation"
          >
            <span className={isOpen ? styles.toggleOpen : ''}></span>
            <span className={isOpen ? styles.toggleOpen : ''}></span>
            <span className={isOpen ? styles.toggleOpen : ''}></span>
          </button>
        </div>

        {/* Mobile Nav */}
        <div className={`${styles.mobileNav} ${isOpen ? styles.mobileNavOpen : ''}`}>
          <div className={styles.mobileNavContent}>
            <NavLink to="/" onClick={() => setIsOpen(false)}>Home</NavLink>
            <NavLink to="/membership" onClick={() => setIsOpen(false)}>Membership</NavLink>
            <NavLink to="/products" onClick={() => setIsOpen(false)}>Products</NavLink>
            <NavLink to="/blog" onClick={() => setIsOpen(false)}>Blog</NavLink>
            <NavLink to="/education" onClick={() => setIsOpen(false)}>Education</NavLink>
            <NavLink to="/events" onClick={() => setIsOpen(false)}>Events</NavLink>
            <NavLink to="/about" onClick={() => setIsOpen(false)}>About</NavLink>

            {!isAuthenticated ? (
              <div className={styles.mobileAuth}>
                <button onClick={() => loginWithRedirect()}>Login</button>
                <button onClick={() => loginWithRedirect({ screen_hint: 'signup' })}>Sign Up</button>
              </div>
            ) : (
              <div className={styles.mobileUser}>
                <img src={user.picture} alt="User" />
                <span>{user.given_name || user.name}</span>
                <Link to="/account" onClick={() => setIsOpen(false)}>Account</Link>
                <LogoutButton />
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
