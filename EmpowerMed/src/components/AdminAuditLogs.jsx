// components/AdminAuditLogs.jsx - FIXED VERSION
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { 
  FiSearch, 
  FiFilter, 
  FiDownload, 
  FiCalendar,
  FiEye,
  FiUser,
  FiShield,
  FiDatabase,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiExternalLink,
  FiFileText,
  FiBarChart2,
  FiUsers,
  FiLock,
  FiActivity,
  FiTrendingUp,
  FiRefreshCw,
  FiInfo,
  FiX
} from 'react-icons/fi';
import { format, subDays } from 'date-fns';

// Your existing authedJson function
const authedJson = async (url, options = {}, getAccessTokenSilently) => {
  try {
    const token = await getAccessTokenSilently({
      authorizationParams: { 
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      },
    });

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AdminAuditLogs() {
  const { getAccessTokenSilently } = useAuth0();
  const [logs, setLogs] = useState([]);
  const [adminLogs, setAdminLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [activeTab, setActiveTab] = useState('audit');
  const [filters, setFilters] = useState({
    eventCategory: '',
    status: '',
    startDate: format(new Date(), 'yyyy-MM-dd'), // Today
    endDate: format(new Date(), 'yyyy-MM-dd'),   // Today
    search: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });
  const [adminPagination, setAdminPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });

  // Modal state
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const tokenGetter = useCallback(
    () => getAccessTokenSilently({
      authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
    }),
    [getAccessTokenSilently]
  );

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams({
        page: pagination.currentPage || 1,
        limit: pagination.itemsPerPage || 20,
        eventCategory: filters.eventCategory || '',
        status: filters.status || '',
        startDate: filters.startDate || '',
        endDate: filters.endDate || '',
        search: filters.search || ''
      });

      console.log('🔍 Loading audit logs from endpoint:', activeTab);

      const endpoint = activeTab === 'audit' ? '/api/audit/logs' : '/api/audit/admin-logs';
      const fullUrl = `${API_URL}${endpoint}?${queryParams}`;

      const response = await authedJson(
        fullUrl,
        { method: 'GET' },
        tokenGetter
      );

      console.log('✅ Audit logs response:', response);

      if (activeTab === 'audit') {
        setLogs(response.logs || []);
        if (response.pagination) {
          setPagination(prev => ({
            ...prev,
            currentPage: response.pagination.page || 1,
            totalPages: response.pagination.totalPages || 1,
            totalItems: response.pagination.total || 0
          }));
        }
      } else {
        setAdminLogs(response.logs || []);
        if (response.pagination) {
          setAdminPagination(prev => ({
            ...prev,
            currentPage: response.pagination.page || 1,
            totalPages: response.pagination.totalPages || 1,
            totalItems: response.pagination.total || 0
          }));
        }
      }
      
    } catch (error) {
      console.error('❌ Load audit logs error:', error);
      alert(`Failed to load audit logs: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.itemsPerPage, filters, activeTab, tokenGetter]);

  const generateReport = async () => {
    try {
      const queryParams = new URLSearchParams({
        startDate: `${filters.startDate}T00:00:00.000Z`,
        endDate: `${filters.endDate}T23:59:59.999Z`
      });

      const response = await authedJson(
        `${API_URL}/api/audit/report?${queryParams}`,
        { method: 'GET' },
        tokenGetter
      );

      setReport(response.report);
      
    } catch (error) {
      console.error('Generate report error:', error);
      alert(`Failed to generate report: ${error.message}`);
    }
  };

  const exportToCSV = async () => {
    try {
      const queryParams = new URLSearchParams({
        startDate: `${filters.startDate}T00:00:00.000Z`,
        endDate: `${filters.endDate}T23:59:59.999Z`,
        eventCategory: filters.eventCategory || '',
        status: filters.status || ''
      });

      const response = await fetch(`${API_URL}/api/audit/export?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${await tokenGetter()}`,
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (error) {
      console.error('Export error:', error);
      alert(`Failed to export: ${error.message}`);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const getEventIcon = (category) => {
    switch(category) {
      case 'authentication': return <FiUser className="me-1" />;
      case 'access': return <FiEye className="me-1" />;
      case 'modification': return <FiDatabase className="me-1" />;
      case 'security': return <FiShield className="me-1" />;
      default: return <FiClock className="me-1" />;
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'success': return (
        <span className="badge" style={{ 
          padding: '0.25em 0.5em', 
          fontSize: '0.7em',
          fontWeight: '600',
          background: '#00FF00',
          color: 'black'
        }}>
          <FiCheckCircle className="me-1" size={10} />
          Success
        </span>
      );
      case 'failure': return (
        <span className="badge" style={{ 
          padding: '0.25em 0.5em', 
          fontSize: '0.7em',
          fontWeight: '600',
          background: '#FF0000',
          color: 'white'
        }}>
          <FiXCircle className="me-1" size={10} />
          Failure
        </span>
      );
      case 'warning': return (
        <span className="badge" style={{ 
          padding: '0.25em 0.5em', 
          fontSize: '0.7em',
          fontWeight: '600',
          background: '#FFA500',
          color: 'black'
        }}>
          <FiAlertCircle className="me-1" size={10} />
          Warning
        </span>
      );
      default: return (
        <span className="badge" style={{ 
          padding: '0.25em 0.5em', 
          fontSize: '0.7em',
          fontWeight: '600',
          background: '#8697C4',
          color: 'white'
        }}>
          {status}
        </span>
      );
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) {
      return 'N/A';
    }
    
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn(`Invalid date string: ${dateString}`);
        return 'Invalid Date';
      }
      
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error, 'Date string:', dateString);
      return 'Error';
    }
  };

  const formatDateShort = (dateString) => {
    if (!dateString) {
      return 'N/A';
    }
    
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Error';
    }
  };

  // Format admin action details for display
  const formatAdminDetails = (details, actionType = '') => {
    if (!details || typeof details !== 'object' || Object.keys(details).length === 0) {
      // Try to infer from action type
      if (actionType) {
        const action = actionType.replace(/_/g, ' ').toLowerCase();
        return `${action}`;
      }
      return 'No details available';
    }

    try {
      // Handle user-related actions
      if (details.action === 'CREATE' || details.operation === 'create user') {
        return `Created user: ${details.target_user_email || details.target_email || 'User'}`;
      }
      
      if (details.action === 'UPDATE' || details.operation === 'update user') {
        return `Updated user: ${details.target_user_email || details.target_email || 'User'}`;
      }
      
      if (details.action === 'DELETE' || details.operation === 'delete user') {
        return `Deleted user: ${details.target_user_email || details.target_email || 'User'}`;
      }
      
      if (details.action === 'STATUS_CHANGE') {
        return `Status change: ${details.target_user_email || details.target_email || 'User'}`;
      }
      
      if (details.action === 'ROLE_CHANGE') {
        return `Role change: ${details.target_user_email || details.target_email || 'User'}`;
      }
      
      if (details.action === 'PASSWORD_RESET') {
        return `Password reset: ${details.target_user_email || details.target_email || 'User'}`;
      }
      
      // Check if we can extract something from the details
      if (details.target_email) {
        return `Action on: ${details.target_email}`;
      }
      
      if (details.target_user_email) {
        return `Action on: ${details.target_user_email}`;
      }
      
      if (details.resource_name) {
        return `Resource: ${details.resource_name}`;
      }
      
      if (details.resource_type) {
        return `Resource type: ${details.resource_type}`;
      }
      
      // Default: show first few values
      const firstKey = Object.keys(details)[0];
      if (firstKey && details[firstKey]) {
        return `${firstKey}: ${details[firstKey]}`;
      }
      
      return 'Action logged';
      
    } catch (error) {
      console.error('Error formatting admin details:', error);
      return 'Action logged';
    }
  };

  // Check if details should be clickable (has actual content)
  const hasDetails = (details) => {
    return details && typeof details === 'object' && Object.keys(details).length > 0;
  };

  const getDisplayLogs = () => {
    return activeTab === 'audit' ? logs : adminLogs;
  };

  const getCurrentPagination = () => {
    return activeTab === 'audit' ? pagination : adminPagination;
  };

  const handlePageChange = (page) => {
    if (activeTab === 'audit') {
      setPagination(prev => ({ ...prev, currentPage: page }));
    } else {
      setAdminPagination(prev => ({ ...prev, currentPage: page }));
    }
  };

  // Handle opening details modal
  const openDetailsModal = (log) => {
    setSelectedLog(log);
    setShowDetailsModal(true);
  };

  if (loading && logs.length === 0 && adminLogs.length === 0) {
    return (
      <div className="page-content">
        <div className="container-fluid">
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
            <div className="text-center">
              <div className="spinner-border mb-3" style={{ 
                width: '3rem', 
                height: '3rem', 
                color: '#3D52A0' 
              }}>
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted">Loading audit logs...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentPagination = getCurrentPagination();
  const displayLogs = getDisplayLogs();

  return (
    <div className="page-content">
      <div className="container-fluid">
        {/* Header */}
        <div className="about-header mb-4">
          <h1 className="display-font about-title" style={{ color: '#3D52A0' }}>HIPAA Audit Logs</h1>
          <p className="about-subtitle body-font" style={{ color: '#3D52A0' }}>
            Monitor and track all access to protected health information
          </p>
        </div>

        {/* Stats Cards - Always show, based on active tab */}
        <div className="row mb-4">
          <div className="col-md-3 col-6 mb-3">
            <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #EDE8F5, #ADBBDA)' }}>
              <div className="card-body text-center" style={{ color: '#3D52A0' }}>
                <FiDatabase size={24} className="mb-2" />
                <h6 className="card-title mb-1 fw-semibold">Total Events</h6>
                <h3 className="mb-0 fw-bold" style={{ color: 'black' }}>
                  {activeTab === 'audit' 
                    ? (currentPagination.totalItems?.toLocaleString() || logs.length.toLocaleString())
                    : (currentPagination.totalItems?.toLocaleString() || adminLogs.length.toLocaleString())
                  }
                </h3>
              </div>
            </div>
          </div>
          
          {activeTab === 'audit' ? (
            <>
              <div className="col-md-3 col-6 mb-3">
                <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #ADBBDA, #8697C4)' }}>
                  <div className="card-body text-center" style={{ color: '#3D52A0' }}>
                    <FiUser size={24} className="mb-2" />
                    <h6 className="card-title mb-1 fw-semibold">Authentication</h6>
                    <h3 className="mb-0 fw-bold" style={{ color: 'black' }}>
                      {logs.filter(l => l.event_category === 'authentication').length.toLocaleString()}
                    </h3>
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-6 mb-3">
                <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #8697C4, #7091E6)' }}>
                  <div className="card-body text-center" style={{ color: 'white' }}>
                    <FiEye size={24} className="mb-2" />
                    <h6 className="card-title mb-1 fw-semibold">Access Logs</h6>
                    <h3 className="mb-0 fw-bold">
                      {logs.filter(l => l.event_category === 'access').length.toLocaleString()}
                    </h3>
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-6 mb-3">
                <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #7091E6, #3D52A0)' }}>
                  <div className="card-body text-center" style={{ color: 'white' }}>
                    <FiShield size={24} className="mb-2" />
                    <h6 className="card-title mb-1 fw-semibold">Security</h6>
                    <h3 className="mb-0 fw-bold">
                      {logs.filter(l => l.event_category === 'security').length.toLocaleString()}
                    </h3>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="col-md-3 col-6 mb-3">
                <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #ADBBDA, #8697C4)' }}>
                  <div className="card-body text-center" style={{ color: '#3D52A0' }}>
                    <FiUsers size={24} className="mb-2" />
                    <h6 className="card-title mb-1 fw-semibold">Admin Actions</h6>
                    <h3 className="mb-0 fw-bold" style={{ color: 'black' }}>
                      {currentPagination.totalItems?.toLocaleString() || adminLogs.length.toLocaleString()}
                    </h3>
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-6 mb-3">
                <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #8697C4, #7091E6)' }}>
                  <div className="card-body text-center" style={{ color: 'white' }}>
                    <FiActivity size={24} className="mb-2" />
                    <h6 className="card-title mb-1 fw-semibold">Active Today</h6>
                    <h3 className="mb-0 fw-bold">
                      {adminLogs.filter(log => {
                        const logDate = new Date(log.created_at || log.timestamp);
                        const today = new Date();
                        return logDate.toDateString() === today.toDateString();
                      }).length.toLocaleString()}
                    </h3>
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-6 mb-3">
                <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #7091E6, #3D52A0)' }}>
                  <div className="card-body text-center" style={{ color: 'white' }}>
                    <FiTrendingUp size={24} className="mb-2" />
                    <h6 className="card-title mb-1 fw-semibold">Page</h6>
                    <h3 className="mb-0 fw-bold">
                      {currentPagination.currentPage} / {currentPagination.totalPages}
                    </h3>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Tabs */}
        <div className="card border-0 shadow-sm mb-4" style={{ background: '#EDE8F5', border: '1px solid #ADBBDA' }}>
          <div className="card-body p-3">
            <ul className="nav nav-tabs border-0">
              <li className="nav-item">
                <button
                  onClick={() => handleTabChange('audit')}
                  className={`nav-link ${activeTab === 'audit' ? 'active' : ''}`}
                  style={{ 
                    background: activeTab === 'audit' ? '#3D52A0' : 'transparent',
                    color: activeTab === 'audit' ? 'white' : '#3D52A0',
                    border: 'none',
                    borderRadius: '4px',
                    marginRight: '0.5rem',
                    padding: '0.5rem 1rem'
                  }}
                >
                  <FiFileText className="me-2" />
                  Audit Logs
                </button>
              </li>
              <li className="nav-item">
                <button
                  onClick={() => handleTabChange('admin')}
                  className={`nav-link ${activeTab === 'admin' ? 'active' : ''}`}
                  style={{ 
                    background: activeTab === 'admin' ? '#3D52A0' : 'transparent',
                    color: activeTab === 'admin' ? 'white' : '#3D52A0',
                    border: 'none',
                    borderRadius: '4px',
                    marginRight: '0.5rem',
                    padding: '0.5rem 1rem'
                  }}
                >
                  <FiUsers className="me-2" />
                  Admin Actions
                </button>
              </li>
              <li className="nav-item">
                <button
                  onClick={() => handleTabChange('report')}
                  className={`nav-link ${activeTab === 'report' ? 'active' : ''}`}
                  style={{ 
                    background: activeTab === 'report' ? '#3D52A0' : 'transparent',
                    color: activeTab === 'report' ? 'white' : '#3D52A0',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.5rem 1rem'
                  }}
                >
                  <FiBarChart2 className="me-2" />
                  Compliance Report
                </button>
              </li>
            </ul>
          </div>
        </div>

{/* Filters (only show for audit logs) */}
{activeTab !== 'report' && (
  <div className="card border-0 shadow-sm mb-4" style={{ background: '#EDE8F5', border: '1px solid #ADBBDA' }}>
    <div className="card-body">
      <div className="row g-3 align-items-center"> {/* Changed from align-items-end to align-items-center */}
        {activeTab === 'audit' && (
          <>
            <div className="col-md-3">
              <label className="form-label fw-semibold mb-1" style={{ color: '#3D52A0' }}>Event Category</label>
              <select
                className="form-select"
                style={{ 
                  borderColor: '#8697C4', 
                  color: 'black',
                  height: '38px'
                }}
                value={filters.eventCategory}
                onChange={(e) => setFilters({...filters, eventCategory: e.target.value})}
              >
                <option value="">All Categories</option>
                <option value="authentication">Authentication</option>
                <option value="access">Access</option>
                <option value="modification">Modification</option>
                <option value="security">Security</option>
                <option value="system">System</option>
              </select>
            </div>
            
            <div className="col-md-2">
              <label className="form-label fw-semibold mb-1" style={{ color: '#3D52A0' }}>Status</label>
              <select
                className="form-select"
                style={{ 
                  borderColor: '#8697C4', 
                  color: 'black',
                  height: '38px'
                }}
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <option value="">All Status</option>
                <option value="success">Success</option>
                <option value="failure">Failure</option>
                <option value="warning">Warning</option>
              </select>
            </div>
          </>
        )}
        
        <div className="col-md-2">
          <label className="form-label fw-semibold mb-1" style={{ color: '#3D52A0' }}>Start Date</label>
          <div className="input-group" style={{ height: '38px' }}>
            <span className="input-group-text d-flex align-items-center justify-content-center" 
              style={{ 
                background: '#ADBBDA', 
                borderColor: '#8697C4', 
                color: '#3D52A0',
                padding: '0.375rem 0.75rem',
                height: '100%'
              }}>
              <FiCalendar size={18} />
            </span>
            <input
              type="date"
              className="form-control"
              style={{ 
                borderColor: '#8697C4', 
                color: 'black',
                height: '100%'
              }}
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
            />
          </div>
        </div>
        
        <div className="col-md-2">
          <label className="form-label fw-semibold mb-1" style={{ color: '#3D52A0' }}>End Date</label>
          <div className="input-group" style={{ height: '38px' }}>
            <span className="input-group-text d-flex align-items-center justify-content-center" 
              style={{ 
                background: '#ADBBDA', 
                borderColor: '#8697C4', 
                color: '#3D52A0',
                padding: '0.375rem 0.75rem',
                height: '100%'
              }}>
              <FiCalendar size={18} />
            </span>
            <input
              type="date"
              className="form-control"
              style={{ 
                borderColor: '#8697C4', 
                color: 'black',
                height: '100%'
              }}
              value={filters.endDate}
              onChange={(e) => setFilters({...filters, endDate: e.target.value})}
            />
          </div>
        </div>

        {activeTab === 'audit' && (
          <div className="col-md-3">
            <label className="form-label fw-semibold mb-1" style={{ color: '#3D52A0' }}>Search</label>
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
                placeholder="Search user, event, resource..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
          </div>
        )}

        <div className="col-md-2">
          <label className="form-label fw-semibold mb-1" style={{ color: '#3D52A0' }}>Actions</label>
          <div className="d-flex gap-2" style={{ height: '38px' }}>
            <button
              onClick={loadLogs}
              className="btn w-100 d-flex align-items-center justify-content-center"
              style={{ 
                background: '#8697C4', 
                borderColor: '#8697C4', 
                color: 'white',
                height: '100%',
                gap: '0.5rem'
              }}
            >
              <FiSearch size={18} />
              Search
            </button>
            <button
              onClick={exportToCSV}
              className="btn w-100 d-flex align-items-center justify-content-center"
              style={{ 
                background: '#3D52A0', 
                borderColor: '#3D52A0', 
                color: 'white',
                height: '100%',
                gap: '0.5rem'
              }}
            >
              <FiDownload size={18} />
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

        {/* Report Section */}
        {activeTab === 'report' && (
          <div className="card border-0 shadow-sm mb-4" style={{ background: '#EDE8F5', border: '1px solid #ADBBDA' }}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-semibold" style={{ color: '#3D52A0' }}>Compliance Report</h2>
                <button
                  onClick={generateReport}
                  className="btn"
                  style={{ 
                    background: '#3D52A0', 
                    borderColor: '#3D52A0', 
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <FiBarChart2 size={18} />
                  Generate Report
                </button>
              </div>

              {report ? (
                <>
                  <div className="row mb-4">
                    <div className="col-md-3 col-6 mb-3">
                      <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #EDE8F5, #ADBBDA)' }}>
                        <div className="card-body text-center" style={{ color: '#3D52A0' }}>
                          <h6 className="card-title mb-1 fw-semibold">Total Events</h6>
                          <h3 className="mb-0 fw-bold" style={{ color: 'black' }}>
                            {report.compliance.totalEvents}
                          </h3>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 col-6 mb-3">
                      <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #ADBBDA, #8697C4)' }}>
                        <div className="card-body text-center" style={{ color: '#3D52A0' }}>
                          <h6 className="card-title mb-1 fw-semibold">Authentication</h6>
                          <h3 className="mb-0 fw-bold" style={{ color: 'black' }}>
                            {report.compliance.hasAuthenticationLogs ? '✓' : '✗'}
                          </h3>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 col-6 mb-3">
                      <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #8697C4, #7091E6)' }}>
                        <div className="card-body text-center" style={{ color: 'white' }}>
                          <h6 className="card-title mb-1 fw-semibold">Access Logs</h6>
                          <h3 className="mb-0 fw-bold">
                            {report.compliance.hasAccessLogs ? '✓' : '✗'}
                          </h3>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 col-6 mb-3">
                      <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #7091E6, #3D52A0)' }}>
                        <div className="card-body text-center" style={{ color: 'white' }}>
                          <h6 className="card-title mb-1 fw-semibold">Security Incidents</h6>
                          <h3 className="mb-0 fw-bold">
                            {report.securityIncidentsCount}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="table-responsive mb-4">
                    <table className="table table-hover align-middle" style={{ fontSize: '0.85rem' }}>
                      <thead style={{ background: 'linear-gradient(135deg, #ADBBDA, #8697C4)' }}>
                        <tr>
                          <th style={{ color: '#3D52A0', borderColor: '#8697C4', fontSize: '0.8rem', padding: '0.5rem' }}>Category</th>
                          <th style={{ color: '#3D52A0', borderColor: '#8697C4', fontSize: '0.8rem', padding: '0.5rem' }}>Success</th>
                          <th style={{ color: '#3D52A0', borderColor: '#8697C4', fontSize: '0.8rem', padding: '0.5rem' }}>Failure</th>
                          <th style={{ color: '#3D52A0', borderColor: '#8697C4', fontSize: '0.8rem', padding: '0.5rem' }}>Warning</th>
                          <th style={{ color: '#3D52A0', borderColor: '#8697C4', fontSize: '0.8rem', padding: '0.5rem' }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(report.summary.byCategory).map(([category, stats]) => (
                          <tr key={category} style={{ borderColor: '#ADBBDA' }}>
                            <td style={{ padding: '0.5rem', color: '#3D52A0' }} className="text-capitalize fw-semibold">
                              {category}
                            </td>
                            <td style={{ padding: '0.5rem', color: 'black' }}>
                              <span className="badge" style={{ background: '#00FF00', color: 'black' }}>
                                {stats.success || 0}
                              </span>
                            </td>
                            <td style={{ padding: '0.5rem', color: 'black' }}>
                              <span className="badge" style={{ background: '#FF0000', color: 'white' }}>
                                {stats.failure || 0}
                              </span>
                            </td>
                            <td style={{ padding: '0.5rem', color: 'black' }}>
                              <span className="badge" style={{ background: '#FFA500', color: 'black' }}>
                                {stats.warning || 0}
                              </span>
                            </td>
                            <td style={{ padding: '0.5rem', color: 'black', fontWeight: '600' }}>
                              {stats.total}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top border-2" style={{ borderColor: '#ADBBDA' }}>
                    <div className="text-muted small" style={{ color: '#3D52A0' }}>
                      Period: {formatDateShort(report.period.startDate)} - {formatDateShort(report.period.endDate)}
                    </div>
                    <button
                      onClick={() => setReport(null)}
                      className="btn btn-sm"
                      style={{ 
                        background: '#8697C4', 
                        borderColor: '#8697C4', 
                        color: 'white'
                      }}
                    >
                      Close Report
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-5">
                  <FiBarChart2 size={48} className="mb-3" style={{ color: '#8697C4' }} />
                  <h5 className="fw-semibold mb-2" style={{ color: '#3D52A0' }}>No Report Generated</h5>
                  <p className="text-muted mb-0">
                    Click "Generate Report" to create a compliance report for the selected period.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Logs Table */}
        {activeTab !== 'report' && (
          <div className="card border-0 shadow-sm" style={{ background: '#EDE8F5', border: '1px solid #ADBBDA' }}>
            <div className="card-body p-2">
              <div className="table-responsive">
                <table className="table table-hover align-middle" style={{ fontSize: '0.85rem' }}>
                  <thead style={{ background: 'linear-gradient(135deg, #ADBBDA, #8697C4)' }}>
                    <tr>
                      {activeTab === 'audit' ? (
                        <>
                          <th style={{ color: '#3D52A0', borderColor: '#8697C4', fontSize: '0.8rem', padding: '0.5rem' }}>Time</th>
                          <th style={{ color: '#3D52A0', borderColor: '#8697C4', fontSize: '0.8rem', padding: '0.5rem' }}>User</th>
                          <th style={{ color: '#3D52A0', borderColor: '#8697C4', fontSize: '0.8rem', padding: '0.5rem' }}>Event</th>
                          <th style={{ color: '#3D52A0', borderColor: '#8697C4', fontSize: '0.8rem', padding: '0.5rem' }}>Resource</th>
                          <th style={{ color: '#3D52A0', borderColor: '#8697C4', fontSize: '0.8rem', padding: '0.5rem' }}>Status</th>
                          <th style={{ color: '#3D52A0', borderColor: '#8697C4', fontSize: '0.8rem', padding: '0.5rem' }}>IP Address</th>
                        </>
                      ) : (
                        <>
                          <th style={{ color: '#3D52A0', borderColor: '#8697C4', fontSize: '0.8rem', padding: '0.5rem' }}>Time</th>
                          <th style={{ color: '#3D52A0', borderColor: '#8697C4', fontSize: '0.8rem', padding: '0.5rem' }}>Admin</th>
                          <th style={{ color: '#3D52A0', borderColor: '#8697C4', fontSize: '0.8rem', padding: '0.5rem' }}>Action</th>
                          <th style={{ color: '#3D52A0', borderColor: '#8697C4', fontSize: '0.8rem', padding: '0.5rem' }}>Target</th>
                          <th style={{ color: '#3D52A0', borderColor: '#8697C4', fontSize: '0.8rem', padding: '0.5rem' }}>Details</th>
                          <th style={{ color: '#3D52A0', borderColor: '#8697C4', fontSize: '0.8rem', padding: '0.5rem' }}>IP</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {displayLogs.length === 0 ? (
                      <tr>
                        <td colSpan={activeTab === 'audit' ? 6 : 6} className="text-center py-5" style={{ color: '#3D52A0' }}>
                          <FiFilter size={48} className="mb-3" style={{ color: '#8697C4' }} />
                          <p className="mb-0">
                            No audit logs found for the selected filters
                          </p>
                        </td>
                      </tr>
                    ) : activeTab === 'audit' ? (
                      logs.map((log) => (
                        <tr key={log.id} style={{ borderColor: '#ADBBDA' }}>
                          <td style={{ padding: '0.5rem', color: 'black', fontSize: '0.8rem' }}>
                            {formatDate(log.created_at)}
                          </td>
                          <td style={{ padding: '0.5rem' }}>
                            <div className="fw-semibold" style={{ color: 'black', fontSize: '0.8rem' }}>
                              {log.user_email || 'System'}
                            </div>
                            <div className="text-muted small" style={{ fontSize: '0.7rem' }}>
                              {log.user_role || 'N/A'}
                            </div>
                          </td>
                          <td style={{ padding: '0.5rem' }}>
                            <div className="d-flex align-items-center">
                              {getEventIcon(log.event_category)}
                              <div>
                                <div className="fw-semibold" style={{ color: 'black', fontSize: '0.8rem' }}>
                                  {log.event_type}
                                </div>
                                <div className="text-muted small" style={{ fontSize: '0.7rem' }}>
                                  {log.event_description}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '0.5rem' }}>
                            <div className="fw-semibold" style={{ color: 'black', fontSize: '0.8rem' }}>
                              {log.resource_type} {log.resource_id ? `#${log.resource_id}` : ''}
                            </div>
                            {log.resource_name && (
                              <div className="text-muted small" style={{ fontSize: '0.7rem' }}>
                                {log.resource_name}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '0.5rem' }}>
                            {getStatusBadge(log.status)}
                          </td>
                          <td style={{ padding: '0.5rem', color: 'black', fontSize: '0.8rem' }}>
                            {log.ip_address || 'N/A'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      adminLogs.map((log, index) => {
                        // Safely extract all properties with fallbacks
                        const timestamp = log?.timestamp || log?.created_at || null;
                        const adminEmail = log?.admin_email || log?.user || 'N/A';
                        const actionType = log?.action_type || log?.action || 'N/A';
                        const targetEmail = log?.target_email || log?.target || 'N/A';
                        const details = log?.details || {};
                        const ipAddress = log?.ip_address || log?.ipAddress || 'N/A';
                        
                        return (
                          <tr key={log?.id || `admin-log-${index}`} style={{ borderColor: '#ADBBDA' }}>
                            <td style={{ padding: '0.5rem', color: 'black', fontSize: '0.8rem' }}>
                              {formatDate(timestamp)}
                            </td>
                            <td style={{ padding: '0.5rem' }}>
                              <div className="fw-semibold" style={{ color: 'black', fontSize: '0.8rem' }}>
                                {adminEmail}
                              </div>
                            </td>
                            <td style={{ padding: '0.5rem' }}>
                              <span className="badge" style={{ 
                                padding: '0.25em 0.5em', 
                                fontSize: '0.7em',
                                fontWeight: '600',
                                background: 'white',
                                color: '#3D52A0',
                                border: '1px solid #ADBBDA'
                              }}>
                                {actionType}
                              </span>
                            </td>
                            <td style={{ padding: '0.5rem', color: 'black', fontSize: '0.8rem' }}>
                              {targetEmail}
                            </td>
                            <td style={{ padding: '0.5rem' }}>
                              <div 
                                className="text-truncate" 
                                style={{ 
                                  maxWidth: '200px',
                                  cursor: hasDetails(details) ? 'pointer' : 'default',
                                  color: hasDetails(details) ? '#3D52A0' : 'inherit',
                                  textDecoration: hasDetails(details) ? 'underline' : 'none'
                                }}
                                title={hasDetails(details) ? "Click to view details" : "Action details"}
                                onClick={() => hasDetails(details) && openDetailsModal({
                                  ...log,
                                  admin_email: adminEmail,
                                  action_type: actionType,
                                  target_email: targetEmail,
                                  details: details,
                                  ip_address: ipAddress,
                                  created_at: timestamp
                                })}
                              >
                                {formatAdminDetails(details, actionType)}
                              </div>
                            </td>
                            <td style={{ padding: '0.5rem', color: 'black', fontSize: '0.8rem' }}>
                              {ipAddress}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination - FIXED DISPLAY */}
              {currentPagination.totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-3 p-2" style={{ 
                  background: '#EDE8F5', 
                  borderTop: '1px solid #ADBBDA' 
                }}>
                  <div className="text-muted small" style={{ color: '#3D52A0' }}>
                    Showing page <strong>{currentPagination.currentPage}</strong> of <strong>{currentPagination.totalPages}</strong>
                    <span className="ms-2" style={{ color: '#8697C4' }}>
                      ({currentPagination.totalItems.toLocaleString()} total items)
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
                      onClick={() => handlePageChange(currentPagination.currentPage - 1)}
                      disabled={currentPagination.currentPage === 1}
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
                      onClick={() => handlePageChange(currentPagination.currentPage + 1)}
                      disabled={currentPagination.currentPage === currentPagination.totalPages}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedLog && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content" style={{ 
                background: '#EDE8F5', 
                border: '2px solid #3D52A0',
                borderRadius: '8px'
              }}>
                <div className="modal-header" style={{ 
                  background: 'linear-gradient(135deg, #ADBBDA, #8697C4)',
                  borderBottom: '2px solid #3D52A0'
                }}>
                  <h5 className="modal-title fw-bold" style={{ color: '#3D52A0' }}>
                    <FiInfo className="me-2" />
                    Admin Action Details
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close"
                    onClick={() => setShowDetailsModal(false)}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="fw-semibold small" style={{ color: '#3D52A0' }}>Admin User:</label>
                      <div style={{ color: 'black', fontSize: '0.9rem' }}>
                        {selectedLog.admin_email || 'N/A'}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="fw-semibold small" style={{ color: '#3D52A0' }}>Timestamp:</label>
                      <div style={{ color: 'black', fontSize: '0.9rem' }}>
                        {formatDate(selectedLog.created_at)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="fw-semibold small" style={{ color: '#3D52A0' }}>Action Type:</label>
                      <div style={{ color: 'black', fontSize: '0.9rem' }}>
                        {selectedLog.action_type || 'N/A'}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="fw-semibold small" style={{ color: '#3D52A0' }}>Target:</label>
                      <div style={{ color: 'black', fontSize: '0.9rem' }}>
                        {selectedLog.target_email || 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="fw-semibold small" style={{ color: '#3D52A0' }}>IP Address:</label>
                      <div style={{ color: 'black', fontSize: '0.9rem' }}>
                        {selectedLog.ip_address || 'N/A'}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="fw-semibold small" style={{ color: '#3D52A0' }}>Log ID:</label>
                      <div style={{ color: 'black', fontSize: '0.9rem' }}>
                        {selectedLog.id || 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="fw-semibold small" style={{ color: '#3D52A0' }}>Details:</label>
                    <div style={{ 
                      background: 'white', 
                      padding: '1rem', 
                      borderRadius: '4px',
                      border: '1px solid #ADBBDA',
                      maxHeight: '300px',
                      overflow: 'auto',
                      fontSize: '0.85rem'
                    }}>
                      {selectedLog.details && Object.keys(selectedLog.details).length > 0 ? (
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                          {JSON.stringify(selectedLog.details, null, 2)}
                        </pre>
                      ) : (
                        <div className="text-muted text-center py-3">
                          No detailed information available for this action
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="modal-footer" style={{ borderTop: '1px solid #ADBBDA' }}>
                  <button 
                    type="button" 
                    className="btn btn-sm"
                    style={{ 
                      background: '#8697C4', 
                      borderColor: '#8697C4', 
                      color: 'white'
                    }}
                    onClick={() => setShowDetailsModal(false)}
                  >
                    <FiX className="me-1" />
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}