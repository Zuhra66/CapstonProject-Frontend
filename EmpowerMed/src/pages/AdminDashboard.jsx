// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { NavLink } from "react-router-dom";
import {
  FiUsers, FiClipboard, FiCalendar, FiBarChart, FiLogOut,
  FiShoppingBag, FiTag, FiBookOpen, FiMessageCircle, FiUserCheck
} from "react-icons/fi";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AdminDashboard() {
  const { isAuthenticated, isLoading, getAccessTokenSilently, logout } = useAuth0();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    const fetchDashboardData = async () => {
      try {
        if (!isAuthenticated) return;

        const token = await getAccessTokenSilently({
          authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE }
        });

        console.log('🔄 Fetching dashboard stats...');
        
        const res = await fetch(`${API}/api/admin/dashboard-stats`, {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json" 
          },
          credentials: "include",
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error('❌ Stats fetch failed:', res.status, errorText);
          setStats(getFallbackStats());
          return;
        }

        const data = await res.json();
        console.log('✅ Dashboard stats received:', data);
        setStats(data);
      } catch (err) {
        console.error("❌ Dashboard error:", err);
        setStats(getFallbackStats());
      } finally {
        if (alive) setLoading(false);
      }
    };

    const getFallbackStats = () => ({
      users: { total: 1, active: 1, newThisMonth: 0 },
      appointments: { total: 0, pending: 0, today: 0 },
      products: { total: 0 },
      categories: { total: 0 },
      blog: { total: 0 },
      education: { videos: 0, articles: 0 },
      events: { upcoming: 0 },
      memberships: { plans: 0, active: 0 },
      messages: { total: 0 },
      audit: { total: 0 }
    });

    if (isAuthenticated && !isLoading) {
      fetchDashboardData();
    }

    return () => { alive = false; };
  }, [isAuthenticated, isLoading, getAccessTokenSilently]);

  // Main stats cards using your existing CSS classes
  const mainCards = [
    { 
      icon: FiUsers, 
      title: "Total Users", 
      value: stats?.users?.total,
      gradient: "card-blue",
      link: "/admin/users"
    },
    { 
      icon: FiUserCheck, 
      title: "Active Users", 
      value: stats?.users?.active,
      gradient: "card-green"
    },
    { 
      icon: FiCalendar, 
      title: "Appointments", 
      value: stats?.appointments?.total,
      gradient: "card-orange",
      link: "/admin/appointments"
    },
    { 
      icon: FiShoppingBag, 
      title: "Products", 
      value: stats?.products?.total,
      gradient: "card-purple",
      link: "/admin/products"
    },
    { 
      icon: FiBookOpen, 
      title: "Blog Posts", 
      value: stats?.blog?.total,
      gradient: "card-blue"
    },
    { 
      icon: FiClipboard, 
      title: "Audit Logs", 
      value: stats?.audit?.total,
      gradient: "card-green",
      link: "/admin/audit"
    },
  ];

  // Additional stats for detailed view
  const detailStats = [
    { label: "New Users This Month", value: stats?.users?.newThisMonth },
    { label: "Pending Appointments", value: stats?.appointments?.pending },
    { label: "Today's Appointments", value: stats?.appointments?.today },
    { label: "Categories", value: stats?.categories?.total },
    { label: "Education Videos", value: stats?.education?.videos },
    { label: "Education Articles", value: stats?.education?.articles },
    { label: "Active Memberships", value: stats?.memberships?.active },
    { label: "Membership Plans", value: stats?.memberships?.plans },
    { label: "Upcoming Events", value: stats?.events?.upcoming },
    { label: "Contact Messages", value: stats?.messages?.total },
  ];

  if (isLoading || loading) {
    return (
      <div className="admin-dashboard-wrapper">
        <aside className="admin-sidebar">
          <h2 className="sidebar-title">Admin Panel</h2>
          <nav className="sidebar-nav">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="sidebar-link placeholder" style={{height: '38px'}}></div>
            ))}
          </nav>
        </aside>
        
        <main className="admin-main page-content">
          <div className="container">
            <div className="placeholder-glow">
              <div className="placeholder col-6 display-font mb-3" style={{height: '40px'}}></div>
              <div className="dashboard-cards-row">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="dashboard-card placeholder" style={{height: '140px'}}></div>
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
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <h2 className="sidebar-title display-font">Admin Panel</h2>
        <nav className="sidebar-nav">
          <NavLink 
            to="/admin/dashboard" 
            className={({ isActive }) => 
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <FiBarChart className="dashboard-icon" />
            Dashboard
          </NavLink>
          <NavLink 
            to="/admin/users" 
            className={({ isActive }) => 
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <FiUsers className="dashboard-icon" />
            Users
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
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <FiShoppingBag className="dashboard-icon" />
            Products
          </NavLink>
          <NavLink 
            to="/admin/audit" 
            className={({ isActive }) => 
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <FiClipboard className="dashboard-icon" />
            Audit Logs
          </NavLink>
        </nav>

        <button 
          onClick={() => logout({ returnTo: window.location.origin })} 
          className="btn btn-secondary logout-btn"
        >
          <FiLogOut className="me-2" />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-main page-content">
        <div className="container">
          {/* Header */}
          <div className="about-header mb-4">
            <h1 className="display-font about-title">Administrator Dashboard</h1>
            <p className="about-subtitle body-font">
              Welcome back! Here's what's happening with your business today.
            </p>
            <div className="text-muted small body-font">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>

          {/* Main Stats Cards */}
          <div className="dashboard-cards-row">
            {mainCards.map(({ icon: Icon, title, value, gradient, link }, index) => (
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
            ))}
          </div>

          {/* Detailed Stats Section */}
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

          {/* User Roles Breakdown */}
          {stats?.users?.roles && (
            <div className="about-section">
              <div className="about-header">
                <h2 className="display-font about-title">User Roles</h2>
              </div>
              <div className="expertise-grid">
                {Object.entries(stats.users.roles).map(([role, count]) => (
                  <div key={role} className="expertise-item body-font">
                    <span className="text-capitalize">{role.toLowerCase()}</span>
                    <span className="badge btn-primary" style={{marginLeft: '1rem'}}>{count}</span>
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

// Reusable Stat Card Component using your existing CSS
const StatCard = ({ icon: Icon, title, value, gradient = "card-blue", clickable = false }) => {
  return (
    <div className={`dashboard-card ${gradient} ${clickable ? 'clickable' : ''}`}>
      <div className="dashboard-icon">
        <Icon size={32} />
      </div>
      <h2 className="display-font">{title}</h2>
      <p className="body-font">{value ?? 0}</p>
    </div>
  );
};