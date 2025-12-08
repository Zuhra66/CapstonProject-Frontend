// src/lib/useAuth.js
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
