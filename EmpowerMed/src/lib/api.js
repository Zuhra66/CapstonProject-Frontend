// src/lib/api.js
const BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

/* ---------- CSRF handling ---------- */
let _csrf = null;

// read a cookie by name (for SSR-safe usage keep it simple)
function readCookie(name) {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

// call backend to mint a CSRF token cookie+json (once per session)
async function ensureCsrf() {
  if (_csrf) return _csrf;

  // try cookie first (if we already fetched it earlier)
  const c = readCookie("XSRF-TOKEN");
  if (c) {
    _csrf = c;
    return _csrf;
  }

  const r = await fetch(`${BASE}/csrf-token`, {
    credentials: "include",
  });
  // backend returns { csrfToken }
  const data = await r.json().catch(() => ({}));
  _csrf = data?.csrfToken || readCookie("XSRF-TOKEN") || null;
  return _csrf;
}

// whether method needs CSRF
const NEEDS_CSRF = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/* ---------- Core helper ---------- */
/**
 * authedJson(path, { method, body, headers }, getToken)
 * - getToken is a function that returns an access token string (e.g., Auth0's getAccessTokenSilently).
 * - Sends cookies and CSRF header automatically.
 */
export async function authedJson(
  path,
  { method = "GET", body, headers = {} } = {},
  getToken
) {
  // fetch/mint CSRF for unsafe methods
  let csrfHeader = {};
  const upper = method.toUpperCase();
  if (NEEDS_CSRF.has(upper)) {
    const token = await ensureCsrf();
    if (token) csrfHeader = { "X-XSRF-TOKEN": token };
  }

  // optional bearer auth
  let bearerHeader = {};
  if (typeof getToken === "function") {
    const t = await getToken();
    if (t) bearerHeader = { Authorization: `Bearer ${t}` };
  }

  const res = await fetch(`${BASE}${path}`, {
    method: upper,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...bearerHeader,
      ...csrfHeader,
      ...headers,
    },
    body: body != null ? JSON.stringify(body) : undefined,
  });

  // Helpful error text
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }

  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

/* ---------- Convenience wrappers (optional) ---------- */
export const getJson = (path, getToken, headers) =>
  authedJson(path, { method: "GET", headers }, getToken);

export const postJson = (path, body, getToken, headers) =>
  authedJson(path, { method: "POST", body, headers }, getToken);

export const putJson = (path, body, getToken, headers) =>
  authedJson(path, { method: "PUT", body, headers }, getToken);

export const delJson = (path, getToken, headers) =>
  authedJson(path, { method: "DELETE", headers }, getToken);
