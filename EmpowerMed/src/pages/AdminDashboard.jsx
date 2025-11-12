// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import useAuthFetch from '../hooks/useAuthFetch';


export default function AdminDashboard() {
  const { user, isAuthenticated, getAccessTokenSilently, isLoading } = useAuth0();
  const { authFetch } = useAuthFetch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      checkAdminAccess();
    }
  }, [isAuthenticated, isLoading]);

  const checkAdminAccess = async () => {
    try {
      // Simply try to access an admin endpoint
      // The backend will handle the actual authorization
      const data = await authFetch('/api/admin/dashboard-stats');
      setIsAdmin(true);
      setStats(data);
    } catch (err) {
      console.error('Admin access check failed:', err);
      if (err.message.includes('403') || err.message.includes('Admin access required')) {
        setError('Access denied. Administrator privileges required.');
      } else if (err.message.includes('401') || err.message.includes('Unauthorized')) {
        setError('Please log in to access the admin dashboard.');
      } else {
        setError('Failed to verify admin access. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning text-center">
          <h4>Authentication Required</h4>
          <p>Please log in to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger text-center">
          <h4>Access Denied</h4>
          <p>{error || 'You do not have permission to access this area.'}</p>
          <small className="text-muted">
            Logged in as: {user?.email}
          </small>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="container-fluid mt-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col">
            <h1 className="display-4">Admin Dashboard</h1>
            <p className="text-muted">
              Welcome back, {user?.name || 'Administrator'}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="admin-nav mb-4">
          <div className="nav nav-tabs">
            <button
              className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              📊 Dashboard
            </button>
            <button
              className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              👥 User Management
            </button>
            <button
              className={`nav-link ${activeTab === 'appointments' ? 'active' : ''}`}
              onClick={() => setActiveTab('appointments')}
            >
              📅 Appointments
            </button>
            <button
              className={`nav-link ${activeTab === 'audit' ? 'active' : ''}`}
              onClick={() => setActiveTab('audit')}
            >
              📋 Audit Logs
            </button>
          </div>
        </nav>

        {/* Tab Content */}
        <div className="admin-content">
          {activeTab === 'dashboard' && <DashboardTab stats={stats} />}
          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'appointments' && <AppointmentsTab />}
          {activeTab === 'audit' && <AuditTab />}
        </div>

        {error && (
          <div className="alert alert-danger mt-3">
            {error}
            <button 
              className="btn-close float-end" 
              onClick={() => setError('')}
            ></button>
          </div>
        )}
      </div>
    </div>
  );
}

// Dashboard Tab Component
function DashboardTab({ stats }) {
  if (!stats) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading dashboard statistics...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="row">
        {/* User Stats */}
        <div className="col-md-3 mb-4">
          <div className="card stat-card">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title text-muted">Total Users</h6>
                  <h3 className="card-text">{stats.users.total}</h3>
                </div>
                <div className="stat-icon">👥</div>
              </div>
              <div className="mt-2">
                <small className="text-success">
                  +{stats.users.newThisMonth} this month
                </small>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-4">
          <div className="card stat-card">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title text-muted">Active Users</h6>
                  <h3 className="card-text">{stats.users.active}</h3>
                </div>
                <div className="stat-icon">✅</div>
              </div>
              <div className="mt-2">
                <small className="text-muted">
                  {Math.round((stats.users.active / stats.users.total) * 100)}% active
                </small>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-4">
          <div className="card stat-card">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title text-muted">Admins</h6>
                  <h3 className="card-text">{stats.users.roles?.admin || 0}</h3>
                </div>
                <div className="stat-icon">🛡️</div>
              </div>
              <div className="mt-2">
                <small className="text-muted">
                  System administrators
                </small>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-4">
          <div className="card stat-card">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title text-muted">Active Memberships</h6>
                  <h3 className="card-text">{stats.memberships.active}</h3>
                </div>
                <div className="stat-icon">🎫</div>
              </div>
              <div className="mt-2">
                <small className="text-muted">
                  {Math.round((stats.memberships.active / stats.memberships.total) * 100)}% active
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Appointment Stats */}
        <div className="col-md-6 mb-4">
          <div className="card stat-card">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title text-muted">Total Appointments</h6>
                  <h3 className="card-text">{stats.appointments.total}</h3>
                </div>
                <div className="stat-icon">📅</div>
              </div>
              <div className="mt-2">
                <small className="text-warning">
                  {stats.appointments.pending} pending
                </small>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card stat-card">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title text-muted">Conversion Rate</h6>
                  <h3 className="card-text">
                    {stats.users.total > 0 
                      ? Math.round((stats.memberships.active / stats.users.total) * 100) 
                      : 0}%
                  </h3>
                </div>
                <div className="stat-icon">📈</div>
              </div>
              <div className="mt-2">
                <small className="text-muted">
                  Users to active memberships
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Role Distribution */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">User Role Distribution</h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-md-4">
                  <h4>{stats.users.roles?.admin || 0}</h4>
                  <small className="text-muted">Administrators</small>
                </div>
                <div className="col-md-4">
                  <h4>{stats.users.roles?.provider || 0}</h4>
                  <small className="text-muted">Providers</small>
                </div>
                <div className="col-md-4">
                  <h4>{stats.users.roles?.member || 0}</h4>
                  <small className="text-muted">Members</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Users Tab Component
function UsersTab() {
  const { authFetch } = useAuthFetch();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    role: '',
    status: ''
  });

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams(filters).toString();
      const data = await authFetch(`/api/admin/users?${queryParams}`);
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await authFetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole })
      });
      fetchUsers(); // Refresh the list
    } catch (err) {
      console.error('Error updating user role:', err);
      alert('Failed to update user role: ' + err.message);
    }
  };

  const updateUserStatus = async (userId, isActive) => {
    try {
      await authFetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: isActive })
      });
      fetchUsers(); // Refresh the list
    } catch (err) {
      console.error('Error updating user status:', err);
      alert('Failed to update user status: ' + err.message);
    }
  };
      console.error('Error updating user status:', err);
      alert('Failed to update user status: ' + err.message);
    }
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">User Management</h5>
        </div>
        <div className="card-body">
          {/* Filters */}
          <div className="row mb-3">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Search users..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
              />
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filters.role}
                onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value, page: 1 }))}
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="provider">Provider</option>
                <option value="member">Member</option>
              </select>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="col-md-2">
              <button 
                className="btn btn-outline-secondary w-100"
                onClick={fetchUsers}
              >
                Refresh
              </button>
            </div>
          </div>
    <div>
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">User Management</h5>
        </div>
        <div className="card-body">
          {/* Filters */}
          <div className="row mb-3">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Search users..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
              />
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filters.role}
                onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value, page: 1 }))}
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="provider">Provider</option>
                <option value="member">Member</option>
              </select>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="col-md-2">
              <button 
                className="btn btn-outline-secondary w-100"
                onClick={fetchUsers}
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Users Table */}
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Last Login</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <UserRow 
                        key={user.id}
                        user={user}
                        onUpdateRole={updateUserRole}
                        onUpdateStatus={updateUserStatus}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <nav>
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${!pagination.hasPrev ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                        disabled={!pagination.hasPrev}
                      >
                        Previous
                      </button>
                    </li>
                    {[...Array(pagination.totalPages)].map((_, i) => (
                      <li key={i} className={`page-item ${filters.page === i + 1 ? 'active' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setFilters(prev => ({ ...prev, page: i + 1 }))}
                        >
                          {i + 1}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${!pagination.hasNext ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                        disabled={!pagination.hasNext}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
          {/* Users Table */}
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Last Login</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <UserRow 
                        key={user.id}
                        user={user}
                        onUpdateRole={updateUserRole}
                        onUpdateStatus={updateUserStatus}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <nav>
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${!pagination.hasPrev ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                        disabled={!pagination.hasPrev}
                      >
                        Previous
                      </button>
                    </li>
                    {[...Array(pagination.totalPages)].map((_, i) => (
                      <li key={i} className={`page-item ${filters.page === i + 1 ? 'active' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setFilters(prev => ({ ...prev, page: i + 1 }))}
                        >
                          {i + 1}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${!pagination.hasNext ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                        disabled={!pagination.hasNext}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// User Row Component - FIXED VERSION
function UserRow({ user, onUpdateRole, onUpdateStatus }) {
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'danger';
      case 'provider': return 'warning';
      case 'member': return 'primary';
      default: return 'secondary';
    }
  };

  return (
    <tr>
      <td>
        <div>
          <strong>{user.first_name} {user.last_name}</strong>
          {user.name && user.name !== `${user.first_name} ${user.last_name}` && (
            <><br /><small className="text-muted">({user.name})</small></>
          )}
          <br />
          <small className="text-muted">{user.email}</small>
          <br />
          <small className="text-muted">
            Joined: {new Date(user.created_at).toLocaleDateString()}
          </small>
        </div>
      </td>
      <td>
        <select
          className={`form-select form-select-sm border-${getRoleBadgeColor(user.role)}`}
          value={user.role}
          onChange={(e) => onUpdateRole(user.id, e.target.value)}
          style={{ width: 'auto', display: 'inline-block' }}
        >
          <option value="member">Member</option>
          <option value="provider">Provider</option>
          <option value="admin">Admin</option>
        </select>
      </td>
      <td>
        <span className={`badge bg-${user.is_active ? 'success' : 'danger'}`}>
          {user.is_active ? 'Active' : 'Inactive'}
        </span>
        <button
          className="btn btn-sm btn-outline-secondary ms-2"
          onClick={() => onUpdateStatus(user.id, !user.is_active)}
        >
          {user.is_active ? 'Deactivate' : 'Activate'}
        </button>
      </td>
      <td>
        {user.last_login 
          ? new Date(user.last_login).toLocaleDateString()
          : 'Never'
        }
      </td>
      <td>
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={() => {/* Add view details functionality */}}
        >
          View
        </button>
      </td>
    </tr>
  );
}

// Placeholder Components for other tabs
function AppointmentsTab() {
  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">Appointment Management</h5>
      </div>
      <div className="card-body">
        <p>Appointment management interface coming soon...</p>
      </div>
    </div>
  );
}

function AuditTab() {
  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">Audit Logs</h5>
      </div>
      <div className="card-body">
        <p>Audit log interface coming soon...</p>
      </div>
    </div>
  );
}
}

// User Row Component - FIXED VERSION
function UserRow({ user, onUpdateRole, onUpdateStatus }) {
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'danger';
      case 'provider': return 'warning';
      case 'member': return 'primary';
      default: return 'secondary';
    }
  };

  return (
    <tr>
      <td>
        <div>
          <strong>{user.first_name} {user.last_name}</strong>
          {user.name && user.name !== `${user.first_name} ${user.last_name}` && (
            <><br /><small className="text-muted">({user.name})</small></>
          )}
          <br />
          <small className="text-muted">{user.email}</small>
          <br />
          <small className="text-muted">
            Joined: {new Date(user.created_at).toLocaleDateString()}
          </small>
        </div>
      </td>
      <td>
        <select
          className={`form-select form-select-sm border-${getRoleBadgeColor(user.role)}`}
          value={user.role}
          onChange={(e) => onUpdateRole(user.id, e.target.value)}
          style={{ width: 'auto', display: 'inline-block' }}
        >
          <option value="member">Member</option>
          <option value="provider">Provider</option>
          <option value="admin">Admin</option>
        </select>
      </td>
      <td>
        <span className={`badge bg-${user.is_active ? 'success' : 'danger'}`}>
          {user.is_active ? 'Active' : 'Inactive'}
        </span>
        <button
          className="btn btn-sm btn-outline-secondary ms-2"
          onClick={() => onUpdateStatus(user.id, !user.is_active)}
        >
          {user.is_active ? 'Deactivate' : 'Activate'}
        </button>
      </td>
      <td>
        {user.last_login 
          ? new Date(user.last_login).toLocaleDateString()
          : 'Never'
        }
      </td>
      <td>
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={() => {/* Add view details functionality */}}
        >
          View
        </button>
      </td>
    </tr>
  );
}

// Placeholder Components for other tabs
function AppointmentsTab() {
  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">Appointment Management</h5>
      </div>
      <div className="card-body">
        <p>Appointment management interface coming soon...</p>
      </div>
    </div>
  );
}

function AuditTab() {
  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">Audit Logs</h5>
      </div>
      <div className="card-body">
        <p>Audit log interface coming soon...</p>
      </div>
    </div>
  );
}