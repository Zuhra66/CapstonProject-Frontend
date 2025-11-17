// src/pages/EducationAdmin.jsx
import React, { useCallback, useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { authedJson } from "../lib/api";
import s from "../styles/EducationalHub.module.css";

function useIsAdmin(user) {
  const roles =
    user?.["https://empowermed.app/roles"] ||
    user?.roles ||
    [];
  return Array.isArray(roles) && roles.includes("admin");
}

export default function EducationAdmin() {
  const { isAuthenticated, user, getAccessTokenSilently, loginWithRedirect, isLoading } = useAuth0();
  const isAdmin = useIsAdmin(user);

  // Build a stable token getter for authed requests
  const getToken = useCallback(
    () =>
      getAccessTokenSilently({
        // Auth0 SPA SDK v2 style (works for v1+ too)
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        },
      }),
    [getAccessTokenSilently]
  );

  const [data, setData] = useState({ articles: [], videos: [], downloads: [] });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      // If your /api/education route requires auth, use authedJson with getToken.
      // If it's public, you could call fetch() instead. Using authedJson is fine either way.
      const d = await authedJson("/api/education", {}, getToken);
      setData(d);
    } catch (e) {
      setErr("Failed to load content");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    if (!isLoading) refresh();
  }, [isLoading, refresh]);

  if (!isAuthenticated) {
    return (
      <div className={s.wrap}>
        <h2>Admin</h2>
        <p className={s.muted}>You must sign in.</p>
        <button className={s.btn} onClick={() => loginWithRedirect()}>Sign in</button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className={s.wrap}>
        <h2>Admin</h2>
        <p className={s.muted}>You don’t have permission to manage education content.</p>
      </div>
    );
  }

  // ----- Articles CRUD -----
  async function createArticle() {
    const title = prompt("Title?");
    if (!title) return;

    await authedJson(
      "/api/education/articles",
      { method: "POST", body: { title, isActive: true } },
      getToken
    );
    await refresh();
  }

  async function updateArticle(id) {
    const title = prompt("New title (leave blank to keep):");
    const payload = title ? { title } : {};

    await authedJson(
      `/api/education/articles/${id}`,
      { method: "PUT", body: payload },
      getToken
    );
    await refresh();
  }

  async function deleteArticle(id) {
    if (!confirm("Delete this article?")) return;

    await authedJson(
      `/api/education/articles/${id}`,
      { method: "DELETE" },
      getToken
    );
    await refresh();
  }

  // TODO: replicate create/update/delete for videos & downloads if needed

  return (
    <div className={s.wrap}>
      <h2 className={s.sectionTitle}>Educational Hub Admin</h2>
      {loading && <div className={s.muted}>Loading…</div>}
      {err && <div className={s.muted}>{err}</div>}

      <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
        <button className={s.btn} onClick={createArticle}>+ New Article</button>
        <button className={s.btn} onClick={refresh}>Refresh</button>
      </div>

      <h3 className={s.sectionTitle}>Articles</h3>
      <ul className={s.downloads}>
        {data.articles.map((a) => (
          <li key={a.id} className={s.downloadItem}>
            <div>
              <div className={s.dlTitle}>{a.title}</div>
              <div className={s.muted}>{(a.tags || []).join(", ")}</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className={s.dlBtn} onClick={() => updateArticle(a.id)}>Edit</button>
              <button className={s.dlBtn} onClick={() => deleteArticle(a.id)}>Delete</button>
            </div>
          </li>
        ))}
        {!data.articles.length && <div className={s.muted}>No articles yet.</div>}
      </ul>
    </div>
  );
}
