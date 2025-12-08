// src/lib/useAuth.js
import { useEffect, useState, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";

// Normalized API base (no trailing slash)
const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5001").replace(
  /\/+$/,
  ""
);

// -------------------------
// Session-based user info
// -------------------------
export function useAuth() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error(`auth/me failed: ${res.status}`);
        }

        const data = await res.json();
        if (!cancelled) {
          setUser(data.user || null);
        }
      } catch (err) {
        console.error("Failed to load auth user:", err);
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setReady(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { user, ready };
}

// -------------------------
// Auth0 + Axios helper
// -------------------------
export default function useAuthFetch() {
  const { getAccessTokenSilently } = useAuth0();

  const authFetch = useCallback(
    async (pathOrUrl, options = {}) => {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          scope: "openid profile email",
        },
      });

      const isAbsolute = /^https?:\/\//i.test(pathOrUrl);
      const url = isAbsolute ? pathOrUrl : `${API_BASE}${pathOrUrl}`;

      const res = await axios(url, {
        withCredentials: true, // send cookies for CSRF/session
        ...options,            // method, data, etc.
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${token}`,
        },
      });

      return res; // Axios response
    },
    [getAccessTokenSilently]
  );

  return authFetch;
}
