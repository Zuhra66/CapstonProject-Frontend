import { useEffect, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function RedirectAfterLogin() {
  const { isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // prevent running multiple times
  const triedRef = useRef(false);

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    if (triedRef.current) return; // run once per session
    triedRef.current = true;

    (async () => {
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE, // must match backend
          },
        });

        const res = await fetch("/api/admin/dashboard-stats", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });

        console.log("[RedirectAfterLogin] /api/admin/dashboard-stats ->", res.status);

        if (res.ok && !pathname.startsWith("/admin")) {
          navigate("/admin/dashboard", { replace: true });
        }
        // 401/403 => not admin or token problem; do nothing and stay where you are
      } catch (e) {
        console.log("[RedirectAfterLogin] error:", e?.message || e);
        // swallow; stay on current page
      }
    })();
  }, [isAuthenticated, isLoading, getAccessTokenSilently, pathname, navigate]);

  return null;
}
