// src/lib/api.js
const BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

/* ---------- CSRF handling ---------- */
let _csrf = null;

function readCookie(name) {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

async function ensureCsrf() {
  if (_csrf) return _csrf;

  const c = readCookie("XSRF-TOKEN");
  if (c) {
    _csrf = c;
    return _csrf;
  }
  const r = await fetch(`${BASE}/csrf-token`, { credentials: "include" });
  const data = await r.json().catch(() => ({}));
  _csrf = data?.csrfToken || readCookie("XSRF-TOKEN") || null;
  return _csrf;
}

const NEEDS_CSRF = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/* ---------- Core helper ---------- */
/**
 * authedJson(path, { method, body, headers }, getToken?)
 * - getToken: optional async () => string that returns a Bearer token
 *   (e.g., Auth0's getAccessTokenSilently or your backend /auth/session fetcher)
 */
export async function authedJson(
  path,
  { method = "GET", body, headers = {} } = {},
  getToken
) {
  const upper = method.toUpperCase();

  // CSRF for unsafe methods
  let csrfHeader = {};
  if (NEEDS_CSRF.has(upper)) {
    const token = await ensureCsrf();
    if (token) csrfHeader = { "X-XSRF-TOKEN": token };
  }

  // Optional Bearer auth
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

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }

  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

/* ---------- Convenience wrappers ---------- */
export const getJson  = (path, getToken, headers) => authedJson(path, { method: "GET", headers }, getToken);
export const postJson = (path, body, getToken, headers) => authedJson(path, { method: "POST", body, headers }, getToken);
export const putJson  = (path, body, getToken, headers) => authedJson(path, { method: "PUT", body, headers }, getToken);
export const delJson  = (path, getToken, headers) => authedJson(path, { method: "DELETE", headers }, getToken);

/* ---------- Token via your backend (optional helper) ----------
   If you aren’t using Auth0’s getAccessTokenSilently in the component,
   you can pass this function as getToken to the calls below. */
export async function getSessionAccessToken() {
  const r = await fetch(`${BASE}/auth/session`, { credentials: "include" });
  if (!r.ok) throw new Error("Not authenticated");
  const { accessToken } = await r.json();
  return accessToken;
}

/* ---------- Admin: Products ---------- */
// Create product
export async function adminCreateProduct(payload, getToken = getSessionAccessToken) {
  return postJson(`/api/admin/products`, payload, getToken);
}

// Update product (partial)
export async function adminUpdateProduct(id, patch, getToken = getSessionAccessToken) {
  return authedJson(`/api/admin/products/${id}`, { method: "PATCH", body: patch }, getToken);
}

// Delete product
export async function adminDeleteProduct(id, getToken = getSessionAccessToken) {
  return delJson(`/api/admin/products/${id}`, getToken);
}

/* ---------- Public catalog (optional) ---------- */
export const fetchProducts   = (params = "", getToken) => getJson(`/api/products${params}`, getToken);
export const fetchCategories = (_ = "", getToken) => getJson(`/api/categories`, getToken);
