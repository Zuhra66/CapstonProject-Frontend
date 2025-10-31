// src/components/LogoutButton.jsx
import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

export default function LogoutButton() {
  const { logout } = useAuth0();
  const frontendUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;

  const handleLogout = () => {
    logout({
      logoutParams: {
        returnTo: frontendUrl
      }
    });
  };

  return (
    <button className="btn btn-outline-secondary" onClick={handleLogout}>
      Log out
    </button>
  );
}
