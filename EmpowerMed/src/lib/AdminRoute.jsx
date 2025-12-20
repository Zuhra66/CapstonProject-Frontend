// src/lib/AdminRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

const AdminRoute = ({ children }) => {
  const { 
    isAuthenticated, 
    isLoading: auth0Loading, 
    user, 
    getAccessTokenSilently 
  } = useAuth0();
  const [backendUser, setBackendUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const fetchBackendUser = async () => {
      if (!isAuthenticated) {
        setBackendUser(null);
        setUserLoading(false);
        return;
      }

      try {
        setUserLoading(true);
        
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

        if (!alive) return;

        if (response.ok) {
          const data = await response.json();
          setBackendUser(data.user);
        } else {
          setBackendUser(null);
        }
      } catch (error) {
        setBackendUser(null);
      } finally {
        if (alive) setUserLoading(false);
      }
    };

    fetchBackendUser();

    return () => {
      alive = false;
    };
  }, [isAuthenticated, getAccessTokenSilently]);

  const isAdmin = !!(backendUser?.is_admin || backendUser?.role === 'Administrator');
  const isLoading = auth0Loading || userLoading;

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;