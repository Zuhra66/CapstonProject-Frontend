// src/lib/AdminRoute.jsx
import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Wrap admin pages with <AdminRoute>...</AdminRoute>
 * - If not authenticated -> start Auth0 login (return to current path)
 * - If authenticated -> call /api/admin/dashboard-stats
 * - If 200 -> render children (admin)
 * - If 401/403/other -> navigate to home with a gentle message (no /login loops)
 */
export default function AdminRoute({ children }) {
  const { isAuthenticated, isLoading, loginWithRedirect, getAccessTokenSilently } = useAuth0();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (isLoading) return; // wait for Auth0
      if (!isAuthenticated) {
        await loginWithRedirect({
          appState: { returnTo: location.pathname },
          authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
        });
        return;
      }

      try {
        const token = await getAccessTokenSilently({
          authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
        });
        const res = await fetch("/api/admin/dashboard-stats", {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });

        if (cancelled) return;

        if (res.ok) {
          setAllowed(true);
        } else {
          // Not an admin or token issue -> go home (avoid /login to prevent loops)
          navigate("/", { replace: true, state: { msg: "Admin access required." } });
        }
      } catch (e) {
        if (!cancelled) {
          navigate("/", { replace: true, state: { msg: "Admin access required." } });
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    };

    run();
    return () => { cancelled = true; };
  }, [isAuthenticated, isLoading, getAccessTokenSilently, loginWithRedirect, location.pathname, navigate]);

  if (isLoading || checking) {
    return <div style={{ padding: 24 }}>Checking admin access…</div>;
  }

  return allowed ? children : null;
}
