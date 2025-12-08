import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { FiSearch, FiEdit, FiTrash2, FiUserCheck, FiUserX, FiShield, FiUser, FiUsers, FiSave, FiX } from "react-icons/fi";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Temporary authedJson implementation since import is failing
async function authedJson(path, { method = "GET", body, headers = {} } = {}, getToken) {
  const upper = method.toUpperCase();
  
  // CSRF token handling
  let csrfToken = null;
  const m = document.cookie.match(new RegExp(`(?:^|; )XSRF-TOKEN=([^;]*)`));
  if (m) csrfToken = decodeURIComponent(m[1]);
  
  let csrfHeader = {};
  if (["POST", "PUT", "PATCH", "DELETE"].includes(upper) && csrfToken) {
    csrfHeader = { "X-XSRF-TOKEN": csrfToken };
  }

  // Bearer token handling
  let bearerHeader = {};
  if (typeof getToken === "function") {
    const token = await getToken();
    if (token) bearerHeader = { Authorization: `Bearer ${token}` };
  }

  const response = await fetch(`${API}${path}`, {
    method: upper,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...bearerHeader,
      ...csrfHeader,
      ...headers,
    },
    body: body != null ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => response.statusText);
    throw new Error(`${response.status} ${response.statusText}: ${text}`);
  }

  const contentType = response.headers.get("content-type") || "";
  return contentType.includes("application/json") ? response.json() : response.text();
}

export default function AdminUsers() {
  const { getAccessTokenSilently } = useAuth0();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    name: "",
    email: "",
    role: "User",
    is_active: true,
    is_admin: false
  });

  const tokenGetter = useCallback(
    () =>
      getAccessTokenSilently({
        authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
      }),
    [getAccessTokenSilently]
  );

  useEffect(() => {
    fetch(`${API}/csrf-token`, { credentials: "include" }).catch(() => {});
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");
      
      const data = await authedJson(
        '/api/admin/users',
        { method: "GET" },
        tokenGetter
      );

      setUsers(data.users || []);
    } catch (err) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = 
        statusFilter === "all" || 
        (statusFilter === "active" && user.is_active) ||
        (statusFilter === "inactive" && !user.is_active);

      const matchesRole = 
        roleFilter === "all" || 
        user.role?.toLowerCase() === roleFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, searchTerm, statusFilter, roleFilter]);

  const startEdit = (user) => {
    setEditingId(user.id);
    setEditForm({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      name: user.name || "",
      email: user.email || "",
      role: user.role || "User",
      is_active: user.is_active ?? true,
      is_admin: user.is_admin ?? false
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({
      first_name: "",
      last_name: "",
      name: "",
      email: "",
      role: "User",
      is_active: true,
      is_admin: false
    });
  };

  const updateEditForm = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const saveUser = async (userId) => {
    try {
      setBusy(true);
      const token = await tokenGetter();

      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      console.log('🔍 Token payload sub:', tokenPayload.sub);
      
      const responseData = await authedJson(
        `/api/admin/users/${userId}`,
        {
          method: "PUT",
          body: editForm
        },
        tokenGetter
      );

      console.log('✅ Frontend - Success response:', responseData);
      
      await loadUsers();
      setEditingId(null);
    } catch (err) {
      console.error('❌ Frontend - Save user error:', err);
      alert(err.message || "Failed to update user");
    } finally {
      setBusy(false);
    }
  };

  const toggleUserStatus = async (user) => {
    if (!confirm(`Are you sure you want to ${user.is_active ? 'deactivate' : 'activate'} this user?`)) return;
    
    try {
      setBusy(true);
      
      await authedJson(
        `/api/admin/users/${user.id}/status`,
        {
          method: "PATCH",
          body: { is_active: !user.is_active }
        },
        tokenGetter
      );

      await loadUsers();
    } catch (err) {
      alert(err.message || "Failed to update user status");
    } finally {
      setBusy(false);
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    
    try {
      setBusy(true);
      
      await authedJson(
        `/api/admin/users/${userId}`,
        {
          method: "DELETE"
        },
        tokenGetter
      );

      await loadUsers();
    } catch (err) {
      alert(err.message || "Failed to delete user");
    } finally {
      setBusy(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return '—';
    }
  };

  const getStatusBadge = (user) => {
    if (user.is_active) {
      return (
        <span className="badge" style={{ 
          padding: '0.25em 0.5em', 
          fontSize: '0.7em',
          fontWeight: '600',
          background: '#00FF00', // Solid neon green
          color: 'black' // Black text
        }}>
          <FiUserCheck className="me-1" size={10} />
          Active
        </span>
      );
    }
    return (
      <span className="badge" style={{ 
        padding: '0.25em 0.5em', 
        fontSize: '0.7em',
        fontWeight: '600',
        background: '#FF0000', // Solid red
        color: 'white' // White text
      }}>
        <FiUserX className="me-1" size={10} />
        Inactive
      </span>
    );
  };

  const getRoleBadge = (user) => {
    return (
      <span className="badge" style={{ 
        padding: '0.25em 0.5em', 
        fontSize: '0.7em',
        fontWeight: '600',
        background: 'white', // White background
        color: 'black', // Black text
        border: '1px solid #dee2e6' // Light border
      }}>
        {user.role || 'User'}
      </span>
    );
  };

const getMembershipBadge = (user) => {

  // If null, undefined, or an empty membership object
  if (
    !user.membership || 
    user.membership.status == null || 
    user.membership.plan_name == null
  ) {
    return (
      <span className="badge" style={{
        padding: '0.25em 0.5em',
        fontSize: '0.7em',
        fontWeight: '600',
        background: '#b6b6b6',
        color: '#333'
      }}>
        No Membership
      </span>
    );
  }

  const status = user.membership.status;

  const colors = {
    active:    { bg: "#00FF00", text: "black" },
    past_due:  { bg: "#FF9900", text: "black" },
    cancelled: { bg: "#F44336", text: "white" },
    inactive:  { bg: "#868E96", text: "white" }
  };

  const c = colors[status] || colors["inactive"];

  return (
    <span className="badge" style={{
      padding: '0.25em 0.5em',
      fontSize: '0.7em',
      fontWeight: '600',
      background: c.bg,
      color: c.text,
      border: '1px solid rgba(0,0,0,0.1)'
    }}>
      {status === "active" ? "Member" : status.replace("_", " ").toUpperCase()}
    </span>
  );
};


  const getToggleStatusButtonStyle = (user) => {
    if (user.is_active) {
      return {
        borderColor: '#00FF00',
        color: '#00FF00',
        background: 'rgba(0, 255, 0, 0.1)',
        padding: '0.25rem 0.5rem'
      };
    }
    return {
      borderColor: '#FF0000', 
      color: '#FF0000',
      background: 'rgba(255, 0, 0, 0.1)',
      padding: '0.25rem 0.5rem'
    };
  };

  const getUserDisplayName = (user) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    } else if (user.name) {
      return user.name;
    } else {
      return user.email;
    }
  };

  if (loading) {
    return (
      <div className="page-content">
        <div className="container">
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
            <div className="text-center">
              <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem', color: '#3D52A0' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted">Loading users...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="container-fluid">
        <div className="about-header mb-4">
          <h1 className="display-font about-title" style={{ color: '#3D52A0' }}>User Management</h1>
          <p className="about-subtitle body-font" style={{ color: '#3D52A0' }}>
            Manage user accounts, roles, and permissions
          </p>
        </div>

        {/* Stats Cards with your color scheme */}
        <div className="row mb-4">
          <div className="col-md-3 col-6 mb-3">
            <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #EDE8F5, #ADBBDA)' }}>
              <div className="card-body text-center" style={{ color: '#3D52A0' }}>
                <FiUser size={24} className="mb-2" />
                <h6 className="card-title mb-1 fw-semibold">Total Users</h6>
                <h3 className="mb-0 fw-bold" style={{ color: 'black' }}>{users.length}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-6 mb-3">
            <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #ADBBDA, #8697C4)' }}>
              <div className="card-body text-center" style={{ color: '#3D52A0' }}>
                <FiUserCheck size={24} className="mb-2" />
                <h6 className="card-title mb-1 fw-semibold">Active Users</h6>
                <h3 className="mb-0 fw-bold" style={{ color: 'black' }}>{users.filter(u => u.is_active).length}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-6 mb-3">
            <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #8697C4, #7091E6)' }}>
              <div className="card-body text-center" style={{ color: 'white' }}>
                <FiUserX size={24} className="mb-2" />
                <h6 className="card-title mb-1 fw-semibold">Inactive Users</h6>
                <h3 className="mb-0 fw-bold">{users.filter(u => !u.is_active).length}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-6 mb-3">
            <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #7091E6, #3D52A0)' }}>
              <div className="card-body text-center" style={{ color: 'white' }}>
                <FiShield size={24} className="mb-2" />
                <h6 className="card-title mb-1 fw-semibold">Administrators</h6>
                <h3 className="mb-0 fw-bold">{users.filter(u => u.role === 'Administrator').length}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card border-0 shadow-sm mb-4" style={{ background: '#EDE8F5', border: '1px solid #ADBBDA' }}>
          <div className="card-body">
            <div className="row g-3 align-items-end">
              <div className="col-md-4">
                <label className="form-label fw-semibold" style={{ color: '#3D52A0' }}>Search Users</label>
                <div className="input-group">
                  <span className="input-group-text" style={{ background: '#ADBBDA', borderColor: '#8697C4', color: '#3D52A0' }}>
                    <FiSearch size={18} />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    style={{ borderColor: '#8697C4', color: 'black' }}
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold" style={{ color: '#3D52A0' }}>Status</label>
                <select
                  className="form-select"
                  style={{ borderColor: '#8697C4', color: 'black' }}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold" style={{ color: '#3D52A0' }}>Role</label>
                <select
                  className="form-select"
                  style={{ borderColor: '#8697C4', color: 'black' }}
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  <option value="User">User</option>
                  <option value="Member">Member</option>
                  <option value="Provider">Provider</option>
                  <option value="Administrator">Administrator</option>
                </select>
              </div>
              <div className="col-md-2">
                <button 
                  className="btn w-100"
                  style={{ background: '#8697C4', borderColor: '#8697C4', color: 'white' }}
                  onClick={loadUsers}
                  disabled={busy}
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="card border-0 shadow-sm" style={{ background: '#EDE8F5', border: '1px solid #ADBBDA' }}>
          <div className="card-body p-2">
            {error && (
              <div className="alert alert-danger d-flex align-items-center" role="alert" style={{ background: '#8697C4', borderColor: '#7091E6', color: 'white' }}>
                <FiUserX className="me-2" size={18} />
                {error}
              </div>
            )}

            <div className="table-responsive">
              <table className="table table-hover align-middle" style={{ fontSize: '0.85rem' }}>
                <thead style={{ background: 'linear-gradient(135deg, #ADBBDA, #8697C4)' }}>
                  <tr>
                    <th style={{ color: '#3D52A0', borderColor: '#8697C4', fontSize: '0.8rem', padding: '0.5rem' }}>User</th>
                    <th style={{ color: '#3D52A0', borderColor: '#8697C4', fontSize: '0.8rem', padding: '0.5rem' }}>Email</th>
                    <th style={{ color: '#3D52A0', borderColor: '#8697C4', fontSize: '0.8rem', padding: '0.5rem' }}>Role</th>
                    <th style={{ color: '#3D52A0', borderColor: '#8697C4', fontSize: '0.8rem', padding: '0.5rem' }}>Status</th>
                    <th style={{ color: '#3D52A0', borderColor: '#8697C4', fontSize: '0.8rem', padding: '0.5rem' }}>Membership</th>
                    <th style={{ color: '#3D52A0', borderColor: '#8697C4', fontSize: '0.8rem', padding: '0.5rem' }}>Account Created</th>
                    <th style={{ color: '#3D52A0', borderColor: '#8697C4', fontSize: '0.8rem', padding: '0.5rem' }}>Last Updated</th>
                    <th className="text-center" style={{ color: '#3D52A0', borderColor: '#8697C4', fontSize: '0.8rem', padding: '0.5rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5" style={{ color: '#3D52A0' }}>
                        <FiUser size={48} className="mb-3" style={{ color: '#8697C4' }} />
                        <p className="mb-0">
                          {users.length === 0 ? "No users found in database" : "No users match your search criteria"}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className={editingId === user.id ? 'table-active' : ''} style={{ borderColor: '#ADBBDA' }}>
                        <td style={{ padding: '0.5rem' }}>
                          <div className="d-flex align-items-center">
                            <div>
                              <div className="fw-semibold" style={{ color: 'black', fontSize: '0.8rem' }}>
                                {getUserDisplayName(user)}
                              </div>
                              <small style={{ color: '#8697C4', fontSize: '0.7rem' }}>
                                {user.auth_provider === 'google-oauth2' ? 'Google Login' : 'Email Login'}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td style={{ color: 'black', fontSize: '0.8rem', padding: '0.5rem' }}>
                          <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {user.email}
                          </div>
                        </td>
                        <td style={{ padding: '0.5rem' }}>{getRoleBadge(user)}</td>
                        <td style={{ padding: '0.5rem' }}>{getStatusBadge(user)}</td>
                        <td style={{ padding: '0.5rem' }}>{getMembershipBadge(user)}</td>
                        <td style={{ color: 'black', fontSize: '0.8rem', padding: '0.5rem' }}>{formatDate(user.created_at)}</td>
                        <td style={{ color: 'black', fontSize: '0.8rem', padding: '0.5rem' }}>{formatDate(user.updated_at)}</td>
                        <td style={{ padding: '0.5rem' }}>
                          <div className="d-flex justify-content-center gap-1">
                            {editingId === user.id ? (
                              <div className="d-flex gap-1">
                                <button
                                  className="btn btn-success btn-sm"
                                  style={{ background: '#7091E6', borderColor: '#7091E6', padding: '0.25rem 0.5rem' }}
                                  onClick={() => saveUser(editingId)}
                                  disabled={busy}
                                >
                                  <FiSave size={12} />
                                </button>
                                <button
                                  className="btn btn-secondary btn-sm"
                                  style={{ background: '#8697C4', borderColor: '#8697C4', padding: '0.25rem 0.5rem' }}
                                  onClick={cancelEdit}
                                  disabled={busy}
                                >
                                  <FiX size={12} />
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  className="btn btn-outline-primary btn-sm"
                                  style={{ borderColor: '#7091E6', color: '#7091E6', padding: '0.25rem 0.5rem' }}
                                  onClick={() => startEdit(user)}
                                  disabled={busy}
                                  title="Edit User"
                                >
                                  <FiEdit size={12} />
                                </button>
                                <button
                                  className="btn btn-outline-warning btn-sm"
                                  style={getToggleStatusButtonStyle(user)}
                                  onClick={() => toggleUserStatus(user)}
                                  disabled={busy}
                                  title={user.is_active ? "Deactivate User" : "Activate User"}
                                >
                                  {user.is_active ? <FiUserX size={12} /> : <FiUserCheck size={12} />}
                                </button>
                                <button
                                  className="btn btn-outline-danger btn-sm"
                                  style={{ borderColor: '#3D52A0', color: '#3D52A0', padding: '0.25rem 0.5rem' }}
                                  onClick={() => deleteUser(user.id)}
                                  disabled={busy || user.id === editingId}
                                  title="Delete User"
                                >
                                  <FiTrash2 size={12} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Edit Form - Maintains your original styling */}
            {editingId && (
              <div className="card mt-4" style={{ borderColor: '#3D52A0', background: '#EDE8F5' }}>
                <div className="card-header text-white d-flex justify-content-between align-items-center" style={{ background: '#3D52A0' }}>
                  <h5 className="mb-0">Edit User</h5>
                  <button
                    className="btn btn-sm"
                    style={{ background: '#ADBBDA', borderColor: '#ADBBDA', color: '#3D52A0' }}
                    onClick={cancelEdit}
                    disabled={busy}
                  >
                    <FiX size={16} />
                  </button>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ color: '#3D52A0' }}>First Name</label>
                      <input
                        type="text"
                        className="form-control"
                        style={{ borderColor: '#ADBBDA', color: 'black' }}
                        value={editForm.first_name}
                        onChange={(e) => updateEditForm('first_name', e.target.value)}
                        placeholder="Enter first name"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ color: '#3D52A0' }}>Last Name</label>
                      <input
                        type="text"
                        className="form-control"
                        style={{ borderColor: '#ADBBDA', color: 'black' }}
                        value={editForm.last_name}
                        onChange={(e) => updateEditForm('last_name', e.target.value)}
                        placeholder="Enter last name"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ color: '#3D52A0' }}>Display Name</label>
                      <input
                        type="text"
                        className="form-control"
                        style={{ borderColor: '#ADBBDA', color: 'black' }}
                        value={editForm.name}
                        onChange={(e) => updateEditForm('name', e.target.value)}
                        placeholder="Enter display name"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ color: '#3D52A0' }}>Email Address</label>
                      <input
                        type="email"
                        className="form-control"
                        style={{ borderColor: '#ADBBDA', color: 'black' }}
                        value={editForm.email}
                        onChange={(e) => updateEditForm('email', e.target.value)}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ color: '#3D52A0' }}>Role</label>
                      <select
                        className="form-select"
                        style={{ borderColor: '#ADBBDA', color: 'black' }}
                        value={editForm.role}
                        onChange={(e) => updateEditForm('role', e.target.value)}
                      >
                        <option value="User">User</option>
                        <option value="Member">Member</option>
                        <option value="Provider">Provider</option>
                        <option value="Administrator">Administrator</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <div className="form-check form-switch mt-4">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          style={{ backgroundColor: '#ADBBDA', borderColor: '#8697C4' }}
                          checked={editForm.is_active}
                          onChange={(e) => updateEditForm('is_active', e.target.checked)}
                          id="activeSwitch"
                        />
                        <label className="form-check-label fw-semibold" style={{ color: '#3D52A0' }} htmlFor="activeSwitch">
                          Active User
                        </label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-check form-switch mt-4">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          style={{ backgroundColor: '#ADBBDA', borderColor: '#8697C4' }}
                          checked={editForm.is_admin}
                          onChange={(e) => updateEditForm('is_admin', e.target.checked)}
                          id="adminSwitch"
                        />
                        <label className="form-check-label fw-semibold" style={{ color: '#3D52A0' }} htmlFor="adminSwitch">
                          Administrator
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="row mt-4">
                    <div className="col-12">
                      <div className="d-flex gap-2 justify-content-end">
                        <button
                          className="btn btn-sm"
                          style={{ 
                            background: '#8697C4', 
                            borderColor: '#8697C4', 
                            color: 'white',
                            padding: '0.375rem 0.75rem',
                            fontSize: '0.875rem'
                          }}
                          onClick={cancelEdit}
                          disabled={busy}
                        >
                          <FiX className="me-1" size={14} />
                          Cancel
                        </button>
                        <button
                          className="btn btn-sm"
                          style={{ 
                            background: '#3D52A0', 
                            borderColor: '#3D52A0', 
                            color: 'white',
                            padding: '0.375rem 0.75rem',
                            fontSize: '0.875rem'
                          }}
                          onClick={() => saveUser(editingId)}
                          disabled={busy}
                        >
                          <FiSave className="me-1" size={14} />
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}