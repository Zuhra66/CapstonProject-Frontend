// src/lib/AdminRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

// Normalize API base (remove trailing slash)
const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5001").replace(
  /\/+$/,
  ""
);

const AdminRoute = ({ children }) => {
  const {
    isAuthenticated,
    isLoading: auth0Loading,
    user,
    getAccessTokenSilently,
  } = useAuth0();

  const [backendUser, setBackendUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const fetchBackendUser = async () => {
      if (!isAuthenticated) {
        console.log("❌ Not authenticated, skipping backend user fetch");
        setBackendUser(null);
        setUserLoading(false);
        return;
      }

      try {
        console.log("🔄 Fetching backend user data...");
        setUserLoading(true);

        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          },
        });

        const response = await fetch(`${API_BASE}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!alive) return;

        if (response.ok) {
          const data = await response.json();
          console.log("✅ Backend user data:", data.user);
          setBackendUser(data.user);
        } else {
          console.log(
            "❌ Backend user fetch failed with status:",
            response.status
          );
          setBackendUser(null);
        }
      } catch (error) {
        console.error("❌ Failed to fetch backend user:", error);
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

  const isAdmin = !!(
    backendUser?.is_admin || backendUser?.isAdmin || backendUser?.role === "Administrator"
  );

  const isLoading = auth0Loading || userLoading;

  console.log("🔍 AdminRoute Debug:", {
    isAuthenticated,
    auth0Loading,
    userLoading,
    backendUser,
    isAdmin,
    user: user?.email,
  });

  if (isLoading) {
    console.log("⏳ AdminRoute: Still loading...");
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "50vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("🚫 AdminRoute: Not authenticated, redirecting to home");
    return <Navigate to="/" replace />;
  }

  if (!isAdmin) {
    console.log(
      "🚫 AdminRoute: Not admin, redirecting to home. User role:",
      backendUser?.role,
      "is_admin:",
      backendUser?.is_admin
    );
    return <Navigate to="/" replace />;
  }

  console.log("✅ AdminRoute: User is admin, rendering children");
  return children;
};

export default AdminRoute;
