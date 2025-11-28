import React, { useEffect, useState } from "react";
import useAuthFetch from "@/hooks/useAuthFetch";

export default function UserManagement() {
  const authFetch = useAuthFetch();
  const [users, setUsers] = useState([]);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    const data = await authFetch("/api/admin/users");
    setUsers(data);
  }

  function updateUserField(id, field, value) {
    setUsers(prev =>
      prev.map(u => (u.id === id ? { ...u, [field]: value } : u))
    );
  }

  async function saveUser(id) {
    const user = users.find(u => u.id === id);
    setSavingId(id);

    await authFetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        is_admin: user.is_admin,
        role: user.role,
        is_active: user.is_active,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        name: user.name
      })
    });

    setSavingId(null);
    loadUsers();
  }

  return (
    <main className="page-content pt-small container">
      <h1 className="display-font text-center mb-5">User Management</h1>

      <div className="table-responsive">
        <table className="table table-striped table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Admin</th>
              <th>Active</th>
              <th>Save</th>
            </tr>
          </thead>

          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>
                  <input
                    className="form-control"
                    value={user.name || ""}
                    onChange={e =>
                      updateUserField(user.id, "name", e.target.value)
                    }
                  />
                </td>

                <td>
                  <input
                    className="form-control"
                    value={user.email || ""}
                    onChange={e =>
                      updateUserField(user.id, "email", e.target.value)
                    }
                  />
                </td>

                <td>
                  <select
                    className="form-select"
                    value={user.role || "User"}
                    onChange={e =>
                      updateUserField(user.id, "role", e.target.value)
                    }
                  >
                    <option>User</option>
                    <option>Administrator</option>
                    <option>Provider</option>
                  </select>
                </td>

                <td>
                  <input
                    type="checkbox"
                    checked={user.is_admin}
                    onChange={e =>
                      updateUserField(user.id, "is_admin", e.target.checked)
                    }
                  />
                </td>

                <td>
                  <input
                    type="checkbox"
                    checked={user.is_active}
                    onChange={e =>
                      updateUserField(user.id, "is_active", e.target.checked)
                    }
                  />
                </td>

                <td>
                  <button
                    className="btn btn-primary"
                    disabled={savingId === user.id}
                    onClick={() => saveUser(user.id)}
                  >
                    {savingId === user.id ? "Saving..." : "Save"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
