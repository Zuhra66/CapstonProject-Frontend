// src/components/Navbar.jsx
import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import logoCropped from "../assets/logo-cropped.png";
import styles from "../styles/Navbar.module.css";
import { UserCog } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    isAuthenticated, 
    isLoading, 
    user, 
    getAccessTokenSilently, // ADD THIS
    loginWithRedirect, 
    logout 
  } = useAuth0();
  const [backendUser, setBackendUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  // Fetch backend user data
  useEffect(() => {
    let alive = true;

    const fetchBackendUser = async () => {
      if (!isAuthenticated) {
        setBackendUser(null);
        setUserLoading(false);
        return;
      }

      try {
        setUserLoading(true);
        
        // Get the access token from Auth0
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          }
        });

        console.log('🔄 Fetching backend user with token...');

        const response = await fetch(`${API}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include',
        });

        if (!alive) return;

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Backend user data:', data.user);
          setBackendUser(data.user);
        } else {
          console.log('❌ Backend user fetch failed with status:', response.status);
          setBackendUser(null);
        }
      } catch (error) {
        console.error('❌ Failed to fetch backend user:', error);
        setBackendUser(null);
      } finally {
        if (alive) setUserLoading(false);
      }
    };

    fetchBackendUser();

    return () => {
      alive = false;
    };
  }, [isAuthenticated, getAccessTokenSilently]); // Add getAccessTokenSilently to dependencies

  // Prevent body scroll when mobile nav is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const displayName = backendUser?.name || 
    user?.name || 
    (user?.given_name ? `${user.given_name} ${user.family_name ? user.family_name[0] + "." : ""}` : "") || 
    user?.email || 
    "Account";

  const isAdmin = !!(backendUser?.is_admin || backendUser?.role === 'Administrator');

  const handleLogin = () => {
    loginWithRedirect({
      appState: { returnTo: window.location.pathname }
    });
  };

  const handleSignup = () => {
    loginWithRedirect({
      screen_hint: "signup",
      appState: { returnTo: window.location.pathname }
    });
  };

  const handleLogout = () => {
    logout({ 
      logoutParams: { 
        returnTo: window.location.origin 
      } 
    });
  };

  if (isLoading || userLoading) {
    return (
      <nav className={styles.navbar}>
        <div className="container">
          <div className={styles.navbarContent}>
            <Link to="/" className={styles.navbarBrand}>
              <div className={styles.logoContainer}>
                <img src={logoCropped} alt="EmpowerMEd Logo" className={styles.navbarLogoImg} />
                <span className={styles.logoText}>EmpowerMEd</span>
              </div>
            </Link>
            <div className={styles.navbarAuth}>
              <div>Loading...</div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className={styles.navbar}>
      <div className="container">
        <div className={styles.navbarContent}>
          {/* Logo + Text */}
          <Link to="/" className={styles.navbarBrand}>
            <div className={styles.logoContainer}>
              <img src={logoCropped} alt="EmpowerMEd Logo" className={styles.navbarLogoImg} />
              <span className={styles.logoText}>EmpowerMEd</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className={styles.navbarNav}>
            <NavLink to="/" end className={({ isActive }) => isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}>Home</NavLink>
            <NavLink to="/services" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}>Services</NavLink>
            <NavLink to="/membership" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}>Membership</NavLink>
            <NavLink to="/products" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}>Products</NavLink>
            <NavLink to="/blog" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}>Blog</NavLink>
            <NavLink to="/education" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}>Education</NavLink>
            <NavLink to="/events" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}>Events</NavLink>
            <NavLink to="/about" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}>About</NavLink>

            {/* Admin Link */}
            {isAdmin && (
              <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}>Admin</NavLink>
            )}
          </div>

          {/* Auth Section */}
          <div className={styles.navbarAuth}>
            {!isAuthenticated ? (
              <div className={styles.authButtons}>
                <button className={styles.loginBtn} onClick={handleLogin}>Login</button>
                <button className={styles.signupBtn} onClick={handleSignup}>Sign Up</button>
              </div>
            ) : (
              <div className={styles.userDropdown}>
                <div className={styles.userInfo}>
                  <img src={user?.picture || "/default-avatar.png"} alt="User avatar" className={styles.userAvatar} />
                  <span className={styles.userName}>{displayName}</span>
                  <div className={styles.dropdownArrow}>▼</div>
                </div>
                <div className={styles.dropdownMenu}>
                  <Link to="/account" className={styles.dropdownItem}>
                    <UserCog className={styles.icon} size={18} strokeWidth={1.8} />
                    Account Settings
                  </Link>

                  {isAdmin && (
                    <Link to="/admin/dashboard" className={styles.dropdownItem}>
                      <UserCog className={styles.icon} size={18} strokeWidth={1.8} />
                      Admin Dashboard
                    </Link>
                  )}

                  <div className={styles.dropdownItem} onClick={handleLogout}>Logout</div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button className={styles.navbarToggle} onClick={() => setIsOpen(!isOpen)} aria-label="Toggle navigation">
            <span className={isOpen ? styles.toggleOpen : ""}></span>
            <span className={isOpen ? styles.toggleOpen : ""}></span>
            <span className={isOpen ? styles.toggleOpen : ""}></span>
          </button>
        </div>

        {/* Mobile Nav */}
        <div className={`${styles.mobileNav} ${isOpen ? styles.mobileNavOpen : ""}`}>
          <div className={styles.mobileNavContent}>
            <NavLink to="/" onClick={() => setIsOpen(false)}>Home</NavLink>
            <NavLink to="/services" onClick={() => setIsOpen(false)}>Services</NavLink>
            <NavLink to="/membership" onClick={() => setIsOpen(false)}>Membership</NavLink>
            <NavLink to="/products" onClick={() => setIsOpen(false)}>Products</NavLink>
            <NavLink to="/blog" onClick={() => setIsOpen(false)}>Blog</NavLink>
            <NavLink to="/education" onClick={() => setIsOpen(false)}>Education</NavLink>
            <NavLink to="/events" onClick={() => setIsOpen(false)}>Events</NavLink>
            <NavLink to="/about" onClick={() => setIsOpen(false)}>About</NavLink>

            {isAdmin && (
              <NavLink to="/admin/dashboard" onClick={() => setIsOpen(false)}>Admin Dashboard</NavLink>
            )}

            {/* Mobile Auth Section */}
            <div className={styles.mobileAuthSection}>
              {!isAuthenticated ? (
                <div className={styles.mobileAuth}>
                  <button className={styles.mobileLoginBtn} onClick={() => { handleLogin(); setIsOpen(false); }}>Login</button>
                  <button className={styles.mobileSignupBtn} onClick={() => { handleSignup(); setIsOpen(false); }}>Sign Up</button>
                </div>
              ) : (
                <div className={styles.mobileUser}>
                  <div className={styles.mobileUserInfo}>
                    <img src={user?.picture || "/default-avatar.png"} alt="User" className={styles.mobileUserAvatar} />
                    <span className={styles.mobileUserName}>{displayName}</span>
                  </div>
                  <Link to="/account" className={styles.mobileAccountBtn} onClick={() => setIsOpen(false)}>Account Settings</Link>
                  {isAdmin && (
                    <Link to="/admin/dashboard" className={styles.mobileAccountBtn} onClick={() => setIsOpen(false)}>Admin Dashboard</Link>
                  )}
                  <button className={styles.mobileLogoutBtn} onClick={() => { handleLogout(); setIsOpen(false); }}>Logout</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}