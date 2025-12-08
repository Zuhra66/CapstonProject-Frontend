import { useAuth0 } from '@auth0/auth0-react'
import { useEffect, useState } from 'react'
import ContactModal from '../components/ContactModal.jsx'
import '../styles/account.css'

export default function Account() {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0()
  const [backendUser, setBackendUser] = useState(null)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [loadingBackend, setLoadingBackend] = useState(true)

  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchBackendUser = async () => {
      if (!isAuthenticated) {
        setLoadingBackend(false);
        return;
      }

      try {
        setLoadingBackend(true);
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          }
        });

        const response = await fetch(`${API}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Backend user data:', data.user); // Debug log
          setBackendUser(data.user);
        } else {
          console.error('Failed to fetch backend user data');
        }
      } catch (error) {
        console.error('Error fetching backend user:', error);
      } finally {
        setLoadingBackend(false);
      }
    };

    fetchBackendUser();
  }, [isAuthenticated, getAccessTokenSilently, API]);

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return '—';
    }
  };

  const formatDateTime = (dateString) => {
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
    } catch {
      return '—';
    }
  };

  const getTimeSince = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
      return `${Math.floor(diffDays / 365)} years ago`;
    } catch {
      return '—';
    }
  };

  const getDisplayName = () => {
    if (backendUser?.first_name && backendUser?.last_name) {
      return `${backendUser.first_name} ${backendUser.last_name}`;
    }
    return backendUser?.name || user?.name || 'User';
  };

  const getAccountType = () => {
    if (backendUser?.auth_provider === 'google-oauth2') return 'Google Account';
    if (user?.sub?.includes('google')) return 'Google Account';
    return 'Standard Account';
  };

  const isAdmin = backendUser?.is_admin === true || backendUser?.role === 'Administrator';

  if (isLoading || loadingBackend) {
    return (
      <div className="account-loading">
        <div className="loading-spinner"></div>
        <p className="display-font">Loading your account...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="account-container not-authenticated">
        <h2 className="display-font">Access Restricted</h2>
        <p>Please log in to view your account settings.</p>
      </div>
    );
  }

  return (
    <>
      <div className="account-container">

        {/* HEADER */}
        <div className="account-header">
          <h1 className="display-font">Account Settings</h1>
          <p>Manage your profile, preferences, and account information.</p>
        </div>

        {/* CARD */}
        <div className="account-card">

          {/* PROFILE SECTION */}
          <div className="account-profile">
            <img
              src={user?.picture || '/logo.png'}
              alt="Profile"
              className="account-avatar"
            />
            <div className="account-info">
              <h2 className="display-font">{getDisplayName()}</h2>
              <p className="account-email">{backendUser?.email || user?.email}</p>

              <div className="account-badges">
                <span className="badge badge-role">{backendUser?.role || 'Member'}</span>

                <span className={`badge badge-status ${backendUser?.is_active ? 'active' : 'inactive'}`}>
                  {backendUser?.is_active ? 'Active' : 'Inactive'}
                </span>

                {!backendUser?.membership ? (
                  <span className="badge badge-status inactive" style={{ background: '#b6b6b6', color: '#333' }}>
                    No Active Membership
                  </span>
                ) : (
                  <span className="badge badge-status active" style={{ background: '#6f79ff', color: 'white' }}>
                    Membership
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* DETAILS */}
          <div className="account-details">

            {/* PERSONAL INFO */}
            <div className="detail-group">
              <h3 className="detail-group-title display-font">Personal Information</h3>
              <div className="detail-grid">

                <div className="account-detail">
                  <span className="detail-label display-font">First Name</span>
                  <span className="detail-value">{backendUser?.first_name || user?.given_name || '—'}</span>
                </div>

                <div className="account-detail">
                  <span className="detail-label display-font">Last Name</span>
                  <span className="detail-value">{backendUser?.last_name || user?.family_name || '—'}</span>
                </div>

                <div className="account-detail">
                  <span className="detail-label display-font">Display Name</span>
                  <span className="detail-value">{backendUser?.name || user?.name || '—'}</span>
                </div>

                <div className="account-detail">
                  <span className="detail-label display-font">Email Address</span>
                  <span className="detail-value">{backendUser?.email || user?.email}</span>
                </div>
              </div>
            </div>

            {/* ACCOUNT INFO */}
            <div className="detail-group">
              <h3 className="detail-group-title display-font">Account Information</h3>
              <div className="detail-grid">

                <div className="account-detail">
                  <span className="detail-label display-font">Account Type</span>
                  <span className="detail-value">{getAccountType()}</span>
                </div>

                <div className="account-detail">
                  <span className="detail-label display-font">Account Created</span>
                  <span className="detail-value">
                    {formatDate(backendUser?.created_at)}
                    {backendUser?.created_at && (
                      <span className="time-ago">
                        ({getTimeSince(backendUser.created_at)})
                      </span>
                    )}
                  </span>
                </div>

                <div className="account-detail">
                  <span className="detail-label display-font">Last Updated</span>
                  <span className="detail-value">{formatDateTime(backendUser?.updated_at)}</span>
                </div>

                <div className="account-detail">
                  <span className="detail-label display-font">User Role</span>
                  <span className="detail-value">{backendUser?.role || 'Member'}</span>
                </div>

                <div className="account-detail">
                  <span className="detail-label display-font">Account Status</span>
                  <span className="detail-value">
                    <span className={`status-indicator ${backendUser?.is_active ? 'active' : 'inactive'}`}>
                      {backendUser?.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </span>
                </div>

                {isAdmin && (
                  <div className="account-detail">
                    <span className="detail-label display-font">Administrator</span>
                    <span className="detail-value">Yes</span>
                  </div>
                )}

              </div>
            </div>

            {/* MEMBERSHIP SECTION */}
            <div className="detail-group">
              <h3 className="detail-group-title display-font">Membership</h3>

              {!backendUser?.membership ? (
                <div className="detail-grid">
                  <div className="account-detail">
                    <span className="detail-label display-font">Membership Status</span>
                    <span className="detail-value">No Active Membership</span>
                  </div>
                </div>
              ) : (
                <div className="detail-grid">

                  <div className="account-detail">
                    <span className="detail-label display-font">Member Since</span>
                    <span className="detail-value">
                      {formatDate(backendUser.membership.start_date)}
                    </span>
                  </div>

                  <div className="account-detail">
                    <span className="detail-label display-font">Membership Renews</span>
                    <span className="detail-value">
                      {formatDate(backendUser.membership.end_date)}
                    </span>
                  </div>

                  <div className="account-detail">
                    <span className="detail-label display-font">Status</span>
                    <span className="detail-value">
                      <span className={`status-indicator ${
                        backendUser.membership.status === "active"
                          ? "active"
                          : backendUser.membership.status === "past_due"
                          ? "past_due"
                          : backendUser.membership.status === "cancelled"
                          ? "cancelled"
                          : "inactive"
                      }`}>
                        {backendUser.membership.status.replace("_", " ").toUpperCase()}
                      </span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="account-footer">
          <p>
            Need help managing your account?{" "}
            <button 
              onClick={() => setIsContactModalOpen(true)}
              className="contact-button"
            >
              Contact Us
            </button>
          </p>
        </div>
      </div>

      <ContactModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
      />
    </>
  );
}