// src/lib/useAuth.js
import { useEffect, useState } from "react";
import { createAuth0Client } from "@auth0/auth0-spa-js";

const API = import.meta.env.VITE_API_URL;

let auth0Client = null;

export function useAuth() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
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
      } finally {
        setReady(true);
      }
    })();
  }, []);

  return { user, ready, auth0: auth0Client };
}
