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

// Add these functions to your existing api.js file

// Newsletter API functions
export const subscribeToNewsletter = async (email) => {
  try {
    const response = await fetch(`${API_URL}/api/newsletter/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Subscription failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    throw error;
  }
};

// Admin newsletter functions
export const getNewsletterSubscribers = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value);
      }
    });

    const token = getAuthToken();
    const response = await fetch(`${API_URL}/api/newsletter/subscribers?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch subscribers');
    }

    return await response.json();
  } catch (error) {
    console.error('Get subscribers error:', error);
    throw error;
  }
};

export const getNewsletterStats = async () => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/api/newsletter/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch stats');
    }

    return await response.json();
  } catch (error) {
    console.error('Get stats error:', error);
    throw error;
  }
};

export const exportSubscribersCSV = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value);
      }
    });

    const token = getAuthToken();
    const response = await fetch(`${API_URL}/api/newsletter/export?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to export subscribers');
    }

    // Create download link for CSV
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    const filename = response.headers.get('Content-Disposition')?.split('filename=')[1] || 
                     `empowermed-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return true;
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};

export const deleteSubscriber = async (subscriberId) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/api/newsletter/subscribers/${subscriberId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete subscriber');
    }

    return await response.json();
  } catch (error) {
    console.error('Delete subscriber error:', error);
    throw error;
  }
};

/* ---------- Public catalog ---------- */
export const fetchProducts   = (params = "", getToken) =>
  getJson(`/api/products${params}`, getToken);
export const fetchCategories = (_ = "", getToken) =>
  getJson(`/api/categories`, getToken);
