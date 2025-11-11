import { useAuth0 } from '@auth0/auth0-react'
import { useEffect, useState } from 'react'
import '../styles/Account.css'

export default function Account() {
  const { user, isAuthenticated, isLoading } = useAuth0()
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    if (isAuthenticated && user) setProfile(user)
  }, [isAuthenticated, user])

  if (isLoading) {
    return <div className="account-loading">Loading your account...</div>
  }

  if (!isAuthenticated) {
    return (
      <div className="account-container not-authenticated">
        <h2>Access Restricted</h2>
        <p>Please log in to view your account settings.</p>
      </div>
    )
  }

  return (
    <div className="account-container">
      <div className="account-header">
        <h1>Account Settings</h1>
        <p>Manage your profile, preferences, and account information.</p>
      </div>

      <div className="account-card">
        <div className="account-profile">
          <img
            src={profile?.picture || '/logo.png'}
            alt="Profile"
            className="account-avatar"
          />
          <div className="account-info">
            <h2>{profile?.name || 'User'}</h2>
            <p className="account-email">{profile?.email}</p>
          </div>
        </div>

        <div className="account-details">
          <div className="account-detail">
            <span className="detail-label">Full Name</span>
            <span className="detail-value">
              {profile?.name || `${profile?.given_name || ''} ${profile?.family_name || ''}`.trim() || '—'}
            </span>
          </div>

          <div className="account-detail">
            <span className="detail-label">Email</span>
            <span className="detail-value">{profile?.email}</span>
          </div>

          <div className="account-detail">
            <span className="detail-label">Account Type</span>
            <span className="detail-value">
              {profile?.sub?.startsWith('google') ? 'Google Login' : 'Standard Login'}
            </span>
          </div>

          <div className="account-detail">
            <span className="detail-label">Member Since</span>
            <span className="detail-value">
              {new Date(profile?.updated_at || Date.now()).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <div className="account-footer">
        <p>
          Need help managing your account?{' '}
          <a href="/contact" className="account-link">
            Contact support
          </a>
        </p>
      </div>
    </div>
  )
}
