import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';

const AdminDashboard = () => {
  const { isAuthenticated, loginWithRedirect, logout, user, getAccessTokenSilently } = useAuth0();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [csrfToken, setCsrfToken] = useState('');
  const [newMembership, setNewMembership] = useState({
    membership_plan_id: '',
    status: 'active',
    start_date: '',
    end_date: ''
  });

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  // Fetch CSRF token from backend
  const fetchCsrfToken = async () => {
    try {
      const res = await axios.get(`${API_BASE}/csrf-token`, { withCredentials: true });
      setCsrfToken(res.data.csrfToken);
    } catch (err) {
      console.error('Error fetching CSRF token:', err);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/admin/users`, {
        withCredentials: true,
        headers: { 'X-XSRF-TOKEN': csrfToken }
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchMemberships = async (userId) => {
    try {
      const res = await axios.get(`${API_BASE}/api/admin/users/${userId}/memberships`, {
        withCredentials: true,
        headers: { 'X-XSRF-TOKEN': csrfToken }
      });
      setMemberships(res.data);
    } catch (err) {
      console.error('Error fetching memberships:', err);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    fetchMemberships(user.id);
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await axios.patch(
        `${API_BASE}/api/admin/users/${userId}/role`,
        { role },
        {
          withCredentials: true,
          headers: { 'X-XSRF-TOKEN': csrfToken }
        }
      );
      fetchUsers();
    } catch (err) {
      console.error('Error updating role:', err);
    }
  };

  const handleNewMembershipChange = (e) => {
    const { name, value } = e.target;
    setNewMembership(prev => ({ ...prev, [name]: value }));
  };

  const handleAddMembership = async () => {
    if (!selectedUser) return;
    try {
      await axios.post(
        `${API_BASE}/api/admin/users/${selectedUser.id}/memberships`,
        newMembership,
        {
          withCredentials: true,
          headers: { 'X-XSRF-TOKEN': csrfToken }
        }
      );
      setNewMembership({ membership_plan_id: '', status: 'active', start_date: '', end_date: '' });
      fetchMemberships(selectedUser.id);
    } catch (err) {
      console.error('Error adding membership:', err);
    }
  };

  const handleDeleteMembership = async (membershipId) => {
    if (!selectedUser) return;
    try {
      await axios.delete(`${API_BASE}/api/admin/users/${selectedUser.id}/memberships/${membershipId}`, {
        withCredentials: true,
        headers: { 'X-XSRF-TOKEN': csrfToken }
      });
      fetchMemberships(selectedUser.id);
    } catch (err) {
      console.error('Error deleting membership:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCsrfToken().then(fetchUsers);
    }
  }, [isAuthenticated, csrfToken]);

  if (!isAuthenticated) {
    return (
      <div className="container mt-5">
        <h3>Please log in as an admin to view the dashboard</h3>
        <button className="btn btn-primary" onClick={() => loginWithRedirect()}>Login</button>
      </div>
    );
  }

  return (
    <div className="container my-4">
      <h2>Admin Dashboard</h2>
      <button className="btn btn-danger float-end" onClick={() => logout({ returnTo: window.location.origin })}>
        Logout
      </button>

      <div className="row mt-4">
        <div className="col-md-5">
          <h4>Users</h4>
          <ul className="list-group">
            {users.map(user => (
              <li
                key={user.id}
                className={`list-group-item ${selectedUser?.id === user.id ? 'active' : ''}`}
                onClick={() => handleSelectUser(user)}
                style={{ cursor: 'pointer' }}
              >
                {user.email} - {user.role}
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  className="float-end"
                >
                  <option value="member">Member</option>
                  <option value="provider">Provider</option>
                  <option value="admin">Admin</option>
                </select>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-md-7">
          {selectedUser && (
            <>
              <h4>Memberships for {selectedUser.email}</h4>
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Plan</th>
                    <th>Status</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {memberships.map(m => (
                    <tr key={m.id}>
                      <td>{m.plan_name}</td>
                      <td>{m.status}</td>
                      <td>{m.start_date}</td>
                      <td>{m.end_date}</td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteMembership(m.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h5>Add New Membership</h5>
              <input type="text" name="membership_plan_id" placeholder="Plan ID" value={newMembership.membership_plan_id} onChange={handleNewMembershipChange} className="form-control mb-2"/>
              <input type="text" name="status" placeholder="Status" value={newMembership.status} onChange={handleNewMembershipChange} className="form-control mb-2"/>
              <input type="date" name="start_date" value={newMembership.start_date} onChange={handleNewMembershipChange} className="form-control mb-2"/>
              <input type="date" name="end_date" value={newMembership.end_date} onChange={handleNewMembershipChange} className="form-control mb-2"/>
              <button className="btn btn-primary" onClick={handleAddMembership}>Add Membership</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
