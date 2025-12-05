// src/components/AdminNewsletter.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { 
  FiMail, 
  FiSearch, 
  FiTrash2, 
  FiDownload,
  FiUserCheck,
  FiUserX,
  FiRefreshCw,
  FiFileText,
  FiCalendar,
  FiTrendingUp,
  FiActivity,
  FiClock
} from "react-icons/fi";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Temporary authedJson implementation (same as AdminUsers)
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

export default function AdminNewsletter() {
  const { getAccessTokenSilently } = useAuth0();
  const [subscribers, setSubscribers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
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

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      
      const [subscribersData, statsData] = await Promise.all([
        authedJson(
          `/api/newsletter/admin/subscribers?page=${pagination.currentPage}&search=${searchTerm}&status=${statusFilter}`,  // ADDED /admin/
          { method: "GET" },
          tokenGetter
        ),
        authedJson(
          '/api/newsletter/admin/stats',  // ADDED /admin/
          { method: "GET" },
          tokenGetter
        )
      ]);
      
      // Check if statsData has nested stats object
      const statsToUse = statsData.stats ? statsData : { stats: statsData };
      
      setSubscribers(subscribersData.subscribers || []);
      setStats(statsToUse);
      setPagination(subscribersData.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalItems: subscribersData.subscribers?.length || 0,
        itemsPerPage: 20
      });
    } catch (err) {
      setError(err.message || "Failed to load newsletter data");
      console.error('Newsletter load error:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, searchTerm, statusFilter, tokenGetter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExport = async () => {
    try {
      setBusy(true);
      
      const token = await tokenGetter();
      const response = await fetch(`${API}/api/newsletter/admin/export?status=${statusFilter}`, {  // ADDED /admin/
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Create download link for CSV
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const filename = response.headers.get('Content-Disposition')?.split('filename=')[1] || 
                      `empowermed-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
      
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export subscribers');
    } finally {
      setBusy(false);
    }
  };

  const deleteSubscriber = async (id, email) => {
    if (!confirm(`Are you sure you want to delete subscriber: ${email}?`)) {
      return;
    }

    try {
      setBusy(true);
      
      await authedJson(
        `/api/newsletter/admin/subscribers/${id}`,  // Already has /admin/
        {
          method: "DELETE"
        },
        tokenGetter
      );

      await loadData();
      alert('Subscriber deleted successfully');
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete subscriber');
    } finally {
      setBusy(false);
    }
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
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

  const getStatusBadge = (subscriber) => {
    const { active, verified_at } = subscriber;
    
    if (active && verified_at) {
      return (
        <span className="badge" style={{ 
          padding: '0.25em 0.5em', 
          fontSize: '0.7em',
          fontWeight: '600',
          background: '#00FF00',
          color: 'black'
        }}>
          <FiUserCheck className="me-1" size={10} />
          Verified
        </span>
      );
    } else if (!verified_at) {
      return (
        <span className="badge" style={{ 
          padding: '0.25em 0.5em', 
          fontSize: '0.7em',
          fontWeight: '600',
          background: '#FFA500',
          color: 'black'
        }}>
          <FiClock className="me-1" size={10} />
          Pending
        </span>
      );
    } else {
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
    }
  };

  const getSourceBadge = (source) => {
    return (
      <span className="badge" style={{ 
        padding: '0.25em 0.5em', 
        fontSize: '0.7em',
        fontWeight: '600',
        background: 'white',
        color: 'black',
        border: '1px solid #dee2e6'
      }}>
        {source || 'website_footer'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="page-content">
        <div className="container">
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
            <div className="text-center">
              <div className="spinner-border mb-3" style={{ 
                width: '3rem', 
                height: '3rem', 
                color: '#3D52A0' 
              }}>
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted">Loading newsletter subscribers...</p>
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
          <h1 className="display-font about-title" style={{ color: '#3D52A0' }}>Newsletter Subscribers</h1>
          <p className="about-subtitle body-font" style={{ color: '#3D52A0' }}>
            Manage your email list and track subscription metrics
          </p>
        </div>

        {/* Stats Cards */}
        <div className="row mb-4">
          <div className="col-md-3 col-6 mb-3">
            <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #EDE8F5, #ADBBDA)' }}>
              <div className="card-body text-center" style={{ color: '#3D52A0' }}>
                <FiMail size={24} className="mb-2" />
                <h6 className="card-title mb-1 fw-semibold">Total Subscribers</h6>
                <h3 className="mb-0 fw-bold" style={{ color: 'black' }}>
                  {stats?.stats?.totals?.total?.toLocaleString() || 0}
                </h3>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-6 mb-3">
            <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #ADBBDA, #8697C4)' }}>
              <div className="card-body text-center" style={{ color: '#3D52A0' }}>
                <FiUserCheck size={24} className="mb-2" />
                <h6 className="card-title mb-1 fw-semibold">Active</h6>
                <h3 className="mb-0 fw-bold" style={{ color: 'black' }}>
                  {stats?.stats?.totals?.active?.toLocaleString() || 0}
                </h3>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-6 mb-3">
            <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #8697C4, #7091E6)' }}>
              <div className="card-body text-center" style={{ color: 'white' }}>
                <FiUserX size={24} className="mb-2" />
                <h6 className="card-title mb-1 fw-semibold">Inactive</h6>
                <h3 className="mb-0 fw-bold">
                  {stats?.stats?.totals?.inactive?.toLocaleString() || 0}
                </h3>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-6 mb-3">
            <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #7091E6, #3D52A0)' }}>
              <div className="card-body text-center" style={{ color: 'white' }}>
                <FiTrendingUp size={24} className="mb-2" />
                <h6 className="card-title mb-1 fw-semibold">This Month</h6>
                <h3 className="mb-0 fw-bold">
                  {stats?.stats?.totals?.this_month?.toLocaleString() || 0}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card border-0 shadow-sm mb-4" style={{ background: '#EDE8F5', border: '1px solid #ADBBDA' }}>
          <div className="card-body">
            <div className="row g-3 align-items-end">
              <div className="col-md-4">
                <label className="form-label fw-semibold" style={{ color: '#3D52A0' }}>Search Subscribers</label>
                <div className="input-group">
                  <span className="input-group-text" style={{ 
                    background: '#ADBBDA', 
                    borderColor: '#8697C4', 
                    color: '#3D52A0' 
                  }}>
                    <FiSearch size={18} />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    style={{ borderColor: '#8697C4', color: 'black' }}
                    placeholder="Search by email..."
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
                  <option value="pending">Pending Verification</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold" style={{ color: '#3D52A0' }}>Export</label>
                <div className="input-group">
                  <button 
                    className="btn w-100"
                    style={{ 
                      background: '#8697C4', 
                      borderColor: '#8697C4', 
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                    onClick={handleExport}
                    disabled={busy || subscribers.length === 0}
                  >
                    <FiDownload size={18} />
                    {busy ? 'Exporting...' : 'Export CSV'}
                  </button>
                </div>
              </div>
              <div className="col-md-2">
                <button 
                  className="btn w-100"
                  style={{ 
                    background: '#3D52A0', 
                    borderColor: '#3D52A0', 
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                  onClick={loadData}
                  disabled={busy}
                >
                  <FiRefreshCw size={18} />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Subscribers Table */}
        <div className="card border-0 shadow-sm" style={{ background: '#EDE8F5', border: '1px solid #ADBBDA' }}>
          <div className="card-body p-2">
            {error && (
              <div className="alert alert-danger d-flex align-items-center" role="alert" style={{ 
                background: '#8697C4', 
                borderColor: '#7091E6', 
                color: 'white' 
              }}>
                <FiActivity className="me-2" size={18} />
                {error}
              </div>
            )}

            <div className="table-responsive">
              <table className="table table-hover align-middle" style={{ fontSize: '0.85rem' }}>
                <thead style={{ background: 'linear-gradient(135deg, #ADBBDA, #8697C4)' }}>
                  <tr>
                    <th style={{ color: '#3D52A0', borderColor: '#8697C4', fontSize: '0.8rem', padding: '0.5rem' }}>Email</th>
                    <th style={{ color: '#3D52A0', borderColor: '#8697C4', fontSize: '0.8rem', padding: '0.5rem' }}>Subscribed</th>
                    <th style={{ color: '#3D52A0', borderColor: '#8697C4', fontSize: '0.8rem', padding: '0.5rem' }}>Source</th>
                    <th style={{ color: '#3D52A0', borderColor: '#8697C4', fontSize: '0.8rem', padding: '0.5rem' }}>Status</th>
                    <th style={{ color: '#3D52A0', borderColor: '#8697C4', fontSize: '0.8rem', padding: '0.5rem' }}>Verified</th>
                    <th className="text-center" style={{ color: '#3D52A0', borderColor: '#8697C4', fontSize: '0.8rem', padding: '0.5rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5" style={{ color: '#3D52A0' }}>
                        <FiMail size={48} className="mb-3" style={{ color: '#8697C4' }} />
                        <p className="mb-0">
                          {searchTerm || statusFilter !== 'all' 
                            ? "No subscribers match your search criteria" 
                            : "No subscribers found in database"}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    subscribers.map((subscriber) => (
                      <tr key={subscriber.id} style={{ borderColor: '#ADBBDA' }}>
                        <td style={{ padding: '0.5rem' }}>
                          <div className="fw-semibold" style={{ color: 'black', fontSize: '0.8rem' }}>
                            {subscriber.email}
                          </div>
                          {subscriber.name && (
                            <div className="text-muted small" style={{ fontSize: '0.7rem' }}>
                              {subscriber.name}
                            </div>
                          )}
                        </td>
                        <td style={{ color: 'black', fontSize: '0.8rem', padding: '0.5rem' }}>
                          {formatDate(subscriber.subscribed_at)}
                        </td>
                        <td style={{ padding: '0.5rem' }}>
                          {getSourceBadge(subscriber.source)}
                        </td>
                        <td style={{ padding: '0.5rem' }}>
                          {getStatusBadge(subscriber)}
                        </td>
                        <td style={{ color: 'black', fontSize: '0.8rem', padding: '0.5rem' }}>
                          {subscriber.verified_at ? formatDate(subscriber.verified_at) : 'Not verified'}
                        </td>
                        <td style={{ padding: '0.5rem' }}>
                          <div className="d-flex justify-content-center gap-1">
                            <button
                              className="btn btn-outline-danger btn-sm"
                              style={{ 
                                borderColor: '#3D52A0', 
                                color: '#3D52A0', 
                                padding: '0.25rem 0.5rem' 
                              }}
                              onClick={() => deleteSubscriber(subscriber.id, subscriber.email)}
                              disabled={busy}
                              title="Delete Subscriber"
                            >
                              <FiTrash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-3 p-2" style={{ 
                background: '#EDE8F5', 
                borderTop: '1px solid #ADBBDA' 
              }}>
                <div className="text-muted small" style={{ color: '#3D52A0' }}>
                  Showing page {pagination.currentPage} of {pagination.totalPages}
                  <span className="ms-2" style={{ color: '#8697C4' }}>
                    ({pagination.totalItems} total subscribers)
                  </span>
                </div>
                <div className="d-flex gap-1">
                  <button
                    className="btn btn-sm"
                    style={{ 
                      background: '#8697C4', 
                      borderColor: '#8697C4', 
                      color: 'white',
                      padding: '0.25rem 0.75rem'
                    }}
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1 || busy}
                  >
                    Previous
                  </button>
                  <button
                    className="btn btn-sm"
                    style={{ 
                      background: '#3D52A0', 
                      borderColor: '#3D52A0', 
                      color: 'white',
                      padding: '0.25rem 0.75rem'
                    }}
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages || busy}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Stats */}
        {stats && (
          <div className="row mt-4">
            <div className="col-md-6 mb-3">
              <div className="card border-0 shadow-sm" style={{ background: '#EDE8F5', border: '1px solid #ADBBDA' }}>
                <div className="card-header" style={{ 
                  background: 'linear-gradient(135deg, #ADBBDA, #8697C4)', 
                  color: '#3D52A0',
                  fontWeight: '600'
                }}>
                  <FiFileText className="me-2" />
                  Subscription Sources
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-sm mb-0" style={{ fontSize: '0.85rem' }}>
                      <tbody>
                        {stats?.stats?.sources?.map((source, index) => (
                          <tr key={index} style={{ borderColor: '#ADBBDA' }}>
                            <td style={{ padding: '0.75rem', color: '#3D52A0', width: '60%' }}>
                              {source.source}
                            </td>
                            <td style={{ padding: '0.75rem', color: 'black', textAlign: 'right' }}>
                              <span className="badge" style={{ 
                                background: '#8697C4', 
                                color: 'white',
                                fontSize: '0.75rem'
                              }}>
                                {source.count} ({source.percentage}%)
                              </span>
                            </td>
                          </tr>
                        )) || (
                          <tr>
                            <td colSpan="2" className="text-center py-3" style={{ color: '#8697C4' }}>
                              No source data available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6 mb-3">
              <div className="card border-0 shadow-sm" style={{ background: '#EDE8F5', border: '1px solid #ADBBDA' }}>
                <div className="card-header" style={{ 
                  background: 'linear-gradient(135deg, #ADBBDA, #8697C4)', 
                  color: '#3D52A0',
                  fontWeight: '600'
                }}>
                  <FiCalendar className="me-2" />
                  Recent Growth
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-sm mb-0" style={{ fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ borderColor: '#ADBBDA' }}>
                          <th style={{ padding: '0.75rem', color: '#3D52A0' }}>Month</th>
                          <th style={{ padding: '0.75rem', color: '#3D52A0', textAlign: 'right' }}>New Subscribers</th>
                          <th style={{ padding: '0.75rem', color: '#3D52A0', textAlign: 'right' }}>Verified</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats?.stats?.growth?.slice(0, 5).map((growth, index) => (
                          <tr key={index} style={{ borderColor: '#ADBBDA' }}>
                            <td style={{ padding: '0.75rem', color: 'black' }}>
                              {new Date(growth.month).toLocaleDateString('en-US', { 
                                month: 'short', 
                                year: 'numeric' 
                              })}
                            </td>
                            <td style={{ padding: '0.75rem', color: 'black', textAlign: 'right' }}>
                              <span className="badge" style={{ 
                                background: '#00FF00', 
                                color: 'black',
                                fontSize: '0.75rem'
                              }}>
                                +{growth.new_subscribers}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem', color: 'black', textAlign: 'right' }}>
                              <span className="badge" style={{ 
                                background: '#3D52A0', 
                                color: 'white',
                                fontSize: '0.75rem'
                              }}>
                                {growth.verified}
                              </span>
                            </td>
                          </tr>
                        )) || (
                          <tr>
                            <td colSpan="3" className="text-center py-3" style={{ color: '#8697C4' }}>
                              No growth data available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}