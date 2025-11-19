// src/lib/useAuth.js
import { useEffect, useState } from "react";
const API = import.meta.env.VITE_API_URL;

export function useAuth() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API}/auth/me`, { credentials: "include" });
        const data = await r.json();
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  return { user, ready };
}
