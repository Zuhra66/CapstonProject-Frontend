// src/components/LoginButton.jsx
import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

export default function LoginButton({ redirectTo }) {
  const { loginWithRedirect, isLoading } = useAuth0();

  const handleLogin = async () => {
    try {
      await loginWithRedirect({
        authorizationParams: {
          redirect_uri: import.meta.env.VITE_AUTH0_REDIRECT_URI || window.location.origin
        },
        appState: { returnTo: redirectTo || '/' }
      });
    } catch (e) {
      console.error('Login failed', e);
    }
  };

  return (
    <button className="btn btn-primary" onClick={handleLogin} disabled={isLoading}>
      {isLoading ? 'Connecting...' : 'Log in'}
    </button>
  );
}
