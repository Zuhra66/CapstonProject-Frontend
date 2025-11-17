import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth0 } from '@auth0/auth0-react';
import LogoutButton from './LogoutButton.jsx';
import logo from '../assets/logo.png';
import logoCropped from '../assets/logo-cropped.png';
import styles from "../styles/Navbar.module.css";
import { UserCog } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, isLoading, loginWithRedirect, logout } = useAuth0();

  if (isLoading) return null;

  const displayName = user?.given_name && user?.family_name
    ? `${user.given_name} ${user.family_name}`
    : user?.name || user?.email || 'Account';

  return (
    <nav className={styles.navbar}>
      <div className="container">
        <div className={styles.navbarContent}>
          {/* Logo + Text (stacked vertically) */}
          <Link to="/" className={styles.navbarBrand}>
            <div className={styles.logoContainer}>
              <img src={logoCropped} alt="EmpowerMEd Logo" className={styles.navbarLogoImg} />
              <span className={styles.logoText}>EmpowerMEd</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className={styles.navbarNav}>
            <NavLink to="/" end className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}>
              Home
            </NavLink>
            <NavLink to="/services" className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}>
              Services
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
                  <span className={styles.userName}>{displayName}</span>
                  <div className={styles.dropdownArrow}>▼</div>
                </div>
                <div className={styles.dropdownMenu}>
                    <Link to="/account" className={styles.dropdownItem}>
                      <UserCog className={styles.icon} size={18} strokeWidth={1.8} />
                      Account Settings
                    </Link>
                  <div
                    className={styles.dropdownItem}
                    onClick={() => logout({ returnTo: window.location.origin })}
                  >
                    Logout
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
            <NavLink to="/services" onClick={() => setIsOpen(false)}>Services</NavLink>
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
                <span>{displayName}</span>
                <Link to="/account" onClick={() => setIsOpen(false)}>Account</Link>
                <button onClick={() => logout({ returnTo: window.location.origin })}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}