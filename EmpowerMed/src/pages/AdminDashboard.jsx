// src/pages/AdminDashboard.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { NavLink } from "react-router-dom";
import {
  FiUsers,
  FiClipboard,
  FiCalendar,
  FiBarChart,
  FiLogOut,
  FiShoppingBag,
  FiTag,
  FiBookOpen,
  FiPlayCircle,
  FiLayers,
  FiMessageCircle,
  FiUserCheck,
} from "react-icons/fi";

// Same-origin in dev; in prod you can set VITE_API_URL if API is on another host.
const API_BASE = import.meta.env.DEV
  ? ""
  : (import.meta.env.VITE_API_URL || "");

export default function AdminDashboard() {
  const {
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
  } = useAuth0();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        if (isLoading) return;

        // Not logged in → send to Auth0, then back here
        if (!isAuthenticated) {
          await loginWithRedirect({
            appState: { returnTo: window.location.pathname },
          });
          return;
        }

        // Get API access token
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          },
        });

        // Same-origin (or API_BASE) so no CORS issues in dev
        const res = await fetch(`${API_BASE}/api/admin/dashboard-stats`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        if (!res.ok) {
          if (res.status === 401) throw new Error("401");
          if (res.status === 403) throw new Error("403");
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        if (!alive) return;

        setStats(data || {});
        setIsAdmin(true);
      } catch (e) {
        const msg = String(e?.message || e);

        if (msg.includes("login_required")) {
          loginWithRedirect({
            appState: { returnTo: window.location.pathname },
          });
        } else if (msg === "401") {
          setError("Not authenticated. Please sign in again.");
        } else if (msg === "403") {
          setError("Access restricted: Administrator role required.");
        } else {
          setError(msg);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [isLoading, isAuthenticated, loginWithRedirect, getAccessTokenSilently]);

  const cards = useMemo(
    () => [
      // Users & auth
      { icon: FiUsers, title: "TOTAL USERS", value: stats?.users?.total },
      { icon: FiUserCheck, title: "ACTIVE SESSIONS", value: stats?.users?.active },
      {
        icon: FiUsers,
        title: "NEW USERS (MONTH)",
        value: stats?.users?.newThisMonth,
      },

      // Appointments
      {
        icon: FiCalendar,
        title: "APPOINTMENTS (ALL)",
        value: stats?.appointments?.total,
        link: "/admin/appointments",
      },
      {
        icon: FiCalendar,
        title: "APPOINTMENTS PENDING",
        value: stats?.appointments?.pending,
        link: "/admin/appointments?status=pending",
      },
      {
        icon: FiCalendar,
        title: "APPOINTMENTS TODAY",
        value: stats?.appointments?.today,
      },

      // Products & categories
      {
        icon: FiShoppingBag,
        title: "PRODUCTS",
        value: stats?.products?.total,
        link: "/admin/products",
      },
      {
        icon: FiTag,
        title: "CATEGORIES",
        value: stats?.categories?.total,
      },

      // Content
      {
        icon: FiBookOpen,
        title: "BLOG POSTS",
        value: stats?.blog?.total,
        link: "/blog",
      },
      {
        icon: FiPlayCircle,
        title: "EDUCATION VIDEOS",
        value: stats?.education?.videos,
      },
      {
        icon: FiLayers,
        title: "EDUCATION ARTICLES",
        value: stats?.education?.articles,
      },

      // Memberships & plans
      {
        icon: FiLayers,
        title: "MEMBERSHIP PLANS",
        value: stats?.memberships?.plans,
      },
      {
        icon: FiLayers,
        title: "ACTIVE MEMBERSHIPS",
        value: stats?.memberships?.active,
      },

      // Events / messages / audit
      {
        icon: FiCalendar,
        title: "UPCOMING EVENTS",
        value: stats?.events?.upcoming,
        link: "/events",
      },
      {
        icon: FiMessageCircle,
        title: "CONTACT MESSAGES",
        value: stats?.messages?.total,
      },
      {
        icon: FiClipboard,
        title: "AUDIT LOGS",
        value: stats?.audit?.total,
        link: "/admin/audit",
      },
    ],
    [stats]
  );

  if (loading || isLoading) {
    return (
      <main className="page-content pt-small">
        <div className="container text-center">
          <p>Loading dashboard...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page-content pt-small">
        <div className="container text-center">
          <h1 className="display-font">Access Denied</h1>
          <p>{error}</p>
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="page-content pt-small">
        <div className="container text-center">
          <h1 className="display-font">Administrator Access Required</h1>
          <p>
            This page is restricted to users with the <strong>admin</strong> role.
          </p>
        </div>
      </main>
    );
  }

  const Wrapper = ({ to, children }) =>
    to ? (
      <NavLink to={to} className="text-reset text-decoration-none">
        {children}
      </NavLink>
    ) : (
      <>{children}</>
    );

  // Rotate your gradient classes to keep the metallic theme
  const palette = ["card-blue", "card-green", "card-orange", "card-purple", "card-blue"];

  return (
    <div className="admin-dashboard-wrapper">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <h2 className="sidebar-title">Admin Panel</h2>
        <nav className="sidebar-nav">
          <NavLink to="/admin/dashboard" className="sidebar-link">
            <FiBarChart size={20} /> Dashboard
          </NavLink>
          <NavLink to="/admin/users" className="sidebar-link">
            <FiUsers size={20} /> User Management
          </NavLink>
          <NavLink to="/admin/appointments" className="sidebar-link">
            <FiCalendar size={20} /> Appointments
          </NavLink>
          <NavLink to="/admin/audit" className="sidebar-link">
            <FiClipboard size={20} /> Audit Logs
          </NavLink>
          <NavLink to="/admin/products" className="sidebar-link">
            <FiShoppingBag size={20} /> Products
          </NavLink>
        </nav>
        <button
          className="btn btn-secondary"
          onClick={() => logout({ returnTo: window.location.origin })}
        >
          <FiLogOut size={18} /> Logout
        </button>
      </aside>

      {/* Main */}
      <main className="admin-main page-content">
        <h1 className="display-font mb-2 text-center">ADMINISTRATOR DASHBOARD</h1>
        <p className="text-center mb-4">
          Access to this dashboard is restricted to users with the{" "}
          <strong>admin</strong> role.
        </p>

        {/* 5 cards per row on XL screens */}
        <div className="container px-0">
          <div className="row g-3 row-cols-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5">
            {cards.map(({ icon: Icon, title, value, link }, i) => {
              const colorClass = palette[i % palette.length];
              return (
                <div key={i} className="col">
                  <Wrapper to={link}>
                    <div
                      className={`dashboard-card ${colorClass} p-3 h-100 d-flex flex-column align-items-center justify-content-center`}
                    >
                      <Icon size={28} className="mb-2" />
                      <div className="small fw-semibold text-uppercase text-center">
                        {title}
                      </div>
                      <div className="fs-4 fw-bold mt-1">{value ?? "—"}</div>
                    </div>
                  </Wrapper>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
