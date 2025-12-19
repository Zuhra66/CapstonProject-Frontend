import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Modal, Button, Spinner } from "react-bootstrap";
import { FiSearch, FiEdit, FiTrash2, FiEye, FiEyeOff, FiStar, FiSave, FiX, FiFileText, FiCalendar, FiTrendingUp, FiFilter, FiChevronLeft } from "react-icons/fi";
import '../styles/admin-dashboard.css';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5001").replace(/\/+$/, "");

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

  let finalBody = body;
  let contentType = "application/json";
  
  if (body instanceof FormData) {
    finalBody = body;
    contentType = null;
  } else if (body != null) {
    finalBody = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: upper,
    credentials: "include",
    headers: {
      ...(contentType && { "Content-Type": contentType }),
      ...bearerHeader,
      ...csrfHeader,
      ...headers,
    },
    body: finalBody,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => response.statusText);
    throw new Error(`${response.status} ${response.statusText}: ${text}`);
  }

  const responseContentType = response.headers.get("content-type") || "";
  return responseContentType.includes("application/json") ? response.json() : response.text();
}

export default function AdminBlog() {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    content_md: "",
    excerpt: "",
    status: "draft",
    is_featured: false,
    category: "",
    cover_image: null
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [preview, setPreview] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const tokenGetter = useCallback(
    () =>
      getAccessTokenSilently({
        authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
      }),
    [getAccessTokenSilently]
  );

  useEffect(() => {
    if (isAuthenticated) {
      loadPosts();
    }
  }, [isAuthenticated]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError("");
      
      const data = await authedJson(
        '/api/blog/admin/posts',
        { method: "GET" },
        tokenGetter
      );

      setPosts(data.posts || []);
    } catch (err) {
      setError(err.message || "Failed to load blog posts");
      console.error("Load posts error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = 
        post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content_md?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = 
        statusFilter === "all" || 
        post.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [posts, searchTerm, statusFilter]);

  const startEdit = (post) => {
    setEditingId(post.id);
    setIsCreatingNew(false);
    setEditForm({
      title: post.title || "",
      content_md: post.content_md || "",
      excerpt: post.excerpt || "",
      status: post.status || "draft",
      is_featured: post.is_featured || false,
      category: post.category || "",
      cover_image: null
    });
    setImagePreview(post.cover_image_url || null);
    setPreview(false);
  };

  const createNewPost = () => {
    setEditingId(null);
    setIsCreatingNew(true);
    setEditForm({
      title: "",
      content_md: "",
      excerpt: "",
      status: "draft",
      is_featured: false,
      category: "",
      cover_image: null
    });
    setImagePreview(null);
    setPreview(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsCreatingNew(false);
    setEditForm({
      title: "",
      content_md: "",
      excerpt: "",
      status: "draft",
      is_featured: false,
      category: "",
      cover_image: null
    });
    setImagePreview(null);
    setPreview(false);
  };

  const updateEditForm = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditForm(prev => ({ ...prev, cover_image: file }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setEditForm(prev => ({ ...prev, cover_image: null }));
    setImagePreview(null);
  };

  const savePost = async () => {
    try {
      setBusy(true);
      setError("");

      const formDataToSend = new FormData();
      
      formDataToSend.append("title", editForm.title);
      formDataToSend.append("content_md", editForm.content_md);
      formDataToSend.append("excerpt", editForm.excerpt || "");
      formDataToSend.append("status", editForm.status);
      formDataToSend.append("is_featured", editForm.is_featured);
      formDataToSend.append("category", editForm.category || "");

      if (editForm.cover_image instanceof File) {
        formDataToSend.append("cover_image", editForm.cover_image);
      }

      const url = editingId 
        ? `/api/blog/admin/posts/${editingId}`
        : '/api/blog/admin/posts';

      const method = editingId ? "PUT" : "POST";

      await authedJson(
        url,
        {
          method,
          body: formDataToSend
        },
        tokenGetter
      );

      await loadPosts();
      cancelEdit();
    } catch (err) {
      setError(err.message || "Failed to save post");
      console.error("Save post error:", err);
    } finally {
      setBusy(false);
    }
  };

  const openDeleteModal = (post) => {
    setPostToDelete(post);
    setShowDeleteModal(true);
  };

  const deletePost = async () => {
    if (!postToDelete) return;
    
    try {
      setBusy(true);
      
      await authedJson(
        `/api/blog/admin/posts/${postToDelete.id}`,
        {
          method: "DELETE"
        },
        tokenGetter
      );

      await loadPosts();
      setShowDeleteModal(false);
      setPostToDelete(null);
    } catch (err) {
      setError(err.message || "Failed to delete post");
      alert(err.message || "Failed to delete post");
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
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return '—';
    }
  };

  const getStatusBadge = (post) => {
    const status = post.status?.toLowerCase();
    
    const styles = {
      published: { bg: "#00FF00", text: "black", icon: <FiEye size={10} />, label: "Published" },
      draft: { bg: "#FF9900", text: "black", icon: <FiEyeOff size={10} />, label: "Draft" },
      archived: { bg: "#868E96", text: "white", icon: <FiFileText size={10} />, label: "Archived" }
    };

    const style = styles[status] || styles.draft;

    return (
      <span className="badge d-flex align-items-center gap-1" style={{ 
        padding: '0.25em 0.5em', 
        fontSize: '0.7em',
        fontWeight: '600',
        background: style.bg,
        color: style.text,
        border: '1px solid rgba(0,0,0,0.1)'
      }}>
        {style.icon}
        {style.label}
      </span>
    );
  };

  const getFeaturedBadge = (post) => {
    if (!post.is_featured) return null;
    
    return (
      <span className="badge d-flex align-items-center gap-1" style={{ 
        padding: '0.25em 0.5em', 
        fontSize: '0.7em',
        fontWeight: '600',
        background: 'linear-gradient(135deg, #FFD700, #FFA500)',
        color: 'black',
        border: '1px solid rgba(0,0,0,0.1)'
      }}>
        <FiStar size={10} />
        Featured
      </span>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="page-content">
        <div className="container">
          <div className="not-authenticated text-center py-5">
            <h2>Authentication Required</h2>
            <p>Please log in to access blog management.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-content">
        <div className="container">
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
            <div className="text-center">
              <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem', color: '#3D52A0' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted">Loading blog posts...</p>
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
          <h1 className="display-font about-title" style={{ color: '#3D52A0' }}>Blog Management</h1>
          <p className="about-subtitle body-font" style={{ color: '#3D52A0' }}>
            Create, edit, and manage blog posts
          </p>
        </div>

        <div className="row mb-4">
          <div className="col-md-3 col-6 mb-3">
            <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #EDE8F5, #ADBBDA)' }}>
              <div className="card-body text-center" style={{ color: '#3D52A0' }}>
                <FiFileText size={24} className="mb-2" />
                <h6 className="card-title mb-1 fw-semibold">Total Posts</h6>
                <h3 className="mb-0 fw-bold" style={{ color: 'black' }}>{posts.length}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-6 mb-3">
            <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #ADBBDA, #8697C4)' }}>
              <div className="card-body text-center" style={{ color: '#3D52A0' }}>
                <FiEye size={24} className="mb-2" />
                <h6 className="card-title mb-1 fw-semibold">Published</h6>
                <h3 className="mb-0 fw-bold" style={{ color: 'black' }}>{posts.filter(p => p.status === 'published').length}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-6 mb-3">
            <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #8697C4, #7091E6)' }}>
              <div className="card-body text-center" style={{ color: 'white' }}>
                <FiEyeOff size={24} className="mb-2" />
                <h6 className="card-title mb-1 fw-semibold">Drafts</h6>
                <h3 className="mb-0 fw-bold">{posts.filter(p => p.status === 'draft').length}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-6 mb-3">
            <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #7091E6, #3D52A0)' }}>
              <div className="card-body text-center" style={{ color: 'white' }}>
                <FiStar size={24} className="mb-2" />
                <h6 className="card-title mb-1 fw-semibold">Featured</h6>
                <h3 className="mb-0 fw-bold">{posts.filter(p => p.is_featured).length}</h3>
              </div>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm mb-4" style={{ background: '#EDE8F5', border: '1px solid #ADBBDA' }}>
          <div className="card-body">
            <div className="row g-3 align-items-center">
              <div className="col-md-4">
                <label className="form-label fw-semibold mb-1" style={{ color: '#3D52A0' }}>Search Posts</label>
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
                    placeholder="Search by title or content..."
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
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="col-md-3">
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
                  onClick={loadPosts}
                  disabled={busy}
                >
                  {busy ? 'Loading...' : 'Refresh'}
                </button>
              </div>
              <div className="col-md-2">
                <label className="form-label fw-semibold mb-1" style={{ color: '#3D52A0', opacity: 0 }}>Create</label>
                <button 
                  className="btn w-100 d-flex align-items-center justify-content-center"
                  style={{ 
                    background: '#3D52A0', 
                    borderColor: '#3D52A0', 
                    color: 'white',
                    borderRadius: '0.375rem',
                    height: '38px',
                    padding: '0'
                  }}
                  onClick={createNewPost}
                  disabled={busy || editingId !== null || isCreatingNew}
                >
                  + New Post
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm" style={{ background: '#EDE8F5', border: '1px solid #ADBBDA' }}>
          <div className="card-body p-2">
            {error && (
              <div className="alert alert-danger d-flex align-items-center" role="alert" style={{ background: '#8697C4', borderColor: '#7091E6', color: 'white' }}>
                {error}
              </div>
            )}

            <div className="table-responsive">
              <table className="table table-hover align-middle" style={{ fontSize: '0.85rem' }}>
                <thead style={{ background: 'linear-gradient(135deg, #ADBBDA, #8697C4)' }}>
                  <tr>
                    <th style={{ color: '#3D52A0', borderColor: '#8697C4', fontSize: '0.8rem', padding: '0.5rem' }}>Title</th>
                    <th style={{ color: '#3D52A0', borderColor: '#8697C4', fontSize: '0.8rem', padding: '0.5rem' }}>Author</th>
                    <th style={{ color: '#3D52A0', borderColor: '#8697C4', fontSize: '0.8rem', padding: '0.5rem' }}>Status</th>
                    <th style={{ color: '#3D52A0', borderColor: '#8697C4', fontSize: '0.8rem', padding: '0.5rem' }}>Featured</th>
                    <th style={{ color: '#3D52A0', borderColor: '#8697C4', fontSize: '0.8rem', padding: '0.5rem' }}>Views</th>
                    <th style={{ color: '#3D52A0', borderColor: '#8697C4', fontSize: '0.8rem', padding: '0.5rem' }}>Published</th>
                    <th style={{ color: '#3D52A0', borderColor: '#8697C4', fontSize: '0.8rem', padding: '0.5rem' }}>Created</th>
                    <th className="text-center" style={{ color: '#3D52A0', borderColor: '#8697C4', fontSize: '0.8rem', padding: '0.5rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-5" style={{ color: '#3D52A0' }}>
                        <FiFileText size={48} className="mb-3" style={{ color: '#8697C4' }} />
                        <p className="mb-0">
                          {posts.length === 0 ? "No blog posts found" : "No posts match your search criteria"}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredPosts.map((post) => (
                      <tr key={post.id} className={editingId === post.id ? 'table-active' : ''} style={{ borderColor: '#ADBBDA' }}>
                        <td style={{ padding: '0.5rem' }}>
                          <div style={{ maxWidth: '250px' }}>
                            <div className="fw-semibold" style={{ color: 'black', fontSize: '0.8rem' }}>
                              <Link to={`/blog/${post.slug}`} target="_blank" style={{ color: '#3D52A0', textDecoration: 'none' }}>
                                {post.title}
                              </Link>
                            </div>
                            {post.excerpt && (
                              <div style={{ color: '#8697C4', fontSize: '0.7rem', marginTop: '2px' }}>
                                {post.excerpt.substring(0, 100)}...
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ color: 'black', fontSize: '0.8rem', padding: '0.5rem' }}>
                          {post.author_name || 'Unknown Author'}
                        </td>
                        <td style={{ padding: '0.5rem' }}>{getStatusBadge(post)}</td>
                        <td style={{ padding: '0.5rem' }}>{getFeaturedBadge(post) || '-'}</td>
                        <td style={{ color: 'black', fontSize: '0.8rem', padding: '0.5rem' }}>
                          <div className="d-flex align-items-center gap-1">
                            <FiTrendingUp size={12} />
                            {post.view_count || 0}
                          </div>
                        </td>
                        <td style={{ color: 'black', fontSize: '0.8rem', padding: '0.5rem' }}>
                          {post.published_at ? formatDate(post.published_at) : 'Not published'}
                        </td>
                        <td style={{ color: 'black', fontSize: '0.8rem', padding: '0.5rem' }}>
                          {formatDate(post.created_at)}
                        </td>
                        <td style={{ padding: '0.5rem' }}>
                          <div className="d-flex justify-content-center gap-1">
                            {editingId === post.id ? (
                              <div className="d-flex gap-1">
                                <button
                                  className="btn btn-success btn-sm"
                                  style={{ background: '#7091E6', borderColor: '#7091E6', padding: '0.25rem 0.5rem' }}
                                  onClick={savePost}
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
                                  onClick={() => startEdit(post)}
                                  disabled={busy || isCreatingNew}
                                  title="Edit Post"
                                >
                                  <FiEdit size={12} />
                                </button>
                                <button
                                  className="btn btn-outline-danger btn-sm"
                                  style={{ borderColor: '#3D52A0', color: '#3D52A0', padding: '0.25rem 0.5rem' }}
                                  onClick={() => openDeleteModal(post)}
                                  disabled={busy || editingId === post.id || isCreatingNew}
                                  title="Delete Post"
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

            {(editingId !== null || isCreatingNew) && (
              <div className="card mt-4" style={{ borderColor: '#3D52A0', background: '#EDE8F5' }}>
                <div className="card-header text-white d-flex justify-content-between align-items-center" style={{ background: '#3D52A0' }}>
                  <h5 className="mb-0">{editingId ? 'Edit Blog Post' : 'Create New Blog Post'}</h5>
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
                  <div className="mb-3">
                    <div className="btn-group" role="group">
                      <button 
                        type="button"
                        className={`btn ${!preview ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setPreview(false)}
                        disabled={busy}
                      >
                        Edit
                      </button>
                      <button 
                        type="button"
                        className={`btn ${preview ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setPreview(true)}
                        disabled={busy}
                      >
                        Preview
                      </button>
                    </div>
                  </div>

                  {!preview ? (
                    <div className="row">
                      <div className="col-lg-8">
                        <div className="mb-3">
                          <label className="form-label fw-semibold" style={{ color: '#3D52A0' }}>Title *</label>
                          <input
                            type="text"
                            className="form-control"
                            style={{ borderColor: '#ADBBDA', color: 'black' }}
                            value={editForm.title}
                            onChange={(e) => updateEditForm('title', e.target.value)}
                            required
                            disabled={busy}
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label fw-semibold" style={{ color: '#3D52A0' }}>Content (Markdown) *</label>
                          <textarea
                            className="form-control"
                            style={{ borderColor: '#ADBBDA', color: 'black', minHeight: '300px' }}
                            rows="15"
                            value={editForm.content_md}
                            onChange={(e) => updateEditForm('content_md', e.target.value)}
                            required
                            disabled={busy}
                          />
                          <small className="text-muted" style={{ color: '#8697C4' }}>Use Markdown syntax for formatting (headers, lists, links, etc.)</small>
                        </div>
                      </div>

                      <div className="col-lg-4">
                        <div className="mb-3">
                          <label className="form-label fw-semibold" style={{ color: '#3D52A0' }}>Excerpt</label>
                          <textarea
                            className="form-control"
                            style={{ borderColor: '#ADBBDA', color: 'black' }}
                            rows="3"
                            value={editForm.excerpt}
                            onChange={(e) => updateEditForm('excerpt', e.target.value)}
                            placeholder="Brief summary of the post..."
                            disabled={busy}
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label fw-semibold" style={{ color: '#3D52A0' }}>Category</label>
                          <input
                            type="text"
                            className="form-control"
                            style={{ borderColor: '#ADBBDA', color: 'black' }}
                            value={editForm.category}
                            onChange={(e) => updateEditForm('category', e.target.value)}
                            placeholder="e.g., Wellness, Mental Health"
                            disabled={busy}
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label fw-semibold" style={{ color: '#3D52A0' }}>Cover Image</label>
                          <input
                            type="file"
                            className="form-control"
                            style={{ borderColor: '#ADBBDA', color: 'black' }}
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={busy}
                          />
                          {(imagePreview || editForm.cover_image) && (
                            <div className="mt-2">
                              <div className="d-flex align-items-center gap-2 mb-2">
                                <small className="text-muted" style={{ color: '#8697C4' }}>Preview:</small>
                                <button 
                                  type="button" 
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={handleRemoveImage}
                                  disabled={busy}
                                >
                                  <FiX size={12} />
                                </button>
                              </div>
                              <img 
                                src={imagePreview} 
                                alt="Preview" 
                                className="img-fluid rounded border" 
                                style={{ maxHeight: '150px' }}
                              />
                            </div>
                          )}
                        </div>

                        <div className="mb-3">
                          <label className="form-label fw-semibold" style={{ color: '#3D52A0' }}>Status</label>
                          <select
                            className="form-select"
                            style={{ borderColor: '#ADBBDA', color: 'black' }}
                            value={editForm.status}
                            onChange={(e) => updateEditForm('status', e.target.value)}
                            disabled={busy}
                          >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="archived">Archived</option>
                          </select>
                        </div>

                        <div className="form-check mb-4">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            style={{ backgroundColor: '#ADBBDA', borderColor: '#8697C4' }}
                            checked={editForm.is_featured}
                            onChange={(e) => updateEditForm('is_featured', e.target.checked)}
                            id="featuredCheck"
                            disabled={busy}
                          />
                          <label className="form-check-label fw-semibold" htmlFor="featuredCheck" style={{ color: '#3D52A0' }}>
                            <FiStar className="me-1" size={14} />
                            Featured Post
                          </label>
                        </div>

                        {editingId && (
                          <div className="card border-0" style={{ background: 'rgba(173, 187, 218, 0.3)' }}>
                            <div className="card-body p-3">
                              <small className="text-muted d-block" style={{ color: '#8697C4' }}>Post ID: {editingId}</small>
                              <small className="text-muted d-block" style={{ color: '#8697C4' }}>Slug: Will be generated</small>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="border rounded p-4" style={{ background: 'white', minHeight: '400px' }}>
                      <h2 className="mb-3" style={{ color: '#3D52A0' }}>{editForm.title || 'Untitled Post'}</h2>
                      
                      {imagePreview && (
                        <div className="mb-4">
                          <img 
                            src={imagePreview} 
                            alt="Cover" 
                            className="img-fluid rounded"
                            style={{ maxHeight: '300px', objectFit: 'cover', width: '100%' }}
                          />
                        </div>
                      )}

                      {editForm.excerpt && (
                        <div className="alert alert-info mb-4" style={{ background: '#EDE8F5', borderColor: '#ADBBDA', color: '#3D52A0' }}>
                          <strong>Excerpt:</strong> {editForm.excerpt}
                        </div>
                      )}

                      <div className="mb-3">
                        <div className="d-flex gap-2 mb-3">
                          <span className="badge bg-primary">{editForm.status}</span>
                          {editForm.is_featured && <span className="badge bg-warning text-dark">Featured</span>}
                          {editForm.category && <span className="badge bg-secondary">{editForm.category}</span>}
                        </div>
                      </div>

                      <div className="border-top pt-4">
                        <ReactMarkdown>{editForm.content_md || '*No content yet*'}</ReactMarkdown>
                      </div>
                    </div>
                  )}

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
                          onClick={savePost}
                          disabled={busy}
                        >
                          <FiSave className="me-1" size={14} />
                          {editingId ? 'Save Changes' : 'Create Post'}
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

      {/* Delete Confirmation Modal */}
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
            Confirm Delete
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="modal-body-custom text-center">
          <p className="mb-3">
            Are you sure you want to delete <strong>"{postToDelete?.title}"</strong>?
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
            onClick={deletePost}
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