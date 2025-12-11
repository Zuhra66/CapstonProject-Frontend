// src/pages/AdminEducation.jsx
import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5001").replace(
  /\/+$/,
  ""
);

// helper: convert array -> "tag1, tag2"
const tagsToString = (tags) => (Array.isArray(tags) ? tags.join(", ") : "");

// generic authenticated fetch helper for this page
async function authedFetch(getAccessTokenSilently, path, options = {}) {
  const token = await getAccessTokenSilently({
    authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
  });

  const isFormData = options.body instanceof FormData;

  // 🔐 Read CSRF token from cookie
  let xsrfToken = null;
  if (typeof document !== "undefined") {
    const match = document.cookie
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("XSRF-TOKEN="));
    if (match) {
      xsrfToken = decodeURIComponent(match.split("=", 2)[1]);
    }
  }

  // Build headers, respecting FormData & any custom headers
  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  };

  // Only set Content-Type for non-FormData; browser sets it automatically for FormData
  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  // Add CSRF header if we have a token
  if (xsrfToken) {
    headers["X-XSRF-TOKEN"] = xsrfToken;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...options,
    headers,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err = new Error(
      `Request failed with ${res.status} ${res.statusText} ${text}`
    );
    err.status = res.status;
    err.body = text;
    throw err;
  }
  // if response has no body (e.g. DELETE), just return null
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return null;
  return res.json();
}

export default function AdminEducation() {
  const {
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    getAccessTokenSilently,
  } = useAuth0();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [articles, setArticles] = useState([]);
  const [videos, setVideos] = useState([]);

  // which section is active in UI
  const [section, setSection] = useState("articles");

  // forms
  const [articleForm, setArticleForm] = useState({
    id: null,
    title: "",
    summary: "",
    minutes: "",
    tags: "",
    cover_url: "",
    href: "",
    is_active: true,
    coverFile: null, // ✅ new: local file for cover image
  });

  const [videoForm, setVideoForm] = useState({
    id: null,
    title: "",
    duration: "",
    tags: "",
    thumb_url: "",
    href: "",
    is_active: true,
  });

  const isEditingArticle = articleForm.id !== null;
  const isEditingVideo = videoForm.id !== null;

  /* ---------------------- LOAD DATA ---------------------- */
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        if (isLoading) return;

        if (!isAuthenticated) {
          await loginWithRedirect({
            appState: { returnTo: window.location.pathname },
          });
          return;
        }

        setLoading(true);
        setError("");

        const [articlesRes, videosRes] = await Promise.all([
          authedFetch(getAccessTokenSilently, "/api/admin/education/articles"),
          authedFetch(getAccessTokenSilently, "/api/admin/education/videos"),
        ]);

        if (!alive) return;

        setArticles(articlesRes.articles || []);
        setVideos(videosRes.videos || []);
      } catch (err) {
        console.error("Admin education load error:", err);
        if (!alive) return;
        setError("Failed to load education content.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [isLoading, isAuthenticated, loginWithRedirect, getAccessTokenSilently]);

  /* ---------------------- FORM HANDLERS ---------------------- */
  const handleArticleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    // ✅ handle file input separately
    if (name === "coverFile") {
      const file = files && files[0] ? files[0] : null;
      setArticleForm((f) => ({
        ...f,
        coverFile: file,
      }));
      return;
    }

    setArticleForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleVideoChange = (e) => {
    const { name, value, type, checked } = e.target;
    setVideoForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /* ---- edit / reset helpers ---- */
  const resetArticleForm = () =>
    setArticleForm({
      id: null,
      title: "",
      summary: "",
      minutes: "",
      tags: "",
      cover_url: "",
      href: "",
      is_active: true,
      coverFile: null,
    });

  const resetVideoForm = () =>
    setVideoForm({
      id: null,
      title: "",
      duration: "",
      tags: "",
      thumb_url: "",
      href: "",
      is_active: true,
    });

  const editArticle = (a) => {
    setSection("articles");
    setArticleForm({
      id: a.id,
      title: a.title || "",
      summary: a.summary || "",
      minutes: a.minutes ?? "",
      tags: tagsToString(a.tags),
      cover_url: a.cover_url || "",
      href: a.href || "",
      is_active: a.is_active ?? true,
      coverFile: null, // reset file when editing
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const editVideo = (v) => {
    setSection("videos");
    setVideoForm({
      id: v.id,
      title: v.title || "",
      duration: v.duration || "",
      tags: tagsToString(v.tags),
      thumb_url: v.thumb_url || "",
      href: v.href || "",
      is_active: v.is_active ?? true,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ---------------------- SUBMIT HANDLERS ---------------------- */
  const submitArticle = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);

      if (!articleForm.title.trim()) {
        alert("Title is required.");
        return;
      }

      const minutesValue =
        articleForm.minutes === "" ? null : Number(articleForm.minutes);

      const baseFields = {
        title: articleForm.title.trim(),
        summary: articleForm.summary.trim(),
        minutes: Number.isFinite(minutesValue) ? minutesValue : null,
        tags: articleForm.tags,
        href: articleForm.href.trim() || null,
        is_active: !!articleForm.is_active,
      };

      let path;
      let method;

      if (isEditingArticle) {
        path = `/api/admin/education/articles/${articleForm.id}`;
        method = "PUT";
      } else {
        path = `/api/admin/education/articles`;
        method = "POST";
      }

      let saved;

      if (articleForm.coverFile) {
        // ✅ send multipart/form-data when a file is chosen
        const formData = new FormData();
        formData.append("title", baseFields.title);
        formData.append("summary", baseFields.summary);
        if (baseFields.minutes !== null) {
          formData.append("minutes", String(baseFields.minutes));
        }
        formData.append("tags", baseFields.tags || "");
        formData.append("href", baseFields.href || "");
        formData.append("is_active", baseFields.is_active ? "true" : "false");

        // field name "file" – match your backend multer config
        formData.append("file", articleForm.coverFile);

        saved = await authedFetch(getAccessTokenSilently, path, {
          method,
          body: formData,
        });
      } else {
        // ✅ no file: send JSON as before (cover_url still supported)
        const payload = {
          ...baseFields,
          cover_url: articleForm.cover_url.trim() || null,
        };

        saved = await authedFetch(getAccessTokenSilently, path, {
          method,
          body: JSON.stringify(payload),
        });
      }

      setArticles((prev) => {
        if (isEditingArticle) {
          return prev.map((a) => (a.id === saved.id ? saved : a));
        }
        return [saved, ...prev];
      });

      resetArticleForm();
    } catch (err) {
      console.error("Save education article error:", err);
      alert("Failed to save article.");
    } finally {
      setSaving(false);
    }
  };

  const submitVideo = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);

      if (!videoForm.title.trim()) {
        alert("Title is required.");
        return;
      }

      const payload = {
        title: videoForm.title.trim(),
        duration: videoForm.duration.trim() || null,
        tags: videoForm.tags,
        thumb_url: videoForm.thumb_url.trim() || null,
        href: videoForm.href.trim() || null, // ✅ video link (YouTube, Vimeo, etc.)
        is_active: !!videoForm.is_active,
      };

      let saved;
      if (isEditingVideo) {
        saved = await authedFetch(
          getAccessTokenSilently,
          `/api/admin/education/videos/${videoForm.id}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          }
        );
      } else {
        saved = await authedFetch(
          getAccessTokenSilently,
          `/api/admin/education/videos`,
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );
      }

      setVideos((prev) => {
        if (isEditingVideo) {
          return prev.map((v) => (v.id === saved.id ? saved : v));
        }
        return [saved, ...prev];
      });

      resetVideoForm();
    } catch (err) {
      console.error("Save education video error:", err);
      alert("Failed to save video.");
    } finally {
      setSaving(false);
    }
  };

  /* ---------------------- DELETE HANDLERS ---------------------- */
  const deleteArticle = async (a) => {
    if (!window.confirm(`Delete article "${a.title}"?`)) return;
    try {
      setSaving(true);
      await authedFetch(
        getAccessTokenSilently,
        `/api/admin/education/articles/${a.id}`,
        { method: "DELETE" }
      );
      setArticles((prev) => prev.filter((x) => x.id !== a.id));
      if (articleForm.id === a.id) resetArticleForm();
    } catch (err) {
      console.error("Delete article error:", err);
      alert("Failed to delete article.");
    } finally {
      setSaving(false);
    }
  };

  const deleteVideo = async (v) => {
    if (!window.confirm(`Delete video "${v.title}"?`)) return;
    try {
      setSaving(true);
      await authedFetch(
        getAccessTokenSilently,
        `/api/admin/education/videos/${v.id}`,
        { method: "DELETE" }
      );
      setVideos((prev) => prev.filter((x) => x.id !== v.id));
      if (videoForm.id === v.id) resetVideoForm();
    } catch (err) {
      console.error("Delete video error:", err);
      alert("Failed to delete video.");
    } finally {
      setSaving(false);
    }
  };

  /* ---------------------- STATUS RENDERS ---------------------- */
  if (isLoading) {
    return (
      <div className="page-content pt-small">
        <div className="container">
          <p>Auth0 is loading…</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-content pt-small">
        <div className="container">
          <p>Loading education admin data…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-content pt-small">
        <div className="container">
          <div className="alert alert-danger">{error}</div>
        </div>
      </div>
    );
  }

  /* ---------------------- MAIN RENDER ---------------------- */
  return (
    <div className="page-content pt-small">
      <div className="container">
        <h1 className="display-font mb-4">Education Hub (Admin)</h1>

        {/* Tabs */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${section === "articles" ? "active" : ""}`}
              onClick={() => setSection("articles")}
            >
              Articles & Courses
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${section === "videos" ? "active" : ""}`}
              onClick={() => setSection("videos")}
            >
              Videos
            </button>
          </li>
        </ul>

        {/* ARTICLES FORM + LIST */}
        {section === "articles" && (
          <>
            <section className="mb-5">
              <h2 className="display-font mb-3">
                {isEditingArticle ? "Edit article" : "Create article"}
              </h2>
              <form onSubmit={submitArticle} className="mb-3">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Title</label>
                    <input
                      name="title"
                      type="text"
                      className="form-control"
                      value={articleForm.title}
                      onChange={handleArticleChange}
                      required
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Minutes</label>
                    <input
                      name="minutes"
                      type="number"
                      min="0"
                      className="form-control"
                      value={articleForm.minutes}
                      onChange={handleArticleChange}
                    />
                  </div>
                  <div className="col-md-4 d-flex align-items-end">
                    <div className="form-check">
                      <input
                        id="article_is_active"
                        name="is_active"
                        type="checkbox"
                        className="form-check-input"
                        checked={articleForm.is_active}
                        onChange={handleArticleChange}
                      />
                      <label
                        htmlFor="article_is_active"
                        className="form-check-label ms-1"
                      >
                        Active
                      </label>
                    </div>
                  </div>

                  <div className="col-12">
                    <label className="form-label">Summary</label>
                    <textarea
                      name="summary"
                      className="form-control"
                      rows={3}
                      value={articleForm.summary}
                      onChange={handleArticleChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      Tags (comma-separated, e.g. Burnout, Stress)
                    </label>
                    <input
                      name="tags"
                      type="text"
                      className="form-control"
                      value={articleForm.tags}
                      onChange={handleArticleChange}
                    />
                  </div>

                  {/* ✅ NEW: upload cover image from computer */}
                  <div className="col-md-6">
                    <label className="form-label">Cover image (upload)</label>
                    <input
                      name="coverFile"
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={handleArticleChange}
                    />
                    {articleForm.cover_url && !articleForm.coverFile && (
                      <small className="text-muted d-block mt-1">
                        Current image:{" "}
                        <a
                          href={articleForm.cover_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View
                        </a>
                      </small>
                    )}
                  </div>

                  {/* Still allow direct URL (optional) */}
                  <div className="col-md-12">
                    <label className="form-label">
                      Cover image URL (optional if you upload a file)
                    </label>
                    <input
                      name="cover_url"
                      type="text"
                      className="form-control"
                      value={articleForm.cover_url}
                      onChange={handleArticleChange}
                    />
                  </div>

                  <div className="col-md-12">
                    <label className="form-label">
                      Link (external course / article URL)
                    </label>
                    <input
                      name="href"
                      type="text"
                      className="form-control"
                      value={articleForm.href}
                      onChange={handleArticleChange}
                    />
                  </div>

                  <div className="col-12 mt-3">
                    <button
                      type="submit"
                      className="btn btn-primary me-2"
                      disabled={saving}
                    >
                      {saving
                        ? "Saving…"
                        : isEditingArticle
                        ? "Save changes"
                        : "Create article"}
                    </button>
                    {isEditingArticle && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={resetArticleForm}
                        disabled={saving}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </section>

            <section>
              <h2 className="display-font mb-3">Existing articles</h2>
              {articles.length === 0 ? (
                <p>No articles yet.</p>
              ) : (
                <div className="list-group">
                  {articles.map((a) => (
                    <div
                      key={a.id}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <div className="fw-semibold">{a.title}</div>
                        <div className="text-muted small">
                          {a.minutes ? `${a.minutes} min · ` : ""}
                          {(a.tags || []).join(", ") || "No tags"} ·{" "}
                          {a.is_active ? "active" : "inactive"}
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => editArticle(a)}
                          disabled={saving}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => deleteArticle(a)}
                          disabled={saving}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {/* VIDEOS FORM + LIST */}
        {section === "videos" && (
          <>
            <section className="mb-5">
              <h2 className="display-font mb-3">
                {isEditingVideo ? "Edit video" : "Create video"}
              </h2>
              <form onSubmit={submitVideo} className="mb-3">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Title</label>
                    <input
                      name="title"
                      type="text"
                      className="form-control"
                      value={videoForm.title}
                      onChange={handleVideoChange}
                      required
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Duration (e.g. 10 min)</label>
                    <input
                      name="duration"
                      type="text"
                      className="form-control"
                      value={videoForm.duration}
                      onChange={handleVideoChange}
                    />
                  </div>
                  <div className="col-md-3 d-flex align-items-end">
                    <div className="form-check">
                      <input
                        id="video_is_active"
                        name="is_active"
                        type="checkbox"
                        className="form-check-input"
                        checked={videoForm.is_active}
                        onChange={handleVideoChange}
                      />
                      <label
                        htmlFor="video_is_active"
                        className="form-check-label ms-1"
                      >
                        Active
                      </label>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      Tags (comma-separated, e.g. Stress, Trauma)
                    </label>
                    <input
                      name="tags"
                      type="text"
                      className="form-control"
                      value={videoForm.tags}
                      onChange={handleVideoChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Thumbnail URL</label>
                    <input
                      name="thumb_url"
                      type="text"
                      className="form-control"
                      value={videoForm.thumb_url}
                      onChange={handleVideoChange}
                    />
                  </div>

                  <div className="col-md-12">
                    <label className="form-label">
                      Video link (URL – YouTube, Vimeo, etc.)
                    </label>
                    <input
                      name="href"
                      type="text"
                      className="form-control"
                      value={videoForm.href}
                      onChange={handleVideoChange}
                    />
                  </div>

                  <div className="col-12 mt-3">
                    <button
                      type="submit"
                      className="btn btn-primary me-2"
                      disabled={saving}
                    >
                      {saving
                        ? "Saving…"
                        : isEditingVideo
                        ? "Save changes"
                        : "Create video"}
                    </button>
                    {isEditingVideo && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={resetVideoForm}
                        disabled={saving}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </section>

            <section>
              <h2 className="display-font mb-3">Existing videos</h2>
              {videos.length === 0 ? (
                <p>No videos yet.</p>
              ) : (
                <div className="list-group">
                  {videos.map((v) => (
                    <div
                      key={v.id}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <div className="fw-semibold">{v.title}</div>
                        <div className="text-muted small">
                          {v.duration || "No duration"} ·{" "}
                          {(v.tags || []).join(", ") || "No tags"} ·{" "}
                          {v.is_active ? "active" : "inactive"}
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => editVideo(v)}
                          disabled={saving}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => deleteVideo(v)}
                          disabled={saving}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
