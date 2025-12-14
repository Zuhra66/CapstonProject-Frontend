import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Modal, Button, Spinner } from "react-bootstrap";
import { FiSearch, FiEdit, FiTrash2, FiUserCheck, FiUserX, FiShield, FiUser, FiSave, FiX, FiAlertTriangle } from "react-icons/fi";
import '../styles/admin-dashboard.css';

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function authedJson(path, { method = "GET", body, headers = {} } = {}, getToken) {
  const upper = method.toUpperCase();
  
  let csrfToken = null;
  const m = document.cookie.match(new RegExp(`(?:^|; )XSRF-TOKEN=([^;]*)`));
  if (m) csrfToken = decodeURIComponent(m[1]);
  
  let csrfHeader = {};
  if (["POST", "PUT", "PATCH", "DELETE"].includes(upper) && csrfToken) {
    csrfHeader = { "X-XSRF-TOKEN": csrfToken };
  }

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

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignUser, setAssignUser] = useState(null);
  const [membershipType, setMembershipType] = useState(null);
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [pendingRoleChange, setPendingRoleChange] = useState(null);
  const [membershipAssigned, setMembershipAssigned] = useState(false);
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

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

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

  // CONFIRM MEMBERSHIP 
const confirmMembershipOverride = async () => {
  if (!assignUser || !membershipType) return;

  try {
    setBusy(true);

    await authedJson(
      "/memberships/admin/assign",
      {
        method: "POST",
        body: {
          userId: assignUser.id,
          membershipType, // "general" | "student"
        },
      },
      tokenGetter
    );

    // Reflect change locally so UI updates immediately
    setEditForm(prev => ({
      ...prev,
      role: "Member",
    }));

    setMembershipAssigned(true);
    setShowAssignModal(false);
    setAssignUser(null);
    setMembershipType(null);

    await loadUsers(); // refresh table
  } catch (err) {
    alert(err.message || "Failed to assign membership");
  } finally {
    setBusy(false);
  }
};

const confirmDowngrade = async () => {
  try {
    setBusy(true);

    await authedJson(
      "/memberships/admin/cancel",
      {
        method: "POST",
        body: { userId: editingId },
      },
      tokenGetter
    );

    // reflect change locally
    setEditForm(prev => ({
      ...prev,
      role: "User",
    }));

    setShowDowngradeModal(false);
    setPendingRoleChange(null);

    await loadUsers(); // refresh table
  } catch (err) {
    alert(err.message || "Failed to cancel membership");
  } finally {
    setBusy(false);
  }
};

 const updateEditForm = (field, value) => {
  // Assign Member (FREE admin override)
  if (field === "role" && value === "Member") {
    setAssignUser({
      id: editingId,
      email: editForm.email,
    });

    setMembershipType(null);
    setShowAssignModal(true);
    return;
  }

  // Downgrade Member → User (CONFIRM FIRST)
  if (field === "role" && editForm.role === "Member" && value === "User") {
    setPendingRoleChange("User");
    setShowDowngradeModal(true);
    return;
  }

  setEditForm(prev => ({ ...prev, [field]: value }));
};

  const saveUser = async (userId) => {
  try {
    setBusy(true);

    const payload = {
      first_name: editForm.first_name,
      last_name: editForm.last_name,
      name: editForm.name,
      email: editForm.email,
      is_active: editForm.is_active,
      is_admin: editForm.is_admin,
    };

    // ❌ NEVER send role or membership here
    await authedJson(
      `/api/admin/users/${userId}`,
      {
        method: "PUT",
        body: payload,
      },
      tokenGetter
    );

    setEditingId(null);
    await loadUsers(); // refresh UI

  } catch (err) {
    alert(err.message || "Failed to update user");
  } finally {
    setBusy(false);
  }
};


  const toggleUserStatus = async (user) => {
    if (!window.confirm(`Are you sure you want to ${user.is_active ? 'deactivate' : 'activate'} this user?`)) return;
    
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

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const deleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      setBusy(true);
      
      await authedJson(
        `/api/admin/users/${userToDelete.id}`,
        {
          method: "DELETE"
        },
        tokenGetter
      );

      await loadUsers();
      setShowDeleteModal(false);
      setUserToDelete(null);
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
          background: '#00FF00',
          color: 'black'
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
        background: '#FF0000',
        color: 'white'
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
        background: 'white',
        color: 'black',
        border: '1px solid #dee2e6'
      }}>
        {user.role || 'User'}
      </span>
    );
  };

  const getMembershipBadge = (user) => {
  const membership = user.membership;

  if (!membership || !membership.plan_name) {
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

  const status = membership.status;
  const plan =
  membership.plan_name
    ?.replace(" Membership", "")
    ?.replace(" membership", "");

  const colors = {
    active:    { bg: "#00FF00", text: "black" },
    past_due:  { bg: "#FF9900", text: "black" },
    cancelled: { bg: "#F44336", text: "white" },
    inactive:  { bg: "#868E96", text: "white" }
  };

  const c = colors[status] || colors["inactive"];

  return (
    <div className="d-flex flex-column">
      {/* PLAN NAME */}
      <span className="badge mb-1" style={{
        padding: '0.25em 0.5em',
        fontSize: '0.7em',
        fontWeight: '600',
        background: '#3D52A0',
        color: 'white',
      }}>
        {plan}
      </span>

      {/* STATUS */}
      <span className="badge" style={{
        padding: '0.25em 0.5em',
        fontSize: '0.7em',
        fontWeight: '600',
        background: c.bg,
        color: c.text,
        border: '1px solid rgba(0,0,0,0.1)'
      }}>
        {status.toUpperCase().replace("_", " ")}
      </span>
    </div>
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

<div className="card border-0 shadow-sm mb-4" style={{ background: '#EDE8F5', border: '1px solid #ADBBDA' }}>
  <div className="card-body">
    <div className="row g-3 align-items-center"> {/* Changed from align-items-end to align-items-center */}
      <div className="col-md-4">
        <label className="form-label fw-semibold mb-1" style={{ color: '#3D52A0' }}>Search Users</label>
        <div className="input-group" style={{ height: '38px' }}>
          <span className="input-group-text d-flex align-items-center justify-content-center" 
            style={{ 
              background: '#ADBBDA', 
              borderColor: '#8697C4', 
              color: '#3D52A0',
              padding: '0.375rem 0.75rem',
              height: '100%'
            }}>
            <FiSearch size={18} />
          </span>
          <input
            type="text"
            className="form-control"
            style={{ 
              borderColor: '#8697C4', 
              color: 'black',
              height: '100%'
            }}
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="col-md-3">
        <label className="form-label fw-semibold mb-1" style={{ color: '#3D52A0' }}>Status</label>
        <select
          className="form-select"
          style={{ 
            borderColor: '#8697C4', 
            color: 'black',
            height: '38px'
          }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
      </div>
      <div className="col-md-3">
        <label className="form-label fw-semibold mb-1" style={{ color: '#3D52A0' }}>Role</label>
        <select
          className="form-select"
          style={{ 
            borderColor: '#8697C4', 
            color: 'black',
            height: '38px'
          }}
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
        <label className="form-label fw-semibold mb-1" style={{ color: '#3D52A0', opacity: 0 }}>Actions</label>
        <button 
          className="btn w-100 d-flex align-items-center justify-content-center"
          style={{ 
            background: '#8697C4', 
            borderColor: '#8697C4', 
            color: 'white',
            borderRadius: '0.375rem',
            height: '38px',
            padding: '0'
          }}
          onClick={loadUsers}
          disabled={busy}
        >
          {busy ? 'Loading...' : 'Refresh'}
        </button>
      </div>
    </div>
  </div>
</div>

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
                    <th style={{ color: '#3D52A0', borderColor: '#8697C4', fontSize: '0.8rem', padding: '0.5rem' }}>Membership Type</th>
                    <th style={{ color: '#3D52A0', borderColor: '#8697C4', fontSize: '0.8rem', padding: '0.5rem' }}>Account Created</th>
                    <th style={{ color: '#3D52A0', borderColor: '#8697C4', fontSize: '0.8rem', padding: '0.5rem' }}>Last Updated</th>
                    <th className="text-center" style={{ color: '#3D52A0', borderColor: '#8697C4', fontSize: '0.8rem', padding: '0.5rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-5" style={{ color: '#3D52A0' }}>
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
                                  onClick={() => openDeleteModal(user)}
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

      <Modal
        show={showAssignModal}
        onHide={() => !busy && setShowAssignModal(false)}
        centered
      >
          <Modal.Header closeButton={!busy}>
            <Modal.Title>⚠️ Assign Membership</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <p>
              You are manually assigning <strong>{assignUser?.email}</strong> as a
              <strong> Member</strong>.
            </p>

            <p>Please choose the membership type:</p>

            <div className="mt-3 d-flex flex-column gap-2">
              <label>
                <input
                  type="radio"
                  name="membershipType"
                  value="general"
                  checked={membershipType === "general"}
                  onChange={() => setMembershipType("general")}
                />{" "}
                General Membership
              </label>

              <label>
                <input
                  type="radio"
                  name="membershipType"
                  value="student"
                  checked={membershipType === "student"}
                  onChange={() => setMembershipType("student")}
                />{" "}
                Student Membership
              </label>
            </div>

            <div className="alert alert-warning mt-3" style={{ fontSize: "0.85rem" }}>
              This is a manual admin override. No billing or PayPal subscription will occur.
            </div>
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowAssignModal(false)}
              disabled={busy}
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              disabled={!membershipType || busy}
              onClick={confirmMembershipOverride}
            >
              {busy ? "Assigning..." : "Confirm Assignment"}
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal
        show={showDowngradeModal}
        onHide={() => !busy && setShowDowngradeModal(false)}
        centered
      >
        <Modal.Header closeButton={!busy}>
          <Modal.Title>⚠️ Cancel Membership</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>
            Downgrading this user to <strong>User</strong> will:
          </p>

          <ul style={{ fontSize: "0.9rem" }}>
            <li>Cancel their active membership</li>
            <li>Revoke member access</li>
            <li>Stop future billing (if applicable)</li>
          </ul>

          <div className="alert alert-warning mt-3" style={{ fontSize: "0.85rem" }}>
            This action cannot be undone.
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            disabled={busy}
            onClick={() => {
              setShowDowngradeModal(false);
              setPendingRoleChange(null);
            }}
          >
            Cancel
          </Button>

          <Button
            variant="danger"
            disabled={busy}
            onClick={confirmDowngrade}
          >
            Confirm Downgrade
          </Button>

        </Modal.Footer>
      </Modal>


      <Modal 
        show={showDeleteModal} 
        onHide={() => !busy && setShowDeleteModal(false)} 
        centered
        backdrop={busy ? "static" : true}
        size="sm"
        className="modal-dark"
      >
        <Modal.Header className="modal-header-custom" closeButton={!busy}>
          <Modal.Title>
            <FiAlertTriangle className="me-2" />
            Confirm Delete
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="modal-body-custom text-center">
          <div className="error-icon mb-3">
            <FiAlertTriangle size={48} />
          </div>
          <p className="mb-3">
            Are you sure you want to delete <strong>{userToDelete?.email}</strong>?
          </p>
          <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
            This action cannot be undone.
          </p>
        </Modal.Body>
        
        <Modal.Footer className="modal-footer-custom">
          <Button 
            variant="secondary" 
            onClick={() => setShowDeleteModal(false)}
            disabled={busy}
            className="modal-btn-cancel"
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={deleteUser}
            disabled={busy}
            className="modal-btn-confirm"
          >
            {busy ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}