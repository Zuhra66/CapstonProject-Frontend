// src/components/Profile.jsx
import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

export default function Profile() {
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) return <div>Loading profile…</div>;
  if (!isAuthenticated) return <div>Please log in</div>;

  // Do NOT store profile in localStorage, sessionStorage, or cookies.
  return (
    <div className="profile">
      <p><strong>Email:</strong> {user?.email}</p>
      <p><strong>Name:</strong> {user?.name || '—'}</p>
    </div>
  );
}
