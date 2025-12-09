// src/pages/AdminDashboard.jsx 
import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { NavLink } from "react-router-dom";
import "../styles/admin-dashboard.css";

import {
  FiUsers,
  FiClipboard,
  FiCalendar,
  FiBarChart,
  FiLogOut,
  FiShoppingBag,
  FiTag,
  FiBookOpen,
  FiUserCheck,
  FiMail,
  FiShield,
  FiDatabase,
  FiActivity,
  FiMessageCircle
} from "react-icons/fi";

// Normalized backend base URL
const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5001").replace(
  /\/+$/,
  ""
);

const getFallbackStats = () => ({
  users: { total: 0, active: 0, newThisMonth: 0, roles: {} },
  newsletter: { total: 0, active: 0 },
  appointments: { total: 0, pending: 0, today: 0 },
  products: { total: 0 },
  categories: { total: 0 },
  blog: { total: 0 },
  education: { videos: 0, articles: 0 },
  events: { upcoming: 0 },
  memberships: { plans: 0, active: 0 },
  messages: { total: 0 },
  audit: { 
    total: 0, 
    today: 0,
    security: 0,
    authentication: 0,
    access: 0,
    modification: 0 
  },
});

export default function AdminDashboard() {
  const {
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
  } = useAuth0();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(getFallbackStats());
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        },
      });

      const res = await fetch(`${API_BASE}/api/admin/dashboard-stats`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("❌ Stats fetch failed:", res.status, text.slice(0, 200));

        if (res.status === 401) {
          setError("Not authenticated. Please sign in again.");
        } else if (res.status === 403) {
          setError("Access restricted: Administrator role required.");
        } else {
          setError("Failed to load dashboard statistics.");
        }

        setStats(getFallbackStats());
        return;
      }

      const data = await res.json();
      setStats(data || getFallbackStats());
    } catch (e) {
      console.error("❌ Dashboard error:", e);

      const msg = String(e?.message || e);
      if (msg.includes("login_required")) {
        await loginWithRedirect({
          appState: { returnTo: window.location.pathname },
        });
        return;
      }

      setError("Failed to load dashboard. Please try again later.");
      setStats(getFallbackStats());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        if (isLoading) return;

        if (!isAuthenticated) {
          await loginWithRedirect({
            appState: { returnTo: window.location.pathname },
          });
          return;
        }

        await fetchDashboardData();
      } catch (err) {
        console.error("Dashboard initialization error:", err);
        if (alive) {
          setError("Failed to initialize dashboard.");
          setLoading(false);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, [isAuthenticated, isLoading, loginWithRedirect, getAccessTokenSilently]);

  const educationTotal =
    (stats?.education?.articles || 0) + (stats?.education?.videos || 0);

  const mainCards = [
    {
      icon: FiUsers,
      title: "Total Users",
      value: stats?.users?.total,
      gradient: "card-blue",
      link: "/admin/users",
    },
    {
      icon: FiUserCheck,
      title: "Active Users",
      value: stats?.users?.active,
      gradient: "card-green",
    },
    { 
      icon: FiMail,
      title: "Newsletter", 
      value: stats?.newsletter?.total || 0,
      gradient: "card-green",
      link: "/admin/newsletter"
    },
    {
      icon: FiCalendar,
      title: "Appointments",
      value: stats?.appointments?.total,
      gradient: "card-orange",
      link: "/admin/appointments",
    },
    {
      icon: FiShoppingBag,
      title: "Products",
      value: stats?.products?.total,
      gradient: "card-purple",
      link: "/admin/products",
    },
    {
      icon: FiBookOpen,
      title: "Blog Posts",
      value: stats?.blog?.total,
      gradient: "card-blue",
      link: "/admin/blog",
    },
    {
      icon: FiBookOpen,
      title: "Education Hub",
      value: educationTotal,
      gradient: "card-slate",
      link: "/admin/education",
    },
    {
      icon: FiCalendar,
      title: "Upcoming Events",
      value: stats?.events?.upcoming,
      gradient: "card-slate",
      link: "/admin/events",
    },
    {
      icon: FiUsers,
      title: "Active Memberships",
      value: stats?.memberships?.active,
      gradient: "card-green",
      link: "/admin/memberships",
    },
    { 
      icon: FiShield, 
      title: "Audit Logs", 
      value: stats?.audit?.total,
      gradient: "card-blue",
      link: "/admin/audit",
    },
  ];

  const detailStats = [
    { label: "New Users This Month", value: stats?.users?.newThisMonth },
    { label: "Active Newsletter", value: stats?.newsletter?.active || 0 },
    { label: "Pending Appointments", value: stats?.appointments?.pending },
    { label: "Today's Appointments", value: stats?.appointments?.today },
    { label: "Categories", value: stats?.categories?.total },
    { label: "Education Videos", value: stats?.education?.videos },
    { label: "Education Articles", value: stats?.education?.articles },
    { label: "Active Memberships", value: stats?.memberships?.active },
    { label: "Membership Plans", value: stats?.memberships?.plans },
    { label: "Upcoming Events", value: stats?.events?.upcoming },
    { label: "Contact Messages", value: stats?.messages?.total },
    // Add audit-specific stats
    { label: "Today's Audit Logs", value: stats?.audit?.today },
    { label: "Security Events", value: stats?.audit?.security },
    { label: "Login Events", value: stats?.audit?.authentication },
    { label: "Data Access Events", value: stats?.audit?.access },
    { label: "Data Changes", value: stats?.audit?.modification },
  ];

  if (isLoading || loading) {
    return (
      <div className="admin-dashboard-wrapper">
        <aside className="admin-sidebar">
          <h2 className="sidebar-title">Admin Panel</h2>
          <nav className="sidebar-nav">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="sidebar-link placeholder"
                style={{ height: "38px" }}
              />
            ))}
          </nav>
        </aside>

        <main className="admin-main page-content">
          <div className="container">
            <div className="placeholder-glow">
              <div
                className="placeholder col-6 display-font mb-3"
                style={{ height: "40px" }}
              />
              <div className="dashboard-cards-row">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="dashboard-card placeholder"
                    style={{ height: "140px" }}
                  />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-content pt-small">
        <div className="container">
          <div className="text-center">
            <div className="alert alert-danger">
              <h4 className="alert-heading display-font">Access Denied</h4>
              <p className="mb-0 body-font">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-wrapper">
      <aside className="admin-sidebar">
        <h2 className="sidebar-title display-font">Admin Panel</h2>
        <nav className="sidebar-nav">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <FiBarChart className="dashboard-icon" />
            Dashboard
          </NavLink>
          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <FiUsers className="dashboard-icon" />
            Users
          </NavLink>
          <NavLink 
            to="/admin/newsletter" 
            className={({ isActive }) => 
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <FiMail className="dashboard-icon" />
            Newsletter
          </NavLink>
          <NavLink 
            to="/admin/appointments" 
            className={({ isActive }) => 
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <FiCalendar className="dashboard-icon" />
            Appointments
          </NavLink>
          <NavLink
            to="/admin/products"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <FiShoppingBag className="dashboard-icon" />
            Products
          </NavLink>
          <NavLink
            to="/admin/events"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <FiCalendar className="dashboard-icon" />
            Events
          </NavLink>
          <NavLink
            to="/admin/blog"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <FiBookOpen className="dashboard-icon" />
            Blog
          </NavLink>
          <NavLink
            to="/admin/education"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <FiBookOpen className="dashboard-icon" />
            Education Hub
          </NavLink>
          <NavLink
            to="/admin/memberships"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <FiUsers className="dashboard-icon" />
            Memberships
          </NavLink>
          <NavLink
            to="/admin/audit"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <FiShield className="dashboard-icon" />
            Audit Logs
          </NavLink>
        </nav>

        <button
          onClick={() =>
            logout({
              logoutParams: { returnTo: window.location.origin },
            })
          }
          className="btn btn-secondary logout-btn"
        >
          <FiLogOut className="me-1" />
          Logout
        </button>
      </aside>

      <main className="admin-main page-content">
        <div className="container">
          <div className="about-header mb-4">
            <h1 className="display-font about-title">Administrator Dashboard</h1>
            <p className="about-subtitle body-font">
              Welcome back! Here&apos;s what&apos;s happening with your business
              today.
            </p>
            <div className="text-muted small body-font">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>

          {/* Main Stats Cards */}
          <div className="dashboard-cards-row">
            {mainCards.map(
              ({ icon: Icon, title, value, gradient, link }, index) => (
                <div key={index}>
                  {link ? (
                    <NavLink to={link} className="text-decoration-none">
                      <StatCard
                        icon={Icon}
                        title={title}
                        value={value}
                        gradient={gradient}
                        clickable
                      />
                    </NavLink>
                  ) : (
                    <StatCard
                      icon={Icon}
                      title={title}
                      value={value}
                      gradient={gradient}
                    />
                  )}
                </div>
              )
            )}
          </div>

          {/* Quick Stats Section */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="about-section">
                <div className="about-header">
                  <h2 className="display-font about-title">Activity Overview</h2>
                </div>
                <div className="row">
                  {/* Audit Activity Card */}
                  <div className="col-md-6 mb-3">
                    <div className="card h-100">
                      <div className="card-body">
                        <h5 className="card-title d-flex align-items-center">
                          <FiActivity className="me-2" /> Audit Activity
                        </h5>
                        <div className="row">
                          <div className="col-6 mb-2">
                            <small className="text-muted">Today</small>
                            <div className="h4">{stats?.audit?.today || 0}</div>
                          </div>
                          <div className="col-6 mb-2">
                            <small className="text-muted">Security Events</small>
                            <div className="h4 text-danger">{stats?.audit?.security || 0}</div>
                          </div>
                          <div className="col-6 mb-2">
                            <small className="text-muted">Logins</small>
                            <div className="h4 text-info">{stats?.audit?.authentication || 0}</div>
                          </div>
                          <div className="col-6 mb-2">
                            <small className="text-muted">Data Access</small>
                            <div className="h4 text-success">{stats?.audit?.access || 0}</div>
                          </div>
                        </div>
                        <NavLink to="/admin/audit" className="btn btn-outline-primary btn-sm mt-2">
                          View Audit Logs
                        </NavLink>
                      </div>
                    </div>
                  </div>
                  
                  {/* System Status Card */}
                  <div className="col-md-6 mb-3">
                    <div className="card h-100">
                      <div className="card-body">
                        <h5 className="card-title d-flex align-items-center">
                          <FiDatabase className="me-2" /> System Status
                        </h5>
                        <div className="row">
                          <div className="col-6 mb-2">
                            <small className="text-muted">Total Audit Logs</small>
                            <div className="h4">{stats?.audit?.total || 0}</div>
                          </div>
                          <div className="col-6 mb-2">
                            <small className="text-muted">Data Changes</small>
                            <div className="h4 text-warning">{stats?.audit?.modification || 0}</div>
                          </div>
                          <div className="col-6 mb-2">
                            <small className="text-muted">HIPAA Compliant</small>
                            <div className="h4 text-success">
                              {stats?.audit?.total > 0 ? '✓' : '–'}
                            </div>
                          </div>
                          <div className="col-6 mb-2">
                            <small className="text-muted">6-Year Retention</small>
                            <div className="h4 text-success">✓</div>
                          </div>
                        </div>
                        <NavLink to="/admin/audit?tab=report" className="btn btn-outline-success btn-sm mt-2">
                          Generate Report
                        </NavLink>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Statistics Section */}
          <div className="about-section">
            <div className="about-header">
              <h2 className="display-font about-title">Detailed Statistics</h2>
            </div>
            <div className="approach-grid">
              {detailStats.map(({ label, value }, index) => (
                <div key={index} className="approach-item">
                  <div className="approach-icon">
                    <FiTag />
                  </div>
                  <div className="approach-text">
                    <h4 className="body-font">{label}</h4>
                    <p className="body-font">{value ?? 0}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {stats?.users?.roles && (
            <div className="about-section">
              <div className="about-header">
                <h2 className="display-font about-title">User Roles</h2>
              </div>
              <div className="expertise-grid">
                {Object.entries(stats.users.roles).map(([role, count]) => (
                  <div key={role} className="expertise-item body-font">
                    <span className="text-capitalize">
                      {String(role).toLowerCase()}
                    </span>
                    <span
                      className="badge btn-primary"
                      style={{ marginLeft: "1rem" }}
                    >
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const StatCard = ({
  icon: Icon,
  title,
  value,
  gradient = "card-blue",
  clickable = false,
}) => (
  <div
    className={`dashboard-card ${gradient} ${
      clickable ? "clickable" : ""
    }`.trim()}
    style={{ minHeight: "140px", padding: "1.5rem" }}
  >
    <div className="dashboard-icon">
      <Icon size={20} />
    </div>
    <h2
      className="display-font"
      style={{ fontSize: "1rem", margin: "0.5rem 0", lineHeight: "1.2" }}
    >
      {title}
    </h2>
    <p
      className="body-font"
      style={{
        fontSize: "1.5rem",
        fontWeight: "var(--fw-bold)",
        margin: 0,
      }}
    >
      {value ?? 0}
    </p>
  </div>
);