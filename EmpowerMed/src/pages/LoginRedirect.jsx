// src/pages/LoginRedirect.jsx
import { useEffect, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

export default function LoginRedirect() {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const navigate = useNavigate();
  const kickedOff = useRef(false);

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated) {
      navigate("/admin/dashboard", { replace: true });
      return;
    }

    if (!kickedOff.current) {
      kickedOff.current = true;
      loginWithRedirect({
        appState: { returnTo: "/admin/dashboard" },
        authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
      });
    }
  }, [isAuthenticated, isLoading, loginWithRedirect, navigate]);

  return <p style={{ padding: 24 }}>Redirecting to login…</p>;
}
