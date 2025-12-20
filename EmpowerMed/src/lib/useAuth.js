// src/lib/useAuth.js
import { useEffect, useState, useCallback } from "react";
import { createAuth0Client } from "@auth0/auth0-spa-js";

const API = (import.meta.env.VITE_API_URL || "http://localhost:5001").replace(
  /\/+$/,
  ""
);

let auth0Client = null;

export function useAuth() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        if (!auth0Client) {
          auth0Client = await createAuth0Client({
            domain: import.meta.env.VITE_AUTH0_DOMAIN,
            clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
            authorizationParams: {
              redirect_uri: window.location.origin,
              audience: import.meta.env.VITE_AUTH0_AUDIENCE,
              scope: "openid profile email",
            },
          });
        }

        if (window.location.search.includes("code=")) {
          await auth0Client.handleRedirectCallback();
          window.history.replaceState({}, document.title, "/");
        }

        const isAuthenticated = await auth0Client.isAuthenticated();

        if (!isAuthenticated) {
          if (!cancelled) {
            setUser(null);
            setReady(true);
          }
          return;
        }

        const auth0User = await auth0Client.getUser();
        const token = await auth0Client.getTokenSilently();

        const res = await fetch(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (!cancelled) {
          setUser(data.user || auth0User || null);
        }
      } catch (err) {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { user, ready, auth0: auth0Client };
}

export function useAuthFetch() {
  const { ready } = useAuth();

  const authFetch = useCallback(
    async (path, options = {}) => {
      if (!auth0Client) {
        throw new Error("Auth0 client not initialized yet");
      }

      const token = await auth0Client.getTokenSilently();

      const {
        method = "GET",
        headers = {},
        data,
        body,
        ...rest
      } = options;

      const response = await fetch(`${API}${path}`, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          ...headers,
        },
        body: data ? JSON.stringify(data) : body ?? undefined,
        ...rest,
      });

      const text = await response.text();
      let payload;
      try {
        payload = text ? JSON.parse(text) : {};
      } catch {
        payload = { raw: text };
      }

      if (!response.ok) {
        const err = new Error(
          payload?.message || payload?.error || "Request failed"
        );
        err.response = { status: response.status, data: payload };
        throw err;
      }

      return { data: payload };
    },
    [ready]
  );

  return authFetch;
}

export default useAuthFetch;