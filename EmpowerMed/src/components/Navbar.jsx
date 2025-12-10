// Navbar.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import logoCropped from "../assets/logo.png";
import styles from "../styles/Navbar.module.css";
import { UserCog, ChevronDown, Menu } from "lucide-react";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5001").replace(/\/+$/, "");

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [backendUser, setBackendUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const location = useLocation();

  const { 
    isAuthenticated, 
    isLoading: isAuth0Loading, 
    user: auth0User, 
    getAccessTokenSilently,
    loginWithRedirect,
    logout,
  } = useAuth0();

  // Reset mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Determine when authentication is fully ready
  useEffect(() => {
    if (!isAuth0Loading) {
      setIsAuthReady(true);
    }
  }, [isAuth0Loading]);

  // Fetch backend user only when Auth0 is ready and user is authenticated
  useEffect(() => {
    let isActive = true;

    const fetchBackendUser = async () => {
      if (!isAuthenticated || !auth0User || !isAuthReady) {
        if (isActive) setBackendUser(null);
        return;
      }

      try {
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          },
        });

        const response = await fetch(`${API_BASE}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!isActive) return;

        if (response.ok) {
          const data = await response.json();
          if (isActive) setBackendUser(data.user);
        } else {
          if (isActive) setBackendUser(null);
        }
      } catch {
        if (isActive) setBackendUser(null);
      }
    };

    fetchBackendUser();

    return () => {
      isActive = false;
    };
  }, [isAuthenticated, auth0User, getAccessTokenSilently, isAuthReady]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Format user display name
  const displayName = React.useMemo(() => {
    if (!isAuthenticated || !auth0User) return null;
    
    if (backendUser?.first_name && backendUser?.last_name) {
      return `${backendUser.first_name} ${backendUser.last_name.charAt(0)}.`;
    }
    
    if (auth0User?.given_name && auth0User?.family_name) {
      return `${auth0User.given_name} ${auth0User.family_name.charAt(0)}.`;
    }
    
    if (auth0User?.name) {
      return auth0User.name;
    }
    
    if (auth0User?.email) {
      return auth0User.email.split("@")[0];
    }
    
    return "Account";
  }, [isAuthenticated, auth0User, backendUser]);

  // Check if user has admin privileges
  const isAdminUser = React.useMemo(() => {
    return !!(backendUser?.is_admin || backendUser?.role === 'Administrator');
  }, [backendUser]);

  // Authentication handlers
  const handleLogin = useCallback(() => {
    loginWithRedirect({
      appState: { returnTo: window.location.pathname },
    });
  }, [loginWithRedirect]);

  const handleSignup = useCallback(() => {
    loginWithRedirect({
      screen_hint: "signup",
      appState: { returnTo: window.location.pathname },
    });
  }, [loginWithRedirect]);

  const handleLogout = useCallback(() => {
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  }, [logout]);

  // Navigation links
  const primaryLinks = React.useMemo(() => [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/services", label: "Services" },
    { to: "/membership", label: "Membership" },
    { to: "/products", label: "Products" },
    { to: "/events", label: "Events" },
  ], []);

  const moreLinks = React.useMemo(() => [
    { to: "/blog", label: "Blog" },
    { to: "/education", label: "Education" },
    { to: "/appointment", label: "Appointments" },
  ], []);

  // Show loading state only during initial Auth0 load
  const showLoading = isAuth0Loading;

  return (
    <nav className={styles.navbar}>
      <div className="container">
        <div className={styles.navbarContent}>
          {/* Logo */}
          <Link to="/" className={styles.navbarBrand}>
            <div className={styles.logoContainer}>
              <img 
                src={logoCropped} 
                alt="EmpowerMEd Logo" 
                className={styles.navbarLogoImg} 
                loading="eager"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className={styles.navbarMain}>
            <div className={styles.navbarNav}>
              {primaryLinks.map(link => (
                <NavLink 
                  key={link.to}
                  to={link.to}
                  end={link.to === "/"}
                  className={({ isActive }) =>
                    isActive
                      ? `${styles.navLink} ${styles.navLinkActive}`
                      : styles.navLink
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              {/* More Menu */}
              <div 
                className={styles.moreMenu}
                onMouseEnter={() => setShowMoreMenu(true)}
                onMouseLeave={() => setShowMoreMenu(false)}
              >
                <button className={`${styles.navLink} ${styles.moreButton}`}>
                  More <ChevronDown size={16} />
                </button>
                
                {showMoreMenu && (
                  <div className={styles.moreDropdown}>
                    {moreLinks.map((link) => (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) =>
                          isActive
                            ? `${styles.dropdownLink} ${styles.dropdownLinkActive}`
                            : styles.dropdownLink
                        }
                        onClick={() => setShowMoreMenu(false)}
                      >
                        {link.label}
                      </NavLink>
                    ))}
                    
                    {isAdminUser && (
                      <NavLink 
                        to="/admin/dashboard"
                        className={({ isActive }) =>
                          isActive
                            ? `${styles.dropdownLink} ${styles.dropdownLinkActive}`
                            : styles.dropdownLink
                        }
                        onClick={() => setShowMoreMenu(false)}
                      >
                        Admin
                      </NavLink>
                    )}
                  </div>
                )}
              </div>

              {isAdminUser && !showMoreMenu && (
                <NavLink 
                  to="/admin/dashboard" 
                  className={({ isActive }) => 
                    isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                  }
                >
                  Admin
                </NavLink>
              )}
            </div>

            {/* Auth Section */}
            <div className={styles.navbarAuth}>
              {showLoading ? (
                <div className={styles.authLoading}>
                  <div className={styles.loadingSpinner}></div>
                </div>
              ) : !isAuthenticated ? (
                <div className={styles.authButtons}>
                  <button className={styles.loginBtn} onClick={handleLogin}>
                    Login
                  </button>
                  <div className={styles.signupContainer}>
                    <div className={styles.signupLink} onClick={handleSignup}>
                      <span className={styles.signupLine1}>New User?</span>
                      <span className={styles.signupLine2}>Sign Up</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={styles.userDropdown}>
                  <div className={styles.userInfo}>
                    <img 
                      src={auth0User?.picture || "/default-avatar.png"} 
                      alt="User avatar" 
                      className={styles.userAvatar} 
                    />
                    {displayName && (
                      <span className={styles.userName}>{displayName}</span>
                    )}
                    <div className={styles.dropdownArrow}>▼</div>
                  </div>
                  
                  <div className={styles.dropdownMenu}>
                    <Link to="/account" className={styles.dropdownItem}>
                      <UserCog className={styles.icon} size={18} strokeWidth={1.8} />
                      Account Settings
                    </Link>

                    {isAdminUser && (
                      <Link to="/admin/dashboard" className={styles.dropdownItem}>
                        <UserCog className={styles.icon} size={18} strokeWidth={1.8} />
                        Admin Dashboard
                      </Link>
                    )}

                    <button className={styles.dropdownItem} onClick={handleLogout}>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className={styles.navbarToggle}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`${styles.mobileNav} ${isOpen ? styles.mobileNavOpen : ""}`}>
          <div className={styles.mobileNavContent}>
            {primaryLinks.map(link => (
              <NavLink 
                key={link.to} 
                to={link.to} 
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  isActive ? styles.mobileNavLinkActive : ""
                }
              >
                {link.label}
              </NavLink>
            ))}

            {moreLinks.map(link => (
              <NavLink 
                key={link.to} 
                to={link.to} 
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => 
                  isActive ? styles.mobileNavLinkActive : ""
                }
              >
                {link.label}
              </NavLink>
            ))}

            {isAdminUser && (
              <NavLink
                to="/admin/dashboard"
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => 
                  isActive ? styles.mobileNavLinkActive : ""
                }
              >
                Admin Dashboard
              </NavLink>
            )}

            <div className={styles.mobileAuthSection}>
              {showLoading ? (
                <div className={styles.mobileLoading}>
                  <div className={styles.loadingSpinner}></div>
                </div>
              ) : !isAuthenticated ? (
                <div className={styles.mobileAuth}>
                  <button
                    className={styles.mobileLoginBtn}
                    onClick={() => {
                      handleLogin();
                      setIsOpen(false);
                    }}
                  >
                    Login
                  </button>
                  <button
                    className={styles.mobileSignupBtn}
                    onClick={() => {
                      handleSignup();
                      setIsOpen(false);
                    }}
                  >
                    Sign Up
                  </button>
                </div>
              ) : (
                <div className={styles.mobileUser}>
                  <div className={styles.mobileUserInfo}>
                    <img 
                      src={auth0User?.picture || "/default-avatar.png"} 
                      alt="User" 
                      className={styles.mobileUserAvatar} 
                    />
                    {displayName && (
                      <span className={styles.mobileUserName}>{displayName}</span>
                    )}
                  </div>
                  
                  <Link
                    to="/account"
                    className={styles.mobileAccountBtn}
                    onClick={() => setIsOpen(false)}
                  >
                    Account Settings
                  </Link>
                  
                  {isAdminUser && (
                    <Link
                      to="/admin/dashboard"
                      className={styles.mobileAccountBtn}
                      onClick={() => setIsOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  
                  <button
                    className={styles.mobileLogoutBtn}
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}