// src/pages/AdminEducation.jsx
import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import useAuthFetch from "../lib/useAuth";

export default function AdminEducation() {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const authFetch = useAuthFetch();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [adminSummary, setAdminSummary] = useState(null);

  // Data lists
  const [articles, setArticles] = useState([]);
  const [videos, setVideos] = useState([]);
  const [downloads, setDownloads] = useState([]);

  // Forms
  const [articleForm, setArticleForm] = useState({
    id: null,
    title: "",
    href: "",
    summary: "",
    minutes: "",
    tagsText: "", // comma-separated tags
    cover_url: "",
  });

  const [videoForm, setVideoForm] = useState({
    id: null,
    title: "",
    href: "",
    duration: "",
    tagsText: "",
    thumb_url: "",
  });

  const [downloadForm, setDownloadForm] = useState({
    id: null,
    title: "",
    href: "",
    file_size: "",
  });

  const isEditingArticle = articleForm.id !== null;
  const isEditingVideo = videoForm.id !== null;
  const isEditingDownload = downloadForm.id !== null;

  /* ----------------------------- Helpers ----------------------------- */

  const parseTags = (tagsText) =>
    tagsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

  const tagsToText = (tags) => (Array.isArray(tags) ? tags.join(", ") : "");

  const resetArticleForm = () =>
    setArticleForm({
      id: null,
      title: "",
      href: "",
      summary: "",
      minutes: "",
      tagsText: "",
      cover_url: "",
    });

  const resetVideoForm = () =>
    setVideoForm({
      id: null,
      title: "",
      href: "",
      duration: "",
      tagsText: "",
      thumb_url: "",
    });

  const resetDownloadForm = () =>
    setDownloadForm({
      id: null,
      title: "",
      href: "",
      file_size: "",
    });

  /* ----------------------------- Load data ----------------------------- */

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

        // 1. Check admin permission + counts
        const summaryRes = await authFetch(`/api/admin/education`);
        const summaryData = summaryRes.data || summaryRes;

        if (!alive) return;

        if (!summaryData.ok || !summaryData.canManageEducation) {
          setAdminSummary(summaryData);
          setError(
            summaryData.message ||
              "You don't have permission to manage education content."
          );
          setLoading(false);
          return;
        }

        setAdminSummary(summaryData);

        // 2. Load editable education content
        const [articlesRes, videosRes, downloadsRes] = await Promise.all([
          authFetch(`/api/admin/education/articles`),
          authFetch(`/api/admin/education/videos`),
          authFetch(`/api/admin/education/downloads`),
        ]);

        if (!alive) return;

        const articlesData = articlesRes.data || articlesRes;
        const videosData = videosRes.data || videosRes;
        const downloadsData = downloadsRes.data || downloadsRes;

        setArticles(articlesData.articles || []);
        setVideos(videosData.videos || []);
        setDownloads(downloadsData.downloads || []);
      } catch (err) {
        console.error("AdminEducation load error:", err);
        if (!alive) return;
        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            "Failed to load education admin data."
        );
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [isLoading, isAuthenticated, loginWithRedirect, authFetch]);

  /* ------------------------ Article handlers ------------------------ */

  const handleArticleChange = (e) => {
    const { name, value } = e.target;
    setArticleForm((f) => ({ ...f, [name]: value }));
  };

  const handleArticleEdit = (item) => {
    setArticleForm({
      id: item.id,
      title: item.title || "",
      href: item.href || "",
      summary: item.summary || "",
      minutes:
        item.minutes !== null && item.minutes !== undefined
          ? String(item.minutes)
          : "",
      tagsText: tagsToText(item.tags),
      cover_url: item.cover_url || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleArticleCancel = () => {
    resetArticleForm();
  };

  const handleArticleDelete = async (item) => {
    if (!window.confirm(`Delete article "${item.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      setSaving(true);
      await authFetch(`/api/admin/education/articles/${item.id}`, {
        method: "DELETE",
      });

      setArticles((prev) => prev.filter((a) => a.id !== item.id));
      if (articleForm.id === item.id) resetArticleForm();
    } catch (err) {
      console.error("Delete article error:", err);
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to delete article.";
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  const handleArticleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      if (!articleForm.title) {
        alert("Title is required for an article.");
        setSaving(false);
        return;
      }

      const minutesNumber = articleForm.minutes
        ? Number(articleForm.minutes)
        : null;
      if (
        articleForm.minutes &&
        (Number.isNaN(minutesNumber) || minutesNumber < 0)
      ) {
        alert("Minutes must be a positive number (or leave blank).");
        setSaving(false);
        return;
      }

      const payload = {
        title: articleForm.title.trim(),
        href: articleForm.href.trim() || null,
        summary: articleForm.summary.trim() || "",
        minutes: minutesNumber,
        tags: parseTags(articleForm.tagsText),
        cover_url: articleForm.cover_url.trim() || null,
      };

      let res;
      if (isEditingArticle) {
        res = await authFetch(
          `/api/admin/education/articles/${articleForm.id}`,
          {
            method: "PUT",
            data: payload,
          }
        );
      } else {
        res = await authFetch(`/api/admin/education/articles`, {
          method: "POST",
          data: payload,
        });
      }

      const saved = res.data || res;

      if (isEditingArticle) {
        setArticles((prev) => prev.map((a) => (a.id === saved.id ? saved : a)));
      } else {
        setArticles((prev) => [saved, ...prev]);
      }

      resetArticleForm();
    } catch (err) {
      console.error("Save article error:", err);
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to save article.";
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  /* ------------------------- Video handlers ------------------------- */

  const handleVideoChange = (e) => {
    const { name, value } = e.target;
    setVideoForm((f) => ({ ...f, [name]: value }));
  };

  const handleVideoEdit = (item) => {
    setVideoForm({
      id: item.id,
      title: item.title || "",
      href: item.href || "",
      duration: item.duration || "",
      tagsText: tagsToText(item.tags),
      thumb_url: item.thumb_url || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleVideoCancel = () => {
    resetVideoForm();
  };

  const handleVideoDelete = async (item) => {
    if (!window.confirm(`Delete video "${item.title}"?`)) {
      return;
    }

    try {
      setSaving(true);
      await authFetch(`/api/admin/education/videos/${item.id}`, {
        method: "DELETE",
      });

      setVideos((prev) => prev.filter((v) => v.id !== item.id));
      if (videoForm.id === item.id) resetVideoForm();
    } catch (err) {
      console.error("Delete video error:", err);
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to delete video.";
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  const handleVideoSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      if (!videoForm.title) {
        alert("Title is required for a video.");
        setSaving(false);
        return;
      }

      const payload = {
        title: videoForm.title.trim(),
        href: videoForm.href.trim() || null,
        duration: videoForm.duration.trim() || "",
        tags: parseTags(videoForm.tagsText),
        thumb_url: videoForm.thumb_url.trim() || null,
      };

      let res;
      if (isEditingVideo) {
        res = await authFetch(`/api/admin/education/videos/${videoForm.id}`, {
          method: "PUT",
          data: payload,
        });
      } else {
        res = await authFetch(`/api/admin/education/videos`, {
          method: "POST",
          data: payload,
        });
      }

      const saved = res.data || res;

      if (isEditingVideo) {
        setVideos((prev) => prev.map((v) => (v.id === saved.id ? saved : v)));
      } else {
        setVideos((prev) => [saved, ...prev]);
      }

      resetVideoForm();
    } catch (err) {
      console.error("Save video error:", err);
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to save video.";
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  /* ----------------------- Download handlers ----------------------- */

  const handleDownloadChange = (e) => {
    const { name, value } = e.target;
    setDownloadForm((f) => ({ ...f, [name]: value }));
  };

  const handleDownloadEdit = (item) => {
    setDownloadForm({
      id: item.id,
      title: item.title || "",
      href: item.href || "",
      file_size: item.file_size || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDownloadCancel = () => {
    resetDownloadForm();
  };

  const handleDownloadDelete = async (item) => {
    if (!window.confirm(`Delete download "${item.title}"?`)) {
      return;
    }

    try {
      setSaving(true);
      await authFetch(`/api/admin/education/downloads/${item.id}`, {
        method: "DELETE",
      });

      setDownloads((prev) => prev.filter((d) => d.id !== item.id));
      if (downloadForm.id === item.id) resetDownloadForm();
    } catch (err) {
      console.error("Delete download error:", err);
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to delete download.";
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      if (!downloadForm.title) {
        alert("Title is required for a download.");
        setSaving(false);
        return;
      }

      const payload = {
        title: downloadForm.title.trim(),
        href: downloadForm.href.trim() || null,
        file_size: downloadForm.file_size.trim() || "",
      };

      let res;
      if (isEditingDownload) {
        res = await authFetch(
          `/api/admin/education/downloads/${downloadForm.id}`,
          {
            method: "PUT",
            data: payload,
          }
        );
      } else {
        res = await authFetch(`/api/admin/education/downloads`, {
          method: "POST",
          data: payload,
        });
      }

      const saved = res.data || res;

      if (isEditingDownload) {
        setDownloads((prev) => prev.map((d) => (d.id === saved.id ? saved : d)));
      } else {
        setDownloads((prev) => [saved, ...prev]);
      }

      resetDownloadForm();
    } catch (err) {
      console.error("Save download error:", err);
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to save download.";
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  /* ---------------------------- Render ---------------------------- */

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
          <h1 className="display-font mb-3">Education (Admin)</h1>
          <div className="alert alert-danger">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content pt-small">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="display-font mb-0">Education (Admin)</h1>
          {adminSummary && (
            <div className="text-muted small body-font">
              <span className="me-3">
                Articles: <strong>{adminSummary.articlesCount}</strong>
              </span>
              <span>
                Videos: <strong>{adminSummary.videosCount}</strong>
              </span>
            </div>
          )}
        </div>

        {/* ---------------------- Articles ---------------------- */}
        <section className="mb-5">
          <h2 className="display-font mb-3">
            {isEditingArticle ? "Edit Article / Course" : "Add Article / Course"}
          </h2>

          <form onSubmit={handleArticleSubmit} className="mb-3">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label body-font" htmlFor="article-title">
                  Title
                </label>
                <input
                  id="article-title"
                  name="title"
                  className="form-control"
                  value={articleForm.title}
                  onChange={handleArticleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label body-font" htmlFor="article-href">
                  Link URL
                </label>
                <input
                  id="article-href"
                  name="href"
                  className="form-control"
                  value={articleForm.href}
                  onChange={handleArticleChange}
                  placeholder="https://example.com"
                />
              </div>

              <div className="col-md-12">
                <label
                  className="form-label body-font"
                  htmlFor="article-summary"
                >
                  Summary
                </label>
                <textarea
                  id="article-summary"
                  name="summary"
                  className="form-control"
                  rows={3}
                  value={articleForm.summary}
                  onChange={handleArticleChange}
                />
              </div>

              <div className="col-md-2">
                <label className="form-label body-font" htmlFor="article-minutes">
                  Minutes (optional)
                </label>
                <input
                  id="article-minutes"
                  name="minutes"
                  type="number"
                  min="0"
                  className="form-control"
                  value={articleForm.minutes}
                  onChange={handleArticleChange}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label body-font" htmlFor="article-tags">
                  Tags (comma-separated)
                </label>
                <input
                  id="article-tags"
                  name="tagsText"
                  className="form-control"
                  value={articleForm.tagsText}
                  onChange={handleArticleChange}
                  placeholder="Burnout, Free Course, Lifestyle"
                />
              </div>

              <div className="col-md-6">
                <label
                  className="form-label body-font"
                  htmlFor="article-cover_url"
                >
                  Cover Image URL (optional)
                </label>
                <input
                  id="article-cover_url"
                  name="cover_url"
                  className="form-control"
                  value={articleForm.cover_url}
                  onChange={handleArticleChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="col-12 mt-2">
                <button
                  type="submit"
                  className="btn btn-primary me-2"
                  disabled={saving}
                >
                  {saving
                    ? "Saving…"
                    : isEditingArticle
                    ? "Save changes"
                    : "Add article"}
                </button>

                {isEditingArticle && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleArticleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>

          <h3 className="display-font mb-3">Existing Articles / Courses</h3>
          {articles.length === 0 ? (
            <p>No articles yet.</p>
          ) : (
            <div className="list-group">
              {articles.map((a) => (
                <div
                  key={a.id}
                  className="list-group-item d-flex justify-content-between align-items-start"
                >
                  <div className="me-3">
                    <div className="fw-semibold body-font">{a.title}</div>
                    <div className="text-muted small body-font mb-1">
                      {a.minutes ? `${a.minutes} min · ` : ""}
                      {(a.tags || []).join(", ")}
                    </div>
                    <div className="small">
                      {a.href && (
                        <a
                          href={a.href}
                          target="_blank"
                          rel="noreferrer"
                          className="me-2"
                        >
                          Open link ↗
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => handleArticleEdit(a)}
                      disabled={saving}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleArticleDelete(a)}
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

        {/* ---------------------- Videos ---------------------- */}
        <section className="mb-5">
          <h2 className="display-font mb-3">
            {isEditingVideo ? "Edit Video" : "Add Video"}
          </h2>

          <form onSubmit={handleVideoSubmit} className="mb-3">
            <div className="row g-3">
              <div className="col-md-5">
                <label className="form-label body-font" htmlFor="video-title">
                  Title
                </label>
                <input
                  id="video-title"
                  name="title"
                  className="form-control"
                  value={videoForm.title}
                  onChange={handleVideoChange}
                  required
                />
              </div>

              <div className="col-md-7">
                <label className="form-label body-font" htmlFor="video-href">
                  Video URL
                </label>
                <input
                  id="video-href"
                  name="href"
                  className="form-control"
                  value={videoForm.href}
                  onChange={handleVideoChange}
                  placeholder="https://youtube.com/…"
                />
              </div>

              <div className="col-md-3">
                <label className="form-label body-font" htmlFor="video-duration">
                  Duration (text)
                </label>
                <input
                  id="video-duration"
                  name="duration"
                  className="form-control"
                  value={videoForm.duration}
                  onChange={handleVideoChange}
                  placeholder="e.g. 12:30 or 1 hr"
                />
              </div>

              <div className="col-md-4">
                <label className="form-label body-font" htmlFor="video-tags">
                  Tags (comma-separated)
                </label>
                <input
                  id="video-tags"
                  name="tagsText"
                  className="form-control"
                  value={videoForm.tagsText}
                  onChange={handleVideoChange}
                  placeholder="Stress, Trauma & Nervous System"
                />
              </div>

              <div className="col-md-5">
                <label
                  className="form-label body-font"
                  htmlFor="video-thumb_url"
                >
                  Thumbnail URL
                </label>
                <input
                  id="video-thumb_url"
                  name="thumb_url"
                  className="form-control"
                  value={videoForm.thumb_url}
                  onChange={handleVideoChange}
                  placeholder="https://example.com/thumb.jpg"
                />
              </div>

              <div className="col-12 mt-2">
                <button
                  type="submit"
                  className="btn btn-primary me-2"
                  disabled={saving}
                >
                  {saving
                    ? "Saving…"
                    : isEditingVideo
                    ? "Save changes"
                    : "Add video"}
                </button>

                {isEditingVideo && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleVideoCancel}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>

          <h3 className="display-font mb-3">Existing Videos</h3>
          {videos.length === 0 ? (
            <p>No videos yet.</p>
          ) : (
            <div className="list-group">
              {videos.map((v) => (
                <div
                  key={v.id}
                  className="list-group-item d-flex justify-content-between align-items-start"
                >
                  <div className="me-3">
                    <div className="fw-semibold body-font">{v.title}</div>
                    <div className="text-muted small body-font mb-1">
                      {v.duration} · {(v.tags || []).join(", ")}
                    </div>
                    <div className="small">
                      {v.href && (
                        <a
                          href={v.href}
                          target="_blank"
                          rel="noreferrer"
                          className="me-2"
                        >
                          Open video ↗
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => handleVideoEdit(v)}
                      disabled={saving}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleVideoDelete(v)}
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

        {/* ---------------------- Downloads ---------------------- */}
        <section className="mb-5">
          <h2 className="display-font mb-3">
            {isEditingDownload ? "Edit Download" : "Add Download"}
          </h2>

          <form onSubmit={handleDownloadSubmit} className="mb-3">
            <div className="row g-3">
              <div className="col-md-5">
                <label className="form-label body-font" htmlFor="download-title">
                  Title
                </label>
                <input
                  id="download-title"
                  name="title"
                  className="form-control"
                  value={downloadForm.title}
                  onChange={handleDownloadChange}
                  required
                />
              </div>

              <div className="col-md-5">
                <label className="form-label body-font" htmlFor="download-href">
                  Download URL
                </label>
                <input
                  id="download-href"
                  name="href"
                  className="form-control"
                  value={downloadForm.href}
                  onChange={handleDownloadChange}
                  placeholder="https://example.com/file.pdf"
                />
              </div>

              <div className="col-md-2">
                <label
                  className="form-label body-font"
                  htmlFor="download-file_size"
                >
                  File size / label
                </label>
                <input
                  id="download-file_size"
                  name="file_size"
                  className="form-control"
                  value={downloadForm.file_size}
                  onChange={handleDownloadChange}
                  placeholder="e.g. PDF – 2 MB"
                />
              </div>

              <div className="col-12 mt-2">
                <button
                  type="submit"
                  className="btn btn-primary me-2"
                  disabled={saving}
                >
                  {saving
                    ? "Saving…"
                    : isEditingDownload
                    ? "Save changes"
                    : "Add download"}
                </button>

                {isEditingDownload && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleDownloadCancel}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>

          <h3 className="display-font mb-3">Existing Downloads</h3>
          {downloads.length === 0 ? (
            <p>No downloads yet.</p>
          ) : (
            <div className="list-group">
              {downloads.map((d) => (
                <div
                  key={d.id}
                  className="list-group-item d-flex justify-content-between align-items-start"
                >
                  <div className="me-3">
                    <div className="fw-semibold body-font">{d.title}</div>
                    <div className="text-muted small body-font mb-1">
                      {d.file_size}
                    </div>
                    <div className="small">
                      {d.href && (
                        <a
                          href={d.href}
                          target="_blank"
                          rel="noreferrer"
                          className="me-2"
                        >
                          Open file ↗
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => handleDownloadEdit(d)}
                      disabled={saving}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDownloadDelete(d)}
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
      </div>
    </div>
  );
}
