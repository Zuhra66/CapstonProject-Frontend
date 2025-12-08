// src/pages/AdminBlog.jsx
import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
//import "../styles/Admin.css"; // adjust if you have a different admin stylesheet

const API_BASE = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001"
).replace(/\/+$/, "");

const emptyForm = {
  id: null,
  title: "",
  slug: "",
  contentMd: "",
  status: "draft",
  publishedAt: "",
};

export default function AdminBlog() {
  const { isAuthenticated, isLoading, loginWithRedirect, getAccessTokenSilently } =
    useAuth0();

  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load posts
  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        if (isLoading) return;

        if (!isAuthenticated) {
          await loginWithRedirect({
            appState: { returnTo: "/admin/blog" },
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

        const url = new URL(`${API_BASE}/api/admin/blog-posts`);
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
          console.error("Failed to load blog posts:", res.status, text);
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        if (!alive) return;

        setPosts(data.posts || []);
      } catch (err) {
        console.error("Admin blog error:", err);
        if (!alive) return;
        setError("Failed to load blog posts.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();

    return () => {
      alive = false;
    };
  }, [isAuthenticated, isLoading, filterStatus, loginWithRedirect, getAccessTokenSilently]);

  function onChange(e) {
    const { name, value } = e.target;

    if (name === "title" && !form.id && !form.slug) {
      // auto-generate slug for new posts if not set
      const slugified = value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      setForm((f) => ({ ...f, title: value, slug: slugified }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  }

  function startNew() {
    setForm(emptyForm);
  }

  function startEdit(post) {
    setForm({
      id: post.id,
      title: post.title || "",
      slug: post.slug || "",
      contentMd: post.contentMd || post.content_md || "",
      status: post.status || "draft",
      publishedAt: post.publishedAt
        ? new Date(post.publishedAt).toISOString().slice(0, 16) // "YYYY-MM-DDTHH:mm"
        : "",
    });
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

      const payload = {
        title: form.title,
        slug: form.slug,
        contentMd: form.contentMd,
        status: form.status,
        publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : null,
      };

      const isNew = !form.id;
      const url = isNew
        ? `${API_BASE}/api/admin/blog-posts`
        : `${API_BASE}/api/admin/blog-posts/${form.id}`;

      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Save blog post failed:", res.status, text);
        throw new Error(`HTTP ${res.status}`);
      }

      // reload list
      const refreshed = await fetch(
        `${API_BASE}/api/admin/blog-posts?status=${filterStatus}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const data = await refreshed.json();
      setPosts(data.posts || []);
      setForm(emptyForm);
    } catch (err) {
      console.error("Admin blog save error:", err);
      setError("Failed to save blog post.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(post) {
    if (!window.confirm(`Delete post "${post.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        },
      });

      const res = await fetch(
        `${API_BASE}/api/admin/blog-posts/${post.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      if (!res.ok) {
        const text = await res.text();
        console.error("Delete blog post failed:", res.status, text);
        throw new Error(`HTTP ${res.status}`);
      }

      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      if (form.id === post.id) {
        setForm(emptyForm);
      }
    } catch (err) {
      console.error("Admin blog delete error:", err);
      setError("Failed to delete blog post.");
    }
  }

  if (isLoading || loading) {
    return (
      <div className="page-content pt-small">
        <div className="container">
          <h1 className="display-font mb-3">Manage Blog</h1>
          <p className="body-font text-muted">Loading blog posts…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="page-content pt-small">
        <div className="container">
          <h1 className="display-font mb-3">Manage Blog</h1>
          <p className="body-font">You must be signed in as an administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content pt-small">
      <div className="container">
        <div className="about-header mb-4">
          <h1 className="display-font about-title">Admin – Blog Manager</h1>
          <p className="about-subtitle body-font">
            Create, edit, publish, and archive EmpowerMed blog posts.
          </p>
        </div>

        {error && (
          <div className="alert alert-danger body-font mb-3">
            {error}
          </div>
        )}

        {/* Filter + New button */}
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
            </select>
          </div>

          <button className="btn btn-primary" onClick={startNew}>
            + New Post
          </button>
        </div>

        {/* Main layout: list + form */}
        <div className="row">
          <div className="col-md-6 mb-4">
            <div className="card h-100">
              <div className="card-body">
                <h2 className="h5 display-font mb-3">Posts</h2>
                {posts.length === 0 ? (
                  <p className="body-font text-muted mb-0">
                    No posts found for this filter.
                  </p>
                ) : (
                  <ul className="list-group list-group-flush">
                    {posts.map((post) => (
                      <li
                        key={post.id}
                        className="list-group-item d-flex justify-content-between align-items-start"
                      >
                        <div>
                          <div className="body-font fw-bold">
                            {post.title || "Untitled post"}
                          </div>
                          <div className="body-font text-muted small">
                            {post.status} · {post.slug}
                          </div>
                        </div>
                        <div>
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => startEdit(post)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(post)}
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
                  {form.id ? "Edit Post" : "New Post"}
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
                      Slug (URL text)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="slug"
                      value={form.slug}
                      onChange={onChange}
                    />
                    <div className="form-text body-font text-muted">
                      Auto-generated from the title, but you can customize it.
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label body-font">
                      Content (Markdown or plain text)
                    </label>
                    <textarea
                      className="form-control"
                      name="contentMd"
                      rows={8}
                      value={form.contentMd}
                      onChange={onChange}
                      required
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
                    </select>
                    <div className="form-text body-font text-muted">
                      Draft posts are not visible on the public blog.
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label body-font">
                      Published At (optional)
                    </label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      name="publishedAt"
                      value={form.publishedAt}
                      onChange={onChange}
                    />
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
                      : "Create Post"}
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
