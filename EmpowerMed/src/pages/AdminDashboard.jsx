import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';

const AdminDashboard = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [newMembership, setNewMembership] = useState({
    membership_plan_id: '',
    status: 'active',
    start_date: '',
    end_date: ''
  });

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const fetchUsers = async () => {
    const token = await getAccessTokenSilently();
    const res = await axios.get(`${API_BASE}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUsers(res.data);
  };

  const fetchMemberships = async (userId) => {
    const token = await getAccessTokenSilently();
    const res = await axios.get(`${API_BASE}/api/admin/users/${userId}/memberships`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setMemberships(res.data);
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    fetchMemberships(user.id);
  };

  const handleRoleChange = async (userId, role) => {
    const token = await getAccessTokenSilently();
    await axios.patch(`${API_BASE}/api/admin/users/${userId}/role`, { role }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchUsers();
  };

  const handleNewMembershipChange = (e) => {
    const { name, value } = e.target;
    setNewMembership(prev => ({ ...prev, [name]: value }));
  };

  const handleAddMembership = async () => {
    if (!selectedUser) return;
    const token = await getAccessTokenSilently();
    await axios.post(`${API_BASE}/api/admin/users/${selectedUser.id}/memberships`, newMembership, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setNewMembership({ membership_plan_id: '', status: 'active', start_date: '', end_date: '' });
    fetchMemberships(selectedUser.id);
  };

  const handleDeleteMembership = async (membershipId) => {
    if (!selectedUser) return;
    const token = await getAccessTokenSilently();
    await axios.delete(`${API_BASE}/api/admin/users/${selectedUser.id}/memberships/${membershipId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchMemberships(selectedUser.id);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="container my-4">
      <h2>Admin Dashboard</h2>

      <div className="row">
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
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteMembership(m.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h5>Add New Membership</h5>
              <div className="mb-2">
                <input
                  type="text"
                  name="membership_plan_id"
                  placeholder="Plan ID"
                  value={newMembership.membership_plan_id}
                  onChange={handleNewMembershipChange}
                  className="form-control mb-2"
                />
                <input
                  type="text"
                  name="status"
                  placeholder="Status"
                  value={newMembership.status}
                  onChange={handleNewMembershipChange}
                  className="form-control mb-2"
                />
                <input
                  type="date"
                  name="start_date"
                  placeholder="Start Date"
                  value={newMembership.start_date}
                  onChange={handleNewMembershipChange}
                  className="form-control mb-2"
                />
                <input
                  type="date"
                  name="end_date"
                  placeholder="End Date"
                  value={newMembership.end_date}
                  onChange={handleNewMembershipChange}
                  className="form-control mb-2"
                />
                <button className="btn btn-primary" onClick={handleAddMembership}>Add Membership</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
