import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

const API_BASE = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001"
).replace(/\/+$/, "");

function getCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

const emptyEvent = {
  id: null,
  title: "",
  description: "",
  location: "",
  startTime: "",
  endTime: "",
  status: "draft",
  imageUrl: "",
};

export default function AdminEvents() {
  const {
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    getAccessTokenSilently,
  } = useAuth0();

  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(emptyEvent);
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        if (isLoading) return;

        if (!isAuthenticated) {
          await loginWithRedirect({
            appState: { returnTo: "/admin/events" },
          });
          return;
        }

        setLoading(true);
        setError("");

        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          },
        });

        const url = new URL(`${API_BASE}/api/admin/events`);
        if (filterStatus && filterStatus !== "all") {
          url.searchParams.set("status", filterStatus);
        }

        const res = await fetch(url.toString(), {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        if (!alive) return;

        setEvents(data.events || []);
      } catch (err) {
        if (!alive) return;
        setError("Failed to load events.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();

    return () => {
      alive = false;
    };
  }, [
    isAuthenticated,
    isLoading,
    filterStatus,
    loginWithRedirect,
    getAccessTokenSilently,
  ]);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function onFileChange(e) {
    const f = e.target.files && e.target.files[0];
    setFile(f || null);
  }

  function startNew() {
    setForm(emptyEvent);
    setFile(null);
  }

  function startEdit(ev) {
    setForm({
      id: ev.id,
      title: ev.title || "",
      description: ev.description || "",
      location: ev.location || "",
      startTime: ev.startTime
        ? new Date(ev.startTime).toISOString().slice(0, 16)
        : "",
      endTime: ev.endTime
        ? new Date(ev.endTime).toISOString().slice(0, 16)
        : "",
      status: ev.status || "draft",
      imageUrl: ev.imageUrl || "",
    });
    setFile(null);
  }

  async function reloadList(token) {
    const url = new URL(`${API_BASE}/api/admin/events`);
    if (filterStatus && filterStatus !== "all") {
      url.searchParams.set("status", filterStatus);
    }

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await res.json();
    setEvents(data.events || []);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        },
      });

      const xsrfToken = getCookie("XSRF-TOKEN");

      const isNew = !form.id;
      const url = isNew
        ? `${API_BASE}/api/admin/events`
        : `${API_BASE}/api/admin/events/${form.id}`;
      const method = isNew ? "POST" : "PUT";

      const headers = {
        Authorization: `Bearer ${token}`,
      };
      if (xsrfToken) {
        headers["x-xsrf-token"] = xsrfToken;
      }

      let body;

      if (file) {
        const fd = new FormData();
        fd.append("title", form.title);
        fd.append("description", form.description || "");
        fd.append("location", form.location || "");
        fd.append(
          "startTime",
          form.startTime ? new Date(form.startTime).toISOString() : ""
        );
        fd.append(
          "endTime",
          form.endTime ? new Date(form.endTime).toISOString() : ""
        );
        fd.append("status", form.status);
        fd.append("imageUrl", form.imageUrl || "");
        fd.append("file", file);
        body = fd;
      } else {
        headers["Content-Type"] = "application/json";
        const payload = {
          title: form.title,
          description: form.description,
          location: form.location,
          startTime: form.startTime
            ? new Date(form.startTime).toISOString()
            : null,
          endTime: form.endTime
            ? new Date(form.endTime).toISOString()
            : null,
          status: form.status,
          imageUrl: form.imageUrl || null,
        };
        body = JSON.stringify(payload);
      }

      const res = await fetch(url, {
        method,
        headers,
        credentials: "include",
        body,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}`);
      }

      await reloadList(token);
      setForm(emptyEvent);
      setFile(null);
    } catch (err) {
      setError("Failed to save event.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(ev) {
    if (!window.confirm(`Delete event "${ev.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        },
      });

      const xsrfToken = getCookie("XSRF-TOKEN");

      const headers = {
        Authorization: `Bearer ${token}`,
      };
      if (xsrfToken) {
        headers["x-xsrf-token"] = xsrfToken;
      }

      const res = await fetch(`${API_BASE}/api/admin/events/${ev.id}`, {
        method: "DELETE",
        headers,
        credentials: "include",
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}`);
      }

      setEvents((prev) => prev.filter((e) => e.id !== ev.id));
      if (form.id === ev.id) {
        setForm(emptyEvent);
        setFile(null);
      }
    } catch (err) {
      setError("Failed to delete event.");
    }
  }

  if (isLoading || loading) {
    return (
      <div className="page-content pt-small admin-page">
        <div className="container">
          <h1 className="display-font mb-3">Manage Events</h1>
          <p className="body-font text-muted">Loading events…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="page-content pt-small admin-page">
        <div className="container">
          <h1 className="display-font mb-3">Manage Events</h1>
          <p className="body-font">
            You must be signed in as an administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content pt-small admin-page">
      <div className="container">
        <div className="about-header mb-4">
          <h1 className="display-font about-title">Admin – Events Manager</h1>
          <p className="about-subtitle body-font">
            Create, update, and manage EmpowerMed events.
          </p>
        </div>

        {error && (
          <div className="alert alert-danger body-font mb-3">{error}</div>
        )}

        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <label className="body-font me-2">Filter by status:</label>
            <select
              className="form-select d-inline-block"
              style={{ width: "180px" }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <button className="btn btn-primary" onClick={startNew}>
            + New Event
          </button>
        </div>

        <div className="row">
          <div className="col-md-6 mb-4">
            <div className="card h-100">
              <div className="card-body">
                <h2 className="h5 display-font mb-3">Events</h2>
                {events.length === 0 ? (
                  <p className="body-font text-muted mb-0">
                    No events found for this filter.
                  </p>
                ) : (
                  <ul className="list-group list-group-flush">
                    {events.map((ev) => (
                      <li
                        key={ev.id}
                        className="list-group-item d-flex justify-content-between align-items-start"
                      >
                        <div>
                          <div className="body-font fw-bold">
                            {ev.title || "Untitled event"}
                          </div>
                          <div className="body-font text-muted small">
                            {ev.status} ·{" "}
                            {ev.startTime &&
                              new Date(ev.startTime).toLocaleString()}
                            {ev.location ? ` · ${ev.location}` : ""}
                          </div>
                        </div>

                        <div className="admin-event-actions">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => startEdit(ev)}
                            type="button"
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(ev)}
                            type="button"
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="col-md-6 mb-4">
            <div className="card h-100">
              <div className="card-body">
                <h2 className="h5 display-font mb-3">
                  {form.id ? "Edit Event" : "New Event"}
                </h2>

                <form onSubmit={handleSave}>
                  <div className="mb-3">
                    <label className="form-label body-font">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      name="title"
                      value={form.title}
                      onChange={onChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label body-font">
                      Description
                    </label>
                    <textarea
                      className="form-control"
                      name="description"
                      rows={5}
                      value={form.description}
                      onChange={onChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label body-font">Location</label>
                    <input
                      type="text"
                      className="form-control"
                      name="location"
                      value={form.location}
                      onChange={onChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label body-font">
                      Image / Flyer URL (optional)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="imageUrl"
                      value={form.imageUrl}
                      onChange={onChange}
                      placeholder="https://example.com/image-or-pdf"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label body-font">
                      Upload image or PDF (optional)
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      onChange={onFileChange}
                      accept=".png,.jpg,.jpeg,.pdf"
                    />
                    <small className="text-muted body-font">
                      Allowed types: PDF, JPG, JPEG, PNG.
                    </small>
                  </div>

                  <div className="mb-3">
                    <label className="form-label body-font">
                      Start Time
                    </label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      name="startTime"
                      value={form.startTime}
                      onChange={onChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label body-font">End Time</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      name="endTime"
                      value={form.endTime}
                      onChange={onChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label body-font">Status</label>
                    <select
                      className="form-select"
                      name="status"
                      value={form.status}
                      onChange={onChange}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving…"
                      : form.id
                      ? "Save Changes"
                      : "Create Event"}
                  </button>
                  {form.id && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary ms-2"
                      onClick={startNew}
                    >
                      Cancel
                    </button>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}