// EmpowerMed/src/lib/api.js

// Prefer same-origin so CSRF + cookies work without extra CORS hassle.
// If you deploy behind a different origin, set VITE_API_URL to that full URL.
const BASE = import.meta.env.VITE_API_URL ?? "";

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
  // same-origin path (BASE may be empty or a full URL; both work)
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
 *   (e.g., Auth0’s getAccessTokenSilently)
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
export const getJson  = (path, getToken, headers) =>
  authedJson(path, { method: "GET", headers }, getToken);
export const postJson = (path, body, getToken, headers) =>
  authedJson(path, { method: "POST", body, headers }, getToken);
export const putJson  = (path, body, getToken, headers) =>
  authedJson(path, { method: "PUT", body, headers }, getToken);
export const delJson  = (path, getToken, headers) =>
  authedJson(path, { method: "DELETE", headers }, getToken);

/* ---------- Admin: Products ---------- */
// Create product
export async function adminCreateProduct(payload, getToken) {
  return postJson(`/api/admin/products`, payload, getToken);
}

// Update product (backend expects PUT, not PATCH)
export async function adminUpdateProduct(id, patch, getToken) {
  return putJson(`/api/admin/products/${id}`, patch, getToken);
}

// Delete product
export async function adminDeleteProduct(id, getToken) {
  return delJson(`/api/admin/products/${id}`, getToken);
}

/* ---------- Public catalog ---------- */
export const fetchProducts   = (params = "", getToken) =>
  getJson(`/api/products${params}`, getToken);
export const fetchCategories = (_ = "", getToken) =>
  getJson(`/api/categories`, getToken);
