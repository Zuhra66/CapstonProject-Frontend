// src/lib/api.js

// In dev, always use same-origin so cookies + CSRF work cleanly.
// In production, you can set VITE_API_URL if the API is on a different origin.
const BASE = import.meta.env.DEV
  ? ""
  : (import.meta.env.VITE_API_URL || "");

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

  // Optional Bearer auth (getToken is async function)
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
export async function adminCreateProduct(payload, getToken) {
  return postJson(`/api/admin/products`, payload, getToken);
}

export async function adminUpdateProduct(id, patch, getToken) {
  return putJson(`/api/admin/products/${id}`, patch, getToken);
}

export async function adminDeleteProduct(id, getToken) {
  return delJson(`/api/admin/products/${id}`, getToken);
}

/* ---------- Public catalog ---------- */
export const fetchProducts   = (params = "", getToken) =>
  getJson(`/api/products${params}`, getToken);
export const fetchCategories = (_ = "", getToken) =>
  getJson(`/api/categories`, getToken);
