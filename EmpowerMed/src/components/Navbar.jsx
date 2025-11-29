import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import logoCropped from "../assets/logo-cropped.png";
import styles from "../styles/Navbar.module.css";
import { UserCog, ChevronDown, Menu } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const { 
    isAuthenticated, 
    isLoading, 
    user, 
    getAccessTokenSilently,
    loginWithRedirect, 
    logout 
  } = useAuth0();
  const [backendUser, setBackendUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

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
        
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          }
        });

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
          setBackendUser(data.user);
        } else {
          setBackendUser(null);
        }
      } catch (error) {
        setBackendUser(null);
      } finally {
        if (alive) setUserLoading(false);
      }
    };

    fetchBackendUser();

    return () => {
      alive = false;
    };
  }, [isAuthenticated, getAccessTokenSilently]);

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

  // Updated display name logic - first name + first letter of family name
  const getDisplayName = () => {
    if (backendUser?.first_name && backendUser?.last_name) {
      return `${backendUser.first_name} ${backendUser.last_name.charAt(0)}.`;
    }
    if (backendUser?.name) {
      return backendUser.name;
    }
    if (user?.given_name && user?.family_name) {
      return `${user.given_name} ${user.family_name.charAt(0)}.`;
    }
    if (user?.name) {
      return user.name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return "Account";
  };

  const displayName = getDisplayName();
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

  // Updated primary links - About is now in primary
  const primaryLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/services", label: "Services" },
    { to: "/membership", label: "Membership" },
    { to: "/products", label: "Products" },
  ];

  // Updated more links - About removed
  const moreLinks = [
    { to: "/blog", label: "Blog" },
    { to: "/education", label: "Education" },
    { to: "/events", label: "Events" },
  ];

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
          <Link to="/" className={styles.navbarBrand}>
            <div className={styles.logoContainer}>
              <img src={logoCropped} alt="EmpowerMEd Logo" className={styles.navbarLogoImg} />
              <span className={styles.logoText}>EmpowerMEd</span>
            </div>
          </Link>

          <div className={styles.navbarMain}>
            <div className={styles.navbarNav}>
              {/* Primary Links - Now includes About */}
              {primaryLinks.map(link => (
                <NavLink 
                  key={link.to}
                  to={link.to} 
                  end={link.to === "/"}
                  className={({ isActive }) => isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}
                >
                  {link.label}
                </NavLink>
              ))}
              
              {/* More Menu Dropdown */}
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
                    {moreLinks.map(link => (
                      <NavLink 
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) => isActive ? `${styles.dropdownLink} ${styles.dropdownLinkActive}` : styles.dropdownLink}
                        onClick={() => setShowMoreMenu(false)}
                      >
                        {link.label}
                      </NavLink>
                    ))}
                    {isAdmin && (
                      <NavLink 
                        to="/admin/dashboard"
                        className={({ isActive }) => isActive ? `${styles.dropdownLink} ${styles.dropdownLinkActive}` : styles.dropdownLink}
                        onClick={() => setShowMoreMenu(false)}
                      >
                        Admin
                      </NavLink>
                    )}
                  </div>
                )}
              </div>

              {/* Admin link shown separately if not in more menu */}
              {isAdmin && !showMoreMenu && (
                <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}>
                  Admin
                </NavLink>
              )}
            </div>

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
          </div>

          <button className={styles.navbarToggle} onClick={() => setIsOpen(!isOpen)} aria-label="Toggle navigation">
            <Menu size={24} />
          </button>
        </div>

        {/* Mobile Nav - Show all links */}
        <div className={`${styles.mobileNav} ${isOpen ? styles.mobileNavOpen : ""}`}>
          <div className={styles.mobileNavContent}>
            {[...primaryLinks, ...moreLinks].map(link => (
              <NavLink 
                key={link.to} 
                to={link.to} 
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => isActive ? styles.mobileNavLinkActive : ""}
              >
                {link.label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink to="/admin/dashboard" onClick={() => setIsOpen(false)}>Admin Dashboard</NavLink>
            )}

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