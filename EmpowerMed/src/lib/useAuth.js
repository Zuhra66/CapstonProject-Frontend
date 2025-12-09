// src/lib/useAuth.js
<<<<<<< HEAD
import { useEffect, useState, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";

// Normalized API base (no trailing slash)
const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5001").replace(
  /\/+$/,
  ""
);

// ===== CSRF CONFIG (matches your backend logs) =====
// Backend log said: headers: { 'x-xsrf-token': 'missing', cookie: 'present' }
// And cookies includes: 'XSRF-TOKEN': '...'
const CSRF_COOKIE_NAME = "XSRF-TOKEN";   // read this cookie
const CSRF_HEADER_NAME = "X-XSRF-Token"; // send it here (=> x-xsrf-token)

// ---- helpers ----
function getCookie(name) {
  if (typeof document === "undefined") return null;
  const parts = document.cookie.split("; ").filter(Boolean);
  for (const part of parts) {
    const [k, ...rest] = part.split("=");
    if (k === name) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return null;
}

// ========= session-based "who am I" hook =========
=======
import { useEffect, useState } from "react";
import { createAuth0Client } from "@auth0/auth0-spa-js";

const API = import.meta.env.VITE_API_URL;

let auth0Client = null;

>>>>>>> origin/prototype-frontend
export function useAuth() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
<<<<<<< HEAD
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
=======
        // Initialize Auth0
        auth0Client = await createAuth0Client({
          domain: import.meta.env.VITE_AUTH0_DOMAIN,
          clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
          authorizationParams: {
            redirect_uri: window.location.origin,
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
            scope: "openid profile email"
          }
        });

        // Handle redirect callback
        if (window.location.search.includes("code=")) {
          await auth0Client.handleRedirectCallback();
          window.history.replaceState({}, document.title, "/");
        }

        // Get logged-in state
        const isAuthenticated = await auth0Client.isAuthenticated();

        if (!isAuthenticated) {
          setUser(null);
          setReady(true);
          return;
        }

        // Retrieve Auth0-provided user (basic info)
        const auth0User = await auth0Client.getUser();

        // Get access token to send to backend
        const token = await auth0Client.getTokenSilently();

        // Ask backend for full DB user + linking
        const res = await fetch(`${API}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setUser(data.user || null);
      } catch (err) {
        console.error("Auth error:", err);
        setUser(null);
>>>>>>> origin/prototype-frontend
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

  return { user, ready, auth0: auth0Client };
}

// ========= Auth0 + Axios helper for admin APIs =========
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

      // Read CSRF token from XSRF-TOKEN cookie
      const csrfToken = getCookie(CSRF_COOKIE_NAME);
      console.log("authFetch CSRF:", {
        cookieName: CSRF_COOKIE_NAME,
        headerName: CSRF_HEADER_NAME,
        tokenPresent: !!csrfToken,
      });

      const res = await axios(url, {
        withCredentials: true, // send cookies
        ...options,            // method, data, etc.
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${token}`,
          ...(csrfToken ? { [CSRF_HEADER_NAME]: csrfToken } : {}),
        },
      });

      return res;
    },
    [getAccessTokenSilently]
  );

  return authFetch;
}
