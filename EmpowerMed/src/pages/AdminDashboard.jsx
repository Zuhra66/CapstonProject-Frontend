import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { NavLink } from "react-router-dom";
import useAuthFetch from "@/hooks/useAuthFetch";
import { FiUsers, FiClipboard, FiCalendar, FiBarChart, FiLogOut } from "react-icons/fi";

export default function AdminDashboard() {
  const { isAuthenticated, isLoading, logout } = useAuth0();
  const authFetch = useAuthFetch();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setIsAdmin(true);
      setStats({}); // dummy stats
      setLoading(false);
    }
}, [isLoading, isAuthenticated]);
  /**useEffect(() => {
    if (!isLoading) {
      const fetchAdminData = async () => {
        try {
          if (!isAuthenticated) {
            // fallback: trigger login if user not authenticated
            loginWithRedirect({ appState: { returnTo: window.location.pathname } });
            return;
          }

          const data = await authFetch("/api/admin/dashboard-stats");

          // Backend enforces admin access, so just check data exists
          if (data && data.users) {
            setStats(data);
            setIsAdmin(true);
          } else {
            setError("You do not have Administrator permissions.");
          }
        } catch (err) {
          // If silent token fails (common in dev), fallback to redirect login
          if (
            err.error === "login_required" ||
            err.message.includes("token") ||
            err.message.includes("401") ||
            err.message.includes("403")
          ) {
            loginWithRedirect({ appState: { returnTo: window.location.pathname } });
          } else {
            setError(err.message);
          }
        } finally {
          setLoading(false);
        }
      };

      fetchAdminData();
    }
  }, [isLoading, isAuthenticated]);**/




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

  if (!isAdmin) return null;

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
        </nav>
        <button
          className="btn btn-secondary logout-btn"
          onClick={() => logout({ returnTo: window.location.origin })}
        >
          <FiLogOut size={18} /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-main page-content">
        <h1 className="display-font mb-6 text-center">Administrator Dashboard</h1>
        <div className="dashboard-cards-row">
          <div className="dashboard-card card-blue">
            <FiBarChart size={32} className="dashboard-icon" />
            <h2>Total Users</h2>
            <p>{stats?.totalUsers ?? "—"}</p>
          </div>
          <div className="dashboard-card card-green">
            <FiUsers size={32} className="dashboard-icon" />
            <h2>Pending Approvals</h2>
            <p>{stats?.pendingApprovals ?? "—"}</p>
          </div>
          <div className="dashboard-card card-orange">
            <FiCalendar size={32} className="dashboard-icon" />
            <h2>Active Sessions</h2>
            <p>{stats?.activeSessions ?? "—"}</p>
          </div>
          <div className="dashboard-card card-purple">
            <FiClipboard size={32} className="dashboard-icon" />
            <h2>Audit Logs</h2>
            <p>{stats?.auditLogs ?? "—"}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
